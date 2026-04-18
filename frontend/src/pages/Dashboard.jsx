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
import { userApi } from '../services/api'

const SPENDING_DATA = [
  { name: 'Rent', value: 1500, color: '#3b5bdb' },
  { name: 'Groceries', value: 580, color: '#40c057' },
  { name: 'Transport', value: 220, color: '#f59e0b' },
  { name: 'Utilities', value: 180, color: '#fa5252' },
  { name: 'Entertainment', value: 120, color: '#be4bdb' },
  { name: 'Other', value: 200, color: '#74c0fc' },
]

const BAR_DATA = [
  { month: 'Nov', income: 4200, expenses: 2800 },
  { month: 'Dec', income: 4500, expenses: 3200 },
  { month: 'Jan', income: 4200, expenses: 2900 },
  { month: 'Feb', income: 4200, expenses: 2700 },
  { month: 'Mar', income: 4800, expenses: 3100 },
  { month: 'Apr', income: 4200, expenses: 2800 },
]

const RECENT_TRANSACTIONS = [
  { id: 1, description: 'Whole Foods Market', category: 'Groceries', amount: -84.32, date: 'Apr 16' },
  { id: 2, description: 'Salary Deposit', category: 'Income', amount: 4200.00, date: 'Apr 15' },
  { id: 3, description: 'Netflix', category: 'Entertainment', amount: -15.99, date: 'Apr 14' },
  { id: 4, description: 'Electric Bill', category: 'Utilities', amount: -92.40, date: 'Apr 13' },
  { id: 5, description: 'Uber', category: 'Transport', amount: -24.50, date: 'Apr 12' },
]

const BUDGET_ALERTS = [
  { category: 'Entertainment', spent: 120, limit: 150, color: '#f59e0b' },
  { category: 'Dining Out', spent: 210, limit: 200, color: '#fa5252' },
]

const s = {
  page: { display: 'flex', flexDirection: 'column', gap: 24 },
  heading: { fontSize: 24, fontWeight: 700, color: '#1e2a4a', marginBottom: 4 },
  sub: { fontSize: 14, color: '#64748b' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  cardTitle: { fontSize: 13, color: '#64748b', fontWeight: 500, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#1e2a4a' },
  trend: (positive) => ({
    fontSize: 12,
    color: positive ? '#40c057' : '#fa5252',
    marginTop: 4,
  }),
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#1e2a4a', marginBottom: 16 },
  progressTrack: {
    background: '#e2e8f0',
    borderRadius: 999,
    height: 8,
    marginTop: 8,
  },
  txRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  txDesc: { fontSize: 14, fontWeight: 500, color: '#1e2a4a' },
  txCat: { fontSize: 12, color: '#94a3b8' },
  txDate: { fontSize: 12, color: '#94a3b8', marginRight: 16 },
  txAmt: (positive) => ({
    fontSize: 14,
    fontWeight: 600,
    color: positive ? '#40c057' : '#fa5252',
  }),
  viewAll: {
    display: 'block',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    color: '#3b5bdb',
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

function StatCard({ title, value, trend, trendPositive, extra }) {
  return (
    <div style={s.card}>
      <div style={s.cardTitle}>{title}</div>
      <div style={s.statValue}>{value}</div>
      {trend && <div style={s.trend(trendPositive)}>{trend}</div>}
      {extra}
    </div>
  )
}

export default function Dashboard() {
  const savingsGoalPct = Math.round((1240 / 5000) * 100)
  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    userApi.getProfile().then((u) => setFirstName(u.first_name)).catch(() => {})
  }, [])

  return (
    <div style={s.page}>
      <div>
        <div style={s.heading}>Dashboard</div>
        <div style={s.sub}>Welcome back{firstName ? `, ${firstName}` : ''}. Here's your financial overview.</div>
      </div>

      {/* Stat cards */}
      <div style={s.grid4}>
        <StatCard
          title="Total Balance"
          value="$12,840.50"
          trend="▲ 2.4% from last month"
          trendPositive={true}
        />
        <StatCard
          title="Monthly Income"
          value="$4,200.00"
          trend="▲ Stable"
          trendPositive={true}
        />
        <StatCard
          title="Monthly Expenses"
          value="$2,800.21"
          trend="▼ 5.1% from last month"
          trendPositive={true}
        />
        <StatCard
          title="Savings Goal"
          value="$1,240 / $5,000"
          extra={
            <div style={s.progressTrack}>
              <div
                style={{
                  width: `${savingsGoalPct}%`,
                  height: '100%',
                  background: '#3b5bdb',
                  borderRadius: 999,
                }}
              />
            </div>
          }
        />
      </div>

      {/* Charts row */}
      <div style={s.grid2}>
        <div style={s.card}>
          <div style={s.sectionTitle}>Spending by Category</div>
          <SpendingChart data={SPENDING_DATA} />
        </div>

        <div style={s.card}>
          <div style={s.sectionTitle}>Income vs Expenses (6 months)</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={BAR_DATA} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="income" fill="#40c057" name="Income" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expenses" fill="#fa5252" name="Expenses" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions + Budget alerts */}
      <div style={s.grid2}>
        <div style={s.card}>
          <div style={s.sectionTitle}>Recent Transactions</div>
          {RECENT_TRANSACTIONS.map((tx) => (
            <div key={tx.id} style={s.txRow}>
              <div>
                <div style={s.txDesc}>{tx.description}</div>
                <div style={s.txCat}>{tx.category}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={s.txDate}>{tx.date}</span>
                <span style={s.txAmt(tx.amount > 0)}>
                  {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          <Link to="/transactions" style={s.viewAll}>View All Transactions →</Link>
        </div>

        <div style={s.card}>
          <div style={s.sectionTitle}>Budget Alerts</div>
          {BUDGET_ALERTS.map((alert) => {
            const pct = Math.min(Math.round((alert.spent / alert.limit) * 100), 100)
            return (
              <div key={alert.category} style={s.alertRow}>
                <div style={s.alertHeader}>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{alert.category}</span>
                  <span style={{ color: alert.color, fontSize: 13 }}>
                    ${alert.spent} / ${alert.limit}
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
          })}
        </div>
      </div>
    </div>
  )
}
