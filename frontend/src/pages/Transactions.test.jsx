import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach } from 'vitest'
import Transactions from './Transactions'

const mockTransactions = [
  {
    TransactionID: 1,
    Trans_Total: 100,
    CategoryID: 1,
    Description: 'Salary',
    DateOfTransaction: '2026-04-01',
    AccountID: 1,
  },
  {
    TransactionID: 2,
    Trans_Total: -50,
    CategoryID: 2,
    Description: 'Groceries',
    DateOfTransaction: '2026-04-02',
    AccountID: 1,
  },
]

const mockAccounts = [{ account_id: 1, account_type_name: 'Checking', account_balance: 1000 }]
const mockCategories = [
  { CategoryID: 1, Category_Title: 'Income' },
  { CategoryID: 2, Category_Title: 'Food' },
]

function okJson(data) {
  return { ok: true, json: async () => data }
}

function setupFetch(...responses) {
  let mock = fetch
  responses.forEach((r) => { mock = mock.mockResolvedValueOnce(r) })
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
  localStorage.setItem('token', 'test-token')
})

describe('Transactions', () => {
  it('renders loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {}))
    render(<MemoryRouter><Transactions /></MemoryRouter>)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders transaction list after fetch', async () => {
    setupFetch(
      okJson(mockTransactions),
      okJson(mockAccounts),
      okJson(mockCategories),
    )
    render(<MemoryRouter><Transactions /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Salary')).toBeInTheDocument())
    expect(screen.getByText('Groceries')).toBeInTheDocument()
  })

  it('renders empty state when no transactions', async () => {
    setupFetch(
      okJson([]),
      okJson(mockAccounts),
      okJson(mockCategories),
    )
    render(<MemoryRouter><Transactions /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('No transactions found')).toBeInTheDocument())
  })

  it('shows correct income, expense, and net totals', async () => {
    setupFetch(
      okJson(mockTransactions),
      okJson(mockAccounts),
      okJson(mockCategories),
    )
    render(<MemoryRouter><Transactions /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Salary')).toBeInTheDocument())
    // +$100.00 appears in the table row and the footer total — both should exist
    expect(screen.getAllByText('+$100.00')).toHaveLength(2)
    // -$50.00 appears in the table row and the footer total
    expect(screen.getAllByText('-$50.00')).toHaveLength(2)
    // net balance +$50.00 appears only in the footer
    expect(screen.getByText('+$50.00')).toBeInTheDocument()
  })

  it('opens add transaction modal when Add Transaction is clicked', async () => {
    setupFetch(
      okJson([]),
      okJson(mockAccounts),
      okJson(mockCategories),
    )
    render(<MemoryRouter><Transactions /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('No transactions found')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /add transaction/i }))
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('deletes a transaction and removes it from the list', async () => {
    setupFetch(
      okJson(mockTransactions),
      okJson(mockAccounts),
      okJson(mockCategories),
      okJson({ message: 'Transaction deleted' }),
    )
    render(<MemoryRouter><Transactions /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Salary')).toBeInTheDocument())
    const deleteButtons = screen.getAllByTitle('Delete')
    await userEvent.click(deleteButtons[0])
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/transactions/1',
        expect.objectContaining({ method: 'DELETE' }),
      )
    )
    await waitFor(() => expect(screen.queryByText('Salary')).not.toBeInTheDocument())
  })

  it('handles fetch error gracefully without crashing', async () => {
    fetch.mockRejectedValue(new Error('Network error'))
    render(<MemoryRouter><Transactions /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument())
  })
})
