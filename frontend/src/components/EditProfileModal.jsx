import { useState, useEffect } from 'react'
import { userApi, accountsApi } from '../services/api'

const ACCOUNT_TYPES = [
  { id: 1, label: 'Checking' },
  { id: 2, label: 'Savings' },
]

const s = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(14,28,79,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: 16,
    width: 480,
    maxWidth: '95vw',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: 32,
    position: 'relative',
    boxShadow: '0 8px 40px rgba(14,28,79,0.15)',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    background: 'none',
    border: 'none',
    fontSize: 20,
    cursor: 'pointer',
    color: '#bba591',
    lineHeight: 1,
    padding: '4px 8px',
    fontFamily: 'inherit',
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#0e1c4f',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#bba591',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: '1px solid #f3efe8',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#0e1c4f',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #bba591',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    marginBottom: 16,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    background: '#fdf9f4',
    color: '#0e1c4f',
  },
  nameRow: {
    display: 'flex',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  saveBtn: {
    padding: '10px 20px',
    background: '#336659',
    color: '#f3efe8',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
    fontFamily: 'inherit',
  },
  error: {
    background: '#fef2f2',
    color: '#b91c1c',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 12,
  },
  success: {
    background: '#f0faf6',
    color: '#336659',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 12,
  },
  divider: {
    margin: '28px 0',
    border: 'none',
    borderTop: '1px solid #f3efe8',
  },
  accountRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: '#f3efe8',
    borderRadius: 8,
    marginBottom: 8,
  },
  accountInfo: {
    fontSize: 14,
    color: '#0e1c4f',
    fontWeight: 500,
  },
  accountBalance: {
    fontSize: 13,
    color: '#bba591',
    marginTop: 2,
  },
  deleteBtn: {
    background: 'none',
    border: '1px solid #bba591',
    borderRadius: 6,
    color: '#8b5e52',
    cursor: 'pointer',
    fontSize: 16,
    padding: '2px 8px',
    lineHeight: 1.4,
    fontFamily: 'inherit',
  },
  addRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-end',
    marginTop: 12,
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #bba591',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'inherit',
    background: '#fdf9f4',
    color: '#0e1c4f',
    flex: '0 0 140px',
  },
  balanceInput: {
    padding: '10px 14px',
    border: '1px solid #bba591',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'inherit',
    background: '#fdf9f4',
    color: '#0e1c4f',
    flex: 1,
  },
  addBtn: {
    padding: '10px 16px',
    background: '#faecc3',
    color: '#0e1c4f',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
  },
  emptyAccounts: {
    fontSize: 14,
    color: '#bba591',
    textAlign: 'center',
    padding: '16px 0',
  },
}

export default function EditProfileModal({ user, onClose, onProfileUpdated }) {
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  const [accounts, setAccounts] = useState([])
  const [accountsError, setAccountsError] = useState('')
  const [newTypeId, setNewTypeId] = useState(1)
  const [newBalance, setNewBalance] = useState('')
  const [addingAccount, setAddingAccount] = useState(false)

  useEffect(() => {
    accountsApi.getAll()
      .then(setAccounts)
      .catch((e) => setAccountsError(e.message))
  }, [])

  async function handleSaveProfile(e) {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    if (password && password !== confirmPassword) {
      setProfileError('Passwords do not match.')
      return
    }

    const updates = {}
    if (firstName !== user?.first_name) updates.first_name = firstName
    if (lastName !== user?.last_name) updates.last_name = lastName
    if (email !== user?.email) updates.email = email
    if (password) updates.password = password

    if (Object.keys(updates).length === 0) {
      setProfileSuccess('No changes to save.')
      return
    }

    setProfileLoading(true)
    try {
      await userApi.updateProfile(updates)
      setProfileSuccess('Profile updated successfully.')
      setPassword('')
      setConfirmPassword('')
      if (onProfileUpdated) onProfileUpdated({ first_name: firstName, last_name: lastName, email })
    } catch (err) {
      setProfileError(err.message || 'Update failed.')
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleAddAccount(e) {
    e.preventDefault()
    setAccountsError('')
    setAddingAccount(true)
    try {
      const account = await accountsApi.create({ account_balance: parseFloat(newBalance), account_type_id: newTypeId })
      setAccounts((prev) => [...prev, account])
      setNewBalance('')
      setNewTypeId(1)
    } catch (err) {
      setAccountsError(err.message || 'Failed to add account.')
    } finally {
      setAddingAccount(false)
    }
  }

  async function handleDeleteAccount(id) {
    setAccountsError('')
    try {
      await accountsApi.delete(id)
      setAccounts((prev) => prev.filter((a) => a.account_id !== id))
    } catch (err) {
      setAccountsError(err.message || 'Failed to delete account.')
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div style={s.backdrop} onClick={handleBackdropClick}>
      <div style={s.modal}>
        <button style={s.closeBtn} onClick={onClose} aria-label="Close">×</button>
        <div style={s.title}>Edit Profile</div>

        {/* Profile section */}
        <div style={s.sectionTitle}>Profile Information</div>

        {profileError && <div style={s.error}>{profileError}</div>}
        {profileSuccess && <div style={s.success}>{profileSuccess}</div>}

        <form onSubmit={handleSaveProfile}>
          <div style={s.nameRow}>
            <div style={s.nameField}>
              <label style={s.label}>First Name</label>
              <input
                style={s.input}
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div style={s.nameField}>
              <label style={s.label}>Last Name</label>
              <input
                style={s.input}
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <label style={s.label}>Email</label>
          <input
            style={s.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={s.label}>New Password</label>
          <input
            style={s.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current"
          />

          <label style={s.label}>Confirm Password</label>
          <input
            style={s.input}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Leave blank to keep current"
          />

          <button style={s.saveBtn} type="submit" disabled={profileLoading}>
            {profileLoading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        <hr style={s.divider} />

        {/* Linked accounts section */}
        <div style={s.sectionTitle}>Linked Accounts</div>

        {accountsError && <div style={s.error}>{accountsError}</div>}

        {accounts.length === 0 ? (
          <div style={s.emptyAccounts}>No linked accounts yet.</div>
        ) : (
          accounts.map((account) => (
            <div key={account.account_id} style={s.accountRow}>
              <div>
                <div style={s.accountInfo}>{account.account_type_name}</div>
                <div style={s.accountBalance}>${account.account_balance.toFixed(2)}</div>
              </div>
              <button style={s.deleteBtn} onClick={() => handleDeleteAccount(account.account_id)} aria-label="Delete account">
                ×
              </button>
            </div>
          ))
        )}

        <form onSubmit={handleAddAccount} style={s.addRow}>
          <select
            style={s.select}
            value={newTypeId}
            onChange={(e) => setNewTypeId(Number(e.target.value))}
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <input
            style={s.balanceInput}
            type="number"
            step="0.01"
            min="0"
            placeholder="Balance"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            required
          />
          <button style={s.addBtn} type="submit" disabled={addingAccount}>
            {addingAccount ? '…' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  )
}
