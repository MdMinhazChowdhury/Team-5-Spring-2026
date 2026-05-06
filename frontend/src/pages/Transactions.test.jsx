import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import Transactions from './Transactions'

const mockTransactions = [
  {
    TransactionID: 1,
    Description: 'Salary Deposit',
    Trans_Total: 3000,
    CategoryID: 1,
    AccountID: 1,
    DateOfTransaction: '2024-04-01',
  },
  {
    TransactionID: 2,
    Description: 'Grocery Run',
    Trans_Total: -85,
    CategoryID: 2,
    AccountID: 1,
    DateOfTransaction: '2024-04-02',
  },
]

const mockAccounts = [{ account_id: 1, account_type_name: 'Checking', account_balance: 5000 }]

const mockCategories = [
  { CategoryID: 1, Category_Title: 'Income' },
  { CategoryID: 2, Category_Title: 'Food' },
]

function setupFetch({
  transactions = mockTransactions,
  accounts = mockAccounts,
  categories = mockCategories,
} = {}) {
  fetch.mockImplementation((url, options) => {
    if (options?.method === 'DELETE') {
      return Promise.resolve({ ok: true, json: async () => ({ message: 'deleted' }) })
    }
    if (url.includes('/accounts')) {
      return Promise.resolve({ ok: true, json: async () => accounts })
    }
    if (url.includes('/categories')) {
      return Promise.resolve({ ok: true, json: async () => categories })
    }
    if (url.includes('/transactions')) {
      return Promise.resolve({ ok: true, json: async () => transactions })
    }
    return Promise.resolve({ ok: true, json: async () => [] })
  })
}

function renderPage() {
  return render(
    <MemoryRouter>
      <Transactions />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
  localStorage.clear()
})

describe('Transactions', () => {
  it('renders transaction table headers', async () => {
    setupFetch()
    renderPage()
    await waitFor(() => expect(screen.getByText('DATE')).toBeInTheDocument())
    expect(screen.getByText('DESCRIPTION')).toBeInTheDocument()
    expect(screen.getByText('CATEGORY')).toBeInTheDocument()
    expect(screen.getByText('TYPE')).toBeInTheDocument()
    expect(screen.getByText('AMOUNT')).toBeInTheDocument()
    expect(screen.getByText('ACTIONS')).toBeInTheDocument()
  })

  it('displays fetched transactions', async () => {
    setupFetch()
    renderPage()
    await waitFor(() => expect(screen.getByText('Salary Deposit')).toBeInTheDocument())
    expect(screen.getByText('Grocery Run')).toBeInTheDocument()
  })

  it('filters transactions by search input', async () => {
    setupFetch()
    renderPage()
    await waitFor(() => expect(screen.getByText('Salary Deposit')).toBeInTheDocument())
    await userEvent.type(screen.getByPlaceholderText('Search by description...'), 'Salary')
    expect(screen.getByText('Salary Deposit')).toBeInTheDocument()
    expect(screen.queryByText('Grocery Run')).not.toBeInTheDocument()
  })

  it('filters transactions by category dropdown', async () => {
    setupFetch()
    renderPage()
    await waitFor(() => expect(screen.getByText('Salary Deposit')).toBeInTheDocument())
    await userEvent.selectOptions(screen.getByRole('combobox'), '2')
    expect(screen.getByText('Grocery Run')).toBeInTheDocument()
    expect(screen.queryByText('Salary Deposit')).not.toBeInTheDocument()
  })

  it('renders summary footer with correct totals', async () => {
    setupFetch()
    renderPage()
    await waitFor(() => expect(screen.getByText('TOTAL INCOME')).toBeInTheDocument())
    expect(screen.getByText('TOTAL EXPENSES')).toBeInTheDocument()
    expect(screen.getByText('NET BALANCE')).toBeInTheDocument()
    expect(screen.getByText('+$3000.00')).toBeInTheDocument()
    expect(screen.getByText('-$85.00')).toBeInTheDocument()
    expect(screen.getByText('+$2915.00')).toBeInTheDocument()
  })

  it('opens add transaction modal when Add Transaction is clicked', async () => {
    setupFetch()
    renderPage()
    await waitFor(() => expect(screen.getByText('+ Add Transaction')).toBeInTheDocument())
    fireEvent.click(screen.getByText('+ Add Transaction'))
    expect(screen.getByText('Add Transaction')).toBeInTheDocument()
  })

  it('opens pre-filled edit modal when edit button is clicked', async () => {
    setupFetch()
    renderPage()
    await waitFor(() => expect(screen.getByText('Salary Deposit')).toBeInTheDocument())
    fireEvent.click(screen.getAllByTitle('Edit')[0])
    expect(screen.getByText('Edit Transaction')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Salary Deposit')).toBeInTheDocument()
  })

  it('removes a transaction row after successful delete', async () => {
    setupFetch()
    renderPage()
    await waitFor(() => expect(screen.getByText('Salary Deposit')).toBeInTheDocument())
    fireEvent.click(screen.getAllByTitle('Delete')[0])
    await waitFor(() => expect(screen.queryByText('Salary Deposit')).not.toBeInTheDocument())
    expect(screen.getByText('Grocery Run')).toBeInTheDocument()
  })

  it('shows loading indicator before fetch resolves', () => {
    fetch.mockImplementation(() => new Promise(() => {}))
    renderPage()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error message when fetch fails', async () => {
    fetch.mockRejectedValue(new Error('Network error'))
    renderPage()
    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument())
  })
})
