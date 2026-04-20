import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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
