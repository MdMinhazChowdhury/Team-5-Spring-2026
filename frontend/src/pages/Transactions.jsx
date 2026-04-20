import { useEffect, useState } from 'react'
import { transactionApi, accountsApi, categoriesApi } from '../services/api'
import TransactionForm from '../components/TransactionForm'

const s = {
  page: { display: 'flex', flexDirection: 'column', gap: 24 },
  heading: { fontSize: 26, fontWeight: 700, color: '#0e1c4f', marginBottom: 4 },
  sub: { fontSize: 14, color: '#8c7260', fontWeight: 600 },
  headingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  addBtn: {
    background: '#336659', color: '#f3efe8', border: 'none', borderRadius: 8,
    padding: '10px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit',
  },
  card: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 6px rgba(14,28,79,0.07)',
  },
  cardTitle: { fontSize: 13, color: '#8c7260', fontWeight: 600, marginBottom: 12, letterSpacing: '0.04em' },
  filters: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  input: {
    padding: '10px 14px', borderRadius: 8, border: '1px solid #8c7260',
    fontSize: 14, flex: 1, minWidth: 200, background: '#fdf9f4',
    color: '#0e1c4f', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  },
  select: {
    padding: '10px 14px', borderRadius: 8, border: '1px solid #8c7260',
    fontSize: 14, background: '#fdf9f4', color: '#0e1c4f', fontFamily: 'inherit', outline: 'none',
  },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#0e1c4f', marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #f3efe8',
    color: '#8c7260', fontWeight: 600, fontSize: 13, letterSpacing: '0.04em',
  },
  td: { padding: '10px 12px', borderBottom: '1px solid #f3efe8', color: '#0e1c4f' },
  badgeIncome: {
    background: '#dcfce7', color: '#166534', padding: '2px 10px',
    borderRadius: 12, fontSize: 12, fontWeight: 600,
  },
  badgeExpense: {
    background: '#f3efe8', color: '#8c7260', padding: '2px 10px',
    borderRadius: 12, fontSize: 12, fontWeight: 600,
  },
  amtIncome: { color: '#16a34a', fontWeight: 600 },
  amtExpense: { color: '#dc2626', fontWeight: 600 },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '0 4px' },
  footer: {
    display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'flex-end',
    borderTop: '2px solid #f3efe8', paddingTop: 16, marginTop: 8,
  },
  summaryLabel: { fontSize: 12, color: '#8c7260', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 2 },
  summaryValue: { fontSize: 20, fontWeight: 700 },
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadData() {
    try {
      const [txns, accts, cats] = await Promise.all([
        transactionApi.getAll(),
        accountsApi.getAll(),
        categoriesApi.getAll(),
      ])
      setTransactions(txns)
      setAccounts(accts)
      setCategories(cats)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleDelete(id) {
    try {
      await transactionApi.delete(id)
      setTransactions((prev) => prev.filter((t) => t.TransactionID !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  function handleAddClick() {
    setEditingTransaction(null)
    setShowForm(true)
  }

  function handleEditClick(txn) {
    setEditingTransaction(txn)
    setShowForm(true)
  }

  function handleFormSave() {
    setShowForm(false)
    setEditingTransaction(null)
    loadData()
  }

  const categoryMap = {}
  categories.forEach((c) => { categoryMap[c.CategoryID] = c.Category_Title })

  const filtered = transactions.filter((t) => {
    const matchSearch = !search || (t.Description || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || String(t.CategoryID) === String(categoryFilter)
    return matchSearch && matchCat
  })

  const totalIncome = filtered.filter((t) => t.Trans_Total > 0).reduce((s, t) => s + t.Trans_Total, 0)
  const totalExpenses = filtered.filter((t) => t.Trans_Total < 0).reduce((s, t) => s + t.Trans_Total, 0)
  const netBalance = totalIncome + totalExpenses

  function fmt(n) {
    const abs = Math.abs(n).toFixed(2)
    return n >= 0 ? `+$${abs}` : `-$${abs}`
  }

  return (
    <div style={s.page}>
      <div style={s.headingRow}>
        <div>
          <div style={s.heading}>Transactions</div>
          <div style={s.sub}>View, add, and manage your transactions.</div>
        </div>
        <button style={s.addBtn} onClick={handleAddClick}>+ Add Transaction</button>
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>FILTER</div>
        <div style={s.filters}>
          <input
            style={s.input}
            placeholder="Search by description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={s.select}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.CategoryID} value={c.CategoryID}>{c.Category_Title}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.sectionTitle}>All Transactions</div>
        {loading && <p style={{ color: '#8c7260', textAlign: 'center' }}>Loading...</p>}
        {error && <p style={{ color: '#dc2626', textAlign: 'center' }}>{error}</p>}
        {!loading && !error && (
          <>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>DATE</th>
                  <th style={s.th}>DESCRIPTION</th>
                  <th style={s.th}>CATEGORY</th>
                  <th style={s.th}>TYPE</th>
                  <th style={s.th}>AMOUNT</th>
                  <th style={s.th}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#8c7260' }}>
                      No transactions found
                    </td>
                  </tr>
                )}
                {filtered.map((t) => {
                  const isIncome = t.Trans_Total > 0
                  return (
                    <tr key={t.TransactionID}>
                      <td style={s.td}>{t.DateOfTransaction}</td>
                      <td style={s.td}>{t.Description || <span style={{ color: '#8c7260' }}>—</span>}</td>
                      <td style={s.td}>{categoryMap[t.CategoryID] || t.CategoryID}</td>
                      <td style={s.td}>
                        <span style={isIncome ? s.badgeIncome : s.badgeExpense}>
                          {isIncome ? 'income' : 'expense'}
                        </span>
                      </td>
                      <td style={{ ...s.td, ...(isIncome ? s.amtIncome : s.amtExpense) }}>
                        {fmt(t.Trans_Total)}
                      </td>
                      <td style={s.td}>
                        <button style={s.actionBtn} onClick={() => handleEditClick(t)} title="Edit">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button style={s.actionBtn} onClick={() => handleDelete(t.TransactionID)} title="Delete">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div style={s.footer}>
              <div>
                <div style={s.summaryLabel}>TOTAL INCOME</div>
                <div style={{ ...s.summaryValue, color: '#16a34a' }}>{fmt(totalIncome)}</div>
              </div>
              <div>
                <div style={s.summaryLabel}>TOTAL EXPENSES</div>
                <div style={{ ...s.summaryValue, color: '#dc2626' }}>{fmt(totalExpenses)}</div>
              </div>
              <div>
                <div style={s.summaryLabel}>NET BALANCE</div>
                <div style={{ ...s.summaryValue, color: netBalance >= 0 ? '#16a34a' : '#dc2626' }}>
                  {fmt(netBalance)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          accounts={accounts}
          categories={categories}
          onClose={() => { setShowForm(false); setEditingTransaction(null) }}
          onSave={handleFormSave}
        />
      )}
    </div>
  )
}
