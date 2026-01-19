/**
 * Example: Testing Next.js Page Components (App Router)
 *
 * This demonstrates how to test:
 * - Page components with Server Components
 * - Client Components with interactivity
 * - Components using hooks (useRouter, useSearchParams)
 * - Components with data fetching
 * - Form submissions
 * - Loading and error states
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { render, renderWithUser, createMockUser, createMockSession } from '../src/test/utils'

// -----------------------------------------------------------------
// Example Components (would be in your app directory)
// -----------------------------------------------------------------

// A simple client component with user interactions
function LoginButton({ onLogin }: { onLogin: () => void }) {
  return (
    <button onClick={onLogin} className="btn-primary">
      Sign In
    </button>
  )
}

// A component that displays user info
function UserProfile({ user }: { user: { name: string; email: string } | null }) {
  if (!user) {
    return <p>Please log in to view your profile.</p>
  }

  return (
    <div data-testid="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}

// A component with a form
function ContactForm({ onSubmit }: { onSubmit: (data: { name: string; message: string }) => void }) {
  const [formData, setFormData] = React.useState({ name: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Contact form">
      <label htmlFor="name">Name</label>
      <input
        id="name"
        type="text"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        required
      />

      <label htmlFor="message">Message</label>
      <textarea
        id="message"
        value={formData.message}
        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
        required
      />

      <button type="submit">Send Message</button>
    </form>
  )
}

// A component with loading state
function DataList({ isLoading, items }: { isLoading: boolean; items: string[] }) {
  if (isLoading) {
    return <div role="status" aria-label="Loading">Loading...</div>
  }

  if (items.length === 0) {
    return <p>No items found.</p>
  }

  return (
    <ul aria-label="Item list">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  )
}

// A navigation component that uses Next.js hooks
function Navigation() {
  // In actual code, this would use usePathname() from next/navigation
  // The mock in setup.ts returns '/' by default
  const pathname = '/'

  return (
    <nav aria-label="Main navigation">
      <a href="/" className={pathname === '/' ? 'active' : ''}>Home</a>
      <a href="/about" className={pathname === '/about' ? 'active' : ''}>About</a>
      <a href="/contact" className={pathname === '/contact' ? 'active' : ''}>Contact</a>
    </nav>
  )
}

// -----------------------------------------------------------------
// Tests
// -----------------------------------------------------------------

describe('LoginButton', () => {
  it('renders the sign in button', () => {
    const handleLogin = vi.fn()
    render(<LoginButton onLogin={handleLogin} />)

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls onLogin when clicked', async () => {
    const handleLogin = vi.fn()
    const { user } = renderWithUser(<LoginButton onLogin={handleLogin} />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(handleLogin).toHaveBeenCalledTimes(1)
  })
})

describe('UserProfile', () => {
  it('shows login prompt when user is null', () => {
    render(<UserProfile user={null} />)

    expect(screen.getByText(/please log in/i)).toBeInTheDocument()
    expect(screen.queryByTestId('user-profile')).not.toBeInTheDocument()
  })

  it('displays user information when logged in', () => {
    const mockUser = createMockUser({ name: 'John Doe', email: 'john@example.com' })
    render(<UserProfile user={mockUser} />)

    expect(screen.getByTestId('user-profile')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })
})

describe('ContactForm', () => {
  it('renders all form fields', () => {
    const handleSubmit = vi.fn()
    render(<ContactForm onSubmit={handleSubmit} />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('calls onSubmit with form data when submitted', async () => {
    const handleSubmit = vi.fn()
    const { user } = renderWithUser(<ContactForm onSubmit={handleSubmit} />)

    // Fill in the form
    await user.type(screen.getByLabelText(/name/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/message/i), 'Hello, this is a test message.')

    // Submit the form
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Jane Doe',
      message: 'Hello, this is a test message.',
    })
  })

  it('allows clearing and retyping form fields', async () => {
    const handleSubmit = vi.fn()
    const { user } = renderWithUser(<ContactForm onSubmit={handleSubmit} />)

    const nameInput = screen.getByLabelText(/name/i)

    await user.type(nameInput, 'Initial Name')
    expect(nameInput).toHaveValue('Initial Name')

    await user.clear(nameInput)
    expect(nameInput).toHaveValue('')

    await user.type(nameInput, 'Updated Name')
    expect(nameInput).toHaveValue('Updated Name')
  })
})

describe('DataList', () => {
  it('shows loading state', () => {
    render(<DataList isLoading={true} items={[]} />)

    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('shows empty state when no items', () => {
    render(<DataList isLoading={false} items={[]} />)

    expect(screen.getByText(/no items found/i)).toBeInTheDocument()
  })

  it('renders list of items', () => {
    const items = ['Item 1', 'Item 2', 'Item 3']
    render(<DataList isLoading={false} items={items} />)

    const list = screen.getByRole('list', { name: /item list/i })
    const listItems = within(list).getAllByRole('listitem')

    expect(listItems).toHaveLength(3)
    expect(listItems[0]).toHaveTextContent('Item 1')
    expect(listItems[1]).toHaveTextContent('Item 2')
    expect(listItems[2]).toHaveTextContent('Item 3')
  })
})

describe('Navigation', () => {
  it('renders all navigation links', () => {
    render(<Navigation />)

    const nav = screen.getByRole('navigation', { name: /main navigation/i })

    expect(within(nav).getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /about/i })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /contact/i })).toBeInTheDocument()
  })

  it('marks current page as active', () => {
    render(<Navigation />)

    // The mock usePathname returns '/' by default
    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink).toHaveClass('active')
  })
})

// -----------------------------------------------------------------
// Testing Components with Async Data
// -----------------------------------------------------------------

describe('Component with async data fetching', () => {
  // A component that fetches and displays data
  function AsyncDataComponent() {
    const [data, setData] = React.useState<string[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
      async function fetchData() {
        try {
          // Simulated fetch - in real code this would call an API
          const response = await fetch('/api/data')
          if (!response.ok) throw new Error('Failed to fetch')
          const result = await response.json()
          setData(result)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
          setIsLoading(false)
        }
      }
      fetchData()
    }, [])

    if (isLoading) return <div>Loading...</div>
    if (error) return <div role="alert">{error}</div>
    return (
      <ul>
        {data.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    )
  }

  beforeEach(() => {
    vi.mocked(global.fetch).mockReset()
  })

  it('shows loading state initially', () => {
    vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}))

    render(<AsyncDataComponent />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays data after successful fetch', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(['Apple', 'Banana', 'Cherry']),
    } as Response)

    render(<AsyncDataComponent />)

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument()
    })

    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.getByText('Cherry')).toBeInTheDocument()
  })

  it('displays error message on fetch failure', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
    } as Response)

    render(<AsyncDataComponent />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch')
    })
  })
})
