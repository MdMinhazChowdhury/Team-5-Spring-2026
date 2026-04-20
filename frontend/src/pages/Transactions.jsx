import { useEffect, useState } from 'react'
import { transactionApi, accountsApi, categoriesApi } from '../services/api'
import TransactionForm from '../components/TransactionForm'

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

  const styles = {
    page: { background: '#f3efe8', minHeight: '100vh', padding: 24, fontFamily: 'sans-serif' },
    header: {
      background: '#1e2a4a', color: '#fff', borderRadius: 12, padding: '20px 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
    },
    title: { fontSize: 22, fontWeight: 700, margin: 0 },
    addBtn: {
      background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8,
      padding: '10px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
    },
    card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 },
    filters: { display: 'flex', gap: 12, flexWrap: 'wrap' },
    input: {
      padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd',
      fontSize: 14, flex: 1, minWidth: 200,
    },
    select: {
      padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14,
    },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
    th: {
      textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #eee',
      color: '#555', fontWeight: 600, fontSize: 13,
    },
    td: { padding: '10px 12px', borderBottom: '1px solid #f0f0f0', color: '#333' },
    badgeIncome: {
      background: '#dcfce7', color: '#166534', padding: '2px 10px',
      borderRadius: 12, fontSize: 12, fontWeight: 600,
    },
    badgeExpense: {
      background: '#f3f4f6', color: '#374151', padding: '2px 10px',
      borderRadius: 12, fontSize: 12, fontWeight: 600,
    },
    amtIncome: { color: '#16a34a', fontWeight: 600 },
    amtExpense: { color: '#dc2626', fontWeight: 600 },
    actionBtn: {
      background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '0 4px',
    },
    footer: {
      display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'flex-end',
      borderTop: '2px solid #eee', paddingTop: 16, marginTop: 8,
    },
    summaryItem: { textAlign: 'right' },
    summaryLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
    summaryValue: { fontSize: 18, fontWeight: 700 },
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Transactions</h1>
        <button style={styles.addBtn} onClick={handleAddClick}>+ Add Transaction</button>
      </div>

      <div style={styles.card}>
        <div style={styles.filters}>
          <input
            style={styles.input}
            placeholder="Search by description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={styles.select}
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

      <div style={styles.card}>
        {loading && <p style={{ color: '#888', textAlign: 'center' }}>Loading…</p>}
        {error && <p style={{ color: '#dc2626', textAlign: 'center' }}>{error}</p>}
        {!loading && !error && (
          <>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#aaa' }}>
                      No transactions found
                    </td>
                  </tr>
                )}
                {filtered.map((t) => {
                  const isIncome = t.Trans_Total > 0
                  return (
                    <tr key={t.TransactionID}>
                      <td style={styles.td}>{t.DateOfTransaction}</td>
                      <td style={styles.td}>{t.Description || '—'}</td>
                      <td style={styles.td}>{categoryMap[t.CategoryID] || t.CategoryID}</td>
                      <td style={styles.td}>
                        <span style={isIncome ? styles.badgeIncome : styles.badgeExpense}>
                          {isIncome ? 'income' : 'expense'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, ...(isIncome ? styles.amtIncome : styles.amtExpense) }}>
                        {fmt(t.Trans_Total)}
                      </td>
                      <td style={styles.td}>
                        <button style={styles.actionBtn} onClick={() => handleEditClick(t)} title="Edit">✏️</button>
                        <button style={styles.actionBtn} onClick={() => handleDelete(t.TransactionID)} title="Delete">🗑️</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div style={styles.footer}>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Total Income</div>
                <div style={{ ...styles.summaryValue, color: '#16a34a' }}>{fmt(totalIncome)}</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Total Expenses</div>
                <div style={{ ...styles.summaryValue, color: '#dc2626' }}>{fmt(totalExpenses)}</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Net Balance</div>
                <div style={{ ...styles.summaryValue, color: netBalance >= 0 ? '#16a34a' : '#dc2626' }}>
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
