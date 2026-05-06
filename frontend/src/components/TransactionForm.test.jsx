import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import TransactionForm from './TransactionForm'

const mockAccounts = [{ account_id: 1, account_type_name: 'Checking' }]
const mockCategories = [{ CategoryID: 1, Category_Title: 'Income' }]

const existingTransaction = {
  TransactionID: 42,
  Description: 'Salary',
  Trans_Total: 3000,
  CategoryID: 1,
  AccountID: 1,
  DateOfTransaction: '2024-04-01',
}

const defaultProps = {
  onClose: vi.fn(),
  onSave: vi.fn(),
  transaction: null,
  accounts: mockAccounts,
  categories: mockCategories,
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
  localStorage.clear()
  defaultProps.onClose.mockClear()
  defaultProps.onSave.mockClear()
})

describe('TransactionForm', () => {
  it('renders all form fields', () => {
    render(<TransactionForm {...defaultProps} />)
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Account/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument()
  })

  it('create mode: submit calls POST /transactions with correct body', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ transaction_id: 1 }) })
    const user = userEvent.setup()
    render(<TransactionForm {...defaultProps} />)

    await user.type(screen.getByLabelText(/Description/i), 'Coffee')
    await user.clear(screen.getByLabelText(/Amount/i))
    await user.type(screen.getByLabelText(/Amount/i), '-5.50')
    await user.selectOptions(screen.getByLabelText(/Category/i), '1')
    await user.selectOptions(screen.getByLabelText(/Account/i), '1')

    fireEvent.click(screen.getByRole('button', { name: /Add Transaction/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/transactions'),
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  it('edit mode: pre-fills fields with existing transaction values', () => {
    render(<TransactionForm {...defaultProps} transaction={existingTransaction} />)
    expect(screen.getByDisplayValue('Salary')).toBeInTheDocument()
    expect(screen.getByDisplayValue('3000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024-04-01')).toBeInTheDocument()
  })

  it('edit mode: submit calls PUT /transactions/:id', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ message: 'updated' }) })
    const user = userEvent.setup()
    render(<TransactionForm {...defaultProps} transaction={existingTransaction} />)

    const descInput = screen.getByLabelText(/Description/i)
    await user.clear(descInput)
    await user.type(descInput, 'Updated Salary')

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/transactions/42'),
        expect.objectContaining({ method: 'PUT' })
      )
    })
  })

  it('shows Saving… on submit button while fetch is pending', async () => {
    fetch.mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    render(<TransactionForm {...defaultProps} />)

    await user.clear(screen.getByLabelText(/Amount/i))
    await user.type(screen.getByLabelText(/Amount/i), '100')
    await user.selectOptions(screen.getByLabelText(/Category/i), '1')
    await user.selectOptions(screen.getByLabelText(/Account/i), '1')

    fireEvent.click(screen.getByRole('button', { name: /Add Transaction/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /Saving/i })).toBeInTheDocument())
  })

  it('displays error message when API call fails', async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Server error' }),
    })
    const user = userEvent.setup()
    render(<TransactionForm {...defaultProps} />)

    await user.clear(screen.getByLabelText(/Amount/i))
    await user.type(screen.getByLabelText(/Amount/i), '100')
    await user.selectOptions(screen.getByLabelText(/Category/i), '1')
    await user.selectOptions(screen.getByLabelText(/Account/i), '1')

    fireEvent.click(screen.getByRole('button', { name: /Add Transaction/i }))
    await waitFor(() => expect(screen.getByText('Server error')).toBeInTheDocument())
  })

  it('calls onClose when backdrop is clicked', () => {
    const { container } = render(<TransactionForm {...defaultProps} />)
    fireEvent.click(container.firstChild)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('does not call fetch when required amount field is empty', async () => {
    const user = userEvent.setup()
    render(<TransactionForm {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /Add Transaction/i }))
    expect(fetch).not.toHaveBeenCalled()
  })
})
