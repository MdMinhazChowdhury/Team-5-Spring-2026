import { useState } from 'react'

// TODO: replace with goalsApi.getAll()
const MOCK_GOALS = [
  { id: '1', name: 'Emergency Fund', category: 'Savings', target: 5000, current: 3200, endDate: '2026-12-31' },
  { id: '2', name: 'Vacation to Europe', category: 'Travel', target: 3500, current: 1200, endDate: '2027-06-30' },
  { id: '3', name: 'New Laptop', category: 'Electronics', target: 2000, current: 850, endDate: '2026-09-30' },
  { id: '4', name: 'Car Down Payment', category: 'Vehicle', target: 8000, current: 2500, endDate: '2027-03-31' },
]

const GOAL_CATEGORIES = ['Savings', 'Travel', 'Electronics', 'Vehicle', 'Education', 'Home', 'Other']

const EMPTY_FORM = { name: '', category: 'Savings', target: '', current: '', endDate: '' }

function fmt(val) {
  return `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function monthsRemaining(endDate) {
  const end = new Date(endDate + 'T00:00:00')
  const now = new Date()
  const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth())
  return Math.max(0, months)
}

function progressColor(pct) {
  if (pct > 66) return '#16a34a'
  if (pct >= 33) return '#3b82f6'
  return '#f59e0b'
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const s = {
  page: { display: 'flex', flexDirection: 'column', gap: 24 },
  heading: { fontSize: 26, fontWeight: 700, color: '#0e1c4f', marginBottom: 4 },
  sub: { fontSize: 14, color: '#8c7260', fontWeight: 600 },
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 6px rgba(14,28,79,0.07)',
  },
  cardTitle: { fontSize: 13, color: '#8c7260', fontWeight: 600, marginBottom: 8, letterSpacing: '0.04em' },
  statValue: { fontSize: 28, fontWeight: 700, color: '#0e1c4f' },
  statSub: { fontSize: 12, color: '#8c7260', marginTop: 4 },
  tabBar: { display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 16 },
  tab: (active) => ({
    padding: '8px 20px',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: active ? '#0e1c4f' : '#8c7260',
    borderBottom: active ? '2px solid #0e1c4f' : '2px solid transparent',
    marginBottom: -2,
  }),
  goalsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 },
  goalCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 6px rgba(14,28,79,0.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  goalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  goalName: { fontSize: 16, fontWeight: 700, color: '#0e1c4f' },
  categoryBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 999,
    background: '#f3efe8',
    color: '#8c7260',
    marginTop: 4,
    display: 'inline-block',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 6,
    color: '#8c7260',
    fontSize: 16,
    lineHeight: 1,
  },
  amountsRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13 },
  amountLabel: { color: '#8c7260' },
  amountValue: { fontWeight: 600, color: '#0e1c4f' },
  progressTrack: { background: '#f3efe8', borderRadius: 999, height: 8 },
  progressFill: (pct, color) => ({
    width: `${Math.min(pct, 100)}%`,
    height: '100%',
    background: color,
    borderRadius: 999,
    transition: 'width 0.3s',
  }),
  goalMeta: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8c7260' },
  addBtn: {
    alignSelf: 'flex-end',
    padding: '10px 20px',
    background: '#0e1c4f',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  emptyMsg: { fontSize: 14, color: '#8c7260', padding: 24, textAlign: 'center' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 16, padding: 32, width: 440,
    maxWidth: '90vw', boxShadow: '0 8px 40px rgba(14,28,79,0.18)',
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#0e1c4f', marginBottom: 4 },
  fieldLabel: { fontSize: 13, fontWeight: 600, color: '#0e1c4f', marginBottom: 4, display: 'block' },
  input: {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px',
    border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#0e1c4f',
    outline: 'none',
  },
  select: {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px',
    border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#0e1c4f',
    outline: 'none', background: '#fff',
  },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
  cancelBtn: {
    padding: '9px 18px', background: '#f3efe8', color: '#0e1c4f',
    border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
  saveBtn: {
    padding: '9px 18px', background: '#0e1c4f', color: '#fff',
    border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
}

function GoalCard({ goal, onEdit, onDelete }) {
  const pct = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0
  const color = progressColor(pct)
  const remaining = Math.max(0, goal.target - goal.current)
  const months = monthsRemaining(goal.endDate)

  return (
    <div style={s.goalCard}>
      <div style={s.goalHeader}>
        <div>
          <div style={s.goalName}>{goal.name}</div>
          <span style={s.categoryBadge}>{goal.category}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={s.iconBtn} onClick={() => onEdit(goal)} title="Edit" aria-label="Edit goal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button style={s.iconBtn} onClick={() => onDelete(goal.id)} title="Delete" aria-label="Delete goal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div style={s.amountsRow}>
        <div>
          <div style={s.amountLabel}>Target</div>
          <div style={s.amountValue}>{fmt(goal.target)}</div>
        </div>
        <div>
          <div style={s.amountLabel}>Saved</div>
          <div style={{ ...s.amountValue, color }}>{fmt(goal.current)}</div>
        </div>
        <div>
          <div style={s.amountLabel}>Remaining</div>
          <div style={s.amountValue}>{fmt(remaining)}</div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
          <span style={{ color, fontWeight: 600 }}>{pct}% complete</span>
        </div>
        <div style={s.progressTrack}>
          <div style={s.progressFill(pct, color)} />
        </div>
      </div>

      <div style={s.goalMeta}>
        <span>{months} month{months !== 1 ? 's' : ''} remaining</span>
        <span>Due {formatDate(goal.endDate)}</span>
      </div>
    </div>
  )
}

function GoalModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.target || !form.endDate) return
    onSave({
      ...form,
      target: parseFloat(form.target) || 0,
      current: parseFloat(form.current) || 0,
    })
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalTitle}>{initial ? 'Edit Goal' : 'Add New Goal'}</div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={s.fieldLabel}>Goal Name</label>
            <input style={s.input} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Emergency Fund" required />
          </div>
          <div>
            <label style={s.fieldLabel}>Category</label>
            <select style={s.select} value={form.category} onChange={e => set('category', e.target.value)}>
              {GOAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={s.fieldLabel}>Target Amount ($)</label>
              <input style={s.input} type="number" min="0" step="0.01" value={form.target} onChange={e => set('target', e.target.value)} placeholder="5000" required />
            </div>
            <div>
              <label style={s.fieldLabel}>Current Savings ($)</label>
              <input style={s.input} type="number" min="0" step="0.01" value={form.current} onChange={e => set('current', e.target.value)} placeholder="0" />
            </div>
          </div>
          <div>
            <label style={s.fieldLabel}>Target Date</label>
            <input style={s.input} type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} required />
          </div>
          <div style={s.modalActions}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={s.saveBtn}>{initial ? 'Save Changes' : 'Add Goal'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Goals() {
  const [goals, setGoals] = useState(MOCK_GOALS)
  const [activeTab, setActiveTab] = useState('active')
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0)
  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0)
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  const activeGoals = goals.filter(g => g.current < g.target)
  const completedGoals = goals.filter(g => g.current >= g.target)
  const displayed = activeTab === 'active' ? activeGoals : completedGoals

  function handleAdd(data) {
    const newGoal = { ...data, id: String(Date.now()) }
    setGoals(prev => [...prev, newGoal])
    setShowModal(false)
  }

  function handleEdit(goal) {
    setEditingGoal(goal)
  }

  function handleSaveEdit(data) {
    setGoals(prev => prev.map(g => g.id === editingGoal.id ? { ...data, id: editingGoal.id } : g))
    setEditingGoal(null)
  }

  function handleDelete(id) {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  return (
    <div style={s.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={s.heading}>Goals</div>
          <div style={s.sub}>Track your savings goals and stay on target.</div>
        </div>
        <button style={s.addBtn} onClick={() => setShowModal(true)}>+ Add New Goal</button>
      </div>

      {/* Summary row */}
      <div style={s.summaryRow}>
        <div style={s.card}>
          <div style={s.cardTitle}>TOTAL GOALS</div>
          <div style={s.statValue}>{goals.length}</div>
          <div style={s.statSub}>{activeGoals.length} active, {completedGoals.length} completed</div>
        </div>
        <div style={s.card}>
          <div style={s.cardTitle}>TARGET AMOUNT</div>
          <div style={s.statValue}>{fmt(totalTarget)}</div>
          <div style={s.statSub}>Combined goal targets</div>
        </div>
        <div style={s.card}>
          <div style={s.cardTitle}>TOTAL SAVED</div>
          <div style={{ ...s.statValue, color: '#16a34a' }}>{fmt(totalSaved)}</div>
          <div style={s.statSub}>{fmt(Math.max(0, totalTarget - totalSaved))} remaining</div>
        </div>
        <div style={s.card}>
          <div style={s.cardTitle}>OVERALL PROGRESS</div>
          <div style={{ ...s.statValue, color: progressColor(overallPct) }}>{overallPct}%</div>
          <div style={{ ...s.progressTrack, marginTop: 10 }}>
            <div style={s.progressFill(overallPct, progressColor(overallPct))} />
          </div>
        </div>
      </div>

      {/* Tabs + goal cards */}
      <div style={s.card}>
        <div style={s.tabBar}>
          <button style={s.tab(activeTab === 'active')} onClick={() => setActiveTab('active')}>
            Active ({activeGoals.length})
          </button>
          <button style={s.tab(activeTab === 'completed')} onClick={() => setActiveTab('completed')}>
            Completed ({completedGoals.length})
          </button>
        </div>

        {displayed.length === 0 ? (
          <div style={s.emptyMsg}>
            {activeTab === 'active' ? 'No active goals. Add a goal to get started!' : 'No completed goals yet.'}
          </div>
        ) : (
          <div style={s.goalsGrid}>
            {displayed.map(goal => (
              <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <GoalModal onSave={handleAdd} onClose={() => setShowModal(false)} />
      )}
      {editingGoal && (
        <GoalModal initial={editingGoal} onSave={handleSaveEdit} onClose={() => setEditingGoal(null)} />
      )}
    </div>
  )
}
