import { useState } from 'react'

// TODO: replace with budgetApi.get(year, month)
const MOCK_BUDGET_CATEGORIES = [
  { id: 1, title: 'Rent/Mortgage', limit: 1200, spent: 1200 },
  { id: 2, title: 'Utilities', limit: 250, spent: 200 },
  { id: 3, title: 'Groceries', limit: 500, spent: 450 },
  { id: 4, title: 'Transportation', limit: 200, spent: 150 },
  { id: 5, title: 'Entertainment', limit: 200, spent: 180 },
  { id: 6, title: 'Healthcare', limit: 150, spent: 35 },
]
const MOCK_INCOME = 4500

const PAYMENT_FREQUENCIES = ['Monthly', 'Bi-Weekly', 'Weekly', 'Semi-Monthly']

function fmt(val) {
  return `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const s = {
  page: { display: 'flex', flexDirection: 'column', gap: 24 },
  heading: { fontSize: 26, fontWeight: 700, color: '#0e1c4f', marginBottom: 4 },
  sub: { fontSize: 14, color: '#8c7260', fontWeight: 600 },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 6px rgba(14,28,79,0.07)',
  },
  cardTitle: { fontSize: 16, fontWeight: 600, color: '#0e1c4f', marginBottom: 16 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  topRow: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 },
  statLabel: { fontSize: 13, color: '#8c7260', fontWeight: 600, marginBottom: 6, letterSpacing: '0.04em' },
  statValue: { fontSize: 24, fontWeight: 700, color: '#0e1c4f' },
  statSub: { fontSize: 12, color: '#8c7260', marginTop: 3 },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  summaryItem: {
    background: '#f9f7f3',
    borderRadius: 10,
    padding: '14px 16px',
  },
  input: {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px',
    border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 15,
    color: '#0e1c4f', fontWeight: 700, outline: 'none',
  },
  select: {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px',
    border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14,
    color: '#0e1c4f', background: '#fff', outline: 'none',
  },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: '#8c7260', marginBottom: 6, display: 'block', letterSpacing: '0.04em' },
  tabBar: { display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 20 },
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
  categoryRow: {
    padding: '14px 0',
    borderBottom: '1px solid #f3efe8',
  },
  catHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catTitle: { fontSize: 14, fontWeight: 600, color: '#0e1c4f' },
  catAmounts: { fontSize: 13, color: '#8c7260' },
  progressTrack: { background: '#f3efe8', borderRadius: 999, height: 8 },
  progressFill: (pct, color) => ({
    width: `${Math.min(pct, 100)}%`,
    height: '100%',
    background: color,
    borderRadius: 999,
    transition: 'width 0.3s',
  }),
  warningBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: '#b45309',
    background: '#fef3c7',
    borderRadius: 999,
    padding: '2px 8px',
    marginLeft: 8,
  },
  editRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3efe8',
  },
  editLabel: { fontSize: 14, fontWeight: 500, color: '#0e1c4f', flex: 1 },
  editInput: {
    width: 120,
    padding: '7px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
    color: '#0e1c4f',
    textAlign: 'right',
    outline: 'none',
  },
  healthBar: { background: '#f3efe8', borderRadius: 999, height: 12, marginTop: 8, marginBottom: 8 },
  healthFill: (pct) => ({
    width: `${Math.min(pct, 100)}%`,
    height: '100%',
    background: pct >= 90 ? '#dc2626' : pct >= 75 ? '#f59e0b' : '#16a34a',
    borderRadius: 999,
    transition: 'width 0.3s',
  }),
  unallocatedNote: { fontSize: 13, color: '#336659', fontWeight: 500, marginTop: 8 },
}

function progressBarColor(pct) {
  if (pct >= 100) return '#dc2626'
  if (pct >= 80) return '#f59e0b'
  return '#336659'
}

export default function Budget() {
  const [income, setIncome] = useState(MOCK_INCOME)
  const [incomeInput, setIncomeInput] = useState(String(MOCK_INCOME))
  const [frequency, setFrequency] = useState('Monthly')
  const [categories, setCategories] = useState(MOCK_BUDGET_CATEGORIES)
  const [activeTab, setActiveTab] = useState('overview')
  const [limitInputs, setLimitInputs] = useState(
    Object.fromEntries(MOCK_BUDGET_CATEGORIES.map(c => [c.id, String(c.limit)]))
  )

  const totalBudgeted = categories.reduce((sum, c) => sum + c.limit, 0)
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0)
  const remaining = income - totalSpent
  const utilizationPct = income > 0 ? Math.round((totalSpent / income) * 100) : 0
  const unallocated = income - totalBudgeted

  function handleIncomeBlur() {
    const val = parseFloat(incomeInput)
    if (!isNaN(val) && val >= 0) setIncome(val)
    else setIncomeInput(String(income))
  }

  function handleLimitChange(id, value) {
    setLimitInputs(prev => ({ ...prev, [id]: value }))
  }

  function handleLimitBlur(id) {
    const val = parseFloat(limitInputs[id])
    if (!isNaN(val) && val >= 0) {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, limit: val } : c))
    } else {
      const cat = categories.find(c => c.id === id)
      setLimitInputs(prev => ({ ...prev, [id]: String(cat.limit) }))
    }
  }

  return (
    <div style={s.page}>
      <div>
        <div style={s.heading}>Budget</div>
        <div style={s.sub}>Manage your monthly budget allocations and track spending.</div>
      </div>

      {/* Top row: Income Setup + Monthly Summary */}
      <div style={s.topRow}>
        {/* Income Setup */}
        <div style={s.card}>
          <div style={s.cardTitle}>Income Setup</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={s.fieldLabel}>MONTHLY INCOME</label>
              <input
                style={s.input}
                type="number"
                min="0"
                step="0.01"
                value={incomeInput}
                onChange={e => setIncomeInput(e.target.value)}
                onBlur={handleIncomeBlur}
                aria-label="Monthly income"
              />
            </div>
            <div>
              <label style={s.fieldLabel}>PAYMENT FREQUENCY</label>
              <select
                style={s.select}
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                aria-label="Payment frequency"
              >
                {PAYMENT_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Monthly Summary */}
        <div style={s.card}>
          <div style={s.cardTitle}>Monthly Summary</div>
          <div style={s.summaryGrid}>
            <div style={s.summaryItem}>
              <div style={s.statLabel}>INCOME</div>
              <div style={{ ...s.statValue, color: '#16a34a' }}>{fmt(income)}</div>
              <div style={s.statSub}>{frequency}</div>
            </div>
            <div style={s.summaryItem}>
              <div style={s.statLabel}>BUDGETED</div>
              <div style={s.statValue}>{fmt(totalBudgeted)}</div>
              <div style={s.statSub}>Across {categories.length} categories</div>
            </div>
            <div style={s.summaryItem}>
              <div style={s.statLabel}>SPENT</div>
              <div style={{ ...s.statValue, color: '#dc2626' }}>{fmt(totalSpent)}</div>
              <div style={s.statSub}>This month</div>
            </div>
            <div style={s.summaryItem}>
              <div style={s.statLabel}>REMAINING</div>
              <div style={{ ...s.statValue, color: remaining >= 0 ? '#16a34a' : '#dc2626' }}>{fmt(remaining)}</div>
              <div style={s.statSub}>After spending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Health */}
      <div style={s.card}>
        <div style={s.cardTitle}>Budget Health</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#8c7260', marginBottom: 4 }}>
          <span>Budget Utilization</span>
          <span style={{ fontWeight: 700, color: utilizationPct >= 90 ? '#dc2626' : utilizationPct >= 75 ? '#b45309' : '#16a34a' }}>
            {utilizationPct}%
          </span>
        </div>
        <div style={s.healthBar}>
          <div style={s.healthFill(utilizationPct)} />
        </div>
        <div style={s.unallocatedNote}>
          {unallocated > 0
            ? `${fmt(unallocated)} unallocated — consider adding it to savings or a goal.`
            : unallocated === 0
            ? 'All income is allocated across budget categories.'
            : `Budget categories exceed income by ${fmt(Math.abs(unallocated))}.`}
        </div>
      </div>

      {/* Budget Categories */}
      <div style={s.card}>
        <div style={s.cardTitle}>Budget Categories</div>
        <div style={s.tabBar}>
          <button style={s.tab(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button style={s.tab(activeTab === 'edit')} onClick={() => setActiveTab('edit')}>
            Edit Allocations
          </button>
        </div>

        {activeTab === 'overview' && (
          <div>
            {categories.map(cat => {
              const pct = cat.limit > 0 ? Math.round((cat.spent / cat.limit) * 100) : 0
              const color = progressBarColor(pct)
              return (
                <div key={cat.id} style={s.categoryRow}>
                  <div style={s.catHeader}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={s.catTitle}>{cat.title}</span>
                      {pct >= 80 && pct < 100 && (
                        <span style={s.warningBadge}>Approaching limit</span>
                      )}
                      {pct >= 100 && (
                        <span style={{ ...s.warningBadge, color: '#991b1b', background: '#fee2e2' }}>Over budget</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={s.catAmounts}>{fmt(cat.spent)} / {fmt(cat.limit)}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={s.progressTrack}>
                    <div style={s.progressFill(pct, color)} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'edit' && (
          <div>
            <div style={{ fontSize: 13, color: '#8c7260', marginBottom: 16 }}>
              Adjust the monthly limit for each category. Changes apply immediately.
            </div>
            {categories.map(cat => (
              <div key={cat.id} style={s.editRow}>
                <span style={s.editLabel}>{cat.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#8c7260' }}>Limit: $</span>
                  <input
                    style={s.editInput}
                    type="number"
                    min="0"
                    step="1"
                    value={limitInputs[cat.id]}
                    onChange={e => handleLimitChange(cat.id, e.target.value)}
                    onBlur={() => handleLimitBlur(cat.id)}
                    aria-label={`${cat.title} monthly limit`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
