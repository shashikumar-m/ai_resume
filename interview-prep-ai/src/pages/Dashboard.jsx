import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Layout from '../components/Layout'
import { User, Briefcase, Code, ArrowRight, FileText, Brain, BookOpen, BarChart2 } from 'lucide-react'
import styles from './Dashboard.module.css'

const roles = ['Software Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Analyst', 'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
  'Product Manager', 'UI/UX Designer', 'Marketing Manager', 'Business Analyst']

const skillOptions = ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'Machine Learning',
  'Data Analysis', 'AWS', 'Docker', 'TypeScript', 'C++', 'Go', 'Figma', 'Excel', 'Power BI']

export default function Dashboard() {
  const { profile, setProfile, mockHistory } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(profile || {
    name: '', role: '', experience: 'Fresher', skills: [], education: '', projects: ''
  })
  const [saved, setSaved] = useState(!!profile)

  const toggleSkill = (s) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s]
    }))
  }

  const handleSave = () => {
    if (!form.name || !form.role) return
    setProfile(form)
    setSaved(true)
  }

  const avgScore = mockHistory.length
    ? Math.round(mockHistory.reduce((a, s) => a + s.score, 0) / mockHistory.length)
    : null

  const quickLinks = [
    { to: '/resume', icon: FileText, label: 'Build Resume', color: '#6c63ff' },
    { to: '/questions', icon: Brain, label: 'Practice Questions', color: '#ff6584' },
    { to: '/mock', icon: Brain, label: 'Mock Interview', color: '#22c55e' },
    { to: '/learn', icon: BookOpen, label: 'Learning Path', color: '#f59e0b' },
    { to: '/skills', icon: BarChart2, label: 'Skill Gap', color: '#06b6d4' },
  ]

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.sub}>Set up your profile to get personalized guidance</p>
          </div>
          {saved && avgScore !== null && (
            <div className={styles.readinessBadge}>
              <span className={styles.readinessNum}>{avgScore}/10</span>
              <span>Readiness Score</span>
            </div>
          )}
        </div>

        <div className={styles.grid}>
          {/* Profile Form */}
          <div className={styles.card}>
            <div className={styles.cardHeader}><User size={18} /> Profile Setup</div>

            <div className={styles.field}>
              <label>Full Name</label>
              <input className={styles.input} placeholder="e.g. Alex Johnson"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            <div className={styles.field}>
              <label>Target Role</label>
              <select className={styles.input} value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="">Select a role...</option>
                {roles.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label>Experience Level</label>
              <div className={styles.toggle}>
                {['Fresher', 'Experienced'].map(lvl => (
                  <button key={lvl}
                    className={`${styles.toggleBtn} ${form.experience === lvl ? styles.toggleActive : ''}`}
                    onClick={() => setForm(f => ({ ...f, experience: lvl }))}>
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label>Education</label>
              <input className={styles.input} placeholder="e.g. B.Tech Computer Science, 2024"
                value={form.education} onChange={e => setForm(f => ({ ...f, education: e.target.value }))} />
            </div>

            <div className={styles.field}>
              <label>Projects / Experience</label>
              <textarea className={styles.textarea} rows={3}
                placeholder="Briefly describe your key projects or work experience..."
                value={form.projects} onChange={e => setForm(f => ({ ...f, projects: e.target.value }))} />
            </div>

            <div className={styles.field}>
              <label>Skills <span className={styles.muted}>(select all that apply)</span></label>
              <div className={styles.skillsGrid}>
                {skillOptions.map(s => (
                  <button key={s}
                    className={`${styles.skillChip} ${form.skills.includes(s) ? styles.skillActive : ''}`}
                    onClick={() => toggleSkill(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button className={styles.saveBtn} onClick={handleSave}>
              Save Profile <ArrowRight size={16} />
            </button>
            {saved && <p className={styles.savedMsg}>✓ Profile saved successfully</p>}
          </div>

          {/* Quick Links */}
          <div className={styles.rightCol}>
            {saved && profile && (
              <div className={styles.profileSummary}>
                <div className={styles.profileAvatar}>{profile.name[0]}</div>
                <div>
                  <div className={styles.profileName}>{profile.name}</div>
                  <div className={styles.profileRole}>{profile.role} · {profile.experience}</div>
                  <div className={styles.profileSkills}>{profile.skills.slice(0, 4).join(', ')}{profile.skills.length > 4 ? ` +${profile.skills.length - 4}` : ''}</div>
                </div>
              </div>
            )}

            <div className={styles.card}>
              <div className={styles.cardHeader}><Briefcase size={18} /> Quick Actions</div>
              <div className={styles.quickLinks}>
                {quickLinks.map(({ to, icon: Icon, label, color }) => (
                  <button key={to} className={styles.quickLink} onClick={() => navigate(to)}>
                    <div className={styles.quickIcon} style={{ background: `${color}22`, color }}>
                      <Icon size={18} />
                    </div>
                    <span>{label}</span>
                    <ArrowRight size={14} className={styles.quickArrow} />
                  </button>
                ))}
              </div>
            </div>

            {mockHistory.length > 0 && (
              <div className={styles.card}>
                <div className={styles.cardHeader}><Code size={18} /> Recent Sessions</div>
                {mockHistory.slice(0, 3).map((s, i) => (
                  <div key={i} className={styles.sessionRow}>
                    <span>{s.role}</span>
                    <span className={styles.sessionScore}>{s.score}/10</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
