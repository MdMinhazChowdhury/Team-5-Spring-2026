import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  BarChart2,
  User,
} from 'lucide-react'
import { userApi } from '../services/api'
import EditProfileModal from './EditProfileModal'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budget', label: 'Budget', icon: Wallet },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/reports', label: 'Reports', icon: BarChart2 },
]

const styles = {
  sidebar: {
    width: 240,
    minWidth: 240,
    background: '#0e1c4f',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  brand: {
    color: '#f3efe8',
    fontSize: 20,
    fontWeight: 700,
    padding: '0 24px 32px',
    letterSpacing: '0.3px',
  },
  brandAccent: {
    color: '#faecc3',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '0 12px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 8,
    color: '#bba591',
    fontSize: 15,
    fontWeight: 500,
    transition: 'background 0.15s, color 0.15s',
  },
  navLinkActive: {
    background: '#faecc3',
    color: '#0e1c4f',
  },
  userSection: {
    padding: '16px 24px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    transition: 'background 0.15s',
    borderRadius: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#336659',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#f3efe8',
    flexShrink: 0,
  },
  userName: {
    color: '#f3efe8',
    fontSize: 14,
    fontWeight: 600,
  },
  userEmail: {
    color: '#bba591',
    fontSize: 12,
  },
}

export default function Navbar() {
  const [userProfile, setUserProfile] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    userApi.getProfile()
      .then(setUserProfile)
      .catch(() => {}) // silently fail if not authenticated
  }, [])

  function handleProfileUpdated(updates) {
    setUserProfile((prev) => ({ ...prev, ...updates }))
  }

  const displayName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`.trim() || userProfile.email
    : '…'
  const displayEmail = userProfile?.email || ''

  return (
    <>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          Finance<span style={styles.brandAccent}>Tracker</span>
        </div>

        <nav style={styles.nav}>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          style={styles.userSection}
          onClick={() => setShowEditModal(true)}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(250,236,195,0.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <div style={styles.avatar}>
            <User size={18} />
          </div>
          <div>
            <div style={styles.userName}>{displayName}</div>
            {displayEmail && <div style={styles.userEmail}>{displayEmail}</div>}
          </div>
        </button>
      </aside>

      {showEditModal && (
        <EditProfileModal
          user={userProfile}
          onClose={() => setShowEditModal(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </>
  )
}
