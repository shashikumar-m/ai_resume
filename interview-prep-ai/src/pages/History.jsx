import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { historyAPI } from '../services/api'
import ResumeRenderer from './ResumeRenderer'
import {
  History as HistoryIcon, FileText, MessageSquare, Brain, Code2,
  Trash2, Eye, X, RefreshCw, Calendar, Download
} from 'lucide-react'
import styles from './History.module.css'

const TABS = [
  { id: 'all',       label: 'All',            icon: HistoryIcon },
  { id: 'resume',    label: 'Resumes',         icon: FileText },
  { id: 'questions', label: 'Q&A Sessions',    icon: MessageSquare },
  { id: 'mock',      label: 'Mock Interviews', icon: Brain },
  { id: 'code',      label: 'Code Challenges', icon: Code2 },
]

const TYPE_COLORS = {
  resume:    { bg: 'rgba(108,99,255,0.1)',  border: 'rgba(108,99,255,0.25)',  text: '#a89fff', icon: FileText },
  questions: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', text: '#f59e0b', icon: MessageSquare },
  mock:      { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.25)',  text: '#22c55e', icon: Brain },
  code:      { bg: 'rgba(6,182,212,0.1)',  border: 'rgba(6,182,212,0.25)', text: '#06b6d4', icon: Code2 },
}

function formatDate(d) {
  const date = new Date(d)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ScoreBadge({ score, max = 10 }) {
  if (score === null || score === undefined) return null
  const pct = (score / max) * 100
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <span className={styles.scoreBadge} style={{ color, borderColor: `${color}44`, background: `${color}12` }}>
      {score}/{max}
    </span>
  )
}

function DetailModal({ entry, onClose }) {
  const [full, setFull] = useState(null)
  const [loading, setLoading] = useState(true)
  const [resumeTab, setResumeTab] = useState('preview') // preview | details

  useEffect(() => {
    historyAPI.getOne(entry._id)
      .then(d => setFull(d))
      .catch(() => setFull(entry))
      .finally(() => setLoading(false))
  }, [entry._id])

  const d = full?.data || {}
  const colors = TYPE_COLORS[entry.type] || TYPE_COLORS.resume

  const handlePrintResume = () => {
    if (!d.form) return
    const f = d.form
    const tpl = d.templateId || 'azurill'
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Resume - ${f.name}</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{background:#fff;}@media print{@page{margin:0;size:A4;}body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}}</style></head><body><div id="root"></div></body></html>`)
    win.document.close()
    setTimeout(() => { win.focus(); win.print() }, 400)
  }

  return (
    <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${entry.type === 'resume' ? styles.modalWide : ''}`}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <span className={styles.modalTypeBadge} style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}>
              {entry.type}
            </span>
            {entry.title}
          </div>
          <div className={styles.modalMeta}>
            <span>{formatDate(entry.createdAt)}</span>
            {entry.score !== null && entry.score !== undefined && <ScoreBadge score={entry.score} max={entry.type === 'resume' ? 100 : 10} />}
          </div>
          <button className={styles.modalClose} onClick={onClose}><X size={16} /></button>
        </div>

        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.modalLoading}><RefreshCw size={18} className={styles.spin} /> Loading...</div>
          ) : (
            <>
              {entry.summary && <p className={styles.modalSummary}>{entry.summary}</p>}

              {/* ── RESUME: show actual rendered preview ── */}
              {entry.type === 'resume' && d.form && (
                <div>
                  {/* Sub-tabs */}
                  <div className={styles.resumeSubTabs}>
                    <button className={`${styles.resumeSubTab} ${resumeTab === 'preview' ? styles.resumeSubTabActive : ''}`} onClick={() => setResumeTab('preview')}>
                      <Eye size={13} /> Resume Preview
                    </button>
                    <button className={`${styles.resumeSubTab} ${resumeTab === 'details' ? styles.resumeSubTabActive : ''}`} onClick={() => setResumeTab('details')}>
                      <FileText size={13} /> Details
                    </button>
                    <button className={styles.printBtn} onClick={handlePrintResume}>
                      <Download size={13} /> Export PDF
                    </button>
                  </div>

                  {resumeTab === 'preview' && (
                    <div className={styles.resumePreviewWrap}>
                      <ResumeRenderer form={d.form} templateId={d.templateId || 'azurill'} />
                    </div>
                  )}

                  {resumeTab === 'details' && (
                    <div className={styles.detailSection}>
                      <div className={styles.detailGrid}>
                        <div><span className={styles.detailLabel}>Role</span><span className={styles.detailVal}>{d.form.targetRole}</span></div>
                        <div><span className={styles.detailLabel}>Name</span><span className={styles.detailVal}>{d.form.name}</span></div>
                        <div><span className={styles.detailLabel}>ATS Score</span><span className={styles.detailVal}>{d.atsScore}/100</span></div>
                        <div><span className={styles.detailLabel}>Template</span><span className={styles.detailVal}>{d.templateId}</span></div>
                      </div>
                      {d.form.skills?.length > 0 && (
                        <div className={styles.detailBlock}>
                          <div className={styles.detailLabel}>Skills</div>
                          <div className={styles.skillTags}>{d.form.skills.map(s => <span key={s} className={styles.skillTag}>{s}</span>)}</div>
                        </div>
                      )}
                      {d.form.experience?.length > 0 && (
                        <div className={styles.detailBlock}>
                          <div className={styles.detailLabel}>Experience</div>
                          {d.form.experience.map((e, i) => <div key={i} className={styles.expItem}><strong>{e.title}</strong> at {e.company} · {e.period}</div>)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── QUESTIONS: show all Q&A with scores ── */}
              {entry.type === 'questions' && (
                <div className={styles.detailSection}>
                  <div className={styles.detailGrid}>
                    <div><span className={styles.detailLabel}>Role</span><span className={styles.detailVal}>{d.role}</span></div>
                    <div><span className={styles.detailLabel}>Level</span><span className={styles.detailVal}>{d.expLevel}</span></div>
                    <div><span className={styles.detailLabel}>Type</span><span className={styles.detailVal}>{d.qType}</span></div>
                    <div><span className={styles.detailLabel}>Answered</span><span className={styles.detailVal}>{d.answers?.length || 0} / {d.questions?.length || 0}</span></div>
                  </div>
                  {d.answers?.length > 0 ? (
                    d.answers.map((a, i) => (
                      <div key={i} className={styles.qaItem}>
                        <div className={styles.qaQ}>Q{i + 1}: {a.question}</div>
                        <div className={styles.qaA}><strong>Your answer:</strong> {a.answer}</div>
                        {a.score !== null && a.score !== undefined && (
                          <div className={styles.qaScore}>
                            <ScoreBadge score={a.score} />
                            <span>{a.feedback?.slice(0, 150)}{a.feedback?.length > 150 ? '...' : ''}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={styles.noAnswers}>No answers recorded in this session.</div>
                  )}
                  {d.questions?.length > 0 && (!d.answers || d.answers.length === 0) && (
                    <div className={styles.detailBlock}>
                      <div className={styles.detailLabel}>Questions in this session</div>
                      {d.questions.map((q, i) => (
                        <div key={i} className={styles.expItem}>Q{i+1}: {q.q || q}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── MOCK INTERVIEW ── */}
              {entry.type === 'mock' && d.scores && (
                <div className={styles.detailSection}>
                  <div className={styles.detailGrid}>
                    <div><span className={styles.detailLabel}>Role</span><span className={styles.detailVal}>{d.role}</span></div>
                    <div><span className={styles.detailLabel}>Level</span><span className={styles.detailVal}>{d.expLevel}</span></div>
                    <div><span className={styles.detailLabel}>Questions</span><span className={styles.detailVal}>{d.scores.length}</span></div>
                    <div><span className={styles.detailLabel}>Avg Score</span><span className={styles.detailVal}>{d.avgScore}/10</span></div>
                  </div>
                  {d.scores.map((s, i) => (
                    <div key={i} className={styles.qaItem}>
                      <div className={styles.qaQ}>Q{i + 1}: {s.q}</div>
                      <div className={styles.qaA}><strong>Answer:</strong> {s.answer}</div>
                      <div className={styles.qaScore}><ScoreBadge score={s.score} /> <span>{s.feedback?.slice(0, 150)}{s.feedback?.length > 150 ? '...' : ''}</span></div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── CODE CHALLENGE ── */}
              {entry.type === 'code' && (
                <div className={styles.detailSection}>
                  <div className={styles.detailGrid}>
                    <div><span className={styles.detailLabel}>Challenge</span><span className={styles.detailVal}>{d.challengeTitle}</span></div>
                    <div><span className={styles.detailLabel}>Difficulty</span><span className={styles.detailVal}>{d.difficulty}</span></div>
                    <div><span className={styles.detailLabel}>Language</span><span className={styles.detailVal}>{d.language}</span></div>
                    <div><span className={styles.detailLabel}>Tests</span><span className={styles.detailVal}>{d.testsPassed}/{d.testsTotal} passed</span></div>
                  </div>
                  {d.code && (
                    <div className={styles.detailBlock}>
                      <div className={styles.detailLabel}>Your Code</div>
                      <pre className={styles.codeBlock}>{d.code}</pre>
                    </div>
                  )}
                  {d.analysis && (
                    <div className={styles.detailBlock}>
                      <div className={styles.detailLabel}>AI Analysis</div>
                      <p className={styles.detailText}>{d.analysis}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function History() {
  const [activeTab, setActiveTab] = useState('all')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await historyAPI.getAll(activeTab === 'all' ? null : activeTab)
      setEntries(data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [activeTab])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    setDeleting(id)
    try {
      await historyAPI.delete(id)
      setEntries(prev => prev.filter(e => e._id !== id))
    } catch {}
    setDeleting(null)
  }

  const grouped = entries.reduce((acc, e) => {
    const day = new Date(e.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    if (!acc[day]) acc[day] = []
    acc[day].push(e)
    return acc
  }, {})

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderIcon}><HistoryIcon size={22} /></div>
          <div>
            <h1 className={styles.pageTitle}>History</h1>
            <p className={styles.pageSub}>All your saved sessions, resumes, and practice data</p>
          </div>
          <button className={styles.refreshBtn} onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? styles.spin : ''} />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={14} /> {label}
              {activeTab === id && entries.length > 0 && (
                <span className={styles.tabCount}>{entries.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.loadingState}>
            <RefreshCw size={24} className={styles.spin} />
            <span>Loading history...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className={styles.emptyState}>
            <HistoryIcon size={40} className={styles.emptyIcon} />
            <h3>No history yet</h3>
            <p>Your {activeTab === 'all' ? 'activity' : activeTab} history will appear here automatically as you use the app.</p>
          </div>
        ) : (
          <div className={styles.timeline}>
            {Object.entries(grouped).map(([day, dayEntries]) => (
              <div key={day} className={styles.dayGroup}>
                <div className={styles.dayLabel}>
                  <Calendar size={13} /> {day}
                </div>
                <div className={styles.dayEntries}>
                  {dayEntries.map(entry => {
                    const colors = TYPE_COLORS[entry.type] || TYPE_COLORS.resume
                    const Icon = colors.icon
                    return (
                      <div
                        key={entry._id}
                        className={styles.entryCard}
                        onClick={() => setSelected(entry)}
                      >
                        <div className={styles.entryLeft}>
                          <div className={styles.entryIconWrap} style={{ background: colors.bg, borderColor: colors.border }}>
                            <Icon size={16} style={{ color: colors.text }} />
                          </div>
                          <div className={styles.entryInfo}>
                            <div className={styles.entryTitle}>{entry.title}</div>
                            {entry.summary && <div className={styles.entrySummary}>{entry.summary}</div>}
                          </div>
                        </div>
                        <div className={styles.entryRight}>
                          {entry.score !== null && <ScoreBadge score={entry.score} />}
                          <span className={styles.entryTime}>{formatDate(entry.createdAt)}</span>
                          <button
                            className={styles.viewBtn}
                            onClick={e => { e.stopPropagation(); setSelected(entry) }}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={e => handleDelete(entry._id, e)}
                            disabled={deleting === entry._id}
                          >
                            {deleting === entry._id
                              ? <RefreshCw size={13} className={styles.spin} />
                              : <Trash2 size={13} />}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <DetailModal entry={selected} onClose={() => setSelected(null)} />}
    </Layout>
  )
}
