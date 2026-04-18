import { describe, it, expect, vi, beforeEach } from 'vitest'
import { transactionApi, authApi } from './api'

const BASE_URL = 'http://localhost:8000'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
  localStorage.clear()
})

describe('transactionApi', () => {
  it('getAll sends GET to /transactions', async () => {
    fetch.mockResolvedValue({ json: async () => [] })
    await transactionApi.getAll()
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/transactions`,
      expect.objectContaining({})
    )
  })

  it('create sends POST to /transactions with body', async () => {
    const txData = { description: 'Test', amount: 100 }
    fetch.mockResolvedValue({ json: async () => ({ id: 1, ...txData }) })
    await transactionApi.create(txData)
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/transactions`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify(txData) })
    )
  })

  it('update sends PUT to /transactions/:id', async () => {
    fetch.mockResolvedValue({ json: async () => ({}) })
    await transactionApi.update(42, { amount: 200 })
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/transactions/42`,
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('delete sends DELETE to /transactions/:id', async () => {
    fetch.mockResolvedValue({})
    await transactionApi.delete(42)
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/transactions/42`,
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})

describe('authApi', () => {
  it('login sends POST to /auth/login', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'abc123' }),
    })
    await authApi.login('user@test.com', 'password')
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/auth/login`,
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('login throws on non-ok response', async () => {
    fetch.mockResolvedValue({ ok: false })
    await expect(authApi.login('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials')
  })
})
