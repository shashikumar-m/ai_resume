import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Eye, EyeOff, Sparkles, ArrowRight, User, Mail, Lock } from 'lucide-react'
import styles from './Auth.module.css'

export default function Auth() {
  const [mode, setMode] = useState('login') // login | register
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        if (!form.name.trim()) return setError('Name is required')
        await register(form.name.trim(), form.email.trim(), form.password)
      } else {
        await login(form.email.trim(), form.password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError('')
    setForm({ name: '', email: '', password: '' })
  }

  return (
    <div className={styles.page}>
      {/* Background grid */}
      <div className={styles.bg} />

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Zap size={20} /></div>
          <span className={styles.logoText}>HireReady Resume AI</span>
        </div>

        {/* Heading */}
        <div className={styles.heading}>
          <h1 className={styles.title}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className={styles.sub}>
            {mode === 'login'
              ? 'Sign in to continue your interview prep journey'
              : 'Start your AI-powered interview preparation'}
          </p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <div className={styles.inputWrap}>
                <User size={15} className={styles.inputIcon} />
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Alex Johnson"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrap}>
              <Mail size={15} className={styles.inputIcon} />
              <input
                className={styles.input}
                type="email"
                placeholder="alex@email.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
                autoFocus={mode === 'login'}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <Lock size={15} className={styles.inputIcon} />
              <input
                className={styles.input}
                type={showPass ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Min 6 characters' : 'Your password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading
              ? <span className={styles.spinner} />
              : mode === 'login'
                ? <><ArrowRight size={16} /> Sign In</>
                : <><Sparkles size={16} /> Create Account</>}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}><span>or</span></div>

        {/* Switch mode */}
        <p className={styles.switchText}>
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button className={styles.switchBtn} onClick={switchMode}>
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>

        {/* Features hint */}
        {mode === 'register' && (
          <div className={styles.features}>
            {['AI Resume Builder', 'Mock Interviews', 'Skill Gap Analysis', 'Code Challenges'].map(f => (
              <span key={f} className={styles.featureTag}>âœ“ {f}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

