import { useState } from 'react'
import { transactionApi } from '../services/api'

export default function TransactionForm({ onClose, onSave, transaction, accounts, categories }) {
  const isEdit = transaction != null

  const [form, setForm] = useState({
    description: transaction?.Description || '',
    amount: transaction?.Trans_Total ?? '',
    category_id: transaction?.CategoryID || '',
    account_id: transaction?.AccountID || '',
    date_of_transaction: transaction?.DateOfTransaction || new Date().toISOString().slice(0, 10),
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload = {
        description: form.description,
        amount: parseFloat(form.amount),
        category_id: parseInt(form.category_id),
        account_id: parseInt(form.account_id),
        date_of_transaction: form.date_of_transaction,
      }
      if (isEdit) {
        await transactionApi.update(transaction.TransactionID, { ...payload, date: payload.date_of_transaction })
      } else {
        await transactionApi.create(payload)
      }
      onSave()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const s = {
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(14,28,79,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    modal: {
      background: '#fff', borderRadius: 16, width: 480, maxWidth: '95vw',
      boxShadow: '0 8px 40px rgba(14,28,79,0.18)', overflow: 'hidden',
    },
    header: {
      background: '#0e1c4f', color: '#f3efe8', padding: '16px 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    headerTitle: { fontWeight: 700, fontSize: 16 },
    closeBtn: {
      background: 'none', border: 'none', color: '#f3efe8',
      fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 0,
    },
    body: { padding: 24 },
    field: { marginBottom: 18 },
    label: { display: 'block', marginBottom: 6, fontSize: 13, color: '#0e1c4f', fontWeight: 600 },
    input: {
      width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #8c7260',
      fontSize: 14, boxSizing: 'border-box', background: '#fdf9f4',
      color: '#0e1c4f', fontFamily: 'inherit', outline: 'none',
    },
    error: {
      background: '#fee2e2', color: '#b91c1c', borderRadius: 8,
      padding: '10px 14px', fontSize: 14, marginBottom: 16,
    },
    footer: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
    cancelBtn: {
      padding: '10px 18px', borderRadius: 8, border: '1px solid #8c7260',
      background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', color: '#0e1c4f',
    },
    saveBtn: {
      padding: '10px 18px', borderRadius: 8, border: 'none',
      background: '#336659', color: '#f3efe8', cursor: 'pointer',
      fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
    },
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <span style={s.headerTitle}>{isEdit ? 'Edit Transaction' : 'Add Transaction'}</span>
          <button onClick={onClose} style={s.closeBtn}>x</button>
        </div>
        <div style={s.body}>
          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>Description</label>
              <input
                style={s.input}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Grocery run"
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Amount (positive = income, negative = expense)</label>
              <input
                style={s.input}
                name="amount"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                required
                placeholder="e.g. -45.00"
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Category</label>
              <select style={s.input} name="category_id" value={form.category_id} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.CategoryID} value={c.CategoryID}>{c.Category_Title}</option>
                ))}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Account</label>
              <select style={s.input} name="account_id" value={form.account_id} onChange={handleChange} required>
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.AccountID} value={a.AccountID}>{a.Account_Name}</option>
                ))}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Date</label>
              <input
                style={s.input}
                name="date_of_transaction"
                type="date"
                value={form.date_of_transaction}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div style={s.error}>{error}</div>}
            <div style={s.footer}>
              <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
              <button type="submit" style={s.saveBtn} disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
