const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function authHeader() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const transactionApi = {
  getAll: () =>
    fetch(`${BASE_URL}/transactions`, { headers: authHeader() }).then((r) => {
      if (!r.ok) throw new Error('Failed to load transactions')
      return r.json()
    }),

  create: (data) =>
    fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: authHeader(),
    }).then((r) => {
      if (!r.ok) return r.json().then((d) => { throw new Error(d.detail || 'Failed to create transaction') })
      return r.json()
    }),

  update: (id, data) =>
    fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: authHeader(),
    }).then((r) => {
      if (!r.ok) return r.json().then((d) => { throw new Error(d.detail || 'Failed to update transaction') })
      return r.json()
    }),

  delete: (id) =>
    fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    }).then((r) => {
      if (!r.ok) return r.json().then((d) => { throw new Error(d.detail || 'Failed to delete transaction') })
      return r.json()
    }),

  getMonthlyIncome: (year, month) =>
    fetch(`${BASE_URL}/transactions/monthly-income?year=${year}&month=${month}`, {
      headers: authHeader(),
    }).then((r) => r.json()),

  getMonthlySpending: (year, month) =>
    fetch(`${BASE_URL}/transactions/monthly-spending?year=${year}&month=${month}`, {
      headers: authHeader(),
    }).then((r) => r.json()),
}

export const authApi = {
  login: (email, password) =>
    fetch(`${BASE_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    }).then((r) => {
      if (!r.ok) throw new Error('Invalid credentials')
      return r.json()
    }),

  signup: (firstName, lastName, email, password) =>
    fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
      headers: { 'Content-Type': 'application/json' },
    }).then((r) => {
      if (!r.ok) return r.json().then((d) => { throw new Error(d.detail || 'Signup failed') })
      return r.json()
    }),
}

export const userApi = {
  getProfile: () =>
    fetch(`${BASE_URL}/user`, { headers: authHeader() }).then((r) => {
      if (!r.ok) throw new Error('Failed to load profile')
      return r.json()
    }),

  updateProfile: (data) =>
    fetch(`${BASE_URL}/user`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: authHeader(),
    }).then((r) => {
      if (!r.ok) return r.json().then((d) => { throw new Error(d.detail || 'Update failed') })
      return r.json()
    }),
}

export const categoriesApi = {
  getAll: () =>
    fetch(`${BASE_URL}/categories`, { headers: authHeader() }).then((r) => {
      if (!r.ok) throw new Error('Failed to load categories')
      return r.json()
    }),
}

function parseError(response, fallback) {
  return response.json()
    .then((data) => {
      throw new Error(data.detail || data.message || fallback)
    })
    .catch((error) => {
      if (error instanceof SyntaxError) throw new Error(fallback)
      throw error
    })
}

export const goalsApi = {
  getAll: () =>
    fetch(`${BASE_URL}/goals`, { headers: authHeader() }).then((r) => {
      if (!r.ok) throw new Error('Failed to load goals')
      return r.json()
    }),

  create: (data) =>
    fetch(`${BASE_URL}/goals`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: authHeader(),
    }).then((r) => {
      if (!r.ok) return parseError(r, 'Failed to create goal')
      return r.json()
    }),

  update: (id, data) =>
    fetch(`${BASE_URL}/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: authHeader(),
    }).then((r) => {
      if (!r.ok) return parseError(r, 'Failed to update goal')
      return r.json()
    }),

  delete: (id) =>
    fetch(`${BASE_URL}/goals/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    }).then((r) => {
      if (!r.ok) return parseError(r, 'Failed to delete goal')
      return r.json()
    }),
}

export const budgetApi = {
  getAll: (year, month) =>
    fetch(`${BASE_URL}/budgets?year=${year}&month=${month}`, { headers: authHeader() }).then((r) => {
      if (!r.ok) throw new Error('Failed to load budgets')
      return r.json()
    }),

  upsert: (data) =>
    fetch(`${BASE_URL}/budgets`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: authHeader(),
    }).then((r) => {
      if (!r.ok) return parseError(r, 'Failed to save budget')
      return r.json()
    }),

  delete: (id) =>
    fetch(`${BASE_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    }).then((r) => {
      if (!r.ok) return parseError(r, 'Failed to delete budget')
      return r.json()
    }),
}

export const accountsApi = {
  getAll: () =>
    fetch(`${BASE_URL}/accounts`, { headers: authHeader() }).then((r) => {
      if (!r.ok) throw new Error('Failed to load accounts')
      return r.json()
    }),

  create: (data) =>
    fetch(`${BASE_URL}/accounts`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: authHeader(),
    }).then((r) => {
      if (!r.ok) return r.json().then((d) => { throw new Error(d.detail || 'Failed to create account') })
      return r.json()
    }),

  delete: (id) =>
    fetch(`${BASE_URL}/accounts/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    }).then((r) => {
      if (!r.ok) return r.json().then((d) => { throw new Error(d.detail || 'Failed to delete account') })
      return r.json()
    }),
}
