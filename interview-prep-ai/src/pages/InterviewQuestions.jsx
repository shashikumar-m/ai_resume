import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Layout from '../components/Layout'
import { groqChat } from '../services/groq'
import { useHistorySave } from '../hooks/useHistorySave'
import {
  MessageSquare, Sparkles, RefreshCw, ChevronDown, ChevronUp,
  Star, ThumbsUp, ThumbsDown, Copy, Check, BookOpen, Zap
} from 'lucide-react'
import styles from './InterviewQuestions.module.css'

// ── Constants ─────────────────────────────────────────────────────────────────
const ROLES = [
  'Software Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Analyst', 'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
  'Product Manager', 'UI/UX Designer', 'Marketing Manager', 'Business Analyst',
  'MERN Developer', 'Java Developer', 'Python Developer', 'React Developer',
  'Node.js Developer', 'Cloud Engineer', 'QA Engineer', 'Mobile Developer',
]

const EXPERIENCE_LEVELS = [
  { label: 'Fresher (0-1 yr)', value: 'fresher' },
  { label: 'Junior (1-3 yrs)', value: 'junior' },
  { label: 'Mid (3-5 yrs)', value: 'mid' },
  { label: 'Senior (5+ yrs)', value: 'senior' },
]

const QUESTION_TYPES = [
  { label: 'Technical', value: 'technical' },
  { label: 'Behavioral', value: 'behavioral' },
  { label: 'System Design', value: 'system_design' },
  { label: 'Mixed (All Types)', value: 'mixed' },
]

const QUESTION_COUNTS = [5, 10, 15, 20]

// ── Static fallback bank ──────────────────────────────────────────────────────
const STATIC_BANK = {
  'Software Developer': {
    technical: [
      { q: 'Explain the difference between REST and GraphQL.', a: 'REST uses fixed endpoints returning predefined data structures, while GraphQL uses a single endpoint where clients specify exactly what data they need. GraphQL reduces over-fetching and under-fetching.', difficulty: 'Medium', topic: 'API Design' },
      { q: 'What is the time complexity of quicksort?', a: 'Average O(n log n), worst case O(n²) when pivot is always the smallest/largest. Space complexity O(log n) for the call stack.', difficulty: 'Medium', topic: 'Algorithms' },
      { q: 'Explain SOLID principles.', a: 'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion — guiding maintainable, scalable OOP design.', difficulty: 'Medium', topic: 'OOP' },
      { q: 'What is a closure in JavaScript?', a: 'A function that retains access to its outer scope even after the outer function returns. Used for encapsulation and factory functions.', difficulty: 'Easy', topic: 'JavaScript' },
      { q: 'What is the difference between SQL and NoSQL databases?', a: 'SQL databases are relational, use structured schemas, and support ACID transactions. NoSQL databases are non-relational, schema-flexible, and optimized for scale and specific data models.', difficulty: 'Easy', topic: 'Databases' },
    ],
    behavioral: [
      { q: 'Tell me about a challenging bug you fixed.', a: 'Use STAR: Describe the bug context, your debugging approach, the root cause you found, and the fix you implemented with its impact.', difficulty: 'Easy', topic: 'Problem Solving' },
      { q: 'How do you handle tight deadlines?', a: 'STAR: Prioritize tasks by impact, communicate blockers early, break work into smaller deliverables, and focus on MVP first.', difficulty: 'Easy', topic: 'Time Management' },
    ],
    system_design: [
      { q: 'How would you design a URL shortener like bit.ly?', a: 'Components: API gateway, hash generation (MD5/base62), key-value store (Redis for cache, SQL for persistence), CDN for redirects. Handle collisions, expiry, analytics.', difficulty: 'Hard', topic: 'System Design' },
      { q: 'Design a notification system for 10M users.', a: 'Use message queues (Kafka), push notification services (FCM/APNs), fan-out on write for small followings, fan-out on read for celebrities. Rate limiting, retry logic, delivery receipts.', difficulty: 'Hard', topic: 'System Design' },
    ],
  },
  'Data Analyst': {
    technical: [
      { q: 'What is the difference between INNER JOIN and LEFT JOIN?', a: 'INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all left-table rows plus matching right-table rows (NULL for non-matches).', difficulty: 'Easy', topic: 'SQL' },
      { q: 'Explain data normalization.', a: '1NF eliminates duplicate columns, 2NF removes partial dependencies, 3NF removes transitive dependencies. Reduces redundancy and improves data integrity.', difficulty: 'Medium', topic: 'Database Design' },
      { q: 'How do you handle missing data in a dataset?', a: 'Options: deletion (if <5%), mean/median/mode imputation, forward-fill for time series, or model-based imputation. Choice depends on data type and missingness pattern (MCAR, MAR, MNAR).', difficulty: 'Medium', topic: 'Data Cleaning' },
      { q: 'What is the difference between correlation and causation?', a: 'Correlation means two variables move together. Causation means one variable directly causes the other. Correlation does not imply causation — confounding variables may explain the relationship.', difficulty: 'Easy', topic: 'Statistics' },
      { q: 'Explain the concept of A/B testing.', a: 'A/B testing is a controlled experiment comparing two variants (A and B) to determine which performs better on a metric. Requires random assignment, sufficient sample size, and statistical significance testing.', difficulty: 'Medium', topic: 'Statistics' },
    ],
    behavioral: [
      { q: 'Describe a time your analysis led to a business decision.', a: 'STAR: Describe the business problem, your analysis approach, the insight you found, and the decision/outcome it drove.', difficulty: 'Easy', topic: 'Communication' },
    ],
    system_design: [
      { q: 'How would you design a real-time analytics dashboard?', a: 'Stream processing (Kafka + Spark Streaming), time-series DB (InfluxDB/TimescaleDB), pre-aggregated metrics, WebSocket for real-time updates, caching layer for common queries.', difficulty: 'Hard', topic: 'System Design' },
    ],
  },
}

function getStaticQuestions(role, type, count) {
  const roleKey = Object.keys(STATIC_BANK).find(k => role?.includes(k.split(' ')[0])) || 'Software Developer'
  const bank = STATIC_BANK[roleKey]
  let questions = []
  if (type === 'mixed') {
    questions = [...(bank.technical || []), ...(bank.behavioral || []), ...(bank.system_design || [])]
  } else {
    questions = bank[type] || bank.technical || []
  }
  return questions.slice(0, count)
}

// ── Difficulty badge ──────────────────────────────────────────────────────────
function DiffBadge({ level }) {
  const colors = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' }
  return (
    <span className={styles.diffBadge} style={{ color: colors[level] || '#888', borderColor: `${colors[level]}44` || '#333' }}>
      {level}
    </span>
  )
}

// ── Single Question Card ──────────────────────────────────────────────────────
function QuestionCard({ item, index, role, expLevel, onAnswer }) {
  const [open, setOpen] = useState(false)
  const [answer, setAnswer] = useState('')
  const [aiFeedback, setAiFeedback] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [score, setScore] = useState(null)
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(null)

  const handleAIFeedback = async () => {
    if (!answer.trim()) return
    setAiLoading(true)
    setAiFeedback('')
    const prompt = `You are an expert ${role || 'software engineering'} interviewer. Evaluate this answer.

Question: ${item.q}
Topic: ${item.topic || 'General'}
Difficulty: ${item.difficulty || 'Medium'}
Experience Level Expected: ${expLevel || 'Mid'}
Candidate Answer: ${answer}

Respond in this EXACT format:
Score: X/10
Verdict: [Excellent/Good/Needs Improvement/Poor]
Strengths: [what was good in 1-2 sentences]
Improve: [what to fix in 1-2 sentences]
Tip: [one specific actionable tip]

Keep total under 150 words. Be direct and specific.`
    let feedbackText = ''
    try {
      await groqChat(prompt, (_, full) => { feedbackText = full; setAiFeedback(full) })
    } catch (e) {
      feedbackText = `Error: ${e.message}`
      setAiFeedback(feedbackText)
    }
    setAiLoading(false)
    // Parse score and notify parent
    const m = feedbackText.match(/Score:\s*(\d+)/i)
    const parsedScore = m ? parseInt(m[1]) : null
    if (parsedScore) setScore(parsedScore)
    if (onAnswer) onAnswer(index, answer, parsedScore, feedbackText)
  }

  const copyQuestion = () => {
    navigator.clipboard.writeText(item.q)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scoreColor = score >= 8 ? '#22c55e' : score >= 6 ? '#f59e0b' : score >= 4 ? '#f97316' : '#ef4444'

  return (
    <div className={`${styles.qCard} ${open ? styles.qCardOpen : ''}`}>
      {/* Header row */}
      <div className={styles.qHeader} onClick={() => setOpen(o => !o)}>
        <div className={styles.qLeft}>
          <span className={styles.qIndex}>Q{index + 1}</span>
          <div className={styles.qMeta}>
            <span className={styles.qTopic}>{item.topic}</span>
            <DiffBadge level={item.difficulty} />
          </div>
        </div>
        <div className={styles.qTitle}>{item.q}</div>
        <div className={styles.qActions} onClick={e => e.stopPropagation()}>
          <button className={styles.iconBtn} onClick={copyQuestion} title="Copy question">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button className={`${styles.iconBtn} ${liked === true ? styles.liked : ''}`} onClick={() => setLiked(true)}>
            <ThumbsUp size={14} />
          </button>
          <button className={`${styles.iconBtn} ${liked === false ? styles.disliked : ''}`} onClick={() => setLiked(false)}>
            <ThumbsDown size={14} />
          </button>
          <button className={styles.expandBtn}>
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div className={styles.qBody}>
          {/* Model Answer */}
          <div className={styles.modelAnswerBox}>
            <div className={styles.modelAnswerLabel}>
              <BookOpen size={13} /> Model Answer
            </div>
            <p className={styles.modelAnswerText}>{item.a}</p>
          </div>

          {/* Practice area */}
          <div className={styles.practiceBox}>
            <div className={styles.practiceLabel}>
              <Zap size={13} /> Your Answer
              <span className={styles.practiceHint}>Get AI feedback powered by Groq</span>
            </div>
            <textarea
              className={styles.answerTextarea}
              rows={5}
              placeholder="Type your answer here to get AI-powered feedback..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
            />
            <div className={styles.practiceFooter}>
              {score !== null && (
                <div className={styles.scoreChip} style={{ color: scoreColor, borderColor: `${scoreColor}44` }}>
                  {score}/10
                </div>
              )}
              <button
                className={styles.aiFeedbackBtn}
                onClick={handleAIFeedback}
                disabled={aiLoading || !answer.trim()}
              >
                {aiLoading
                  ? <><RefreshCw size={13} className={styles.spin} /> Analyzing...</>
                  : <><Sparkles size={13} /> Get AI Feedback</>}
              </button>
            </div>

            {/* AI Feedback output */}
            {(aiFeedback || aiLoading) && (
              <div className={styles.aiFeedbackBox}>
                {aiLoading && !aiFeedback && (
                  <div className={styles.aiThinking}>
                    <RefreshCw size={14} className={styles.spin} />
                    <span>Groq AI is evaluating your answer...</span>
                  </div>
                )}
                {aiFeedback && (
                  <pre className={styles.aiFeedbackText}>{aiFeedback}</pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InterviewQuestions() {
  const { profile } = useApp()
  const { save } = useHistorySave()

  const [role, setRole] = useState(profile?.role || '')
  const [expLevel, setExpLevel] = useState('junior')
  const [qType, setQType] = useState('mixed')
  const [qCount, setQCount] = useState(5)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [useAI, setUseAI] = useState(false)
  const [sessionAnswers, setSessionAnswers] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [overallFeedback, setOverallFeedback] = useState('')
  const [overallLoading, setOverallLoading] = useState(false)

  const recordAnswer = (idx, answer, score, feedback) => {
    setSessionAnswers(prev => ({ ...prev, [idx]: { question: questions[idx]?.q || '', answer, score, feedback } }))
  }

  const handleGetOverallFeedback = async () => {
    const answers = Object.values(sessionAnswers)
    if (answers.length === 0) return
    setOverallLoading(true)
    setOverallFeedback('')
    const avgScore = answers.filter(a => a.score).length > 0
      ? Math.round(answers.filter(a => a.score).reduce((s, a) => s + a.score, 0) / answers.filter(a => a.score).length)
      : null

    const prompt = `You are an expert interview coach. Analyze this Q&A practice session and provide comprehensive feedback.

Role: ${role}
Experience Level: ${expLabel}
Question Type: ${typeLabel}
Average Score: ${avgScore ? `${avgScore}/10` : 'Not scored yet'}

Answered Questions:
${answers.map((a, i) => `Q${i+1}: ${a.question}\nAnswer: ${a.answer}\nScore: ${a.score ? `${a.score}/10` : 'Not scored'}\nFeedback: ${a.feedback || 'No feedback yet'}`).join('\n\n')}

Provide a structured feedback report:

## 📊 Session Summary
[Overall assessment of the practice session in 2-3 sentences]

## ✅ What You Did Well
[3-4 specific strengths from the answers given]

## ⚠️ Key Areas to Improve
[3-4 specific weaknesses with actionable advice]

## 💡 Answer Quality Analysis
[Comment on answer structure, depth, use of examples, STAR method usage]

## 🎯 Topics to Study More
[Based on weak answers, list 3-5 specific topics to review]

## 🚀 Next Steps
[3 concrete actions to improve before the actual interview]

Be specific and reference actual answers. Keep it constructive and encouraging.`

    try {
      await groqChat(prompt, (_, full) => setOverallFeedback(full))
    } catch (e) {
      setOverallFeedback(`Error: ${e.message}`)
    }
    setOverallLoading(false)
  }

  const handleSaveSession = async () => {
    setSaving(true)
    const answers = Object.values(sessionAnswers)
    const avgScore = answers.length > 0
      ? Math.round(answers.filter(a => a.score).reduce((s, a) => s + (a.score || 0), 0) / answers.filter(a => a.score).length)
      : null
    await save(
      'questions',
      `${role} — ${typeLabel} Q&A Session`,
      `${questions.length} questions · ${answers.length} answered${avgScore ? ` · Avg ${avgScore}/10` : ''}`,
      avgScore,
      { role, expLevel: expLabel, qType, questions, answers }
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const expLabel = EXPERIENCE_LEVELS.find(e => e.value === expLevel)?.label || 'Junior'
  const typeLabel = QUESTION_TYPES.find(t => t.value === qType)?.label || 'Mixed'

  const parseAIQuestions = (raw) => {
    const questions = []
    // Match patterns like "1." or "Q1:" or "**1.**"
    const blocks = raw.split(/\n(?=\*?\*?(?:Q?\d+[\.\):]|\d+\.))/i).filter(Boolean)
    for (const block of blocks) {
      const lines = block.split('\n').filter(l => l.trim())
      if (lines.length < 2) continue
      const qLine = lines[0].replace(/^\*?\*?(?:Q?\d+[\.\):]|\d+\.)\s*\*?\*?/, '').trim()
      const rest = lines.slice(1).join('\n')
      const aMatch = rest.match(/(?:Answer|A|Model Answer)[:\s]+(.+)/is)
      const topicMatch = rest.match(/(?:Topic|Category)[:\s]+(.+)/i)
      const diffMatch = rest.match(/(?:Difficulty)[:\s]+(Easy|Medium|Hard)/i)
      if (qLine.length > 10) {
        questions.push({
          q: qLine,
          a: aMatch?.[1]?.trim() || 'See model answer above.',
          topic: topicMatch?.[1]?.trim() || typeLabel,
          difficulty: diffMatch?.[1] || (qType === 'system_design' ? 'Hard' : 'Medium'),
        })
      }
    }
    return questions.length >= 2 ? questions : null
  }

  const handleGenerate = async () => {
    if (!role) return alert('Please select a Target Role first.')
    setLoading(true)
    setGenerated(false)
    setQuestions([])

    const typeDesc = qType === 'mixed'
      ? 'a mix of technical, behavioral, and situational'
      : qType === 'system_design'
        ? 'system design'
        : qType

    const prompt = `You are an expert technical interviewer. Generate exactly ${qCount} ${typeDesc} interview questions for a ${role} position at ${expLabel} experience level.

For each question, use this EXACT format:
1. [Question text]
Answer: [Comprehensive model answer in 2-4 sentences]
Topic: [Topic/Category name]
Difficulty: [Easy/Medium/Hard]

2. [Question text]
Answer: [Comprehensive model answer]
Topic: [Topic/Category name]
Difficulty: [Easy/Medium/Hard]

Continue for all ${qCount} questions. Make questions specific to ${role} at ${expLabel} level. No extra text outside this format.`

    try {
      let raw = ''
      await groqChat(prompt, (_, full) => { raw = full })
      const parsed = parseAIQuestions(raw)
      if (parsed && parsed.length >= 2) {
        setQuestions(parsed.slice(0, qCount))
        setUseAI(true)
      } else {
        // Fallback to static
        setQuestions(getStaticQuestions(role, qType, qCount))
        setUseAI(false)
      }
    } catch (e) {
      setQuestions(getStaticQuestions(role, qType, qCount))
      setUseAI(false)
    }
    setLoading(false)
    setGenerated(true)
    // Auto-save session to history
    save('questions',
      `${role} — ${typeLabel} Questions`,
      `${qCount} ${typeLabel} questions · ${expLabel}`,
      null,
      { role, expLevel: expLabel, qType, qCount, questions: displayQuestions, answers: [] }
    )
  }

  return (
    <Layout>
      <div className={styles.page}>
        {/* ── Page Header ── */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderIcon}>
            <MessageSquare size={22} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Interview Q&A Generator</h1>
            <p className={styles.pageSub}>Generate role-specific questions, attempt answers, and get AI feedback</p>
          </div>
        </div>

        {/* ── Generator Card ── */}
        <div className={styles.generatorCard}>
          {/* Row 1: Role + Count */}
          <div className={styles.genRow}>
            <div className={styles.genField}>
              <label className={styles.genLabel}>Target Role <span className={styles.required}>*</span></label>
              <div className={styles.selectWrap}>
                <select
                  className={styles.genSelect}
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="">Select role...</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown size={14} className={styles.selectArrow} />
              </div>
            </div>
            <div className={styles.genField}>
              <label className={styles.genLabel}>Number of Questions</label>
              <div className={styles.selectWrap}>
                <select
                  className={styles.genSelect}
                  value={qCount}
                  onChange={e => setQCount(Number(e.target.value))}
                >
                  {QUESTION_COUNTS.map(n => <option key={n} value={n}>{n} questions</option>)}
                </select>
                <ChevronDown size={14} className={styles.selectArrow} />
              </div>
            </div>
          </div>

          {/* Row 2: Experience + Type */}
          <div className={styles.genRow}>
            <div className={styles.genField}>
              <label className={styles.genLabel}>Experience Level</label>
              <div className={styles.chipGroup}>
                {EXPERIENCE_LEVELS.map(({ label, value }) => (
                  <button
                    key={value}
                    className={`${styles.chip} ${expLevel === value ? styles.chipActive : ''}`}
                    onClick={() => setExpLevel(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.genField}>
              <label className={styles.genLabel}>Question Type</label>
              <div className={styles.chipGroup}>
                {QUESTION_TYPES.map(({ label, value }) => (
                  <button
                    key={value}
                    className={`${styles.chip} ${qType === value ? styles.chipActive : ''}`}
                    onClick={() => setQType(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={loading || !role}
          >
            {loading
              ? <><RefreshCw size={16} className={styles.spin} /> Generating Questions...</>
              : <><Sparkles size={16} /> Generate Questions</>}
          </button>
        </div>

        {/* ── Results ── */}
        {generated && questions.length > 0 && (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <div className={styles.resultsInfo}>
                <span className={styles.resultsCount}>{questions.length} questions</span>
                <span className={styles.resultsMeta}>
                  {role} · {expLabel} · {typeLabel}
                </span>
                {useAI && (
                  <span className={styles.aiTag}>
                    <Sparkles size={11} /> AI Generated
                  </span>
                )}
              </div>
              <button className={styles.regenerateBtn} onClick={handleGenerate} disabled={loading}>
                <RefreshCw size={13} /> Regenerate
              </button>
              <button
                className={`${styles.saveSessionBtn} ${saved ? styles.saveSessionBtnSaved : ''}`}
                onClick={handleSaveSession}
                disabled={saving || Object.keys(sessionAnswers).length === 0}
                title={Object.keys(sessionAnswers).length === 0 ? 'Answer at least one question first' : 'Save session to History'}
              >
                {saving ? <><RefreshCw size={13} className={styles.spin} /> Saving...</>
                  : saved ? <>✓ Saved!</>
                  : <><Sparkles size={13} /> Save Session</>}
              </button>
            </div>

            {Object.keys(sessionAnswers).length > 0 && (
              <div className={styles.sessionProgress}>
                <span>{Object.keys(sessionAnswers).length}/{questions.length} answered</span>
                {Object.values(sessionAnswers).filter(a => a.score).length > 0 && (
                  <span>· Avg score: {Math.round(Object.values(sessionAnswers).filter(a => a.score).reduce((s, a) => s + a.score, 0) / Object.values(sessionAnswers).filter(a => a.score).length)}/10</span>
                )}
              </div>
            )}

            <div className={styles.questionsList}>
              {questions.map((item, i) => (
                <QuestionCard
                  key={`${i}-${item.q.slice(0, 20)}`}
                  item={item}
                  index={i}
                  role={role}
                  expLevel={expLabel}
                  onAnswer={recordAnswer}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Overall AI Feedback ── */}
        {generated && Object.keys(sessionAnswers).length > 0 && (
          <div className={styles.overallFeedbackSection}>
            <div className={styles.overallFeedbackHeader}>
              <div>
                <div className={styles.overallFeedbackTitle}>
                  <Sparkles size={16} /> Overall Session Feedback
                </div>
                <div className={styles.overallFeedbackSub}>
                  Get AI analysis of your entire practice session
                </div>
              </div>
              <button
                className={styles.overallFeedbackBtn}
                onClick={handleGetOverallFeedback}
                disabled={overallLoading}
              >
                {overallLoading
                  ? <><RefreshCw size={13} className={styles.spin} /> Analyzing...</>
                  : <><Sparkles size={13} /> Get Overall Feedback</>}
              </button>
            </div>

            {overallLoading && !overallFeedback && (
              <div className={styles.overallFeedbackLoading}>
                <RefreshCw size={16} className={styles.spin} />
                <span>Groq AI is analyzing your session performance...</span>
              </div>
            )}

            {overallFeedback && (
              <div className={styles.overallFeedbackContent}>
                {overallFeedback.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) return <h3 key={i} className={styles.fbH3}>{line.slice(3)}</h3>
                  if (line.startsWith('- ') || line.startsWith('• ')) return <li key={i} className={styles.fbLi}>{line.slice(2)}</li>
                  if (line.trim() === '') return <div key={i} style={{ height: 6 }} />
                  return <p key={i} className={styles.fbP}>{line}</p>
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Empty state ── */}
        {!generated && (          <div className={styles.emptyState}>
            <MessageSquare size={40} className={styles.emptyIcon} />
            <h3>Ready to practice?</h3>
            <p>Select your target role, experience level, and question type above, then click Generate Questions to get started.</p>
            <div className={styles.emptyTips}>
              <div className={styles.emptyTip}><Star size={13} /> Questions sourced from tech-interview-handbook patterns</div>
              <div className={styles.emptyTip}><Sparkles size={13} /> AI generates fresh questions every time via Groq</div>
              <div className={styles.emptyTip}><Zap size={13} /> Get scored feedback on your answers instantly</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
