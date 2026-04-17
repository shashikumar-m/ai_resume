import styles from './ResumeRenderer.module.css'
import { getTemplate } from './resumeTemplates'

// ── Shared helpers ────────────────────────────────────────────────────────────
function Bullets({ text }) {
  const lines = (text || '').split('\n').filter(l => l.trim())
  if (!lines.length) return null
  return (
    <ul className={styles.bullets}>
      {lines.map((b, i) => <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>)}
    </ul>
  )
}

function SectionTitle({ children, accent, style = {} }) {
  return (
    <div className={styles.sectionTitle} style={{ color: accent, borderColor: accent, ...style }}>
      {children}
    </div>
  )
}

// ── SIDEBAR-LEFT layout (Azurill, Chikorita, Gengar, Leafish, Pikachu, Ditgar) ──
function SidebarLeft({ form, tpl }) {
  const { accent, sidebar } = tpl
  return (
    <div className={styles.sidebarLeft}>
      {/* LEFT */}
      <div className={styles.leftCol} style={{ background: sidebar }}>
        {form.photo
          ? <img src={form.photo} alt="Profile" className={styles.avatarPhoto} />
          : <div className={styles.avatarCircle} style={{ background: accent }}>
              {(form.name || 'Y')[0].toUpperCase()}
            </div>
        }
        <div className={styles.sidebarName}>{form.name || 'Your Name'}</div>
        <div className={styles.sidebarRole} style={{ color: `${accent}cc` }}>{form.targetRole || 'Professional'}</div>

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarSectionTitle}>CONTACT</div>
          {form.email    && <div className={styles.sidebarItem}>✉ {form.email}</div>}
          {form.phone    && <div className={styles.sidebarItem}>📞 {form.phone}</div>}
          {form.location && <div className={styles.sidebarItem}>📍 {form.location}</div>}
          {form.linkedin && <div className={styles.sidebarItem}>🔗 {form.linkedin}</div>}
          {form.github   && <div className={styles.sidebarItem}>💻 {form.github}</div>}
        </div>

        {form.skills.length > 0 && (
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>SKILLS</div>
            <div className={styles.sidebarSkills}>
              {form.skills.map(s => (
                <span key={s} className={styles.sidebarSkillTag} style={{ background: `${accent}33`, color: '#fff' }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {form.certifications && (
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>CERTIFICATIONS</div>
            {form.certifications.split('\n').filter(Boolean).map((c, i) => (
              <div key={i} className={styles.sidebarItem}>• {c.trim()}</div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className={styles.rightCol}>
        {form.summary && (
          <div className={styles.section}>
            <SectionTitle accent={accent}>PROFESSIONAL SUMMARY</SectionTitle>
            <p className={styles.bodyText}>{form.summary}</p>
          </div>
        )}

        {form.experience.length > 0 && (
          <div className={styles.section}>
            <SectionTitle accent={accent}>EXPERIENCE</SectionTitle>
            {form.experience.map((exp, i) => (
              <div key={i} className={styles.entry}>
                <div className={styles.entryHeader}>
                  <div>
                    <span className={styles.entryTitle}>{exp.title}</span>
                    {exp.company && <span className={styles.entryCompany} style={{ color: accent }}> · {exp.company}</span>}
                  </div>
                  <span className={styles.entryPeriod}>{exp.period}</span>
                </div>
                <Bullets text={exp.bullets} />
              </div>
            ))}
          </div>
        )}

        {form.projects.length > 0 && (
          <div className={styles.section}>
            <SectionTitle accent={accent}>PROJECTS</SectionTitle>
            {form.projects.map((p, i) => (
              <div key={i} className={styles.entry}>
                <div className={styles.entryHeader}>
                  <span className={styles.entryTitle}>{p.name}</span>
                  {p.tech && <span className={styles.entryTech} style={{ color: accent }}>{p.tech}</span>}
                </div>
                {p.desc && <p className={styles.bodyText}>{p.desc}</p>}
              </div>
            ))}
          </div>
        )}

        {form.education && (
          <div className={styles.section}>
            <SectionTitle accent={accent}>EDUCATION</SectionTitle>
            <p className={styles.bodyText}>{form.education}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── SIDEBAR-RIGHT layout (Kakuna) ─────────────────────────────────────────────
function SidebarRight({ form, tpl }) {
  const { accent, sidebar } = tpl
  return (
    <div className={styles.sidebarLeft}>
      {/* MAIN LEFT */}
      <div className={styles.rightCol} style={{ order: 1 }}>
        <div className={styles.proHeader} style={{ borderColor: accent }}>
          <div className={styles.proName}>{form.name || 'Your Name'}</div>
          <div className={styles.proRole} style={{ color: accent }}>{form.targetRole || 'Professional'}</div>
        </div>

        {form.summary && (
          <div className={styles.section}>
            <SectionTitle accent={accent}>SUMMARY</SectionTitle>
            <p className={styles.bodyText}>{form.summary}</p>
          </div>
        )}

        {form.experience.length > 0 && (
          <div className={styles.section}>
            <SectionTitle accent={accent}>EXPERIENCE</SectionTitle>
            {form.experience.map((exp, i) => (
              <div key={i} className={styles.entry}>
                <div className={styles.entryHeader}>
                  <div>
                    <span className={styles.entryTitle}>{exp.title}</span>
                    {exp.company && <span className={styles.entryCompany} style={{ color: accent }}> · {exp.company}</span>}
                  </div>
                  <span className={styles.entryPeriod}>{exp.period}</span>
                </div>
                <Bullets text={exp.bullets} />
              </div>
            ))}
          </div>
        )}

        {form.projects.length > 0 && (
          <div className={styles.section}>
            <SectionTitle accent={accent}>PROJECTS</SectionTitle>
            {form.projects.map((p, i) => (
              <div key={i} className={styles.entry}>
                <div className={styles.entryHeader}>
                  <span className={styles.entryTitle}>{p.name}</span>
                  {p.tech && <span className={styles.entryTech} style={{ color: accent }}>{p.tech}</span>}
                </div>
                {p.desc && <p className={styles.bodyText}>{p.desc}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SIDEBAR RIGHT */}
      <div className={styles.leftCol} style={{ background: sidebar, order: 2 }}>
        {form.photo
          ? <img src={form.photo} alt="Profile" className={styles.avatarPhoto} />
          : <div className={styles.avatarCircle} style={{ background: accent }}>
              {(form.name || 'Y')[0].toUpperCase()}
            </div>
        }
        <div className={styles.sidebarSection}>
          <div className={styles.sidebarSectionTitle}>CONTACT</div>
          {form.email    && <div className={styles.sidebarItem}>{form.email}</div>}
          {form.phone    && <div className={styles.sidebarItem}>{form.phone}</div>}
          {form.location && <div className={styles.sidebarItem}>{form.location}</div>}
          {form.linkedin && <div className={styles.sidebarItem}>{form.linkedin}</div>}
          {form.github   && <div className={styles.sidebarItem}>{form.github}</div>}
        </div>
        {form.skills.length > 0 && (
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>SKILLS</div>
            {form.skills.map(s => (
              <div key={s} className={styles.sidebarItem}>• {s}</div>
            ))}
          </div>
        )}
        {form.education && (
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>EDUCATION</div>
            <div className={styles.sidebarItem}>{form.education}</div>
          </div>
        )}
        {form.certifications && (
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>CERTIFICATIONS</div>
            <div className={styles.sidebarItem}>{form.certifications}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── TOP-BAND layout (Ditto, Lapras) ──────────────────────────────────────────
function TopBand({ form, tpl }) {
  const { accent, sidebar } = tpl
  return (
    <div className={styles.topBand}>
      {/* HEADER BAND */}
      <div className={styles.bandHeader} style={{ background: sidebar }}>
        <div className={styles.bandHeaderInner}>
          {form.photo && <img src={form.photo} alt="Profile" className={styles.bandPhoto} />}
          <div>
            <div className={styles.bandName}>{form.name || 'Your Name'}</div>
            <div className={styles.bandRole}>{form.targetRole || 'Professional'}</div>
            <div className={styles.bandContact}>
              {[form.email, form.phone, form.location, form.linkedin, form.github].filter(Boolean).join('  ·  ')}
            </div>
          </div>
        </div>
      </div>

      {/* BODY — two columns */}
      <div className={styles.bandBody}>
        <div className={styles.bandMain}>
          {form.summary && (
            <div className={styles.section}>
              <SectionTitle accent={accent}>SUMMARY</SectionTitle>
              <p className={styles.bodyText}>{form.summary}</p>
            </div>
          )}
          {form.experience.length > 0 && (
            <div className={styles.section}>
              <SectionTitle accent={accent}>EXPERIENCE</SectionTitle>
              {form.experience.map((exp, i) => (
                <div key={i} className={styles.entry}>
                  <div className={styles.entryHeader}>
                    <div>
                      <span className={styles.entryTitle}>{exp.title}</span>
                      {exp.company && <span className={styles.entryCompany} style={{ color: accent }}> · {exp.company}</span>}
                    </div>
                    <span className={styles.entryPeriod}>{exp.period}</span>
                  </div>
                  <Bullets text={exp.bullets} />
                </div>
              ))}
            </div>
          )}
          {form.projects.length > 0 && (
            <div className={styles.section}>
              <SectionTitle accent={accent}>PROJECTS</SectionTitle>
              {form.projects.map((p, i) => (
                <div key={i} className={styles.entry}>
                  <div className={styles.entryHeader}>
                    <span className={styles.entryTitle}>{p.name}</span>
                    {p.tech && <span className={styles.entryTech} style={{ color: accent }}>{p.tech}</span>}
                  </div>
                  {p.desc && <p className={styles.bodyText}>{p.desc}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.bandSide}>
          {form.skills.length > 0 && (
            <div className={styles.section}>
              <SectionTitle accent={accent}>SKILLS</SectionTitle>
              <div className={styles.skillPills}>
                {form.skills.map(s => (
                  <span key={s} className={styles.skillPill} style={{ borderColor: accent, color: accent }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {form.education && (
            <div className={styles.section}>
              <SectionTitle accent={accent}>EDUCATION</SectionTitle>
              <p className={styles.bodyText}>{form.education}</p>
            </div>
          )}
          {form.certifications && (
            <div className={styles.section}>
              <SectionTitle accent={accent}>CERTIFICATIONS</SectionTitle>
              <p className={styles.bodyText}>{form.certifications}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── SINGLE-COLUMN layout (Bronzor, Glalie, Onyx, Rhyhorn) ────────────────────
function SingleColumn({ form, tpl }) {
  const { accent } = tpl
  const isOnyx = tpl.id === 'onyx'
  const isGlalie = tpl.id === 'glalie'

  return (
    <div className={styles.single}>
      {/* Header */}
      <div className={styles.singleHeader} style={{
        borderBottom: `${isOnyx ? 3 : 2}px solid ${accent}`,
        paddingBottom: 14,
        marginBottom: 4,
      }}>
        {form.photo && <img src={form.photo} alt="Profile" className={styles.singlePhoto} />}
        <div className={styles.singleName} style={{ color: isOnyx ? '#111' : accent }}>{form.name || 'Your Name'}</div>
        <div className={styles.singleRole} style={{ color: isGlalie ? accent : '#555' }}>{form.targetRole || 'Professional'}</div>
        <div className={styles.singleContact}>
          {[form.email, form.phone, form.location].filter(Boolean).join('  ·  ')}
        </div>
        {(form.linkedin || form.github) && (
          <div className={styles.singleLinks} style={{ color: accent }}>
            {[form.linkedin, form.github].filter(Boolean).join('  ·  ')}
          </div>
        )}
      </div>

      {form.summary && (
        <div className={styles.section}>
          <SectionTitle accent={accent}>PROFESSIONAL SUMMARY</SectionTitle>
          <p className={styles.bodyText}>{form.summary}</p>
        </div>
      )}

      {form.skills.length > 0 && (
        <div className={styles.section}>
          <SectionTitle accent={accent}>SKILLS</SectionTitle>
          <p className={styles.bodyText}>{form.skills.join('  ·  ')}</p>
        </div>
      )}

      {form.experience.length > 0 && (
        <div className={styles.section}>
          <SectionTitle accent={accent}>EXPERIENCE</SectionTitle>
          {form.experience.map((exp, i) => (
            <div key={i} className={styles.entry}>
              <div className={styles.entryHeader}>
                <div>
                  <span className={styles.entryTitle}>{exp.title}</span>
                  {exp.company && <span className={styles.entryCompany} style={{ color: accent }}> — {exp.company}</span>}
                </div>
                <span className={styles.entryPeriod}>{exp.period}</span>
              </div>
              <Bullets text={exp.bullets} />
            </div>
          ))}
        </div>
      )}

      {form.projects.length > 0 && (
        <div className={styles.section}>
          <SectionTitle accent={accent}>PROJECTS</SectionTitle>
          {form.projects.map((p, i) => (
            <div key={i} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.entryTitle}>{p.name}</span>
                {p.tech && <span className={styles.entryTech} style={{ color: accent }}>{p.tech}</span>}
              </div>
              {p.desc && <p className={styles.bodyText}>{p.desc}</p>}
            </div>
          ))}
        </div>
      )}

      {form.education && (
        <div className={styles.section}>
          <SectionTitle accent={accent}>EDUCATION</SectionTitle>
          <p className={styles.bodyText}>{form.education}</p>
        </div>
      )}

      {form.certifications && (
        <div className={styles.section}>
          <SectionTitle accent={accent}>CERTIFICATIONS</SectionTitle>
          <p className={styles.bodyText}>{form.certifications}</p>
        </div>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ResumeRenderer({ form, templateId }) {
  const tpl = getTemplate(templateId)

  if (tpl.layout === 'sidebar-left')  return <SidebarLeft  form={form} tpl={tpl} />
  if (tpl.layout === 'sidebar-right') return <SidebarRight form={form} tpl={tpl} />
  if (tpl.layout === 'top-band')      return <TopBand      form={form} tpl={tpl} />
  return <SingleColumn form={form} tpl={tpl} />
}
