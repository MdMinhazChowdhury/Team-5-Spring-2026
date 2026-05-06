import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Transactions from '../pages/Transactions'

function ProtectedRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />
}

function buildApp(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

function setupDashboardFetch() {
  fetch.mockImplementation((url) => {
    if (url.includes('/monthly-income')) {
      return Promise.resolve({ ok: true, json: async () => ({ total: 4200 }) })
    }
    if (url.includes('/monthly-spending')) {
      return Promise.resolve({ ok: true, json: async () => ({ total: -2800 }) })
    }
    if (url.includes('/accounts')) {
      return Promise.resolve({ ok: true, json: async () => [] })
    }
    if (url.includes('/user')) {
      return Promise.resolve({ ok: true, json: async () => ({ first_name: 'Test' }) })
    }
    return Promise.resolve({ ok: true, json: async () => [] })
  })
}

function setupTransactionsFetch(transactions = []) {
  fetch.mockImplementation((url, options) => {
    if (options?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: async () => ({ transaction_id: 99 }),
      })
    }
    if (url.includes('/accounts')) {
      return Promise.resolve({ ok: true, json: async () => [] })
    }
    if (url.includes('/categories')) {
      return Promise.resolve({ ok: true, json: async () => [] })
    }
    if (url.includes('/transactions')) {
      return Promise.resolve({ ok: true, json: async () => transactions })
    }
    return Promise.resolve({ ok: true, json: async () => [] })
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
  localStorage.clear()
})

describe('Auth & Transactions integration', () => {
  it('redirects to Dashboard after successful login', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/login')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ access_token: 'token123' }),
        })
      }
      return Promise.resolve({ ok: true, json: async () => ({}) })
    })

    buildApp('/login')
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'user@test.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument())
  })

  it('redirects unauthenticated user to login when accessing /transactions', () => {
    buildApp('/transactions')
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
  })

  it('renders transactions table after login and navigation to /transactions', async () => {
    localStorage.setItem('token', 'test_token')
    setupTransactionsFetch([
      {
        TransactionID: 1,
        Description: 'Test Paycheck',
        Trans_Total: 2000,
        CategoryID: 1,
        AccountID: 1,
        DateOfTransaction: '2024-04-10',
      },
    ])
    buildApp('/transactions')
    await waitFor(() => expect(screen.getByText('Test Paycheck')).toBeInTheDocument())
  })

  it('new transaction appears in list after add form is submitted', async () => {
    localStorage.setItem('token', 'test_token')
    const transactions = [
      {
        TransactionID: 1,
        Description: 'Initial Entry',
        Trans_Total: 100,
        CategoryID: 1,
        AccountID: 1,
        DateOfTransaction: '2024-04-01',
      },
    ]
    const newTransaction = {
      TransactionID: 2,
      Description: 'New Bonus',
      Trans_Total: 500,
      CategoryID: 1,
      AccountID: 1,
      DateOfTransaction: '2024-04-15',
    }
    let callCount = 0

    fetch.mockImplementation((url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({ ok: true, json: async () => ({ transaction_id: 2 }) })
      }
      if (url.includes('/accounts')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ account_id: 1, account_type_name: 'Checking' }],
        })
      }
      if (url.includes('/categories')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ CategoryID: 1, Category_Title: 'Income' }],
        })
      }
      if (url.includes('/transactions')) {
        callCount++
        const data = callCount === 1 ? transactions : [...transactions, newTransaction]
        return Promise.resolve({ ok: true, json: async () => data })
      }
      return Promise.resolve({ ok: true, json: async () => [] })
    })

    buildApp('/transactions')
    await waitFor(() => expect(screen.getByText('Initial Entry')).toBeInTheDocument())

    fireEvent.click(screen.getByText('+ Add Transaction'))
    await userEvent.type(screen.getByLabelText(/Description/i), 'New Bonus')
    await userEvent.clear(screen.getByLabelText(/Amount/i))
    await userEvent.type(screen.getByLabelText(/Amount/i), '500')
    await userEvent.selectOptions(screen.getByLabelText(/Category/i), '1')
    await userEvent.selectOptions(screen.getByLabelText(/Account/i), '1')

    fireEvent.click(screen.getByRole('button', { name: /Add Transaction/i }))
    await waitFor(() => expect(screen.getByText('New Bonus')).toBeInTheDocument())
  })
})
