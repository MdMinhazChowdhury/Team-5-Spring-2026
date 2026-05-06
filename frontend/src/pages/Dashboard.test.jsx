import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach, afterEach } from 'vitest'
import Dashboard from './Dashboard'

describe('Dashboard', () => {
  it('renders all 4 stat cards', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    expect(screen.getByText('Total Balance')).toBeInTheDocument()
    expect(screen.getByText('Monthly Income')).toBeInTheDocument()
    expect(screen.getByText('Monthly Expenses')).toBeInTheDocument()
    expect(screen.getByText('Savings Goal')).toBeInTheDocument()
  })

  it('renders spending chart section', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    expect(screen.getByText('Spending by Category')).toBeInTheDocument()
  })

  it('renders income vs expenses chart section', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    expect(screen.getByText('Income vs Expenses (6 months)')).toBeInTheDocument()
  })

  it('renders recent transactions list', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument()
    expect(screen.getByText('Whole Foods Market')).toBeInTheDocument()
    expect(screen.getByText('Salary Deposit')).toBeInTheDocument()
  })

  it('has a View All link to /transactions', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    const link = screen.getByText(/View All Transactions/)
    expect(link.closest('a')).toHaveAttribute('href', '/transactions')
  })
})

describe('Dashboard — live API path', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('populates stat cards with values from API', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/monthly-income')) {
        return Promise.resolve({ ok: true, json: async () => ({ total: 3000 }) })
      }
      if (url.includes('/monthly-spending')) {
        return Promise.resolve({ ok: true, json: async () => ({ total: -2500 }) })
      }
      if (url.includes('/accounts')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ account_id: 1, account_type_name: 'Checking', account_balance: 5000 }],
        })
      }
      if (url.includes('/user')) {
        return Promise.resolve({ ok: true, json: async () => ({ first_name: 'Alex' }) })
      }
      return Promise.resolve({ ok: true, json: async () => ({}) })
    })

    render(<MemoryRouter><Dashboard /></MemoryRouter>)

    await waitFor(() => expect(screen.getByText('$5,000.00')).toBeInTheDocument())
    expect(screen.getByText('$3,000.00')).toBeInTheDocument()
    expect(screen.getByText('$2,500.00')).toBeInTheDocument()
  })

  it('renders without crashing when API calls fail', async () => {
    fetch.mockRejectedValue(new Error('Network error'))
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument())
    expect(screen.getByText('Total Balance')).toBeInTheDocument()
  })
})
