import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import EditProfileModal from './EditProfileModal'

const mockUser = { first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' }

const mockAccounts = [
  { account_id: 1, account_type_name: 'Checking', account_balance: 1500.0 },
  { account_id: 2, account_type_name: 'Savings', account_balance: 4000.0 },
]

const defaultProps = {
  user: mockUser,
  onClose: vi.fn(),
  onProfileUpdated: vi.fn(),
}

function setupAccountsFetch(accounts = mockAccounts) {
  fetch.mockImplementation((url, options) => {
    if (options?.method === 'PUT') {
      return Promise.resolve({ ok: true, json: async () => ({}) })
    }
    if (options?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          account_id: 3,
          account_type_name: 'Savings',
          account_balance: 500.0,
          account_type_id: 2,
        }),
      })
    }
    if (options?.method === 'DELETE') {
      return Promise.resolve({ ok: true, json: async () => ({ message: 'deleted' }) })
    }
    if (url.includes('/accounts')) {
      return Promise.resolve({ ok: true, json: async () => accounts })
    }
    return Promise.resolve({ ok: true, json: async () => ({}) })
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
  localStorage.clear()
  defaultProps.onClose.mockClear()
  defaultProps.onProfileUpdated.mockClear()
})

describe('EditProfileModal', () => {
  it('renders profile input fields', async () => {
    setupAccountsFetch()
    render(<EditProfileModal {...defaultProps} />)
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument()
  })

  it('shows success message after profile update', async () => {
    setupAccountsFetch()
    const user = userEvent.setup()
    render(<EditProfileModal {...defaultProps} />)

    const emailInput = screen.getByLabelText(/Email/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'newemail@example.com')

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }))
    await waitFor(() =>
      expect(screen.getByText('Profile updated successfully.')).toBeInTheDocument()
    )
  })

  it('shows error message when profile update fails', async () => {
    fetch.mockImplementation((url, options) => {
      if (options?.method === 'PUT') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ detail: 'Update failed' }),
        })
      }
      if (url.includes('/accounts')) {
        return Promise.resolve({ ok: true, json: async () => [] })
      }
      return Promise.resolve({ ok: true, json: async () => ({}) })
    })
    const user = userEvent.setup()
    render(<EditProfileModal {...defaultProps} />)

    const emailInput = screen.getByLabelText(/Email/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'changed@example.com')

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }))
    await waitFor(() => expect(screen.getByText('Update failed')).toBeInTheDocument())
  })

  it('renders linked accounts fetched from API', async () => {
    setupAccountsFetch()
    render(<EditProfileModal {...defaultProps} />)
    await waitFor(() => expect(screen.getByText('Checking')).toBeInTheDocument())
    expect(screen.getByText('Savings')).toBeInTheDocument()
  })

  it('adds a new account and shows it in the list', async () => {
    setupAccountsFetch([])
    const user = userEvent.setup()
    render(<EditProfileModal {...defaultProps} />)
    await waitFor(() => expect(screen.getByText('No linked accounts yet.')).toBeInTheDocument())

    await user.selectOptions(screen.getByRole('combobox'), '2')
    await user.type(screen.getByPlaceholderText('Balance'), '500')
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }))

    await waitFor(() => expect(screen.getByText('Savings')).toBeInTheDocument())
  })

  it('removes an account after clicking delete', async () => {
    setupAccountsFetch()
    render(<EditProfileModal {...defaultProps} />)
    await waitFor(() => expect(screen.getByText('Checking')).toBeInTheDocument())

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete account' })[0])
    await waitFor(() => expect(screen.queryByText('Checking')).not.toBeInTheDocument())
    expect(screen.getByText('Savings')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    setupAccountsFetch()
    render(<EditProfileModal {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})
