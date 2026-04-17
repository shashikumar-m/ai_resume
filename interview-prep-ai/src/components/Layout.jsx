import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Brain, FileText, MessageSquare, BookOpen, BarChart2, Zap, LayoutDashboard, TrendingUp, GraduationCap, Code2, LogOut, History } from 'lucide-react'
import OllamaStatus from './OllamaStatus'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

const nav = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resume',     icon: FileText,         label: 'Resume Builder' },
  { to: '/questions',  icon: MessageSquare,    label: 'Questions' },
  { to: '/mock',       icon: Brain,            label: 'Mock Interview' },
  { to: '/study',      icon: GraduationCap,    label: 'Study Concepts' },
  { to: '/code',       icon: Code2,            label: 'Code & Test' },
  { to: '/learn',      icon: BookOpen,         label: 'Learning Path' },
  { to: '/skills',     icon: BarChart2,        label: 'Skill Gap' },
  { to: '/analytics',  icon: TrendingUp,       label: 'Analytics' },
  { to: '/history',    icon: History,          label: 'History' },
]

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/auth') }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.logo}>
          <Zap size={22} />
          <span>HireReady</span>
        </Link>
        <nav className={styles.nav}>
          {nav.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`${styles.navItem} ${pathname === to ? styles.active : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.statusArea}>
          <OllamaStatus />
          {user && (
            <div className={styles.userArea}>
              <div className={styles.userAvatar}>{user.name?.[0]?.toUpperCase() || 'U'}</div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>{user.name}</div>
                <div className={styles.userEmail}>{user.email}</div>
              </div>
              <button className={styles.logoutBtn} onClick={handleLogout} title="Sign out">
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  )
}

