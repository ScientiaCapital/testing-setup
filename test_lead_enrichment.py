"""
Unit tests for lead enrichment service.

Unit tests should be:
- FAST (no I/O, no network calls)
- ISOLATED (no dependencies between tests)
- DETERMINISTIC (same result every time)

These tests mock all external dependencies to test LOGIC only.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Import the code we're testing (adjust path for your project)
# from src.services.lead_enrichment import LeadEnrichmentService, EnrichmentResult


# =============================================================================
# Example: Testing a Service Class
# =============================================================================

class TestLeadEnrichmentService:
    """
    Group related tests in a class.
    
    Benefits:
    - Shared setup via class-level fixtures
    - Clear organization in test output
    - Can use class attributes for common test data
    """

    @pytest.fixture
    def service(self, mock_llm_client, mock_enrichment_api) -> MagicMock:
        """
        Create service instance with mocked dependencies.
        
        This is DEPENDENCY INJECTION in action - the service
        receives its dependencies rather than creating them.
        This is what makes code testable.
        """
        # In real code:
        # return LeadEnrichmentService(
        #     llm_client=mock_llm_client,
        #     enrichment_api=mock_enrichment_api,
        # )
        
        # For this example, return a mock
        service = MagicMock()
        service.enrich = AsyncMock()
        service.batch_enrich = AsyncMock()
        return service

    # -------------------------------------------------------------------------
    # Basic Happy Path Tests
    # -------------------------------------------------------------------------

    @pytest.mark.unit
    async def test_enrich_returns_enriched_lead(
        self, 
        service: MagicMock, 
        sample_lead: dict,
    ) -> None:
        """
        Test that enrichment returns expected data structure.
        
        Test naming convention: test_<what>_<expected_behavior>
        """
        # Arrange - set up test data and mocks
        service.enrich.return_value = {
            **sample_lead,
            "enriched": True,
            "linkedin_url": "https://linkedin.com/company/test",
            "technologies": ["QuickBooks"],
        }
        
        # Act - call the code being tested
        result = await service.enrich(sample_lead)
        
        # Assert - verify the results
        assert result["enriched"] is True
        assert "linkedin_url" in result
        assert result["company_name"] == sample_lead["company_name"]
        
        # Verify the method was called correctly
        service.enrich.assert_called_once_with(sample_lead)

    @pytest.mark.unit
    async def test_batch_enrich_processes_all_leads(
        self,
        service: MagicMock,
        sample_leads: list[dict],
    ) -> None:
        """
        Test batch processing handles multiple leads correctly.
        """
        # Arrange
        service.batch_enrich.return_value = [
            {**lead, "enriched": True} for lead in sample_leads
        ]
        
        # Act
        results = await service.batch_enrich(sample_leads)
        
        # Assert
        assert len(results) == len(sample_leads)
        assert all(r["enriched"] for r in results)

    # -------------------------------------------------------------------------
    # Edge Cases and Error Handling
    # -------------------------------------------------------------------------

    @pytest.mark.unit
    async def test_enrich_handles_missing_email(
        self,
        service: MagicMock,
        sample_lead: dict,
    ) -> None:
        """
        Test graceful handling of incomplete data.
        
        Edge cases are where bugs hide. Always test:
        - Missing/null values
        - Empty strings
        - Empty lists
        - Boundary values
        """
        # Arrange
        lead_without_email = {**sample_lead}
        del lead_without_email["email"]
        
        service.enrich.return_value = {
            **lead_without_email,
            "enriched": True,
            "enrichment_status": "partial",
        }
        
        # Act
        result = await service.enrich(lead_without_email)
        
        # Assert
        assert result["enrichment_status"] == "partial"
        assert "email" not in result

    @pytest.mark.unit
    async def test_enrich_raises_on_api_failure(
        self,
        service: MagicMock,
        sample_lead: dict,
    ) -> None:
        """
        Test that API failures are handled appropriately.
        
        Use pytest.raises to test exception handling.
        """
        # Arrange - configure mock to raise exception
        service.enrich.side_effect = ConnectionError("API unavailable")
        
        # Act & Assert - verify exception is raised
        with pytest.raises(ConnectionError) as exc_info:
            await service.enrich(sample_lead)
        
        assert "API unavailable" in str(exc_info.value)

    @pytest.mark.unit
    async def test_enrich_retries_on_rate_limit(
        self,
        service: MagicMock,
        sample_lead: dict,
    ) -> None:
        """
        Test retry logic on rate limiting.
        
        Use side_effect with a list to simulate sequence of responses.
        """
        # Arrange - first call fails, second succeeds
        rate_limit_error = Exception("Rate limited")
        success_response = {**sample_lead, "enriched": True}
        
        service.enrich.side_effect = [rate_limit_error, success_response]
        
        # In real code, you'd test that retry logic works:
        # result = await service.enrich_with_retry(sample_lead)
        # assert result["enriched"] is True
        # assert service.enrich.call_count == 2

    # -------------------------------------------------------------------------
    # Data Validation Tests
    # -------------------------------------------------------------------------

    @pytest.mark.unit
    @pytest.mark.parametrize(
        "invalid_input,error_type",
        [
            (None, TypeError),
            ({}, ValueError),
            ({"company_name": ""}, ValueError),
            ({"company_name": "x" * 1000}, ValueError),  # Too long
        ],
    )
    async def test_enrich_validates_input(
        self,
        service: MagicMock,
        invalid_input: dict | None,
        error_type: type,
    ) -> None:
        """
        Test input validation using parametrize.
        
        @pytest.mark.parametrize runs the same test with different inputs.
        Much cleaner than writing 4 separate tests.
        """
        service.enrich.side_effect = error_type("Invalid input")
        
        with pytest.raises(error_type):
            await service.enrich(invalid_input)


# =============================================================================
# Example: Testing Pure Functions
# =============================================================================

class TestDataTransformation:
    """
    Tests for pure functions (no side effects).
    
    Pure functions are the EASIEST to test:
    - Same input always gives same output
    - No mocking needed
    - No async complexity
    """

    @pytest.mark.unit
    def test_normalize_company_name(self) -> None:
        """Test company name normalization."""
        # Example function (you'd import the real one)
        def normalize_company_name(name: str) -> str:
            return name.strip().title().replace("Llc", "LLC")
        
        assert normalize_company_name("  acme hvac llc  ") == "Acme Hvac LLC"
        assert normalize_company_name("TEST COMPANY") == "Test Company"

    @pytest.mark.unit
    @pytest.mark.parametrize(
        "phone,expected",
        [
            ("555-123-4567", "+15551234567"),
            ("(555) 123-4567", "+15551234567"),
            ("555.123.4567", "+15551234567"),
            ("+1 555 123 4567", "+15551234567"),
        ],
    )
    def test_normalize_phone_number(self, phone: str, expected: str) -> None:
        """
        Test phone normalization with multiple formats.
        
        Parametrize is perfect for testing multiple input variations.
        """
        # Example function
        def normalize_phone(phone: str) -> str:
            digits = "".join(c for c in phone if c.isdigit())
            if len(digits) == 10:
                digits = "1" + digits
            return f"+{digits}"
        
        assert normalize_phone(phone) == expected


# =============================================================================
# Example: Testing Async Code
# =============================================================================

class TestAsyncOperations:
    """
    Tests for async code patterns.
    
    Common async testing scenarios:
    - Concurrent operations
    - Timeouts
    - Race conditions
    """

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_concurrent_enrichment(
        self,
        sample_leads: list[dict],
    ) -> None:
        """
        Test that concurrent operations complete correctly.
        """
        import asyncio
        
        async def mock_enrich(lead: dict) -> dict:
            await asyncio.sleep(0.01)  # Simulate I/O
            return {**lead, "enriched": True}
        
        # Run concurrently
        tasks = [mock_enrich(lead) for lead in sample_leads[:5]]
        results = await asyncio.gather(*tasks)
        
        assert len(results) == 5
        assert all(r["enriched"] for r in results)

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_timeout_handling(self) -> None:
        """
        Test that slow operations are handled properly.
        """
        import asyncio
        
        async def slow_operation() -> str:
            await asyncio.sleep(10)  # Would be too slow
            return "completed"
        
        with pytest.raises(asyncio.TimeoutError):
            await asyncio.wait_for(slow_operation(), timeout=0.1)


# =============================================================================
# Running Tests Cheat Sheet (add as comment for reference)
# =============================================================================
"""
Common pytest commands:

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/unit/test_lead_enrichment.py

# Run specific test class
pytest tests/unit/test_lead_enrichment.py::TestLeadEnrichmentService

# Run specific test method
pytest tests/unit/test_lead_enrichment.py::TestLeadEnrichmentService::test_enrich_returns_enriched_lead

# Run tests matching a pattern
pytest -k "enrich"

# Run only unit tests (using markers)
pytest -m unit

# Run with coverage report
pytest --cov=src --cov-report=html

# Run in parallel (requires pytest-xdist)
pytest -n auto

# Stop on first failure
pytest -x

# Show local variables in tracebacks
pytest -l

# Run last failed tests only
pytest --lf
"""
