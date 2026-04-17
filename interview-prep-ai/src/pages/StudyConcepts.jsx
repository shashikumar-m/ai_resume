import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout'
import { groqChat } from '../services/groq'
import {
  BookOpen, Sparkles, RefreshCw, ChevronRight,
  Copy, Check, RotateCcw, MessageSquare, Send,
  ExternalLink, Link2
} from 'lucide-react'
import styles from './StudyConcepts.module.css'

// ── Curated source links per topic ───────────────────────────────────────────
const SOURCE_LINKS = {
  // Frontend
  'HTML/CSS': [
    { title: 'MDN: HTML Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', tag: 'Docs' },
    { title: 'MDN: CSS Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', tag: 'Docs' },
    { title: 'CSS Tricks', url: 'https://css-tricks.com', tag: 'Guide' },
    { title: 'Tech Interview Handbook: Front End', url: 'https://www.techinterviewhandbook.org/front-end-interview-guidebook/', tag: 'Interview' },
  ],
  'JavaScript': [
    { title: 'MDN: JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', tag: 'Docs' },
    { title: 'javascript.info', url: 'https://javascript.info', tag: 'Guide' },
    { title: 'You Don\'t Know JS', url: 'https://github.com/getify/You-Dont-Know-JS', tag: 'Book' },
    { title: 'Tech Interview Handbook: JS', url: 'https://www.techinterviewhandbook.org/front-end-interview-guidebook/javascript', tag: 'Interview' },
  ],
  'React': [
    { title: 'React Official Docs', url: 'https://react.dev', tag: 'Docs' },
    { title: 'React Patterns', url: 'https://reactpatterns.com', tag: 'Guide' },
    { title: 'Tech Interview Handbook: React', url: 'https://www.techinterviewhandbook.org/front-end-interview-guidebook/react', tag: 'Interview' },
  ],
  'TypeScript': [
    { title: 'TypeScript Official Docs', url: 'https://www.typescriptlang.org/docs/', tag: 'Docs' },
    { title: 'TypeScript Deep Dive', url: 'https://basarat.gitbook.io/typescript/', tag: 'Book' },
    { title: 'Total TypeScript', url: 'https://www.totaltypescript.com', tag: 'Guide' },
  ],
  'Performance': [
    { title: 'web.dev Performance', url: 'https://web.dev/performance/', tag: 'Guide' },
    { title: 'MDN: Performance', url: 'https://developer.mozilla.org/en-US/docs/Web/Performance', tag: 'Docs' },
    { title: 'Chrome DevTools', url: 'https://developer.chrome.com/docs/devtools/', tag: 'Tool' },
  ],
  'Accessibility': [
    { title: 'MDN: Accessibility', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility', tag: 'Docs' },
    { title: 'WCAG Guidelines', url: 'https://www.w3.org/WAI/WCAG21/quickref/', tag: 'Standard' },
    { title: 'a11y Project', url: 'https://www.a11yproject.com', tag: 'Guide' },
  ],
  'Web APIs': [
    { title: 'MDN: Web APIs', url: 'https://developer.mozilla.org/en-US/docs/Web/API', tag: 'Docs' },
    { title: 'Tech Interview Handbook: Browser', url: 'https://www.techinterviewhandbook.org/front-end-interview-guidebook/browser', tag: 'Interview' },
  ],
  'Testing': [
    { title: 'Jest Docs', url: 'https://jestjs.io/docs/getting-started', tag: 'Docs' },
    { title: 'Testing Library', url: 'https://testing-library.com/docs/', tag: 'Docs' },
    { title: 'Tech Interview Handbook: Testing', url: 'https://www.techinterviewhandbook.org/front-end-interview-guidebook/testing', tag: 'Interview' },
  ],
  // Backend / System Design
  'System Design': [
    { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', tag: 'Guide' },
    { title: 'Tech Interview Handbook: System Design', url: 'https://www.techinterviewhandbook.org/system-design/', tag: 'Interview' },
    { title: 'ByteByteGo Newsletter', url: 'https://blog.bytebytego.com', tag: 'Blog' },
    { title: 'High Scalability', url: 'http://highscalability.com', tag: 'Blog' },
  ],
  'Databases': [
    { title: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs/', tag: 'Docs' },
    { title: 'MongoDB Docs', url: 'https://www.mongodb.com/docs/', tag: 'Docs' },
    { title: 'Use The Index, Luke', url: 'https://use-the-index-luke.com', tag: 'Guide' },
    { title: 'DB Engines Ranking', url: 'https://db-engines.com/en/ranking', tag: 'Reference' },
  ],
  'REST APIs': [
    { title: 'REST API Tutorial', url: 'https://restfulapi.net', tag: 'Guide' },
    { title: 'HTTP Status Codes', url: 'https://httpstatuses.io', tag: 'Reference' },
    { title: 'OpenAPI Specification', url: 'https://swagger.io/specification/', tag: 'Standard' },
  ],
  'Authentication': [
    { title: 'JWT.io', url: 'https://jwt.io/introduction', tag: 'Guide' },
    { title: 'OAuth 2.0 Simplified', url: 'https://www.oauth.com', tag: 'Guide' },
    { title: 'OWASP Auth Cheatsheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html', tag: 'Security' },
  ],
  'Caching': [
    { title: 'Redis Docs', url: 'https://redis.io/docs/', tag: 'Docs' },
    { title: 'Caching Strategies', url: 'https://codeahoy.com/2017/08/11/caching-strategies-and-how-to-choose-the-right-one/', tag: 'Guide' },
  ],
  'Microservices': [
    { title: 'Martin Fowler: Microservices', url: 'https://martinfowler.com/articles/microservices.html', tag: 'Article' },
    { title: 'Microservices.io Patterns', url: 'https://microservices.io/patterns/', tag: 'Patterns' },
  ],
  'Security': [
    { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/', tag: 'Security' },
    { title: 'PortSwigger Web Security', url: 'https://portswigger.net/web-security', tag: 'Learning' },
  ],
  // Data
  'SQL': [
    { title: 'SQLZoo', url: 'https://sqlzoo.net', tag: 'Practice' },
    { title: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/', tag: 'Guide' },
    { title: 'LeetCode SQL', url: 'https://leetcode.com/problemset/database/', tag: 'Practice' },
    { title: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs/current/sql.html', tag: 'Docs' },
  ],
  'Statistics': [
    { title: 'Khan Academy Statistics', url: 'https://www.khanacademy.org/math/statistics-probability', tag: 'Learning' },
    { title: 'StatQuest YouTube', url: 'https://www.youtube.com/@statquest', tag: 'Video' },
    { title: 'Think Stats (Free Book)', url: 'https://greenteapress.com/thinkstats2/', tag: 'Book' },
  ],
  'Machine Learning': [
    { title: 'Scikit-learn Docs', url: 'https://scikit-learn.org/stable/user_guide.html', tag: 'Docs' },
    { title: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', tag: 'Course' },
    { title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', tag: 'Practice' },
    { title: 'Papers With Code', url: 'https://paperswithcode.com', tag: 'Research' },
  ],
  'Deep Learning': [
    { title: 'fast.ai', url: 'https://www.fast.ai', tag: 'Course' },
    { title: 'Deep Learning Book', url: 'https://www.deeplearningbook.org', tag: 'Book' },
    { title: 'PyTorch Docs', url: 'https://pytorch.org/docs/stable/', tag: 'Docs' },
    { title: 'TensorFlow Docs', url: 'https://www.tensorflow.org/learn', tag: 'Docs' },
  ],
  'Python': [
    { title: 'Python Official Docs', url: 'https://docs.python.org/3/', tag: 'Docs' },
    { title: 'Real Python', url: 'https://realpython.com', tag: 'Guide' },
    { title: 'Python Cheatsheet', url: 'https://www.pythoncheatsheet.org', tag: 'Reference' },
  ],
  'Data Visualization': [
    { title: 'Matplotlib Docs', url: 'https://matplotlib.org/stable/tutorials/', tag: 'Docs' },
    { title: 'Seaborn Docs', url: 'https://seaborn.pydata.org/tutorial.html', tag: 'Docs' },
    { title: 'Tableau Public', url: 'https://public.tableau.com/en-us/s/resources', tag: 'Tool' },
    { title: 'Data Viz Catalogue', url: 'https://datavizcatalogue.com', tag: 'Reference' },
  ],
  // DevOps
  'Docker': [
    { title: 'Docker Official Docs', url: 'https://docs.docker.com/get-started/', tag: 'Docs' },
    { title: 'Play with Docker', url: 'https://labs.play-with-docker.com', tag: 'Practice' },
  ],
  'Kubernetes': [
    { title: 'Kubernetes Docs', url: 'https://kubernetes.io/docs/home/', tag: 'Docs' },
    { title: 'Kubernetes by Example', url: 'https://kubernetesbyexample.com', tag: 'Guide' },
    { title: 'Play with K8s', url: 'https://labs.play-with-k8s.com', tag: 'Practice' },
  ],
  'CI/CD': [
    { title: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions', tag: 'Docs' },
    { title: 'GitLab CI/CD', url: 'https://docs.gitlab.com/ee/ci/', tag: 'Docs' },
    { title: 'Jenkins Docs', url: 'https://www.jenkins.io/doc/', tag: 'Docs' },
  ],
  // Algorithms
  'Data Structures': [
    { title: 'Tech Interview Handbook: DSA', url: 'https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/', tag: 'Interview' },
    { title: 'Visualgo', url: 'https://visualgo.net', tag: 'Visual' },
    { title: 'LeetCode', url: 'https://leetcode.com/explore/', tag: 'Practice' },
    { title: 'NeetCode', url: 'https://neetcode.io', tag: 'Practice' },
  ],
  'Algorithms': [
    { title: 'Tech Interview Handbook: Algorithms', url: 'https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/', tag: 'Interview' },
    { title: 'Grind 75', url: 'https://www.techinterviewhandbook.org/grind75', tag: 'Practice' },
    { title: 'LeetCode Patterns', url: 'https://seanprashad.com/leetcode-patterns/', tag: 'Guide' },
    { title: 'Big-O Cheatsheet', url: 'https://www.bigocheatsheet.com', tag: 'Reference' },
  ],
  'Behavioral': [
    { title: 'Tech Interview Handbook: Behavioral', url: 'https://www.techinterviewhandbook.org/behavioral-interview/', tag: 'Interview' },
    { title: 'STAR Method Guide', url: 'https://www.techinterviewhandbook.org/behavioral-interview-questions/', tag: 'Guide' },
  ],
}

// Fallback sources for topics not in the map
const FALLBACK_SOURCES = (topic, domain) => [
  { title: `Tech Interview Handbook`, url: 'https://www.techinterviewhandbook.org', tag: 'Interview' },
  { title: `MDN Web Docs`, url: 'https://developer.mozilla.org', tag: 'Docs' },
  { title: `Search "${topic}" on Google`, url: `https://www.google.com/search?q=${encodeURIComponent(topic + ' ' + domain + ' interview')}`, tag: 'Search' },
]

function getSourceLinks(topic, domain) {
  return SOURCE_LINKS[topic] || FALLBACK_SOURCES(topic, domain)
}

const TAG_COLORS = {
  Docs: '#6c63ff', Guide: '#22c55e', Interview: '#f59e0b',
  Practice: '#06b6d4', Book: '#a855f7', Course: '#ec4899',
  Security: '#ef4444', Reference: '#64748b', Search: '#888',
  Blog: '#f97316', Video: '#ef4444', Tool: '#0ea5e9',
  Standard: '#8b5cf6', Article: '#10b981', Patterns: '#f59e0b',
  Learning: '#22c55e', Research: '#6366f1', Visual: '#06b6d4',
}

// ── Domain → Topics map (inspired by tech-interview-handbook) ─────────────────
const DOMAINS = {
  'Frontend Developer': {
    icon: '🎨',
    topics: ['HTML/CSS', 'JavaScript', 'React', 'TypeScript', 'Performance', 'Accessibility', 'Web APIs', 'Testing'],
  },
  'Backend Developer': {
    icon: '⚙️',
    topics: ['System Design', 'Databases', 'REST APIs', 'Authentication', 'Caching', 'Message Queues', 'Microservices', 'Security'],
  },
  'Full Stack Developer': {
    icon: '🔧',
    topics: ['JavaScript', 'React', 'Node.js', 'Databases', 'REST APIs', 'System Design', 'DevOps Basics', 'Testing'],
  },
  'Data Scientist': {
    icon: '🔬',
    topics: ['Statistics', 'Machine Learning', 'Deep Learning', 'Feature Engineering', 'Model Evaluation', 'NLP', 'Data Visualization', 'Python'],
  },
  'Data Analyst': {
    icon: '📊',
    topics: ['SQL', 'Statistics', 'Python/Pandas', 'Data Visualization', 'Excel', 'Business Intelligence', 'A/B Testing', 'ETL'],
  },
  'ML Engineer': {
    icon: '🤖',
    topics: ['Machine Learning', 'Deep Learning', 'MLOps', 'Model Deployment', 'Feature Stores', 'Data Pipelines', 'Python', 'Cloud ML'],
  },
  'DevOps Engineer': {
    icon: '🚀',
    topics: ['CI/CD', 'Docker', 'Kubernetes', 'Cloud (AWS/GCP)', 'Infrastructure as Code', 'Monitoring', 'Linux', 'Networking'],
  },
  'Product Manager': {
    icon: '📋',
    topics: ['Product Strategy', 'User Research', 'Roadmapping', 'Metrics & KPIs', 'Agile/Scrum', 'Stakeholder Management', 'Prioritization', 'Go-to-Market'],
  },
  'Software Engineer': {
    icon: '💻',
    topics: ['Data Structures', 'Algorithms', 'System Design', 'OOP', 'Databases', 'Networking', 'OS Concepts', 'Behavioral'],
  },
}

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

// ── AI Chat Message ───────────────────────────────────────────────────────────
function ChatMessage({ role, text, isTyping }) {
  const isAI = role === 'ai'
  return (
    <div className={`${styles.chatMsg} ${isAI ? styles.chatMsgAI : styles.chatMsgUser}`}>
      <div className={styles.chatAvatar}>{isAI ? '🤖' : '👤'}</div>
      <div className={styles.chatBubble}>
        {isTyping
          ? <div className={styles.typingDots}><span /><span /><span /></div>
          : <p className={styles.chatText}>{text}</p>
        }
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudyConcepts() {
  const [domain, setDomain] = useState('Frontend Developer')
  const [level, setLevel] = useState('Intermediate')
  const [activeTopic, setActiveTopic] = useState(null)
  const [content, setContent] = useState('')
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(false)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // AI Chat
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const topics = DOMAINS[domain]?.topics || []

  // ── Load topic content ──
  const loadTopic = async (topic) => {
    setActiveTopic(topic)
    setContent('')
    setSources(getSourceLinks(topic, domain))
    setChatOpen(false)
    setChatMessages([])
    setLoading(true)

    const prompt = `You are an expert technical educator. Create a comprehensive ${level} level study guide for "${topic}" for a ${domain} interview.

Structure your response with these sections:
## Overview
[2-3 sentence summary of what this topic is and why it matters]

## Key Concepts
[5-8 bullet points of the most important concepts to know]

## Common Interview Questions
[3-5 typical interview questions with brief answers]

## Code Example (if applicable)
[A practical code snippet demonstrating a key concept]

## Quick Tips
[3-4 actionable tips for the interview]

Keep it concise, practical, and interview-focused. Use markdown formatting.`

    try {
      await groqChat(prompt, (_, full) => setContent(full))
    } catch (e) {
      setContent(`Error loading content: ${e.message}`)
    }
    setLoading(false)
  }

  // ── Load full domain overview ──
  const loadOverview = async () => {
    setActiveTopic(null)
    setContent('')
    setSources([{ title: 'Tech Interview Handbook', url: 'https://www.techinterviewhandbook.org', tag: 'Interview' }, { title: 'Grind 75', url: 'https://www.techinterviewhandbook.org/grind75', tag: 'Practice' }])
    setChatOpen(false)
    setChatMessages([])
    setOverviewLoading(true)

    const prompt = `You are an expert technical educator. Create a ${level} level study overview for a ${domain} interview preparation.

Cover these topics: ${topics.join(', ')}.

For each topic provide:
## ${domain} Interview Study Guide (${level})

### [Topic Name]
- What to know: [2-3 key points]
- Key interview focus: [what interviewers look for]

Keep each section brief and actionable. Total response should be comprehensive but scannable.`

    try {
      await groqChat(prompt, (_, full) => setContent(full))
    } catch (e) {
      setContent(`Error: ${e.message}`)
    }
    setOverviewLoading(false)
  }

  // ── AI Chat ──
  const sendChat = async () => {
    const msg = chatInput.trim()
    if (!msg || chatLoading) return
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', text: msg }])
    setChatLoading(true)

    const context = activeTopic
      ? `The user is studying "${activeTopic}" for a ${domain} interview at ${level} level.`
      : `The user is studying ${domain} interview preparation at ${level} level.`

    const prompt = `${context}

User question: ${msg}

Answer as a helpful technical mentor. Be concise, clear, and give practical examples where relevant. Keep response under 200 words.`

    let reply = ''
    try {
      await groqChat(prompt, (_, full) => { reply = full })
    } catch (e) {
      reply = `Error: ${e.message}`
    }
    setChatMessages(prev => [...prev, { role: 'ai', text: reply }])
    setChatLoading(false)
  }

  const copyContent = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Render markdown-ish content ──
  const renderContent = (text) => {
    if (!text) return null
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className={styles.mdH2}>{line.slice(3)}</h2>
      if (line.startsWith('### ')) return <h3 key={i} className={styles.mdH3}>{line.slice(4)}</h3>
      if (line.startsWith('- ') || line.startsWith('• ')) return <li key={i} className={styles.mdLi}>{line.slice(2)}</li>
      if (line.startsWith('```')) return <div key={i} className={styles.mdCodeFence} />
      if (line.trim() === '') return <div key={i} className={styles.mdSpacer} />
      return <p key={i} className={styles.mdP}>{line}</p>
    })
  }

  return (
    <Layout>
      <div className={styles.page}>
        {/* ── Page Header ── */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderIcon}><BookOpen size={22} /></div>
          <div>
            <h1 className={styles.pageTitle}>Study Concepts</h1>
            <p className={styles.pageSub}>Role-specific study material organized by topic with progressive learning paths</p>
          </div>
        </div>

        <div className={styles.layout}>
          {/* ── LEFT SIDEBAR ── */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarLabel}>SELECT DOMAIN</div>
              <div className={styles.domainList}>
                {Object.keys(DOMAINS).map(d => (
                  <button
                    key={d}
                    className={`${styles.domainItem} ${domain === d ? styles.domainActive : ''}`}
                    onClick={() => { setDomain(d); setActiveTopic(null); setContent(''); setSources([]) }}
                  >
                    <span className={styles.domainIcon}>{DOMAINS[d].icon}</span>
                    <span>{d}</span>
                    {domain === d && <ChevronRight size={14} className={styles.domainArrow} />}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.sidebarLabel}>LEVEL</div>
              <div className={styles.levelChips}>
                {LEVELS.map(l => (
                  <button
                    key={l}
                    className={`${styles.levelChip} ${level === l ? styles.levelChipActive : ''}`}
                    onClick={() => setLevel(l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              className={styles.overviewBtn}
              onClick={loadOverview}
              disabled={overviewLoading}
            >
              {overviewLoading
                ? <><RefreshCw size={14} className={styles.spin} /> Loading...</>
                : <><Sparkles size={14} /> Load Study Overview</>}
            </button>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className={styles.rightPanel}>
            {/* Topics grid */}
            <div className={styles.topicsSection}>
              <div className={styles.topicsHeader}>
                Topics for <span className={styles.topicsDomain}>{domain}</span>
              </div>
              <div className={styles.topicsGrid}>
                {topics.map(topic => (
                  <button
                    key={topic}
                    className={`${styles.topicChip} ${activeTopic === topic ? styles.topicChipActive : ''}`}
                    onClick={() => loadTopic(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Content area */}
            <div className={styles.contentArea}>
              {(loading || overviewLoading) && !content && (
                <div className={styles.loadingState}>
                  <RefreshCw size={24} className={styles.spin} />
                  <p>Groq AI is generating your study material...</p>
                </div>
              )}

              {!content && !loading && !overviewLoading && (
                <div className={styles.emptyState}>
                  <BookOpen size={36} className={styles.emptyIcon} />
                  <p>Click a topic to load study material, or load the full overview</p>
                </div>
              )}

              {content && (
                <div className={styles.contentCard}>
                  <div className={styles.contentHeader}>
                    <div className={styles.contentTitle}>
                      {activeTopic
                        ? <><span className={styles.contentTopic}>{activeTopic}</span> · {domain} · {level}</>
                        : <>{domain} · Full Overview · {level}</>
                      }
                    </div>
                    <div className={styles.contentActions}>
                      <button className={styles.actionBtn} onClick={copyContent} title="Copy">
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <button className={styles.actionBtn} onClick={() => setContent('')} title="Clear">
                        <RotateCcw size={14} />
                      </button>
                      <button
                        className={`${styles.chatToggleBtn} ${chatOpen ? styles.chatToggleActive : ''}`}
                        onClick={() => setChatOpen(o => !o)}
                      >
                        <MessageSquare size={14} /> Ask AI
                      </button>
                    </div>
                  </div>
                  <div className={styles.contentBody}>
                    <div className={styles.mdContent}>
                      {renderContent(content)}
                      {(loading || overviewLoading) && <span className={styles.cursor} />}
                    </div>
                  </div>
                </div>
              )}

              {/* Source Links */}
              {sources.length > 0 && (
                <div className={styles.sourcesCard}>
                  <div className={styles.sourcesHeader}>
                    <Link2 size={14} />
                    <span>Source Links</span>
                    <span className={styles.sourcesCount}>{sources.length} resources</span>
                  </div>
                  <div className={styles.sourcesList}>
                    {sources.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noreferrer" className={styles.sourceItem}>
                        <div className={styles.sourceLeft}>
                          <span className={styles.sourceTag} style={{ background: `${TAG_COLORS[s.tag] || '#888'}18`, color: TAG_COLORS[s.tag] || '#888', borderColor: `${TAG_COLORS[s.tag] || '#888'}44` }}>
                            {s.tag}
                          </span>
                          <span className={styles.sourceTitle}>{s.title}</span>
                        </div>
                        <ExternalLink size={13} className={styles.sourceArrow} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Chat Panel */}
              {chatOpen && content && (
                <div className={styles.chatPanel}>
                  <div className={styles.chatHeader}>
                    <MessageSquare size={14} />
                    <span>Ask AI about {activeTopic || domain}</span>
                  </div>
                  <div className={styles.chatMessages}>
                    {chatMessages.length === 0 && (
                      <div className={styles.chatEmpty}>
                        Ask any question about this topic — concepts, examples, interview tips...
                      </div>
                    )}
                    {chatMessages.map((m, i) => (
                      <ChatMessage key={i} role={m.role} text={m.text} />
                    ))}
                    {chatLoading && <ChatMessage role="ai" isTyping />}
                    <div ref={chatEndRef} />
                  </div>
                  <div className={styles.chatInputRow}>
                    <input
                      className={styles.chatInput}
                      placeholder={`Ask about ${activeTopic || domain}...`}
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChat()}
                    />
                    <button className={styles.chatSendBtn} onClick={sendChat} disabled={!chatInput.trim() || chatLoading}>
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
