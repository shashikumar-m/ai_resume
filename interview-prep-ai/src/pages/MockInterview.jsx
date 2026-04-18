
import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import Layout from '../components/Layout'
import { groqChat } from '../services/groq'
import { useHistorySave } from '../hooks/useHistorySave'
import {
  Mic, MicOff, Volume2, VolumeX, Brain, Send, RotateCcw,
  Trophy, TrendingUp, AlertCircle, ChevronDown, Play,
  Square, Sparkles, RefreshCw, User, Bot, CheckCircle
} from 'lucide-react'
import styles from './MockInterview.module.css'

function SaveToHistoryBtn({ onSave }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const handleClick = async () => {
    setSaving(true)
    try { await onSave() } catch {}
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }
  return (
    <button className={styles.saveHistoryBtn} onClick={handleClick} disabled={saving || saved}>
      {saving ? <><RefreshCw size={14} className={styles.spin} /> Saving...</>
        : saved ? <>✓ Saved to History</>
        : <><Sparkles size={14} /> Save to History</>}
    </button>
  )
}

// ── Constants ─────────────────────────────────────────────────────────────────
const ROLES = [
  'Software Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Analyst', 'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
  'Product Manager', 'UI/UX Designer', 'Java Developer', 'Python Developer',
]
const EXP_LEVELS = ['Fresher', 'Junior', 'Mid-level', 'Senior']
const LENGTHS = [
  { label: '5 questions', value: 5 },
  { label: '8 questions', value: 8 },
  { label: '10 questions', value: 10 },
]

// ── Speech helpers ────────────────────────────────────────────────────────────
function speak(text, onEnd) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate = 0.92
  utt.pitch = 1.0
  utt.volume = 1
  // Prefer a natural English voice
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural'))
    || voices.find(v => v.lang.startsWith('en-US'))
    || voices.find(v => v.lang.startsWith('en'))
  if (preferred) utt.voice = preferred
  utt.onend = onEnd || null
  window.speechSynthesis.speak(utt)
}

function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel()
}

// ── Score parser ──────────────────────────────────────────────────────────────
function parseScore(text) {
  const m = text.match(/score[:\s]+(\d+)/i)
  return m ? Math.min(10, Math.max(1, parseInt(m[1]))) : null
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ role, text, score, isTyping }) {
  const isAI = role === 'ai'
  return (
    <div className={`${styles.bubble} ${isAI ? styles.bubbleAI : styles.bubbleUser}`}>
      <div className={styles.bubbleAvatar}>
        {isAI ? <Bot size={16} /> : <User size={16} />}
      </div>
      <div className={styles.bubbleContent}>
        <div className={styles.bubbleRole}>{isAI ? 'AI Interviewer' : 'You'}</div>
        {isTyping
          ? <div className={styles.typingDots}><span /><span /><span /></div>
          : <p className={styles.bubbleText}>{text}</p>
        }
        {score !== null && score !== undefined && (
          <div className={styles.bubbleScore} style={{
            color: score >= 7 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444'
          }}>
            Score: {score}/10
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MockInterview() {
  const { profile, addMockSession } = useApp()
  const { save } = useHistorySave()

  // Config state
  const [phase, setPhase] = useState('config') // config | interview | results
  const [role, setRole] = useState(profile?.role || '')
  const [expLevel, setExpLevel] = useState('Junior')
  const [length, setLength] = useState(5)
  const [voiceMode, setVoiceMode] = useState(true)
  const [muteAI, setMuteAI] = useState(false)

  // Interview state
  const [messages, setMessages] = useState([])
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [textAnswer, setTextAnswer] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [scores, setScores] = useState([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [overallFeedback, setOverallFeedback] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const recognitionRef = useRef(null)
  const chatEndRef = useRef(null)
  const answerRef = useRef('')

  // Check voice support
  useEffect(() => {
    const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    setVoiceSupported(supported)
    if (!supported) setVoiceMode(false)
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Generate questions via Groq ──
  const generateQuestions = async () => {
    const prompt = `You are an expert interviewer. Generate exactly ${length} interview questions for a ${role} position at ${expLevel} level.

Output ONLY the questions, numbered 1 to ${length}, one per line. No answers, no extra text.
Example:
1. Tell me about yourself and your experience with ${role}.
2. What is your biggest technical strength?

Generate ${length} questions now:`

    try {
      let raw = ''
      await groqChat(prompt, (_, full) => { raw = full })
      const qs = raw.split('\n')
        .filter(l => l.trim())
        .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(l => l.length > 10)
        .slice(0, length)
      if (qs.length >= 3) return qs
    } catch {}

    // Fallback static questions
    return [
      `Tell me about yourself and your background as a ${role}.`,
      `What are your strongest technical skills relevant to ${role}?`,
      `Describe a challenging project you worked on and how you handled it.`,
      `How do you stay updated with the latest trends in your field?`,
      `Where do you see yourself in 3-5 years?`,
      `Tell me about a time you had to learn something new quickly.`,
      `How do you handle pressure and tight deadlines?`,
      `What motivates you in your work?`,
      `Describe your ideal work environment.`,
      `Do you have any questions for me?`,
    ].slice(0, length)
  }

  // ── Start interview ──
  const handleStart = async () => {
    if (!role) return alert('Please select a Target Role.')
    setLoadingQuestions(true)
    const qs = await generateQuestions()
    setQuestions(qs)
    setCurrentQ(0)
    setMessages([])
    setScores([])
    setLoadingQuestions(false)
    setPhase('interview')

    // Greeting
    const greeting = `Hello! I'm your AI interviewer today. We'll be doing a ${expLevel} level interview for the ${role} position. I'll ask you ${qs.length} questions. Take your time with each answer. Let's begin!`
    addMessage('ai', greeting)
    if (!muteAI) {
      setIsSpeaking(true)
      speak(greeting, () => {
        setIsSpeaking(false)
        setTimeout(() => askQuestion(qs, 0), 600)
      })
    } else {
      setTimeout(() => askQuestion(qs, 0), 800)
    }
  }

  // ── Ask a question ──
  const askQuestion = useCallback((qs, idx) => {
    if (idx >= qs.length) return
    const q = qs[idx]
    const prefix = idx === 0 ? 'Question 1: ' : `Question ${idx + 1}: `
    addMessage('ai', prefix + q)
    if (!muteAI) {
      setIsSpeaking(true)
      speak(prefix + q, () => {
        setIsSpeaking(false)
        if (voiceMode) setTimeout(() => startListening(), 400)
      })
    } else {
      if (voiceMode) setTimeout(() => startListening(), 400)
    }
  }, [muteAI, voiceMode])

  // ── Add message ──
  const addMessage = (role, text, score) => {
    setMessages(prev => [...prev, { role, text, score: score ?? null, id: Date.now() + Math.random() }])
  }

  // ── Voice recognition ──
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    stopSpeaking()
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognitionRef.current = recognition
    setTranscript('')
    setIsListening(true)
    answerRef.current = ''

    recognition.onresult = (e) => {
      let interim = '', final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript
        else interim += e.results[i][0].transcript
      }
      const combined = (final || interim).trim()
      setTranscript(combined)
      answerRef.current = combined
    }

    recognition.onend = () => {
      setIsListening(false)
      if (answerRef.current.trim()) {
        setTextAnswer(answerRef.current)
      }
    }

    recognition.onerror = (e) => {
      setIsListening(false)
      if (e.error !== 'no-speech') console.warn('Speech error:', e.error)
    }

    recognition.start()
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  // ── Submit answer ──
  const handleSubmitAnswer = async () => {
    const answer = textAnswer.trim() || transcript.trim()
    if (!answer) return
    if (isListening) stopListening()

    addMessage('user', answer)
    setTextAnswer('')
    setTranscript('')
    setIsEvaluating(true)

    const q = questions[currentQ]
    const prompt = `You are a professional interviewer evaluating a candidate for a ${role} position (${expLevel} level).

Question asked: ${q}
Candidate's answer: ${answer}

Evaluate the answer and respond conversationally as an interviewer would. Include:
1. Brief acknowledgment of their answer
2. Score: X/10
3. One strength of their answer
4. One area to improve
5. A brief follow-up comment or transition to next question

Keep your response under 100 words. Be encouraging but honest. Sound natural, not robotic.`

    let feedback = ''
    try {
      await groqChat(prompt, (_, full) => { feedback = full })
    } catch {
      feedback = `Thank you for your answer. Score: ${Math.floor(Math.random() * 3) + 6}/10. Good effort! Let's continue.`
    }

    const score = parseScore(feedback)
    setScores(prev => [...prev, { q, answer, score: score || 6, feedback }])
    setIsEvaluating(false)
    addMessage('ai', feedback, score)

    if (!muteAI) {
      setIsSpeaking(true)
      speak(feedback, () => {
        setIsSpeaking(false)
        const next = currentQ + 1
        if (next < questions.length) {
          setCurrentQ(next)
          setTimeout(() => askQuestion(questions, next), 600)
        } else {
          finishInterview()
        }
      })
    } else {
      const next = currentQ + 1
      if (next < questions.length) {
        setCurrentQ(next)
        setTimeout(() => askQuestion(questions, next), 800)
      } else {
        finishInterview()
      }
    }
  }

  // ── Finish interview ──
  const finishInterview = () => {
    const closing = `That concludes our interview! You've answered all ${questions.length} questions. I'll now prepare your performance report. Thank you for your time!`
    addMessage('ai', closing)
    if (!muteAI) speak(closing, () => setIsSpeaking(false))
    setTimeout(async () => {
      const avg = scores.length
        ? Math.round(scores.reduce((a, s) => a + (s.score || 6), 0) / scores.length)
        : 6
      addMockSession({ role, score: avg, date: new Date().toLocaleDateString() })
      save('mock',
        `Mock Interview — ${role}`,
        `${expLevel} · ${scores.length} questions · Avg ${avg}/10`,
        avg,
        { role, expLevel, avgScore: avg, scores, totalQuestions: scores.length }
      )
      setPhase('results')
      // Generate overall AI feedback
      generateOverallFeedback(scores, avg)
    }, 2000)
  }

  const generateOverallFeedback = async (allScores, avg) => {
    setFeedbackLoading(true)
    const prompt = `You are an expert interview coach. Based on this mock interview performance, provide a comprehensive feedback report.

Role: ${role}
Experience Level: ${expLevel}
Overall Score: ${avg}/10

Interview Q&A Summary:
${allScores.map((s, i) => `Q${i+1}: ${s.q}\nAnswer: ${s.answer}\nScore: ${s.score}/10\nFeedback: ${s.feedback}`).join('\n\n')}

Provide a structured overall feedback report with these sections:

## 🎯 Overall Performance Summary
[2-3 sentences summarizing the candidate's overall performance]

## ✅ Key Strengths
[3-4 specific strengths demonstrated across the interview]

## ⚠️ Areas for Improvement
[3-4 specific areas that need work, with actionable advice]

## 📊 Skill Assessment
[Rate these areas: Communication, Technical Knowledge, Problem Solving, Confidence — each with a brief comment]

## 🚀 Action Plan
[3-5 specific steps the candidate should take before their next interview]

## 💬 Final Verdict
[One encouraging closing statement with readiness assessment]

Be specific, constructive, and encouraging. Reference actual answers from the interview.`

    try {
      await groqChat(prompt, (_, full) => setOverallFeedback(full))
    } catch (e) {
      setOverallFeedback(`Could not generate feedback: ${e.message}`)
    }
    setFeedbackLoading(false)
  }

  const handleReset = () => {
    stopSpeaking()
    stopListening()
    setPhase('config')
    setMessages([])
    setScores([])
    setCurrentQ(0)
    setTextAnswer('')
    setTranscript('')
    setOverallFeedback('')
  }

  const avgScore = scores.length
    ? Math.round(scores.reduce((a, s) => a + (s.score || 6), 0) / scores.length)
    : 0

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: CONFIG
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === 'config') {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div className={styles.pageHeaderIcon}><Brain size={22} /></div>
            <div>
              <h1 className={styles.pageTitle}>Mock Interview</h1>
              <p className={styles.pageSub}>Simulate a real interview with AI — text or voice</p>
            </div>
          </div>

          <div className={styles.configCard}>
            <h2 className={styles.configTitle}>Configure Your Interview</h2>

            {/* Role */}
            <div className={styles.configField}>
              <label className={styles.configLabel}>Target Role <span className={styles.req}>*</span></label>
              <div className={styles.selectWrap}>
                <select className={styles.configSelect} value={role} onChange={e => setRole(e.target.value)}>
                  <option value="">Select role...</option>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
                <ChevronDown size={14} className={styles.selectArrow} />
              </div>
            </div>

            {/* Experience */}
            <div className={styles.configField}>
              <label className={styles.configLabel}>Experience Level</label>
              <div className={styles.chipRow}>
                {EXP_LEVELS.map(l => (
                  <button key={l} className={`${styles.chip} ${expLevel === l ? styles.chipActive : ''}`}
                    onClick={() => setExpLevel(l)}>{l}</button>
                ))}
              </div>
            </div>

            {/* Length */}
            <div className={styles.configField}>
              <label className={styles.configLabel}>Interview Length</label>
              <div className={styles.chipRow}>
                {LENGTHS.map(({ label, value }) => (
                  <button key={value} className={`${styles.chip} ${length === value ? styles.chipActive : ''}`}
                    onClick={() => setLength(value)}>{label}</button>
                ))}
              </div>
            </div>

            {/* Voice Mode */}
            <div className={styles.voiceRow}>
              <div className={styles.voiceInfo}>
                <div className={styles.voiceTitle}>
                  <Mic size={16} /> Voice Mode
                  {!voiceSupported && <span className={styles.voiceUnsupported}>(Not supported in this browser)</span>}
                </div>
                <div className={styles.voiceDesc}>AI speaks questions · You answer by voice</div>
              </div>
              <button className={`${styles.toggle} ${voiceMode ? styles.toggleOn : ''}`}
                onClick={() => voiceSupported && setVoiceMode(v => !v)} disabled={!voiceSupported}>
                <span className={styles.toggleThumb} />
              </button>
            </div>

            {/* AI Voice */}
            <div className={styles.voiceRow}>
              <div className={styles.voiceInfo}>
                <div className={styles.voiceTitle}><Volume2 size={16} /> AI Voice</div>
                <div className={styles.voiceDesc}>AI reads questions and feedback aloud</div>
              </div>
              <button className={`${styles.toggle} ${!muteAI ? styles.toggleOn : ''}`}
                onClick={() => setMuteAI(v => !v)}>
                <span className={styles.toggleThumb} />
              </button>
            </div>

            <button className={styles.startBtn} onClick={handleStart} disabled={loadingQuestions || !role}>
              {loadingQuestions
                ? <><RefreshCw size={16} className={styles.spin} /> Preparing Interview...</>
                : <><Sparkles size={16} /> Start Mock Interview</>}
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: INTERVIEW
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === 'interview') {
    const progress = questions.length > 0 ? (currentQ / questions.length) * 100 : 0

    return (
      <Layout>
        <div className={styles.page}>
          {/* Top bar */}
          <div className={styles.interviewTopBar}>
            <div className={styles.interviewInfo}>
              <div className={styles.interviewRole}>{role}</div>
              <div className={styles.interviewMeta}>{expLevel} · {questions.length} questions</div>
            </div>
            <div className={styles.interviewControls}>
              <button className={styles.muteBtn} onClick={() => { setMuteAI(m => !m); stopSpeaking() }}
                title={muteAI ? 'Unmute AI' : 'Mute AI'}>
                {muteAI ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button className={styles.endBtn} onClick={handleReset}>End Interview</button>
            </div>
          </div>

          {/* Progress */}
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.progressLabel}>
              {currentQ < questions.length ? `Question ${currentQ + 1} of ${questions.length}` : 'Wrapping up...'}
            </span>
          </div>

          {/* AI Status indicator */}
          <div className={styles.aiStatus}>
            <div className={`${styles.aiStatusDot} ${isSpeaking ? styles.aiStatusSpeaking : isEvaluating ? styles.aiStatusThinking : styles.aiStatusIdle}`} />
            <span className={styles.aiStatusText}>
              {isSpeaking ? 'AI is speaking...' : isEvaluating ? 'AI is evaluating...' : isListening ? 'Listening to you...' : 'AI Interviewer ready'}
            </span>
            {isSpeaking && (
              <button className={styles.stopSpeakBtn} onClick={() => { stopSpeaking(); setIsSpeaking(false) }}>
                <Square size={12} /> Stop
              </button>
            )}
          </div>

          {/* Chat window */}
          <div className={styles.chatWindow}>
            {messages.map(m => (
              <Bubble key={m.id} role={m.role} text={m.text} score={m.score} />
            ))}
            {isEvaluating && <Bubble role="ai" text="" isTyping />}
            <div ref={chatEndRef} />
          </div>

          {/* Answer input */}
          {!isEvaluating && currentQ < questions.length && (
            <div className={styles.answerPanel}>
              {/* Voice transcript preview */}
              {(isListening || transcript) && (
                <div className={styles.transcriptBox}>
                  <div className={styles.transcriptLabel}>
                    <Mic size={12} className={styles.micPulse} /> Listening...
                  </div>
                  <p className={styles.transcriptText}>{transcript || '...'}</p>
                </div>
              )}

              <div className={styles.answerRow}>
                <textarea
                  className={styles.answerInput}
                  rows={3}
                  placeholder={voiceMode ? 'Speak your answer or type here...' : 'Type your answer here...'}
                  value={textAnswer || transcript}
                  onChange={e => setTextAnswer(e.target.value)}
                  onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') handleSubmitAnswer() }}
                />
                <div className={styles.answerBtns}>
                  {voiceMode && voiceSupported && (
                    <button
                      className={`${styles.voiceBtn} ${isListening ? styles.voiceBtnActive : ''}`}
                      onClick={isListening ? stopListening : startListening}
                      title={isListening ? 'Stop listening' : 'Start voice input'}
                    >
                      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                  )}
                  <button
                    className={styles.submitBtn}
                    onClick={handleSubmitAnswer}
                    disabled={!textAnswer.trim() && !transcript.trim()}
                  >
                    <Send size={16} /> Submit
                  </button>
                </div>
              </div>
              <div className={styles.answerHint}>
                {voiceMode && voiceSupported
                  ? 'Click the mic to speak, or type your answer · Ctrl+Enter to submit'
                  : 'Type your answer · Ctrl+Enter to submit'}
              </div>
            </div>
          )}
        </div>
      </Layout>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: RESULTS
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.resultsCard}>
          <div className={styles.resultsTop}>
            <Trophy size={44} className={styles.trophyIcon} />
            <h2 className={styles.resultsTitle}>Interview Complete!</h2>
            <div className={styles.overallScore}>
              <span className={styles.scoreNum} style={{
                color: avgScore >= 8 ? '#22c55e' : avgScore >= 6 ? '#f59e0b' : '#ef4444'
              }}>{avgScore}</span>
              <span className={styles.scoreDen}>/10</span>
            </div>
            <p className={styles.scoreVerdict}>
              {avgScore >= 8 ? '🎉 Excellent! You are interview-ready.' :
                avgScore >= 6 ? '👍 Good performance. Keep practicing.' :
                  '📚 Needs improvement. Review the feedback below.'}
            </p>
          </div>

          {/* ── AI Overall Feedback ── */}
          <div className={styles.overallFeedbackCard}>
            <div className={styles.overallFeedbackHeader}>
              <Sparkles size={16} className={styles.overallFeedbackIcon} />
              <span>AI Performance Feedback</span>
              {feedbackLoading && <RefreshCw size={13} className={styles.spin} />}
            </div>
            {feedbackLoading && !overallFeedback && (
              <div className={styles.feedbackLoading}>
                <RefreshCw size={16} className={styles.spin} />
                <span>Groq AI is analyzing your interview performance...</span>
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

          {/* Summary stats */}
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <div className={styles.statNum} style={{ color: '#22c55e' }}>
                {scores.filter(s => s.score >= 7).length}
              </div>
              <div className={styles.statLabel}>Strong Answers</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum} style={{ color: '#f59e0b' }}>
                {scores.filter(s => s.score >= 5 && s.score < 7).length}
              </div>
              <div className={styles.statLabel}>Average Answers</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum} style={{ color: '#ef4444' }}>
                {scores.filter(s => s.score < 5).length}
              </div>
              <div className={styles.statLabel}>Needs Work</div>
            </div>
          </div>

          {/* Per-question breakdown */}
          <div className={styles.breakdown}>
            <div className={styles.breakdownTitle}>Question-by-Question Breakdown</div>
            {scores.map((s, i) => (
              <div key={i} className={styles.breakdownItem}>
                <div className={styles.breakdownHeader}>
                  <span className={styles.breakdownQ}>Q{i + 1}: {s.q}</span>
                  <span className={styles.breakdownScore} style={{
                    color: s.score >= 7 ? '#22c55e' : s.score >= 5 ? '#f59e0b' : '#ef4444'
                  }}>{s.score}/10</span>
                </div>
                <div className={styles.breakdownAnswer}><strong>Your answer:</strong> {s.answer}</div>
                <div className={styles.breakdownFeedback}>{s.feedback}</div>
              </div>
            ))}
          </div>

          <div className={styles.resultsBtns}>
            <button className={styles.retryBtn} onClick={handleReset}>
              <RotateCcw size={15} /> Try Again
            </button>
            <SaveToHistoryBtn
              onSave={() => save(
                'mock',
                `Mock Interview — ${role}`,
                `${expLevel} · ${scores.length} questions · Avg ${avgScore}/10`,
                avgScore,
                { role, expLevel, avgScore, scores, totalQuestions: scores.length }
              )}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}
