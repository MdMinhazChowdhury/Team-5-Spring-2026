import { describe, it, expect, vi, beforeEach } from 'vitest'
import { transactionApi, authApi } from './api'

const BASE_URL = 'http://localhost:8000'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
  localStorage.clear()
})

describe('transactionApi', () => {
  it('getAll sends GET to /transactions', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => [] })
    await transactionApi.getAll()
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/transactions`,
      expect.objectContaining({})
    )
  })

  it('create sends POST to /transactions with body', async () => {
    const txData = { description: 'Test', amount: 100 }
    fetch.mockResolvedValue({ ok: true, json: async () => ({ id: 1, ...txData }) })
    await transactionApi.create(txData)
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/transactions`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify(txData) })
    )
  })

  it('update sends PUT to /transactions/:id', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({}) })
    await transactionApi.update(42, { amount: 200 })
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/transactions/42`,
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('delete sends DELETE to /transactions/:id', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({}) })
    await transactionApi.delete(42)
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/transactions/42`,
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('getMonthlyIncome sends GET to /transactions/monthly-income with year and month', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ total: 500 }) })
    await transactionApi.getMonthlyIncome(2026, 4)
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/transactions/monthly-income?year=2026&month=4`,
      expect.objectContaining({})
    )
  })

  it('getMonthlySpending sends GET to /transactions/monthly-spending with year and month', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ total: 200 }) })
    await transactionApi.getMonthlySpending(2026, 4)
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/transactions/monthly-spending?year=2026&month=4`,
      expect.objectContaining({})
    )
  })

  it('getAll throws when response is not ok', async () => {
    fetch.mockResolvedValue({ ok: false, json: async () => ({}) })
    await expect(transactionApi.getAll()).rejects.toThrow('Failed to load transactions')
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
      `${BASE_URL}/login`,
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('login throws on non-ok response', async () => {
    fetch.mockResolvedValue({ ok: false })
    await expect(authApi.login('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials')
  })
})
