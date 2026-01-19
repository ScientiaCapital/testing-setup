/**
 * Example Component Tests
 * 
 * This file demonstrates React Testing Library best practices:
 * - Query by accessibility roles (not test IDs or classes)
 * - Test user behavior, not implementation details
 * - Use userEvent for realistic interactions
 * - Test async behavior properly
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/utils'
import { mockLead, mockApiError } from '@/test/utils'

// Example component for testing (in real code, import your actual component)
// import { LeadCard } from '@/components/LeadCard'

// =============================================================================
// Mock Component for Example (replace with your real component import)
// =============================================================================

interface Lead {
  id: string
  company_name: string
  contact_name: string
  email: string
  status: string
}

interface LeadCardProps {
  lead: Lead
  onStatusChange?: (id: string, status: string) => void
  onDelete?: (id: string) => void
}

// Simplified component for demonstration
function LeadCard({ lead, onStatusChange, onDelete }: LeadCardProps) {
  return (
    <article aria-labelledby={`lead-${lead.id}`}>
      <h3 id={`lead-${lead.id}`}>{lead.company_name}</h3>
      <p>{lead.contact_name}</p>
      <p>{lead.email}</p>
      <span data-testid="status-badge">{lead.status}</span>
      
      <select
        aria-label="Change status"
        value={lead.status}
        onChange={(e) => onStatusChange?.(lead.id, e.target.value)}
      >
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="lost">Lost</option>
      </select>
      
      <button onClick={() => onDelete?.(lead.id)}>
        Delete
      </button>
    </article>
  )
}

// =============================================================================
// Component Tests
// =============================================================================

describe('LeadCard', () => {
  // Shared test data
  const defaultLead: Lead = {
    id: 'lead_123',
    company_name: 'Acme HVAC Services',
    contact_name: 'John Smith',
    email: 'john@acmehvac.com',
    status: 'new',
  }
  
  // Common mock functions - reset before each test
  let onStatusChange: ReturnType<typeof vi.fn>
  let onDelete: ReturnType<typeof vi.fn>
  
  beforeEach(() => {
    onStatusChange = vi.fn()
    onDelete = vi.fn()
  })
  
  // ---------------------------------------------------------------------------
  // Rendering Tests
  // ---------------------------------------------------------------------------
  
  describe('rendering', () => {
    it('displays lead information correctly', () => {
      render(<LeadCard lead={defaultLead} />)
      
      // Query by accessible role, not test ID or class
      expect(screen.getByRole('heading', { name: defaultLead.company_name })).toBeInTheDocument()
      expect(screen.getByText(defaultLead.contact_name)).toBeInTheDocument()
      expect(screen.getByText(defaultLead.email)).toBeInTheDocument()
    })
    
    it('shows current status', () => {
      render(<LeadCard lead={defaultLead} />)
      
      // When you MUST use testId (like for styled badges)
      expect(screen.getByTestId('status-badge')).toHaveTextContent('new')
    })
    
    it('renders different lead data correctly', () => {
      // Test with different data to ensure component is actually using props
      const differentLead = {
        ...defaultLead,
        company_name: 'Different Company',
        contact_name: 'Jane Doe',
      }
      
      render(<LeadCard lead={differentLead} />)
      
      expect(screen.getByRole('heading', { name: 'Different Company' })).toBeInTheDocument()
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })
  })
  
  // ---------------------------------------------------------------------------
  // User Interaction Tests
  // ---------------------------------------------------------------------------
  
  describe('user interactions', () => {
    it('calls onStatusChange when user changes status', async () => {
      const user = userEvent.setup()
      
      render(
        <LeadCard 
          lead={defaultLead} 
          onStatusChange={onStatusChange} 
        />
      )
      
      // Find by accessible role and label
      const statusSelect = screen.getByRole('combobox', { name: /change status/i })
      
      // Use userEvent (not fireEvent) for realistic behavior
      await user.selectOptions(statusSelect, 'qualified')
      
      // Verify callback was called with correct arguments
      expect(onStatusChange).toHaveBeenCalledTimes(1)
      expect(onStatusChange).toHaveBeenCalledWith('lead_123', 'qualified')
    })
    
    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <LeadCard 
          lead={defaultLead} 
          onDelete={onDelete} 
        />
      )
      
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)
      
      expect(onDelete).toHaveBeenCalledWith('lead_123')
    })
    
    it('handles rapid clicks gracefully', async () => {
      const user = userEvent.setup()
      
      render(
        <LeadCard 
          lead={defaultLead} 
          onDelete={onDelete} 
        />
      )
      
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      
      // Simulate user clicking rapidly
      await user.click(deleteButton)
      await user.click(deleteButton)
      await user.click(deleteButton)
      
      // Depending on your implementation, you might debounce or allow multiple
      // This test documents the expected behavior
      expect(onDelete).toHaveBeenCalledTimes(3)
    })
  })
  
  // ---------------------------------------------------------------------------
  // Accessibility Tests
  // ---------------------------------------------------------------------------
  
  describe('accessibility', () => {
    it('has accessible name for the card', () => {
      render(<LeadCard lead={defaultLead} />)
      
      // Card should be findable by its company name
      const card = screen.getByRole('article', { name: defaultLead.company_name })
      expect(card).toBeInTheDocument()
    })
    
    it('status dropdown has accessible label', () => {
      render(<LeadCard lead={defaultLead} />)
      
      // Screen readers should be able to identify this control
      const dropdown = screen.getByRole('combobox', { name: /change status/i })
      expect(dropdown).toBeInTheDocument()
    })
  })
  
  // ---------------------------------------------------------------------------
  // Edge Cases
  // ---------------------------------------------------------------------------
  
  describe('edge cases', () => {
    it('handles missing optional callbacks', async () => {
      const user = userEvent.setup()
      
      // Should not crash without callbacks
      render(<LeadCard lead={defaultLead} />)
      
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      
      // Should not throw
      await expect(user.click(deleteButton)).resolves.not.toThrow()
    })
    
    it('displays long company names correctly', () => {
      const leadWithLongName = {
        ...defaultLead,
        company_name: 'This Is A Very Long Company Name That Might Cause Layout Issues In Some Cases',
      }
      
      render(<LeadCard lead={leadWithLongName} />)
      
      expect(screen.getByRole('heading', { name: leadWithLongName.company_name })).toBeInTheDocument()
    })
    
    it('handles special characters in lead data', () => {
      const leadWithSpecialChars = {
        ...defaultLead,
        company_name: "O'Brien & Associates <HVAC>",
        contact_name: 'José García-López',
        email: 'jose+test@example.com',
      }
      
      render(<LeadCard lead={leadWithSpecialChars} />)
      
      expect(screen.getByRole('heading', { name: leadWithSpecialChars.company_name })).toBeInTheDocument()
      expect(screen.getByText(leadWithSpecialChars.contact_name)).toBeInTheDocument()
    })
  })
})

// =============================================================================
// Async Component Tests Example
// =============================================================================

describe('async component patterns', () => {
  // Mock API function
  const fetchLeads = vi.fn()
  
  // Example async component
  function LeadsList() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    useEffect(() => {
      fetchLeads()
        .then((data: Lead[]) => {
          setLeads(data)
          setLoading(false)
        })
        .catch((err: Error) => {
          setError(err.message)
          setLoading(false)
        })
    }, [])
    
    if (loading) return <div>Loading leads...</div>
    if (error) return <div role="alert">Error: {error}</div>
    if (leads.length === 0) return <div>No leads found</div>
    
    return (
      <ul>
        {leads.map(lead => (
          <li key={lead.id}>{lead.company_name}</li>
        ))}
      </ul>
    )
  }
  
  beforeEach(() => {
    fetchLeads.mockReset()
  })
  
  it('shows loading state initially', () => {
    fetchLeads.mockReturnValue(new Promise(() => {}))  // Never resolves
    
    render(<LeadsList />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
  
  it('displays leads after loading', async () => {
    const mockLeads = [
      { id: '1', company_name: 'Company A', contact_name: '', email: '', status: 'new' },
      { id: '2', company_name: 'Company B', contact_name: '', email: '', status: 'new' },
    ]
    
    fetchLeads.mockResolvedValue(mockLeads)
    
    render(<LeadsList />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })
    
    // Check leads are displayed
    expect(screen.getByText('Company A')).toBeInTheDocument()
    expect(screen.getByText('Company B')).toBeInTheDocument()
  })
  
  it('shows error message on API failure', async () => {
    fetchLeads.mockRejectedValue(new Error('Network error'))
    
    render(<LeadsList />)
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    
    expect(screen.getByText(/network error/i)).toBeInTheDocument()
  })
  
  it('shows empty state when no leads returned', async () => {
    fetchLeads.mockResolvedValue([])
    
    render(<LeadsList />)
    
    await waitFor(() => {
      expect(screen.getByText(/no leads found/i)).toBeInTheDocument()
    })
  })
})

// Need these imports for the async example
import { useState, useEffect } from 'react'

// =============================================================================
// Query Priority Cheat Sheet (add as reference)
// =============================================================================
/**
 * React Testing Library Query Priority (in order of preference):
 * 
 * 1. Accessible to Everyone:
 *    - getByRole       - BEST: uses accessibility tree
 *    - getByLabelText  - for form fields
 *    - getByPlaceholderText
 *    - getByText       - for non-interactive elements
 *    - getByDisplayValue
 * 
 * 2. Semantic Queries:
 *    - getByAltText    - for images
 *    - getByTitle
 * 
 * 3. Test IDs (last resort):
 *    - getByTestId     - when other queries don't work
 * 
 * Common roles to query by:
 * - button, link, checkbox, radio
 * - textbox, combobox, listbox, option
 * - heading, list, listitem
 * - table, row, cell
 * - dialog, alert, alertdialog
 * - navigation, main, article
 * 
 * Async queries:
 * - findBy* - returns Promise, waits for element (use with await)
 * - queryBy* - returns null if not found (use for asserting absence)
 * - getBy* - throws if not found (use for asserting presence)
 */
