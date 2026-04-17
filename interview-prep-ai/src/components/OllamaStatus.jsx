import { useEffect, useState } from 'react'
import { checkGroq } from '../services/groq'
import styles from './OllamaStatus.module.css'

export default function AIStatus() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    checkGroq().then(ok => setStatus(ok ? 'online' : 'offline'))
  }, [])

  return (
    <div className={`${styles.badge} ${styles[status]}`}>
      <span className={styles.dot} />
      {status === 'checking' ? 'Checking...' :
       status === 'online' ? 'Groq AI Ready' : 'API Key Missing'}
    </div>
  )
}
