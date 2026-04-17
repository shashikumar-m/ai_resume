import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Layout from '../components/Layout'
import AIResponse from '../components/AIResponse'
import { groqChat } from '../services/groq'
import { BarChart2, TrendingUp, AlertCircle, CheckCircle, BookOpen, Sparkles } from 'lucide-react'
import styles from './SkillGap.module.css'
const requiredSkills = {
  'Software Developer': [
    { name: 'Data Structures & Algorithms', weight: 'Critical' },
    { name: 'System Design', weight: 'Critical' },
    { name: 'JavaScript / TypeScript', weight: 'High' },
    { name: 'React or Angular', weight: 'High' },
    { name: 'Node.js / Backend', weight: 'High' },
    { name: 'SQL / Databases', weight: 'Medium' },
    { name: 'Git & Version Control', weight: 'Medium' },
    { name: 'Docker / DevOps', weight: 'Medium' },
    { name: 'Testing', weight: 'Medium' },
    { name: 'Cloud (AWS/GCP)', weight: 'Low' },
  ],
  'Data Analyst': [
    { name: 'SQL', weight: 'Critical' },
    { name: 'Python (Pandas/NumPy)', weight: 'Critical' },
    { name: 'Statistics', weight: 'Critical' },
    { name: 'Data Visualization', weight: 'High' },
    { name: 'Excel / Spreadsheets', weight: 'High' },
    { name: 'Power BI / Tableau', weight: 'High' },
    { name: 'Business Intelligence', weight: 'Medium' },
    { name: 'Machine Learning Basics', weight: 'Medium' },
    { name: 'Communication', weight: 'Medium' },
    { name: 'Big Data Tools', weight: 'Low' },
  ],
  'default': [
    { name: 'Communication', weight: 'Critical' },
    { name: 'Problem Solving', weight: 'Critical' },
    { name: 'Domain Knowledge', weight: 'High' },
    { name: 'Data Analysis', weight: 'High' },
    { name: 'Project Management', weight: 'Medium' },
    { name: 'Leadership', weight: 'Medium' },
    { name: 'Technical Tools', weight: 'Medium' },
    { name: 'Presentation Skills', weight: 'Low' },
  ]
}

const studyPlan = {
  'Critical': { time: '2–3 weeks', resources: ['LeetCode', 'System Design Primer', 'Official Docs'] },
  'High': { time: '1–2 weeks', resources: ['YouTube tutorials', 'Udemy courses', 'Practice projects'] },
  'Medium': { time: '3–5 days', resources: ['Documentation', 'Blog posts', 'Small exercises'] },
  'Low': { time: '1–2 days', resources: ['Overview articles', 'Quick tutorials'] },
}

const weightColor = { Critical: '#ef4444', High: '#f59e0b', Medium: '#6c63ff', Low: '#22c55e' }

function getRequired(role) {
  const key = Object.keys(requiredSkills).find(k =>
    role?.toLowerCase().includes(k.toLowerCase().split(' ')[0])
  ) || 'default'
  return requiredSkills[key]
}

export default function SkillGap() {
  const { profile, mockHistory } = useApp()
  const required = getRequired(profile?.role)
  const userSkills = profile?.skills || []
  const [aiPlan, setAiPlan] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const present = required.filter(s => userSkills.some(u => u.toLowerCase().includes(s.name.toLowerCase().split(' ')[0])))
  const missing = required.filter(s => !userSkills.some(u => u.toLowerCase().includes(s.name.toLowerCase().split(' ')[0])))

  const avgScore = mockHistory.length
    ? Math.round(mockHistory.reduce((a, s) => a + s.score, 0) / mockHistory.length)
    : null

  const readiness = Math.round((present.length / required.length) * 100)

  const generateAIPlan = async () => {
    if (!profile) return
    setAiLoading(true)
    setAiPlan('')
    const prompt = `Create a concise 2-week study plan for a ${profile.role} candidate (${profile.experience} level).
Missing skills: ${missing.map(s => s.name).join(', ') || 'None'}.
Interview score: ${avgScore !== null ? `${avgScore}/10` : 'Not assessed yet'}.

Format as:
Week 1: [3 focus areas with brief actions]
Week 2: [3 focus areas with brief actions]
Daily habit: [one daily practice tip]

Keep it under 150 words. Be specific and actionable.`
    try {
      await groqChat(prompt, (_, full) => setAiPlan(full))
    } catch (e) {
      setAiPlan(`Error: ${e.message}`)
    }
    setAiLoading(false)
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Skill Gap Analysis</h1>
            <p className={styles.sub}>Personalized gap analysis for {profile?.role || 'your target role'}</p>
          </div>
        </div>

        {!profile ? (
          <div className={styles.emptyState}>
            <BarChart2 size={40} className={styles.emptyIcon} />
            <p>Set up your profile on the Dashboard to see your personalized skill gap analysis.</p>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <div className={styles.statNum} style={{ color: '#22c55e' }}>{present.length}</div>
                <div className={styles.statLabel}>Skills Present</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNum} style={{ color: '#ef4444' }}>{missing.length}</div>
                <div className={styles.statLabel}>Skills Missing</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNum} style={{ color: '#6c63ff' }}>{readiness}%</div>
                <div className={styles.statLabel}>Profile Readiness</div>
              </div>
              {avgScore !== null && (
                <div className={styles.statCard}>
                  <div className={styles.statNum} style={{ color: '#f59e0b' }}>{avgScore}/10</div>
                  <div className={styles.statLabel}>Interview Score</div>
                </div>
              )}
            </div>

            {/* Readiness Bar */}
            <div className={styles.readinessCard}>
              <div className={styles.readinessHeader}>
                <TrendingUp size={16} />
                <span>Overall Readiness for {profile.role}</span>
                <span className={styles.readinessPct}>{readiness}%</span>
              </div>
              <div className={styles.readinessBar}>
                <div className={styles.readinessFill} style={{ width: `${readiness}%` }} />
              </div>
              <p className={styles.readinessMsg}>
                {readiness >= 80 ? '🎉 You\'re well-prepared! Focus on advanced topics and mock interviews.' :
                  readiness >= 50 ? '📈 Good foundation. Close the gaps below to boost your chances.' :
                    '🚀 Start with the Critical skills below to build a strong foundation.'}
              </p>
            </div>

            <div className={styles.grid}>
              {/* Present Skills */}
              <div className={styles.card}>
                <div className={styles.cardTitle}><CheckCircle size={15} className={styles.greenIcon} /> Skills You Have</div>
                {present.length === 0 ? (
                  <p className={styles.emptyMsg}>No matching skills found. Update your profile with your skills.</p>
                ) : (
                  present.map(s => (
                    <div key={s.name} className={styles.skillRow}>
                      <span className={styles.skillName}>{s.name}</span>
                      <span className={styles.weightBadge} style={{ color: weightColor[s.weight], background: `${weightColor[s.weight]}18` }}>
                        {s.weight}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Missing Skills */}
              <div className={styles.card}>
                <div className={styles.cardTitle}><AlertCircle size={15} className={styles.redIcon} /> Skills to Develop</div>
                {missing.length === 0 ? (
                  <p className={styles.emptyMsg}>🎉 You have all required skills for this role!</p>
                ) : (
                  missing.map(s => (
                    <div key={s.name} className={styles.skillRow}>
                      <span className={styles.skillName}>{s.name}</span>
                      <span className={styles.weightBadge} style={{ color: weightColor[s.weight], background: `${weightColor[s.weight]}18` }}>
                        {s.weight}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Study Plan */}
            {missing.length > 0 && (
              <div className={styles.studyPlanCard}>
                <div className={styles.cardTitle}><BookOpen size={15} /> Personalized Study Plan</div>
                <div className={styles.studyGrid}>
                  {['Critical', 'High', 'Medium', 'Low'].map(w => {
                    const skills = missing.filter(s => s.weight === w)
                    if (!skills.length) return null
                    const plan = studyPlan[w]
                    return (
                      <div key={w} className={styles.studyBlock}>
                        <div className={styles.studyHeader} style={{ borderColor: weightColor[w] }}>
                          <span style={{ color: weightColor[w] }}>{w} Priority</span>
                          <span className={styles.studyTime}>{plan.time}</span>
                        </div>
                        <div className={styles.studySkills}>
                          {skills.map(s => <div key={s.name} className={styles.studySkill}>{s.name}</div>)}
                        </div>
                        <div className={styles.studyResources}>
                          {plan.resources.map(r => <span key={r} className={styles.resource}>{r}</span>)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* AI Study Plan */}
            <div className={styles.studyPlanCard}>
              <div className={styles.cardTitle}><Sparkles size={15} /> AI-Generated Study Plan (Groq)</div>
              <button className={styles.aiPlanBtn} onClick={generateAIPlan} disabled={aiLoading}>
                <Sparkles size={13} /> {aiLoading ? 'Generating plan...' : 'Generate My 2-Week Plan'}
              </button>
              <AIResponse text={aiPlan} loading={aiLoading} />
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
