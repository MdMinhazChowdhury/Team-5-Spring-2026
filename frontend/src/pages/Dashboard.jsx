import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import SpendingChart from '../components/SpendingChart'
import { userApi, accountsApi, transactionApi, goalsApi, budgetApi } from '../services/api'

const CHART_COLORS = ['#0e1c4f', '#336659', '#bba591', '#8b5e52', '#6b8f86', '#c9a882', '#4a7c6f', '#a0522d']

function getLastSixMonths() {
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleString('en-US', { month: 'short' }),
    })
  }
  return months
}

function normalizeSpendingRow(row, index) {
  return {
    name: row.category_title ?? row.Category_Title ?? row.category ?? 'Other',
    value: Math.abs(Number(row.total_spent ?? row.total ?? row.amount ?? 0)),
    color: CHART_COLORS[index % CHART_COLORS.length],
  }
}

function normalizeTransaction(tx) {
  return {
    id: tx.transaction_id ?? tx.id,
    description: tx.description ?? tx.Description ?? 'Transaction',
    category: tx.category_title ?? tx.Category_Title ?? tx.category ?? '',
    amount: Number(tx.amount ?? tx.Amount ?? 0),
    date: tx.date_of_transaction ?? tx.date ?? '',
  }
}

function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric' })
}

const s = {
  page: { display: 'flex', flexDirection: 'column', gap: 24 },
  heading: { fontSize: 26, fontWeight: 700, color: '#0e1c4f', marginBottom: 4 },
  sub: { fontSize: 14, color: '#8c7260', fontWeight: 600 },
  accountsRow: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto',
    paddingBottom: 4,
  },
  accountCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '16px 20px',
    boxShadow: '0 1px 6px rgba(14,28,79,0.07)',
    minWidth: 160,
    flexShrink: 0,
  },
  accountType: {
    fontSize: 13,
    color: '#8c7260',
    fontWeight: 600,
    marginBottom: 8,
    letterSpacing: '0.04em',
  },
  accountBalance: {
    fontSize: 22,
    fontWeight: 700,
    color: '#0e1c4f',
  },
  emptyAccounts: {
    fontSize: 14,
    color: '#8c7260',
    fontWeight: 600,
    padding: '16px 20px',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 6px rgba(14,28,79,0.07)',
  },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 6px rgba(14,28,79,0.07)',
  },
  cardTitle: { fontSize: 13, color: '#8c7260', fontWeight: 600, marginBottom: 8, letterSpacing: '0.04em' },
  statValue: { fontSize: 28, fontWeight: 700, color: '#0e1c4f' },
  trend: (positive) => ({
    fontSize: 12,
    color: positive === undefined ? '#8c7260' : positive ? '#16a34a' : '#dc2626',
    marginTop: 4,
  }),
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#0e1c4f', marginBottom: 16 },
  progressTrack: {
    background: '#f3efe8',
    borderRadius: 999,
    height: 8,
    marginTop: 8,
  },
  txRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f3efe8',
  },
  txDesc: { fontSize: 14, fontWeight: 500, color: '#0e1c4f' },
  txCat: { fontSize: 12, color: '#8c7260', fontWeight: 600 },
  txDate: { fontSize: 12, color: '#8c7260', fontWeight: 600, marginRight: 16 },
  txAmt: (positive) => ({
    fontSize: 14,
    fontWeight: 600,
    color: positive ? '#16a34a' : '#dc2626',
  }),
  viewAll: {
    display: 'block',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    color: '#336659',
    fontWeight: 500,
  },
  alertRow: {
    marginBottom: 12,
  },
  alertHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    marginBottom: 4,
  },
}

function StatCard({ title, value, trend, trendPositive, extra, valueColor }) {
  return (
    <div style={s.card}>
      <div style={s.cardTitle}>{title}</div>
      <div style={{ ...s.statValue, ...(valueColor ? { color: valueColor } : {}) }}>{value}</div>
      {trend && <div style={s.trend(trendPositive)}>{trend}</div>}
      {extra}
    </div>
  )
}

function fmt(value) {
  if (value === null) return '...'
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function Dashboard() {
  const [firstName, setFirstName] = useState('')
  const [accounts, setAccounts] = useState([])
  const [totalBalance, setTotalBalance] = useState(null)
  const [monthlyIncome, setMonthlyIncome] = useState(null)
  const [monthlyExpenses, setMonthlyExpenses] = useState(null)
  const [spendingData, setSpendingData] = useState([])
  const [barData, setBarData] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [budgetAlerts, setBudgetAlerts] = useState([])
  const [savingsGoal, setSavingsGoal] = useState(null)

  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    userApi.getProfile().then((u) => setFirstName(u.first_name)).catch(() => {})

    Promise.all([
      accountsApi.getAll(),
      transactionApi.getMonthlyIncome(year, month),
      transactionApi.getMonthlySpending(year, month),
    ]).then(([accts, income, expenses]) => {
      setAccounts(accts)
      setTotalBalance(accts.reduce((sum, a) => sum + a.account_balance, 0))
      setMonthlyIncome(income.total)
      setMonthlyExpenses(Math.abs(expenses.total))
    }).catch(() => {})

    transactionApi.getSpendingByCategory(startDate, endDate)
      .then((rows) => {
        const normalized = (rows || [])
          .map(normalizeSpendingRow)
          .filter((r) => r.value > 0)
        setSpendingData(normalized)
      })
      .catch(() => {})

    transactionApi.getAll()
      .then((txs) => {
        setRecentTransactions((txs || []).slice(0, 5).map(normalizeTransaction))
      })
      .catch(() => {})

    const sixMonths = getLastSixMonths()
    Promise.all(
      sixMonths.map(({ year: y, month: m, label }) =>
        Promise.all([
          transactionApi.getMonthlyIncome(y, m),
          transactionApi.getMonthlySpending(y, m),
        ]).then(([inc, exp]) => ({
          month: label,
          income: Number(inc.total ?? 0),
          expenses: Math.abs(Number(exp.total ?? 0)),
        }))
      )
    ).then((data) => setBarData(data)).catch(() => {})

    budgetApi.getAll(year, month)
      .then((rows) => {
        const budgets = Array.isArray(rows) ? rows : rows.budgets || []
        const alerts = budgets
          .map((b) => ({
            category: b.title ?? b.category_title ?? b.Category_Title ?? 'Uncategorized',
            spent: Math.abs(Number(b.spent ?? b.total_spent ?? 0)),
            limit: Number(b.limit ?? b.monthly_limit ?? 0),
          }))
          .filter((b) => b.limit > 0 && b.spent / b.limit >= 0.8)
          .map((b) => ({
            ...b,
            color: b.spent / b.limit >= 1 ? '#dc2626' : '#336659',
          }))
        setBudgetAlerts(alerts)
      })
      .catch(() => {})

    goalsApi.getAll()
      .then((data) => {
        const list = Array.isArray(data) ? data : data.goals || []
        if (list.length > 0) {
          const g = list[0]
          setSavingsGoal({
            name: g.name ?? g.goal_name ?? g.Goal_Name ?? 'Savings Goal',
            current: Number(g.current ?? g.current_goal_amount ?? g.Current_Goal_Amount ?? 0),
            target: Number(g.target ?? g.end_goal_amount ?? g.End_Goal_Amount ?? 0),
          })
        }
      })
      .catch(() => {})
  }, [])

  const savingsGoalPct = savingsGoal && savingsGoal.target > 0
    ? Math.round((savingsGoal.current / savingsGoal.target) * 100)
    : 0

  return (
    <div style={s.page}>
      <div>
        <div style={s.heading}>Dashboard</div>
        <div style={s.sub}>Welcome back{firstName ? `, ${firstName}` : ''}. Here's your financial overview.</div>
      </div>

      {/* Account cards */}
      <div style={s.accountsRow}>
        {accounts.length === 0 ? (
          <div style={s.emptyAccounts}>No accounts linked — add one in your profile.</div>
        ) : (
          accounts.map((acct) => (
            <div key={acct.account_id} style={s.accountCard}>
              <div style={s.accountType}>{acct.account_type_name}</div>
              <div style={s.accountBalance}>{fmt(acct.account_balance)}</div>
            </div>
          ))
        )}
      </div>

      {/* Stat cards */}
      <div style={s.grid4}>
        <StatCard
          title="Total Balance"
          value={fmt(totalBalance)}
          trend="Across all accounts"
        />
        <StatCard
          title="Monthly Income"
          value={fmt(monthlyIncome)}
          trend="This month"
          trendPositive={true}
          valueColor="#16a34a"
        />
        <StatCard
          title="Monthly Expenses"
          value={fmt(monthlyExpenses)}
          trend="This month"
          trendPositive={false}
          valueColor="#dc2626"
        />
        <StatCard
          title={savingsGoal ? savingsGoal.name : 'Savings Goal'}
          value={savingsGoal ? `${fmt(savingsGoal.current)} / ${fmt(savingsGoal.target)}` : 'No goals set'}
          extra={savingsGoal && (
            <div style={s.progressTrack}>
              <div
                style={{
                  width: `${savingsGoalPct}%`,
                  height: '100%',
                  background: '#336659',
                  borderRadius: 999,
                }}
              />
            </div>
          )}
        />
      </div>

      {/* Charts row */}
      <div style={s.grid2}>
        <div style={s.card}>
          <div style={s.sectionTitle}>Spending by Category</div>
          {spendingData.length > 0 ? (
            <SpendingChart data={spendingData} />
          ) : (
            <div style={{ color: '#8c7260', fontSize: 14, padding: '60px 0', textAlign: 'center' }}>
              No spending data this month
            </div>
          )}
        </div>

        <div style={s.card}>
          <div style={s.sectionTitle}>Income vs Expenses (6 months)</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="income" fill="#16a34a" name="Income" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expenses" fill="#dc2626" name="Expenses" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions + Budget alerts */}
      <div style={s.grid2}>
        <div style={s.card}>
          <div style={s.sectionTitle}>Recent Transactions</div>
          {recentTransactions.length === 0 ? (
            <div style={{ color: '#8c7260', fontSize: 14, padding: '16px 0' }}>No transactions yet</div>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.id} style={s.txRow}>
                <div>
                  <div style={s.txDesc}>{tx.description}</div>
                  <div style={s.txCat}>{tx.category}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={s.txDate}>{fmtDate(tx.date)}</span>
                  <span style={s.txAmt(tx.amount > 0)}>
                    {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
          <Link to="/transactions" style={s.viewAll}>View All Transactions →</Link>
        </div>

        <div style={s.card}>
          <div style={s.sectionTitle}>Budget Alerts</div>
          {budgetAlerts.length === 0 ? (
            <div style={{ color: '#8c7260', fontSize: 14, padding: '16px 0' }}>
              No budget alerts — all categories within limits.
            </div>
          ) : (
            budgetAlerts.map((alert) => {
              const pct = Math.min(Math.round((alert.spent / alert.limit) * 100), 100)
              return (
                <div key={alert.category} style={s.alertRow}>
                  <div style={s.alertHeader}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{alert.category}</span>
                    <span style={{ color: alert.color, fontSize: 13 }}>
                      ${alert.spent.toFixed(2)} / ${alert.limit.toFixed(2)}
                    </span>
                  </div>
                  <div style={s.progressTrack}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: alert.color,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
