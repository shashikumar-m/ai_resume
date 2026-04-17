import { TEMPLATES } from '../pages/resumeTemplates'
import styles from './TemplatePicker.module.css'

// Mini resume thumbnail preview for each template
function Thumbnail({ tpl }) {
  const { layout, accent, sidebar } = tpl

  if (layout === 'sidebar-left') {
    return (
      <div className={styles.thumb}>
        <div className={styles.thumbSidebar} style={{ background: sidebar }}>
          <div className={styles.thumbAvatar} style={{ background: accent }} />
          <div className={styles.thumbLine} style={{ background: 'rgba(255,255,255,0.4)', width: '70%' }} />
          <div className={styles.thumbLine} style={{ background: 'rgba(255,255,255,0.25)', width: '50%' }} />
          <div style={{ marginTop: 6 }}>
            {[60, 45, 55, 40].map((w, i) => (
              <div key={i} className={styles.thumbLine} style={{ background: 'rgba(255,255,255,0.2)', width: `${w}%` }} />
            ))}
          </div>
        </div>
        <div className={styles.thumbMain}>
          <div className={styles.thumbSectionBar} style={{ background: accent }} />
          {[90, 75, 85, 60, 70, 80, 55].map((w, i) => (
            <div key={i} className={styles.thumbLine} style={{ background: i % 3 === 0 ? '#ddd' : '#eee', width: `${w}%` }} />
          ))}
          <div className={styles.thumbSectionBar} style={{ background: accent, marginTop: 6 }} />
          {[85, 65, 75].map((w, i) => (
            <div key={i} className={styles.thumbLine} style={{ background: '#eee', width: `${w}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (layout === 'sidebar-right') {
    return (
      <div className={styles.thumb}>
        <div className={styles.thumbMain} style={{ flex: 1 }}>
          <div className={styles.thumbSectionBar} style={{ background: accent }} />
          {[90, 75, 85, 60, 70, 80, 55, 65].map((w, i) => (
            <div key={i} className={styles.thumbLine} style={{ background: i % 3 === 0 ? '#ddd' : '#eee', width: `${w}%` }} />
          ))}
        </div>
        <div className={styles.thumbSidebar} style={{ background: sidebar }}>
          <div className={styles.thumbAvatar} style={{ background: accent }} />
          {[60, 45, 55, 40, 50].map((w, i) => (
            <div key={i} className={styles.thumbLine} style={{ background: 'rgba(255,255,255,0.25)', width: `${w}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (layout === 'top-band') {
    return (
      <div className={styles.thumb} style={{ flexDirection: 'column' }}>
        <div className={styles.thumbBand} style={{ background: sidebar }}>
          <div className={styles.thumbLine} style={{ background: 'rgba(255,255,255,0.9)', width: '55%', height: 5 }} />
          <div className={styles.thumbLine} style={{ background: 'rgba(255,255,255,0.5)', width: '40%' }} />
          <div className={styles.thumbLine} style={{ background: 'rgba(255,255,255,0.35)', width: '70%' }} />
        </div>
        <div className={styles.thumbBody}>
          <div className={styles.thumbSectionBar} style={{ background: accent }} />
          {[90, 75, 85, 60, 70].map((w, i) => (
            <div key={i} className={styles.thumbLine} style={{ background: i % 3 === 0 ? '#ddd' : '#eee', width: `${w}%` }} />
          ))}
          <div className={styles.thumbSectionBar} style={{ background: accent, marginTop: 5 }} />
          {[80, 65, 75].map((w, i) => (
            <div key={i} className={styles.thumbLine} style={{ background: '#eee', width: `${w}%` }} />
          ))}
        </div>
      </div>
    )
  }

  // single column
  return (
    <div className={styles.thumb} style={{ flexDirection: 'column', padding: 8 }}>
      <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: 5, marginBottom: 5 }}>
        <div className={styles.thumbLine} style={{ background: '#222', width: '55%', height: 5 }} />
        <div className={styles.thumbLine} style={{ background: '#aaa', width: '40%' }} />
        <div className={styles.thumbLine} style={{ background: '#ccc', width: '70%' }} />
      </div>
      {[0,1,2,3].map(s => (
        <div key={s} style={{ marginBottom: 5 }}>
          <div className={styles.thumbLine} style={{ background: accent, width: '35%', height: 3 }} />
          {[90, 75, 80].map((w, i) => (
            <div key={i} className={styles.thumbLine} style={{ background: '#eee', width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function TemplatePicker({ selected, onSelect }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Choose a Template</h2>
            <p className={styles.modalSub}>Inspired by Reactive Resume · {TEMPLATES.length} templates available</p>
          </div>
        </div>
        <div className={styles.grid}>
          {TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              className={`${styles.card} ${selected === tpl.id ? styles.cardSelected : ''}`}
              onClick={() => onSelect(tpl.id)}
            >
              <div className={styles.thumbWrap}>
                <Thumbnail tpl={tpl} />
                {selected === tpl.id && (
                  <div className={styles.selectedBadge}>✓ Selected</div>
                )}
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardName}>{tpl.name}</div>
                <div className={styles.cardDesc}>{tpl.desc}</div>
                <span className={styles.cardTag} style={{ background: `${tpl.accent}22`, color: tpl.accent }}>
                  {tpl.tag}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
