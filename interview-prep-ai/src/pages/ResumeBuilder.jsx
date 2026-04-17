import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import Layout from '../components/Layout'
import { groqChat } from '../services/groq'
import { useHistorySave } from '../hooks/useHistorySave'
import ResumeRenderer from './ResumeRenderer'
import TemplatePicker from '../components/TemplatePicker'
import { getTemplate } from './resumeTemplates'
import { Sparkles, Download, RefreshCw, CheckCircle, AlertCircle, Upload, Plus, Trash2, Palette, Camera, X } from 'lucide-react'
import styles from './ResumeBuilder.module.css'

const ROLE_KEYWORDS = {
  'Software Developer':['JavaScript','React','Node.js','Python','SQL','Git','REST APIs','Docker','CI/CD','Agile','TypeScript','Microservices'],
  'Frontend Developer':['HTML','CSS','JavaScript','React','TypeScript','Tailwind','Webpack','Figma','Responsive Design','Accessibility','Performance','SPA'],
  'Backend Developer':['Node.js','Python','Java','SQL','MongoDB','REST APIs','Docker','AWS','Microservices','API Design','Security','Scalability'],
  'Full Stack Developer':['React','Node.js','Python','SQL','MongoDB','Docker','AWS','Git','Full Stack','Agile','REST','TypeScript'],
  'Data Analyst':['Python','SQL','Power BI','Excel','Tableau','Pandas','NumPy','Statistics','ETL','Data Visualization','KPI','Business Intelligence'],
  'Data Scientist':['Python','Machine Learning','TensorFlow','SQL','Statistics','Pandas','Scikit-learn','Deep Learning','NLP','Feature Engineering','MLOps'],
  'Machine Learning Engineer':['Python','TensorFlow','PyTorch','MLOps','Docker','AWS','Kubernetes','SQL','Model Deployment','Pipeline','Optimization'],
  'DevOps Engineer':['Docker','Kubernetes','AWS','Terraform','CI/CD','Linux','Python','Ansible','Infrastructure as Code','Monitoring','SRE'],
  'Product Manager':['Product Strategy','Agile','Jira','Data Analysis','Roadmapping','Stakeholder Management','SQL','Figma','OKRs','KPIs','Go-to-Market'],
  'UI/UX Designer':['Figma','Adobe XD','User Research','Prototyping','Wireframing','CSS','Design Systems','Usability Testing','Accessibility','Interaction Design'],
  'Marketing Manager':['Digital Marketing','SEO','Google Analytics','Content Strategy','Social Media','Email Marketing','CRM','Excel','Growth','Conversion','ROI'],
  'Business Analyst':['Requirements Analysis','SQL','Excel','Power BI','Process Mapping','Stakeholder Management','Agile','JIRA','Gap Analysis','Use Cases'],
  'MERN Developer':['MongoDB','Express.js','React','Node.js','JavaScript','TypeScript','REST APIs','Git','Docker','Redux','JWT','Mongoose'],
  'Java Developer':['Java','Spring Boot','Hibernate','SQL','Maven','Git','REST APIs','Microservices','JUnit','Docker','AWS','Design Patterns'],
}
const ROLES = Object.keys(ROLE_KEYWORDS)

function calcATSScore(form, role) {
  const kws = ROLE_KEYWORDS[role] || []
  const text = [form.summary, form.skills.join(' '), form.experience.map(e => e.bullets).join(' '), form.projects.map(p => p.desc).join(' ')].join(' ').toLowerCase()
  const matched = kws.filter(k => text.includes(k.toLowerCase()))
  const kwScore = Math.round((matched.length / Math.max(kws.length, 1)) * 40)
  let s = 0
  if (form.summary.length > 50) s += 15
  if (form.experience.length > 0) s += 15
  if (form.skills.length >= 4) s += 10
  if (form.education) s += 10
  if (form.projects.length > 0) s += 10
  return Math.min(100, kwScore + s)
}

function getMissingSections(form) {
  const w = []
  if (!form.summary) w.push({ type: 'error', msg: 'No professional summary — critical for ATS' })
  if (form.experience.length === 0) w.push({ type: 'error', msg: 'No experience entries added' })
  if (form.skills.length < 4) w.push({ type: 'warn', msg: 'Add at least 4-6 skills for better ATS matching' })
  if (form.projects.length === 0) w.push({ type: 'warn', msg: 'No projects added — important for freshers' })
  if (!form.certifications) w.push({ type: 'info', msg: 'Consider adding certifications for your role' })
  const bullets = form.experience.flatMap(e => e.bullets.split('\n').filter(Boolean))
  if (bullets.length > 0 && !bullets.some(b => /\d/.test(b))) w.push({ type: 'warn', msg: 'No quantified achievements — add numbers/% to bullets' })
  return w
}

function getSkillGap(formSkills, role) {
  const required = ROLE_KEYWORDS[role] || []
  const lower = formSkills.map(s => s.toLowerCase())
  return required.filter(k => !lower.some(u => u.includes(k.toLowerCase().split(' ')[0])))
}

function ScoreRing({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const r = 28, circ = 2 * Math.PI * r, dash = (score / 100) * circ
  return (
    <div className={styles.scoreRing}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 36 36)" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div className={styles.scoreRingInner}>
        <span className={styles.scoreNum} style={{ color }}>{score}</span>
        <span className={styles.scoreDen}>/100</span>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', options = [] }) {
  return (
    <div className={styles.fieldWrap}>
      <label className={styles.fieldLabel}>{label}</label>
      {type === 'select'
        ? <select className={styles.input} value={value} onChange={e => onChange(e.target.value)}>
            <option value="">Select...</option>
            {options.map(o => <option key={o}>{o}</option>)}
          </select>
        : <input className={styles.input} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}

const EMPTY_EXP = { title: '', company: '', period: '', bullets: '' }
const EMPTY_PROJ = { name: '', tech: '', desc: '' }

function SaveResumeBtn({ form, templateId, atsScore, save }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const handleSave = async () => {
    if (!form.name && !form.targetRole) return
    setSaving(true)
    try {
      await save(
        'resume',
        `${form.targetRole || 'Resume'} — ${form.name || 'Draft'}`,
        `${form.targetRole} · ${form.experience.length} exp · ATS ${atsScore}/100`,
        atsScore,
        { form: { ...form, skillInput: undefined }, templateId, atsScore }
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    setSaving(false)
  }
  return (
    <button
      style={{ display:'flex', alignItems:'center', gap:6, background: saved ? '#22c55e' : 'rgba(108,99,255,0.12)', border: `1px solid ${saved ? '#22c55e44' : 'rgba(108,99,255,0.3)'}`, color: saved ? '#fff' : '#a89fff', padding:'10px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s', whiteSpace:'nowrap' }}
      onClick={handleSave}
      disabled={saving}
    >
      {saving ? '...' : saved ? '✓ Saved!' : '💾 Save to History'}
    </button>
  )
}

export default function ResumeBuilder() {
  const { profile } = useApp()
  const { save } = useHistorySave()
  const printRef = useRef()
  const fileRef = useRef()
  const photoRef = useRef()
  const [activeTab, setActiveTab] = useState('form')
  const [templateId, setTemplateId] = useState('azurill')
  const [showPicker, setShowPicker] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [optimizeLoading, setOptimizeLoading] = useState(false)
  const [aiOptimizations, setAiOptimizations] = useState('')
  const [uploadedText, setUploadedText] = useState('')
  const [form, setForm] = useState({
    name: profile?.name || '', email: '', phone: '', location: '', linkedin: '', github: '',
    targetRole: profile?.role || '', summary: '',
    skills: profile?.skills || [], skillInput: '',
    experience: [], projects: [],
    education: profile?.education || '', certifications: '',
    photo: null,
  })

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const addSkill = () => {
    const s = form.skillInput.trim()
    if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s], skillInput: '' }))
  }
  const removeSkill = s => setField('skills', form.skills.filter(x => x !== s))
  const addExp = () => setField('experience', [...form.experience, { ...EMPTY_EXP }])
  const updateExp = (i, k, v) => setField('experience', form.experience.map((e, idx) => idx === i ? { ...e, [k]: v } : e))
  const removeExp = i => setField('experience', form.experience.filter((_, idx) => idx !== i))
  const addProj = () => setField('projects', [...form.projects, { ...EMPTY_PROJ }])
  const updateProj = (i, k, v) => setField('projects', form.projects.map((p, idx) => idx === i ? { ...p, [k]: v } : p))
  const removeProj = i => setField('projects', form.projects.filter((_, idx) => idx !== i))

  const atsScore = calcATSScore(form, form.targetRole)
  const warnings = getMissingSections(form)
  const skillGap = getSkillGap(form.skills, form.targetRole)
  const roleKws = ROLE_KEYWORDS[form.targetRole] || []
  const matchedKws = roleKws.filter(k => {
    const text = [form.summary, form.skills.join(' '), form.experience.map(e => e.bullets).join(' ')].join(' ').toLowerCase()
    return text.includes(k.toLowerCase())
  })

  const handleAIGenerate = async () => {
    if (!form.targetRole) return alert('Please select a Target Job Role first.')
    setAiLoading(true)
    const expCtx = form.experience.length > 0
      ? form.experience.map(e => `${e.title} at ${e.company}`).join('; ')
      : 'Fresher / No experience'
    const prompt = `You are a professional resume writer. Generate ATS-optimized resume content.
Role: ${form.targetRole}
Name: ${form.name || 'Candidate'}
Experience: ${expCtx}
Skills: ${form.skills.join(', ') || 'Not specified'}
Education: ${form.education || 'Not specified'}
Projects: ${form.projects.map(p => p.name).join(', ') || 'Not specified'}
Certifications: ${form.certifications || 'None'}

Output EXACTLY this format, no extra text:
SUMMARY:
[3-4 sentence ATS-friendly summary with strong action verbs]

EXPERIENCE_TITLE:
[Job title for ${form.targetRole}]

EXPERIENCE_COMPANY:
[Company name]

EXPERIENCE_PERIOD:
[Jan 2023 - Present]

EXPERIENCE_BULLETS:
- Achievement with metric
- Achievement with metric
- Achievement with metric
- Achievement with metric

PROJECT_NAME:
[Project name for ${form.targetRole}]

PROJECT_TECH:
[Tech stack]

PROJECT_DESC:
[2-3 sentence description with impact]

SKILLS:
[12 comma-separated skills for ${form.targetRole}]`
    try {
      let raw = ''
      await groqChat(prompt, (_, full) => { raw = full })
      const get = key => {
        const m = raw.match(new RegExp(key + ':\\n([\\s\\S]*?)(?=\\n[A-Z_]+:|$)'))
        return m?.[1]?.trim() || ''
      }
      const summary = get('SUMMARY')
      const expTitle = get('EXPERIENCE_TITLE')
      const expCompany = get('EXPERIENCE_COMPANY')
      const expPeriod = get('EXPERIENCE_PERIOD')
      const expBullets = get('EXPERIENCE_BULLETS')
      const projName = get('PROJECT_NAME')
      const projTech = get('PROJECT_TECH')
      const projDesc = get('PROJECT_DESC')
      const skillsRaw = get('SKILLS')
      if (summary) setField('summary', summary)
      if (expTitle || expBullets) {
        const newExp = form.experience.length > 0
          ? form.experience.map((e, i) => i === 0 ? { ...e, title: expTitle || e.title, company: expCompany || e.company, period: expPeriod || e.period, bullets: expBullets || e.bullets } : e)
          : [{ title: expTitle, company: expCompany, period: expPeriod, bullets: expBullets }]
        setField('experience', newExp)
      }
      if (projName || projDesc) {
        const newProj = form.projects.length > 0
          ? form.projects.map((p, i) => i === 0 ? { name: projName || p.name, tech: projTech || p.tech, desc: projDesc || p.desc } : p)
          : [{ name: projName, tech: projTech, desc: projDesc }]
        setField('projects', newProj)
      }
      if (skillsRaw) {
        const aiSkills = skillsRaw.split(',').map(s => s.trim()).filter(Boolean)
        setField('skills', [...new Set([...form.skills, ...aiSkills])].slice(0, 16))
      }
      setActiveTab('preview')
      // Auto-save to history
      const atsScore = calcATSScore({ ...form, summary: summary || form.summary, skills: skillsRaw ? [...new Set([...form.skills, ...skillsRaw.split(',').map(s => s.trim()).filter(Boolean)])].slice(0, 16) : form.skills }, form.targetRole)
      save('resume',
        `${form.targetRole || 'Resume'} — ${form.name || 'Draft'}`,
        `${form.targetRole} · ${form.experience.length} exp · ATS ${atsScore}/100`,
        atsScore,
        { form: { ...form, skillInput: undefined }, templateId, atsScore }
      )
    } catch (e) { alert(`Groq error: ${e.message}`) }
    setAiLoading(false)
  }

  const handleAIOptimize = async () => {
    setOptimizeLoading(true)
    setAiOptimizations('')
    const resumeText = [
      form.summary,
      form.experience.map(e => `${e.title} at ${e.company}: ${e.bullets}`).join('\n'),
      form.projects.map(p => `${p.name}: ${p.desc}`).join('\n'),
    ].join('\n\n')
    const prompt = `You are an expert resume coach. Analyze this resume for a ${form.targetRole || 'professional'} role.
Resume: ${resumeText || uploadedText || 'No content yet'}
Provide:
1. ACTION VERB IMPROVEMENTS (3 weak to strong examples)
2. QUANTIFICATION SUGGESTIONS (3 bullets needing numbers)
3. MISSING KEYWORDS for ${form.targetRole}: top 5
4. OVERALL TIPS: 3 specific actionable tips
Under 250 words. Be specific.`
    try {
      await groqChat(prompt, (_, full) => setAiOptimizations(full))
    } catch (e) { setAiOptimizations(`Error: ${e.message}`) }
    setOptimizeLoading(false)
  }

  const handleUpload = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setUploadedText(ev.target.result)
      const lines = ev.target.result.split('\n').filter(Boolean)
      if (lines[0] && !form.name) setField('name', lines[0].trim())
    }
    reader.readAsText(file)
  }

  const handlePhotoUpload = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setField('photo', ev.target.result)
    reader.readAsDataURL(file)
  }

  const handlePrint = () => {
    const f = form
    const tpl = getTemplate(templateId)
    const { accent, sidebar, layout } = tpl

    // A4 dimensions: 210mm x 297mm = 794px x 1123px at 96dpi
    const A4_W = '210mm'
    const A4_H = '297mm'

    const photoHtml = f.photo
      ? `<img src="${f.photo}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.4);margin-bottom:12px;display:block;-webkit-print-color-adjust:exact;print-color-adjust:exact;" />`
      : `<div style="width:70px;height:70px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:#fff;margin-bottom:12px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">${(f.name || 'Y')[0].toUpperCase()}</div>`

    const expHtml = f.experience.map(e => {
      const bLines = (e.bullets || '').split('\n').filter(l => l.trim())
      const bHtml = bLines.map(b => `<li style="font-size:12.5px;color:#333;margin-bottom:3px;line-height:1.6;">${b.replace(/^[-*•]\s*/, '')}</li>`).join('')
      return `<div style="margin-bottom:14px;"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;margin-bottom:2px;"><div><strong style="font-size:13px;color:#111;">${e.title || ''}</strong>${e.company ? `<span style="font-size:12px;color:${accent};font-weight:600;"> — ${e.company}</span>` : ''}</div><span style="font-size:11px;color:#888;font-style:italic;">${e.period || ''}</span></div><ul style="margin:4px 0 0;padding-left:16px;">${bHtml}</ul></div>`
    }).join('')

    const projHtml = f.projects.map(p => `<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;margin-bottom:3px;"><strong style="font-size:13px;color:#111;">${p.name || ''}</strong>${p.tech ? `<span style="font-size:11px;color:${accent};font-weight:600;">${p.tech}</span>` : ''}</div>${p.desc ? `<p style="font-size:12.5px;color:#333;margin:0;line-height:1.6;">${p.desc}</p>` : ''}</div>`).join('')

    const sec = t => `<div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:${accent};border-bottom:2px solid ${accent};padding-bottom:4px;margin:16px 0 10px;">${t}</div>`

    let body = ''

    if (layout === 'sidebar-left' || layout === 'sidebar-right') {
      const skillsHtml = f.skills.length > 0
        ? `<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;opacity:0.65;border-bottom:1px solid rgba(255,255,255,0.25);padding-bottom:4px;margin:14px 0 8px;">SKILLS</div><div style="display:flex;flex-wrap:wrap;gap:4px;">${f.skills.map(s => `<span style="font-size:10px;background:rgba(255,255,255,0.18);color:#fff;padding:3px 8px;border-radius:100px;margin-bottom:3px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">${s}</span>`).join('')}</div>` : ''

      const contactSec = `
        <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;opacity:0.65;border-bottom:1px solid rgba(255,255,255,0.25);padding-bottom:4px;margin-bottom:8px;">CONTACT</div>
        ${f.email ? `<div style="font-size:11px;opacity:0.9;margin-bottom:4px;word-break:break-all;">✉ ${f.email}</div>` : ''}
        ${f.phone ? `<div style="font-size:11px;opacity:0.9;margin-bottom:4px;">📞 ${f.phone}</div>` : ''}
        ${f.location ? `<div style="font-size:11px;opacity:0.9;margin-bottom:4px;">📍 ${f.location}</div>` : ''}
        ${f.linkedin ? `<div style="font-size:11px;opacity:0.9;margin-bottom:4px;word-break:break-all;">🔗 ${f.linkedin}</div>` : ''}
        ${f.github ? `<div style="font-size:11px;opacity:0.9;margin-bottom:4px;word-break:break-all;">💻 ${f.github}</div>` : ''}
      `

      const left = `
        <div style="width:220px;flex-shrink:0;background:${sidebar};padding:28px 18px;color:#fff;min-height:${A4_H};-webkit-print-color-adjust:exact;print-color-adjust:exact;">
          ${photoHtml}
          <div style="font-size:16px;font-weight:800;margin-bottom:4px;line-height:1.2;">${f.name || ''}</div>
          <div style="font-size:11px;opacity:0.8;margin-bottom:18px;letter-spacing:0.5px;">${f.targetRole || ''}</div>
          ${contactSec}
          ${skillsHtml}
          ${f.certifications ? `<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;opacity:0.65;border-bottom:1px solid rgba(255,255,255,0.25);padding-bottom:4px;margin:14px 0 8px;">CERTIFICATIONS</div><div style="font-size:11px;opacity:0.9;">${f.certifications}</div>` : ''}
        </div>`

      const right = `
        <div style="flex:1;padding:28px 26px;background:#fff;min-height:${A4_H};">
          ${f.summary ? `${sec('PROFESSIONAL SUMMARY')}<p style="font-size:12.5px;color:#333;line-height:1.7;margin:0 0 6px;">${f.summary}</p>` : ''}
          ${f.experience.length > 0 ? `${sec('EXPERIENCE')}${expHtml}` : ''}
          ${f.projects.length > 0 ? `${sec('PROJECTS')}${projHtml}` : ''}
          ${f.education ? `${sec('EDUCATION')}<p style="font-size:12.5px;color:#333;margin:0;">${f.education}</p>` : ''}
        </div>`

      body = layout === 'sidebar-right'
        ? `<div style="display:flex;width:${A4_W};min-height:${A4_H};">${right}${left}</div>`
        : `<div style="display:flex;width:${A4_W};min-height:${A4_H};">${left}${right}</div>`

    } else if (layout === 'top-band') {
      const photoTopHtml = f.photo
        ? `<img src="${f.photo}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.4);margin-right:20px;flex-shrink:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;" />`
        : ''
      body = `
        <div style="width:${A4_W};min-height:${A4_H};font-family:Arial,sans-serif;">
          <div style="background:${sidebar};padding:28px 32px;color:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;display:flex;align-items:center;">
            ${photoTopHtml}
            <div>
              <div style="font-size:26px;font-weight:900;margin-bottom:5px;">${f.name || ''}</div>
              <div style="font-size:12px;opacity:0.85;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">${f.targetRole || ''}</div>
              <div style="font-size:11px;opacity:0.75;">${[f.email, f.phone, f.location, f.linkedin, f.github].filter(Boolean).join('  ·  ')}</div>
            </div>
          </div>
          <div style="display:flex;flex:1;">
            <div style="flex:1;padding:22px 26px;">
              ${f.summary ? `${sec('SUMMARY')}<p style="font-size:12.5px;color:#333;line-height:1.7;margin:0 0 6px;">${f.summary}</p>` : ''}
              ${f.experience.length > 0 ? `${sec('EXPERIENCE')}${expHtml}` : ''}
              ${f.projects.length > 0 ? `${sec('PROJECTS')}${projHtml}` : ''}
            </div>
            <div style="width:200px;flex-shrink:0;padding:22px 18px;border-left:1px solid #eee;">
              ${f.skills.length > 0 ? `${sec('SKILLS')}<div style="display:flex;flex-wrap:wrap;gap:5px;">${f.skills.map(s => `<span style="font-size:11px;border:1px solid ${accent};color:${accent};padding:3px 9px;border-radius:100px;">${s}</span>`).join('')}</div>` : ''}
              ${f.education ? `${sec('EDUCATION')}<p style="font-size:12px;color:#333;margin:0;">${f.education}</p>` : ''}
              ${f.certifications ? `${sec('CERTIFICATIONS')}<p style="font-size:12px;color:#333;margin:0;">${f.certifications}</p>` : ''}
            </div>
          </div>
        </div>`

    } else {
      // single column
      const photoSingleHtml = f.photo
        ? `<img src="${f.photo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid ${accent};margin-bottom:10px;-webkit-print-color-adjust:exact;print-color-adjust:exact;" />`
        : ''
      body = `
        <div style="width:${A4_W};min-height:${A4_H};font-family:Arial,sans-serif;padding:36px 42px;">
          <div style="text-align:center;border-bottom:2.5px solid ${accent};padding-bottom:16px;margin-bottom:6px;">
            ${photoSingleHtml}
            <div style="font-size:28px;font-weight:900;color:${accent};letter-spacing:0.5px;">${f.name || ''}</div>
            <div style="font-size:13px;color:#555;letter-spacing:2px;text-transform:uppercase;margin:5px 0;">${f.targetRole || ''}</div>
            <div style="font-size:12px;color:#555;">${[f.email, f.phone, f.location].filter(Boolean).join('  ·  ')}</div>
            ${(f.linkedin || f.github) ? `<div style="font-size:12px;color:${accent};margin-top:3px;">${[f.linkedin, f.github].filter(Boolean).join('  ·  ')}</div>` : ''}
          </div>
          ${f.summary ? `${sec('PROFESSIONAL SUMMARY')}<p style="font-size:12.5px;color:#333;line-height:1.7;margin:0 0 6px;">${f.summary}</p>` : ''}
          ${f.skills.length > 0 ? `${sec('SKILLS')}<p style="font-size:12.5px;color:#333;margin:0 0 6px;">${f.skills.join('  ·  ')}</p>` : ''}
          ${f.experience.length > 0 ? `${sec('EXPERIENCE')}${expHtml}` : ''}
          ${f.projects.length > 0 ? `${sec('PROJECTS')}${projHtml}` : ''}
          ${f.education ? `${sec('EDUCATION')}<p style="font-size:12.5px;color:#333;margin:0;">${f.education}</p>` : ''}
          ${f.certifications ? `${sec('CERTIFICATIONS')}<p style="font-size:12.5px;color:#333;margin:0;">${f.certifications}</p>` : ''}
        </div>`
    }

    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Resume - ${f.name || 'Resume'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 210mm; margin: 0 auto; background: #fff; }
    @media screen { body { box-shadow: 0 0 20px rgba(0,0,0,0.15); } }
    @media print {
      @page { margin: 0; size: A4 portrait; }
      html, body { width: 210mm; height: 297mm; }
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>${body}</body>
</html>`)
    win.document.close()
    setTimeout(() => { win.focus(); win.print() }, 600)
  }

  const tpl = getTemplate(templateId)

  return (
    <Layout>
      {showPicker && (
        <TemplatePicker
          selected={templateId}
          onSelect={id => { setTemplateId(id); setShowPicker(false); setActiveTab('preview') }}
        />
      )}
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>AI Resume Builder</h1>
            <p className={styles.sub}>ATS-optimized resume for {form.targetRole || 'your target role'}</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.templatePickerBtn} onClick={() => setShowPicker(true)}>
              <Palette size={14} />
              <span className={styles.templatePickerDot} style={{ background: tpl.accent }} />
              {tpl.name}
            </button>
            <button className={styles.aiBtn} onClick={handleAIGenerate} disabled={aiLoading}>
              <Sparkles size={14} />{aiLoading ? 'Generating...' : 'Generate with Groq AI'}
            </button>
            <button className={styles.printBtn} onClick={handlePrint}>
              <Download size={14} /> Export PDF
            </button>
            <SaveResumeBtn form={form} templateId={templateId} atsScore={calcATSScore(form, form.targetRole)} save={save} />
          </div>
        </div>

        <div className={styles.tabs}>
          {[['form', 'Edit Resume'], ['preview', 'Preview'], ['score', 'ATS Score'], ['optimize', 'AI Optimize']].map(([id, label]) => (
            <button key={id} className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`} onClick={() => setActiveTab(id)}>{label}</button>
          ))}
        </div>

        {activeTab === 'form' && (
          <div className={styles.formLayout}>
            <div className={styles.uploadBanner}>
              <Upload size={15} />
              <span>Have an existing resume? Upload it to improve</span>
              <input ref={fileRef} type="file" accept=".txt,.md" style={{ display: 'none' }} onChange={handleUpload} />
              <button className={styles.uploadBtn} onClick={() => fileRef.current.click()}>Upload .txt</button>
              {uploadedText && <span className={styles.uploadedTag}>Uploaded</span>}
            </div>
            <div className={styles.formGrid}>
              <div>
                <div className={styles.card}>
                  <div className={styles.cardTitle}>Personal Information</div>
                  {/* Profile Photo */}
                  <div className={styles.photoRow}>
                    <div className={styles.photoPreview} onClick={() => photoRef.current.click()}>
                      {form.photo
                        ? <img src={form.photo} alt="Profile" className={styles.photoImg} />
                        : <div className={styles.photoPlaceholder}>
                            <Camera size={22} />
                            <span>Add Photo</span>
                          </div>
                      }
                    </div>
                    <div className={styles.photoActions}>
                      <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                      <button className={styles.photoBtn} onClick={() => photoRef.current.click()}>
                        <Camera size={13} /> {form.photo ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      {form.photo && (
                        <button className={styles.photoRemoveBtn} onClick={() => setField('photo', null)}>
                          <X size={13} /> Remove
                        </button>
                      )}
                      <p className={styles.photoHint}>Optional · JPG or PNG · Shows on sidebar templates</p>
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <Field label="Full Name" value={form.name} onChange={v => setField('name', v)} placeholder="Alex Johnson" />
                    <Field label="Target Job Role *" value={form.targetRole} onChange={v => setField('targetRole', v)} type="select" options={ROLES} />
                  </div>
                  <div className={styles.fieldRow}>
                    <Field label="Email" value={form.email} onChange={v => setField('email', v)} placeholder="alex@email.com" />
                    <Field label="Phone" value={form.phone} onChange={v => setField('phone', v)} placeholder="+91 98765 43210" />
                  </div>
                  <div className={styles.fieldRow}>
                    <Field label="Location" value={form.location} onChange={v => setField('location', v)} placeholder="Bangalore, India" />
                    <Field label="LinkedIn" value={form.linkedin} onChange={v => setField('linkedin', v)} placeholder="linkedin.com/in/alex" />
                  </div>
                  <Field label="GitHub / Portfolio" value={form.github} onChange={v => setField('github', v)} placeholder="github.com/alex" />
                </div>

                <div className={styles.card}>
                  <div className={styles.cardTitle}>Professional Summary</div>
                  <textarea className={styles.textarea} rows={4} value={form.summary}
                    onChange={e => setField('summary', e.target.value)}
                    placeholder="Results-driven professional with expertise in..." />
                  <p className={styles.fieldHint}>Tip: Use Groq AI to auto-generate a tailored summary</p>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardTitle}>Skills</div>
                  <div className={styles.skillInputRow}>
                    <input className={styles.input} value={form.skillInput}
                      onChange={e => setField('skillInput', e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSkill()}
                      placeholder="Type a skill and press Enter" />
                    <button className={styles.addBtn} onClick={addSkill}><Plus size={14} /></button>
                  </div>
                  <div className={styles.skillTags}>
                    {form.skills.map(s => (
                      <span key={s} className={styles.skillTag}>
                        {s} <button onClick={() => removeSkill(s)}><Trash2 size={10} /></button>
                      </span>
                    ))}
                  </div>
                  {form.targetRole && (
                    <div className={styles.suggestedSkills}>
                      <span className={styles.suggestLabel}>Suggested for {form.targetRole}:</span>
                      {(ROLE_KEYWORDS[form.targetRole] || []).filter(k => !form.skills.includes(k)).slice(0, 6).map(k => (
                        <button key={k} className={styles.suggestChip} onClick={() => setField('skills', [...form.skills, k])}>
                          <Plus size={10} /> {k}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.card}>
                  <div className={styles.cardTitle}>Education</div>
                  <textarea className={styles.textarea} rows={2} value={form.education}
                    onChange={e => setField('education', e.target.value)}
                    placeholder="B.Tech Computer Science, XYZ University - 2024 | CGPA: 8.5" />
                </div>

                <div className={styles.card}>
                  <div className={styles.cardTitle}>Certifications</div>
                  <textarea className={styles.textarea} rows={2} value={form.certifications}
                    onChange={e => setField('certifications', e.target.value)}
                    placeholder="AWS Certified Developer, Google Data Analytics Certificate" />
                </div>
              </div>

              <div>
                <div className={styles.card}>
                  <div className={styles.cardTitleRow}>
                    <div className={styles.cardTitle}>Work Experience</div>
                    <button className={styles.addSectionBtn} onClick={addExp}><Plus size={13} /> Add</button>
                  </div>
                  {form.experience.length === 0 && <p className={styles.emptySection}>No experience added yet. Click Add to start.</p>}
                  {form.experience.map((exp, i) => (
                    <div key={i} className={styles.entryBlock}>
                      <div className={styles.entryHeader}>
                        <span className={styles.entryNum}>#{i + 1}</span>
                        <button className={styles.removeBtn} onClick={() => removeExp(i)}><Trash2 size={13} /></button>
                      </div>
                      <div className={styles.fieldRow}>
                        <Field label="Job Title" value={exp.title} onChange={v => updateExp(i, 'title', v)} placeholder="Software Developer" />
                        <Field label="Company" value={exp.company} onChange={v => updateExp(i, 'company', v)} placeholder="Tech Corp" />
                      </div>
                      <Field label="Period" value={exp.period} onChange={v => updateExp(i, 'period', v)} placeholder="Jan 2023 - Present" />
                      <div className={styles.fieldWrap}>
                        <label className={styles.fieldLabel}>Bullet Points <span className={styles.fieldHint}>(one per line)</span></label>
                        <textarea className={styles.textarea} rows={4} value={exp.bullets}
                          onChange={e => updateExp(i, 'bullets', e.target.value)}
                          placeholder="- Developed REST APIs reducing response time by 40%" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.card}>
                  <div className={styles.cardTitleRow}>
                    <div className={styles.cardTitle}>Projects</div>
                    <button className={styles.addSectionBtn} onClick={addProj}><Plus size={13} /> Add</button>
                  </div>
                  {form.projects.length === 0 && <p className={styles.emptySection}>No projects added yet. Click Add to start.</p>}
                  {form.projects.map((p, i) => (
                    <div key={i} className={styles.entryBlock}>
                      <div className={styles.entryHeader}>
                        <span className={styles.entryNum}>#{i + 1}</span>
                        <button className={styles.removeBtn} onClick={() => removeProj(i)}><Trash2 size={13} /></button>
                      </div>
                      <div className={styles.fieldRow}>
                        <Field label="Project Name" value={p.name} onChange={v => updateProj(i, 'name', v)} placeholder="E-Commerce Platform" />
                        <Field label="Tech Stack" value={p.tech} onChange={v => updateProj(i, 'tech', v)} placeholder="React, Node.js, MongoDB" />
                      </div>
                      <div className={styles.fieldWrap}>
                        <label className={styles.fieldLabel}>Description</label>
                        <textarea className={styles.textarea} rows={3} value={p.desc}
                          onChange={e => updateProj(i, 'desc', e.target.value)}
                          placeholder="Built a full-stack app with 500+ users, JWT auth, and Stripe payments." />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className={styles.previewTab}>
            <div className={styles.previewToolbar}>
              <div className={styles.activeTemplateInfo}>
                <div className={styles.activeTemplateDot} style={{ background: tpl.accent }} />
                <span className={styles.activeTemplateName}>{tpl.name}</span>
                <span className={styles.activeTemplateDesc}>{tpl.desc}</span>
              </div>
              <button className={styles.changeTemplateBtn} onClick={() => setShowPicker(true)}>
                <Palette size={14} /> Change Template
              </button>
            </div>
            <div ref={printRef} className={styles.previewWrapper}>
              <ResumeRenderer form={form} templateId={templateId} />
            </div>
          </div>
        )}

        {activeTab === 'score' && (
          <div className={styles.scoreTab}>
            <div className={styles.scoreTop}>
              <div className={styles.scoreCard}>
                <ScoreRing score={atsScore} />
                <div className={styles.scoreInfo}>
                  <div className={styles.scoreTitle}>ATS Score</div>
                  <div className={styles.scoreDesc}>
                    {atsScore >= 80 ? 'Excellent! Your resume is well-optimized.' :
                      atsScore >= 60 ? 'Good. Fix the warnings below to improve.' :
                        'Needs work. Follow the suggestions below.'}
                  </div>
                </div>
              </div>
              {form.targetRole && (
                <div className={styles.kwCard}>
                  <div className={styles.kwTitle}>Keyword Match - {form.targetRole}</div>
                  <div className={styles.kwBar}>
                    <div className={styles.kwFill} style={{ width: `${(matchedKws.length / Math.max(roleKws.length, 1)) * 100}%` }} />
                  </div>
                  <div className={styles.kwStats}>{matchedKws.length} / {roleKws.length} keywords matched</div>
                  <div className={styles.kwGroups}>
                    <div>
                      <div className={styles.kwGroupLabel} style={{ color: '#22c55e' }}>Present</div>
                      <div className={styles.kwList}>{matchedKws.map(k => <span key={k} className={styles.kwPresent}>{k}</span>)}</div>
                    </div>
                    <div>
                      <div className={styles.kwGroupLabel} style={{ color: '#ef4444' }}>Missing</div>
                      <div className={styles.kwList}>{roleKws.filter(k => !matchedKws.includes(k)).map(k => <span key={k} className={styles.kwMissing}>{k}</span>)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.warningsCard}>
              <div className={styles.warningsTitle}>Section Analysis</div>
              {warnings.length === 0
                ? <div className={styles.allGood}><CheckCircle size={16} /> All sections look good!</div>
                : warnings.map((w, i) => (
                  <div key={i} className={`${styles.warning} ${styles[w.type]}`}>
                    <AlertCircle size={14} />{w.msg}
                  </div>
                ))}
            </div>
            {form.targetRole && skillGap.length > 0 && (
              <div className={styles.skillGapCard}>
                <div className={styles.warningsTitle}>Skill Gap for {form.targetRole}</div>
                <p className={styles.skillGapDesc}>These skills are expected but missing from your resume:</p>
                <div className={styles.kwList}>
                  {skillGap.map(k => (
                    <button key={k} className={styles.kwMissingBtn} onClick={() => { setField('skills', [...form.skills, k]); setActiveTab('form') }}>
                      <Plus size={10} /> {k}
                    </button>
                  ))}
                </div>
                <p className={styles.fieldHint}>Click any skill to add it to your resume</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'optimize' && (
          <div className={styles.optimizeTab}>
            <div className={styles.optimizeHeader}>
              <div>
                <div className={styles.cardTitle}>AI Resume Optimizer</div>
                <p className={styles.sub}>Groq AI analyzes your resume and gives specific improvement suggestions</p>
              </div>
              <button className={styles.aiBtn} onClick={handleAIOptimize} disabled={optimizeLoading}>
                <Sparkles size={14} />{optimizeLoading ? 'Analyzing...' : 'Analyze My Resume'}
              </button>
            </div>
            <div className={styles.optimizeExamples}>
              <div className={styles.exampleTitle}>What AI Optimization Does</div>
              <div className={styles.exampleGrid}>
                <div className={styles.exampleCard}><div className={styles.exBefore}>Before</div><p>"Worked on login system"</p></div>
                <div className={styles.exampleArrow}>to</div>
                <div className={styles.exampleCard}><div className={styles.exAfter}>After</div><p>"Built secure JWT authentication system reducing login failures by 30%"</p></div>
              </div>
            </div>
            {optimizeLoading && (
              <div className={styles.loadingBox}>
                <RefreshCw size={16} className={styles.spin} />
                <span>Groq AI is analyzing your resume...</span>
              </div>
            )}
            {aiOptimizations && (
              <div className={styles.optimizeResult}>
                <div className={styles.optimizeResultTitle}><Sparkles size={14} /> AI Optimization Report</div>
                <pre className={styles.optimizeText}>{aiOptimizations}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
