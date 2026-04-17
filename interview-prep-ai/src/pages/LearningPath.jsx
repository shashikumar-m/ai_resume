
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import Layout from '../components/Layout'
import { groqChat } from '../services/groq'
import { useHistorySave } from '../hooks/useHistorySave'
import { historyAPI } from '../services/api'
import {
  BookOpen, Sparkles, RefreshCw, Calendar, Target,
  CheckCircle, Circle, ChevronDown, ChevronUp,
  Save, Clock, Zap, TrendingUp, History, Trash2, Eye
} from 'lucide-react'
import styles from './LearningPath.module.css'

const ROLES = [
  'Software Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Analyst', 'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
  'Product Manager', 'UI/UX Designer', 'MERN Developer', 'Java Developer',
]

const EXPERIENCE_LEVELS = ['Fresher (0-1 yr)', 'Junior (1-3 yrs)', 'Mid (3-5 yrs)', 'Senior (5+ yrs)']
const DURATIONS = ['1 week', '2 weeks', '1 month', '2 months', '3 months']
const HOURS_PER_DAY = ['1 hour', '2 hours', '3 hours', '4+ hours']

// ── Render AI markdown output ─────────────────────────────────────────────────
function RenderContent({ text, loading }) {
  if (!text && !loading) return null
  const lines = (text || '').split('\n')
  return (
    <div className={styles.aiContent}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className={styles.h2}>{line.slice(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i} className={styles.h3}>{line.slice(4)}</h3>
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className={styles.bold}>{line.slice(2, -2)}</p>
        if (line.startsWith('- ') || line.startsWith('• ')) return <li key={i} className={styles.li}>{line.slice(2)}</li>
        if (/^\d+\./.test(line)) return <li key={i} className={styles.liNum}>{line.replace(/^\d+\.\s*/, '')}</li>
        if (line.startsWith('---')) return <hr key={i} className={styles.hr} />
        if (line.trim() === '') return <div key={i} className={styles.spacer} />
        return <p key={i} className={styles.p}>{line}</p>
      })}
      {loading && <span className={styles.cursor} />}
    </div>
  )
}

// ── Saved Plan Card ───────────────────────────────────────────────────────────
function SavedPlanCard({ plan, onView, onDelete }) {
  return (
    <div className={styles.savedCard}>
      <div className={styles.savedCardLeft}>
        <div className={styles.savedCardIcon}>
          {plan.data?.planType === 'roadmap' ? <Target size={16} /> : <Calendar size={16} />}
        </div>
        <div>
          <div className={styles.savedCardTitle}>{plan.title}</div>
          <div className={styles.savedCardMeta}>{plan.summary}</div>
          <div className={styles.savedCardDate}>
            {new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>
      <div className={styles.savedCardActions}>
        <button className={styles.savedViewBtn} onClick={() => onView(plan)}>
          <Eye size={13} /> View
        </button>
        <button className={styles.savedDeleteBtn} onClick={() => onDelete(plan._id)}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LearningPath() {
  const { profile } = useApp()
  const { save } = useHistorySave()

  // Config
  const [role, setRole] = useState(profile?.role || '')
  const [experience, setExperience] = useState('Junior (1-3 yrs)')
  const [skills, setSkills] = useState(profile?.skills?.join(', ') || '')
  const [targetDate, setTargetDate] = useState('')
  const [duration, setDuration] = useState('1 month')
  const [hoursPerDay, setHoursPerDay] = useState('2 hours')
  const [weakAreas, setWeakAreas] = useState('')

  // Active tab
  const [activeTab, setActiveTab] = useState('roadmap') // roadmap | daily | saved

  // Roadmap state
  const [roadmap, setRoadmap] = useState('')
  const [roadmapLoading, setRoadmapLoading] = useState(false)
  const [roadmapSaving, setRoadmapSaving] = useState(false)
  const [roadmapSaved, setRoadmapSaved] = useState(false)

  // Daily plan state
  const [dailyPlan, setDailyPlan] = useState('')
  const [dailyLoading, setDailyLoading] = useState(false)
  const [dailySaving, setDailySaving] = useState(false)
  const [dailySaved, setDailySaved] = useState(false)

  // Saved plans
  const [savedPlans, setSavedPlans] = useState([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [viewingPlan, setViewingPlan] = useState(null)

  // Load saved plans when tab switches to saved
  useEffect(() => {
    if (activeTab === 'saved') loadSavedPlans()
  }, [activeTab])

  const loadSavedPlans = async () => {
    setSavedLoading(true)
    try {
      const all = await historyAPI.getAll('learn')
      setSavedPlans(all)
    } catch (e) {
      console.warn('Could not load saved plans:', e.message)
    }
    setSavedLoading(false)
  }

  // ── Generate Personalized Roadmap ──
  const generateRoadmap = async () => {
    if (!role) return alert('Please select a Target Role first.')
    setRoadmapLoading(true)
    setRoadmap('')
    setRoadmapSaved(false)

    const prompt = `You are an expert career coach and technical mentor. Create a highly personalized learning roadmap.

Candidate Profile:
- Target Role: ${role}
- Experience Level: ${experience}
- Current Skills: ${skills || 'Not specified'}
- Weak Areas / Gaps: ${weakAreas || 'Not specified'}
- Available Time: ${hoursPerDay} per day
- Target Duration: ${duration}

Generate a PERSONALIZED learning roadmap with these sections:

## 🎯 Your Personalized Roadmap for ${role}

### 📊 Current Skill Assessment
[Analyze their current skills vs what's needed for ${role}. Be specific about gaps.]

### 🗺️ Learning Phases

#### Phase 1: Foundation (Week 1-2)
[List 4-6 specific topics to master first, with why each matters for ${role}]

#### Phase 2: Core Skills (Week 3-4)
[List 4-6 intermediate topics building on Phase 1]

#### Phase 3: Advanced & Interview Prep (Final weeks)
[List 4-6 advanced topics + interview-specific preparation]

### 🎯 Priority Focus Areas
[Based on their weak areas and role requirements, list top 3 things to focus on most]

### 📚 Recommended Resources
[5-7 specific free resources: courses, books, websites tailored to ${role}]

### ✅ Success Milestones
[4-5 checkpoints to know they're on track]

### ⚡ Quick Wins (Start Today)
[3 things they can do TODAY to start making progress]

Be specific, actionable, and personalized. Not generic advice.`

    try {
      await groqChat(prompt, (_, full) => setRoadmap(full))
    } catch (e) {
      setRoadmap(`Error: ${e.message}`)
    }
    setRoadmapLoading(false)
  }

  // ── Generate Daily Study Plan ──
  const generateDailyPlan = async () => {
    if (!role) return alert('Please select a Target Role first.')
    setDailyLoading(true)
    setDailyPlan('')
    setDailySaved(false)

    // Calculate days from duration
    const daysMap = { '1 week': 7, '2 weeks': 14, '1 month': 30, '2 months': 60, '3 months': 90 }
    const totalDays = daysMap[duration] || 30
    const weeksToShow = Math.min(Math.ceil(totalDays / 7), 4) // show max 4 weeks in detail

    const interviewDate = targetDate
      ? `Target interview date: ${new Date(targetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
      : `Duration: ${duration}`

    const prompt = `You are an expert interview preparation coach. Create a detailed day-by-day study plan.

Candidate Profile:
- Target Role: ${role}
- Experience Level: ${experience}
- Current Skills: ${skills || 'Not specified'}
- Weak Areas: ${weakAreas || 'Not specified'}
- ${interviewDate}
- Study Time Available: ${hoursPerDay} per day

Create a DETAILED daily study plan for ${weeksToShow} weeks:

## 📅 Your ${duration} Study Plan for ${role}

### 📋 Plan Overview
- Total study days: ${totalDays}
- Daily commitment: ${hoursPerDay}
- Focus: ${role} interview preparation

---

### 📆 Week 1: Foundation Building
**Monday** — [Topic] (${hoursPerDay})
- Task 1: [specific action]
- Task 2: [specific action]
- Practice: [specific exercise]

**Tuesday** — [Topic] (${hoursPerDay})
- Task 1: [specific action]
- Task 2: [specific action]
- Practice: [specific exercise]

**Wednesday** — [Topic] (${hoursPerDay})
[same format]

**Thursday** — [Topic] (${hoursPerDay})
[same format]

**Friday** — [Topic] (${hoursPerDay})
[same format]

**Saturday** — Review & Practice (${hoursPerDay})
- Review week's topics
- Practice problems
- Mock interview question practice

**Sunday** — Rest / Light Review
- Optional: review notes
- Prepare for next week

---

### 📆 Week 2: Core Skills
[Same detailed format for week 2]

### 📆 Week 3: Advanced Topics
[Same detailed format for week 3]

### 📆 Week 4: Interview Prep Sprint
[Focus on mock interviews, system design, behavioral questions]

---

### 🎯 Daily Routine Template
[A reusable daily schedule template for ${hoursPerDay} of study]

### 📊 Weekly Goals
[What to achieve by end of each week]

### 🚨 If You Fall Behind
[How to catch up if they miss days]

Be very specific with topics relevant to ${role}. Include actual resource names.`

    try {
      await groqChat(prompt, (_, full) => setDailyPlan(full))
    } catch (e) {
      setDailyPlan(`Error: ${e.message}`)
    }
    setDailyLoading(false)
  }

  // ── Save Roadmap ──
  const saveRoadmap = async () => {
    if (!roadmap) return
    setRoadmapSaving(true)
    await save(
      'learn',
      `Roadmap: ${role} — ${experience}`,
      `${duration} · ${hoursPerDay}/day · ${weakAreas ? 'Custom gaps' : 'Standard'}`,
      null,
      { planType: 'roadmap', role, experience, skills, weakAreas, duration, hoursPerDay, content: roadmap }
    )
    setRoadmapSaving(false)
    setRoadmapSaved(true)
    setTimeout(() => setRoadmapSaved(false), 3000)
  }

  // ── Save Daily Plan ──
  const saveDailyPlan = async () => {
    if (!dailyPlan) return
    setDailySaving(true)
    await save(
      'learn',
      `Daily Plan: ${role} — ${duration}`,
      `${hoursPerDay}/day · ${targetDate ? `Interview: ${new Date(targetDate).toLocaleDateString()}` : duration}`,
      null,
      { planType: 'daily', role, experience, skills, weakAreas, duration, hoursPerDay, targetDate, content: dailyPlan }
    )
    setDailySaving(false)
    setDailySaved(true)
    setTimeout(() => setDailySaved(false), 3000)
  }

  // ── Delete saved plan ──
  const deletePlan = async (id) => {
    try {
      await historyAPI.delete(id)
      setSavedPlans(prev => prev.filter(p => p._id !== id))
      if (viewingPlan?._id === id) setViewingPlan(null)
    } catch (e) {
      console.warn(e)
    }
  }

  // ── View saved plan ──
  const viewPlan = async (plan) => {
    try {
      const full = await historyAPI.getOne(plan._id)
      setViewingPlan(full)
    } catch {
      setViewingPlan(plan)
    }
  }

  return (
    <Layout>
      <div className={styles.page}>
        {/* ── Page Header ── */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderIcon}><BookOpen size={22} /></div>
          <div>
            <h1 className={styles.pageTitle}>AI Learning Path</h1>
            <p className={styles.pageSub}>Personalized roadmap + daily study plan powered by Groq AI</p>
          </div>
        </div>

        {/* ── Config Card ── */}
        <div className={styles.configCard}>
          <div className={styles.configTitle}><Target size={16} /> Configure Your Plan</div>
          <div className={styles.configGrid}>
            {/* Role */}
            <div className={styles.configField}>
              <label className={styles.configLabel}>Target Role *</label>
              <select className={styles.configSelect} value={role} onChange={e => setRole(e.target.value)}>
                <option value="">Select role...</option>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            {/* Experience */}
            <div className={styles.configField}>
              <label className={styles.configLabel}>Experience Level</label>
              <select className={styles.configSelect} value={experience} onChange={e => setExperience(e.target.value)}>
                {EXPERIENCE_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            {/* Duration */}
            <div className={styles.configField}>
              <label className={styles.configLabel}>Study Duration</label>
              <div className={styles.chipRow}>
                {DURATIONS.map(d => (
                  <button key={d} className={`${styles.chip} ${duration === d ? styles.chipActive : ''}`}
                    onClick={() => setDuration(d)}>{d}</button>
                ))}
              </div>
            </div>

            {/* Hours per day */}
            <div className={styles.configField}>
              <label className={styles.configLabel}>Hours Per Day</label>
              <div className={styles.chipRow}>
                {HOURS_PER_DAY.map(h => (
                  <button key={h} className={`${styles.chip} ${hoursPerDay === h ? styles.chipActive : ''}`}
                    onClick={() => setHoursPerDay(h)}>{h}</button>
                ))}
              </div>
            </div>

            {/* Current skills */}
            <div className={styles.configField}>
              <label className={styles.configLabel}>Your Current Skills</label>
              <input className={styles.configInput} value={skills}
                onChange={e => setSkills(e.target.value)}
                placeholder="e.g. JavaScript, React, basic SQL..." />
            </div>

            {/* Target interview date */}
            <div className={styles.configField}>
              <label className={styles.configLabel}>Target Interview Date (optional)</label>
              <input className={styles.configInput} type="date" value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} />
            </div>

            {/* Weak areas */}
            <div className={`${styles.configField} ${styles.configFieldFull}`}>
              <label className={styles.configLabel}>Weak Areas / Skill Gaps (optional)</label>
              <input className={styles.configInput} value={weakAreas}
                onChange={e => setWeakAreas(e.target.value)}
                placeholder="e.g. System Design, Dynamic Programming, SQL joins..." />
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'roadmap' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('roadmap')}>
            <Target size={14} /> Personalized Roadmap
          </button>
          <button className={`${styles.tab} ${activeTab === 'daily' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('daily')}>
            <Calendar size={14} /> Daily Study Plan
          </button>
          <button className={`${styles.tab} ${activeTab === 'saved' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('saved')}>
            <History size={14} /> Saved Plans
          </button>
        </div>

        {/* ══════════ ROADMAP TAB ══════════ */}
        {activeTab === 'roadmap' && (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
              <div>
                <div className={styles.tabTitle}><Target size={16} /> AI-Generated Personalized Roadmap</div>
                <div className={styles.tabDesc}>Based on your profile, skills, and gaps — not a generic template</div>
              </div>
              <div className={styles.tabActions}>
                {roadmap && (
                  <button
                    className={`${styles.saveBtn} ${roadmapSaved ? styles.saveBtnSaved : ''}`}
                    onClick={saveRoadmap}
                    disabled={roadmapSaving}
                  >
                    {roadmapSaving ? <><RefreshCw size={13} className={styles.spin} /> Saving...</>
                      : roadmapSaved ? <><CheckCircle size={13} /> Saved!</>
                      : <><Save size={13} /> Save Roadmap</>}
                  </button>
                )}
                <button className={styles.generateBtn} onClick={generateRoadmap} disabled={roadmapLoading || !role}>
                  {roadmapLoading
                    ? <><RefreshCw size={14} className={styles.spin} /> Generating...</>
                    : <><Sparkles size={14} /> Generate My Roadmap</>}
                </button>
              </div>
            </div>

            {!roadmap && !roadmapLoading && (
              <div className={styles.emptyState}>
                <Target size={40} className={styles.emptyIcon} />
                <h3>Get Your Personalized Roadmap</h3>
                <p>Fill in your profile above and click Generate. AI will create a custom learning path based on your specific skills, gaps, and timeline.</p>
                <div className={styles.emptyFeatures}>
                  <span><Zap size={12} /> Skill gap analysis</span>
                  <span><TrendingUp size={12} /> Phased learning plan</span>
                  <span><BookOpen size={12} /> Curated resources</span>
                  <span><CheckCircle size={12} /> Success milestones</span>
                </div>
              </div>
            )}

            {(roadmap || roadmapLoading) && (
              <div className={styles.contentCard}>
                <RenderContent text={roadmap} loading={roadmapLoading} />
              </div>
            )}
          </div>
        )}

        {/* ══════════ DAILY PLAN TAB ══════════ */}
        {activeTab === 'daily' && (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
              <div>
                <div className={styles.tabTitle}><Calendar size={16} /> Daily Study Plan Generator</div>
                <div className={styles.tabDesc}>Day-by-day schedule tailored to your timeline and availability</div>
              </div>
              <div className={styles.tabActions}>
                {dailyPlan && (
                  <button
                    className={`${styles.saveBtn} ${dailySaved ? styles.saveBtnSaved : ''}`}
                    onClick={saveDailyPlan}
                    disabled={dailySaving}
                  >
                    {dailySaving ? <><RefreshCw size={13} className={styles.spin} /> Saving...</>
                      : dailySaved ? <><CheckCircle size={13} /> Saved!</>
                      : <><Save size={13} /> Save Plan</>}
                  </button>
                )}
                <button className={styles.generateBtn} onClick={generateDailyPlan} disabled={dailyLoading || !role}>
                  {dailyLoading
                    ? <><RefreshCw size={14} className={styles.spin} /> Generating...</>
                    : <><Sparkles size={14} /> Generate Daily Plan</>}
                </button>
              </div>
            </div>

            {!dailyPlan && !dailyLoading && (
              <div className={styles.emptyState}>
                <Calendar size={40} className={styles.emptyIcon} />
                <h3>Get Your Day-by-Day Study Schedule</h3>
                <p>Set your interview date or duration above, then generate a detailed daily plan with specific tasks for each day.</p>
                <div className={styles.emptyFeatures}>
                  <span><Clock size={12} /> Day-by-day schedule</span>
                  <span><Target size={12} /> Weekly goals</span>
                  <span><Zap size={12} /> Specific daily tasks</span>
                  <span><TrendingUp size={12} /> Progress milestones</span>
                </div>
              </div>
            )}

            {(dailyPlan || dailyLoading) && (
              <div className={styles.contentCard}>
                <RenderContent text={dailyPlan} loading={dailyLoading} />
              </div>
            )}
          </div>
        )}

        {/* ══════════ SAVED PLANS TAB ══════════ */}
        {activeTab === 'saved' && (
          <div className={styles.tabContent}>
            {/* Viewing a saved plan */}
            {viewingPlan ? (
              <div>
                <div className={styles.tabHeader}>
                  <div>
                    <div className={styles.tabTitle}>{viewingPlan.title}</div>
                    <div className={styles.tabDesc}>{viewingPlan.summary} · {new Date(viewingPlan.createdAt).toLocaleDateString()}</div>
                  </div>
                  <button className={styles.backBtn} onClick={() => setViewingPlan(null)}>
                    ← Back to Saved Plans
                  </button>
                </div>
                <div className={styles.contentCard}>
                  <RenderContent text={viewingPlan.data?.content} loading={false} />
                </div>
              </div>
            ) : (
              <>
                <div className={styles.tabHeader}>
                  <div>
                    <div className={styles.tabTitle}><History size={16} /> Saved Plans</div>
                    <div className={styles.tabDesc}>Your previously generated roadmaps and daily plans</div>
                  </div>
                  <button className={styles.refreshSmallBtn} onClick={loadSavedPlans} disabled={savedLoading}>
                    <RefreshCw size={13} className={savedLoading ? styles.spin : ''} />
                  </button>
                </div>

                {savedLoading ? (
                  <div className={styles.savedLoading}>
                    <RefreshCw size={20} className={styles.spin} /> Loading saved plans...
                  </div>
                ) : savedPlans.length === 0 ? (
                  <div className={styles.emptyState}>
                    <History size={40} className={styles.emptyIcon} />
                    <h3>No saved plans yet</h3>
                    <p>Generate a roadmap or daily plan and click "Save" to access it here anytime.</p>
                  </div>
                ) : (
                  <div className={styles.savedList}>
                    {savedPlans.map(plan => (
                      <SavedPlanCard
                        key={plan._id}
                        plan={plan}
                        onView={viewPlan}
                        onDelete={deletePlan}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
