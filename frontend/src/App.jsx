import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Transactions from './pages/Transactions'

function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Navbar />
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budget" element={<div><h1>Budget</h1><p>Coming soon.</p></div>} />
          <Route path="/goals" element={<div><h1>Goals</h1><p>Coming soon.</p></div>} />
          <Route path="/reports" element={<div><h1>Reports</h1><p>Coming soon.</p></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
