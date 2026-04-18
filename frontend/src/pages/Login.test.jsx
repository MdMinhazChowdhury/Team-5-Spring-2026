import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi, beforeEach } from 'vitest'
import Login from './Login'

function renderLogin() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
  localStorage.clear()
})

describe('Login', () => {
  it('renders email and password fields', () => {
    renderLogin()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('redirects to dashboard on successful login', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'token123' }),
    })
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'user@test.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument())
    expect(localStorage.getItem('token')).toBe('token123')
  })

  it('shows error message on failed login', async () => {
    fetch.mockResolvedValue({ ok: false })
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'bad@test.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument())
  })
})
