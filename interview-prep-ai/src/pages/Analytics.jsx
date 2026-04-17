import { useApp } from '../context/AppContext'
import Layout from '../components/Layout'
import { TrendingUp, Award, Target, Activity, Brain } from 'lucide-react'
import styles from './Analytics.module.css'

export default function Analytics() {
  const { profile, mockHistory } = useApp()

  const avgScore = mockHistory.length
    ? Math.round(mockHistory.reduce((a, s) => a + s.score, 0) / mockHistory.length)
    : null

  const best = mockHistory.length ? Math.max(...mockHistory.map(s => s.score)) : null
  const latest = mockHistory[0]?.score ?? null
  const prev = mockHistory[1]?.score ?? null
  const trend = latest !== null && prev !== null ? latest - prev : null

  const readiness = avgScore !== null
    ? avgScore >= 8 ? 'High' : avgScore >= 6 ? 'Medium' : 'Low'
    : 'Not assessed'

  const confidence = avgScore !== null
    ? avgScore >= 8 ? 'Interview Ready' : avgScore >= 6 ? 'Needs Practice' : 'Needs Improvement'
    : 'Complete a mock interview'

  const readinessColor = { High: '#22c55e', Medium: '#f59e0b', Low: '#ef4444', 'Not assessed': '#888' }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Performance Analytics</h1>
          <p className={styles.sub}>Track your interview readiness over time</p>
        </div>

        {mockHistory.length === 0 ? (
          <div className={styles.empty}>
            <Brain size={48} className={styles.emptyIcon} />
            <h3>No sessions yet</h3>
            <p>Complete a Mock Interview to see your performance analytics here.</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
              <div className={styles.kpiCard}>
                <div className={styles.kpiIcon} style={{ background: 'rgba(108,99,255,0.12)', color: '#6c63ff' }}>
                  <Activity size={20} />
                </div>
                <div className={styles.kpiNum}>{avgScore}/10</div>
                <div className={styles.kpiLabel}>Average Score</div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiIcon} style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                  <Award size={20} />
                </div>
                <div className={styles.kpiNum}>{best}/10</div>
                <div className={styles.kpiLabel}>Best Score</div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiIcon} style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                  <TrendingUp size={20} />
                </div>
                <div className={styles.kpiNum} style={{ color: trend > 0 ? '#22c55e' : trend < 0 ? '#ef4444' : '#888' }}>
                  {trend === null ? '—' : trend > 0 ? `+${trend}` : trend}
                </div>
                <div className={styles.kpiLabel}>Score Trend</div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiIcon} style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}>
                  <Target size={20} />
                </div>
                <div className={styles.kpiNum}>{mockHistory.length}</div>
                <div className={styles.kpiLabel}>Sessions Done</div>
              </div>
            </div>

            {/* Readiness + Confidence */}
            <div className={styles.statusGrid}>
              <div className={styles.statusCard}>
                <div className={styles.statusLabel}>Readiness Level</div>
                <div className={styles.statusValue} style={{ color: readinessColor[readiness] }}>{readiness}</div>
                <div className={styles.statusBar}>
                  <div className={styles.statusFill}
                    style={{ width: `${avgScore ? (avgScore / 10) * 100 : 0}%`, background: readinessColor[readiness] }} />
                </div>
                <p className={styles.statusNote}>
                  {readiness === 'High' ? 'You\'re well-prepared. Keep it up!' :
                    readiness === 'Medium' ? 'Good progress. Focus on weak areas.' :
                      'Keep practicing. Consistency is key.'}
                </p>
              </div>
              <div className={styles.statusCard}>
                <div className={styles.statusLabel}>Confidence Level</div>
                <div className={styles.statusValue}>{confidence}</div>
                <div className={styles.statusNote}>Based on {mockHistory.length} mock interview session{mockHistory.length > 1 ? 's' : ''}</div>
              </div>
            </div>

            {/* Session History */}
            <div className={styles.historyCard}>
              <div className={styles.historyTitle}>Session History</div>
              <div className={styles.historyChart}>
                {[...mockHistory].reverse().map((s, i) => (
                  <div key={i} className={styles.barGroup}>
                    <div className={styles.barWrap}>
                      <div className={styles.bar} style={{ height: `${(s.score / 10) * 100}%`, background: s.score >= 7 ? '#22c55e' : s.score >= 5 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                    <div className={styles.barScore}>{s.score}</div>
                    <div className={styles.barDate}>{s.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Tips */}
            <div className={styles.tipsCard}>
              <div className={styles.tipsTitle}>Improvement Recommendations</div>
              <div className={styles.tipsList}>
                {avgScore < 6 && <div className={styles.tip}>🎯 Focus on STAR method for behavioral questions</div>}
                {avgScore < 7 && <div className={styles.tip}>📚 Review technical fundamentals for {profile?.role}</div>}
                {avgScore < 8 && <div className={styles.tip}>💡 Add more specific examples and quantified results</div>}
                {avgScore >= 8 && <div className={styles.tip}>🚀 Try advanced system design and leadership questions</div>}
                <div className={styles.tip}>🔄 Practice daily — consistency beats intensity</div>
                <div className={styles.tip}>📝 Review AI feedback from previous sessions carefully</div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
