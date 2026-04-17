import styles from './AIResponse.module.css'

export default function AIResponse({ text, loading }) {
  if (!text && !loading) return null
  return (
    <div className={styles.box}>
      {loading && !text && (
        <div className={styles.dots}>
          <span /><span /><span />
        </div>
      )}
      {text && <p className={styles.text}>{text}</p>}
      {loading && text && <span className={styles.cursor} />}
    </div>
  )
}
