import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight, ChevronDown, ChevronUp, FileText, Brain, BookOpen, BarChart2, MessageSquare, Shield, Globe, Sparkles, Lock, Palette, Share2, CheckCircle, Heart } from 'lucide-react'
import styles from './Landing.module.css'

const TEMPLATES = [
  { name: 'Azurill',   img: 'https://rxresu.me/templates/jpg/azurill.jpg' },
  { name: 'Bronzor',   img: 'https://rxresu.me/templates/jpg/bronzor.jpg' },
  { name: 'Chikorita', img: 'https://rxresu.me/templates/jpg/chikorita.jpg' },
  { name: 'Ditgar',    img: 'https://rxresu.me/templates/jpg/ditgar.jpg' },
  { name: 'Ditto',     img: 'https://rxresu.me/templates/jpg/ditto.jpg' },
  { name: 'Gengar',    img: 'https://rxresu.me/templates/jpg/gengar.jpg' },
  { name: 'Glalie',    img: 'https://rxresu.me/templates/jpg/glalie.jpg' },
  { name: 'Kakuna',    img: 'https://rxresu.me/templates/jpg/kakuna.jpg' },
  { name: 'Lapras',    img: 'https://rxresu.me/templates/jpg/lapras.jpg' },
  { name: 'Leafish',   img: 'https://rxresu.me/templates/jpg/leafish.jpg' },
  { name: 'Onyx',      img: 'https://rxresu.me/templates/jpg/onyx.jpg' },
  { name: 'Pikachu',   img: 'https://rxresu.me/templates/jpg/pikachu.jpg' },
  { name: 'Rhyhorn',   img: 'https://rxresu.me/templates/jpg/rhyhorn.jpg' },
]

const FEATURES = [
  { icon: FileText,      title: 'AI Resume Builder',   desc: 'Generate ATS-friendly resumes with strong action verbs, quantified achievements, and role-specific keywords.' },
  { icon: MessageSquare, title: 'Interview Q&A',       desc: 'Role-specific technical and behavioral questions with model answers and AI feedback.' },
  { icon: Brain,         title: 'Mock Interviews',     desc: 'Simulate real interviews with live Groq AI scoring and instant constructive feedback.' },
  { icon: BookOpen,      title: 'Learning Paths',      desc: 'Structured roadmaps from fundamentals to advanced for every target role.' },
  { icon: BarChart2,     title: 'Skill Gap Analysis',  desc: 'Compare your skills against role requirements and get a personalized study plan.' },
  { icon: Sparkles,      title: 'Groq AI Powered',     desc: 'Uses llama-3.3-70b via Groq for blazing-fast AI responses â€” completely free.' },
  { icon: Palette,       title: '13 Templates',        desc: 'Beautiful resume templates inspired by Reactive Resume, with more coming.' },
  { icon: Share2,        title: 'Export to PDF',       desc: 'Download your resume as a perfectly formatted A4 PDF with your chosen template.' },
  { icon: Shield,        title: 'No Tracking',         desc: 'Your data stays yours. No ads, no analytics, no selling your information.' },
  { icon: Lock,          title: 'Data Security',       desc: 'Your resume data is secure and never shared with third parties.' },
  { icon: Globe,         title: '14+ Job Roles',       desc: 'Tailored content for Software Dev, Data Analyst, DevOps, PM, Designer, and more.' },
  { icon: Zap,           title: 'Free, Forever',       desc: 'Completely free with no hidden costs, subscriptions, or paywalls. Ever.' },
]

const TESTIMONIALS = [
  { text: 'The mock interview feature is incredibly realistic. I felt fully prepared walking into my actual interview.', name: 'Priya S.', role: 'Software Engineer @ Google' },
  { text: 'The AI resume builder helped me land 3x more callbacks. The keyword optimization is spot on.', name: 'Rahul M.', role: 'Data Analyst @ Amazon' },
  { text: 'Skill gap analysis showed me exactly what to study. Got my dream job in 6 weeks.', name: 'Aisha K.', role: 'Product Manager @ Flipkart' },
  { text: 'Best free interview prep tool I have used. The learning path saved me weeks of research.', name: 'James T.', role: 'Frontend Dev @ Startup' },
  { text: 'The Groq AI feedback on my answers was shockingly accurate. It caught exactly what I was doing wrong.', name: 'Meera R.', role: 'Data Scientist @ Microsoft' },
  { text: 'I went from 0 callbacks to 4 interviews in 2 weeks after using the resume builder.', name: 'Arjun P.', role: 'Full Stack Dev @ Infosys' },
  { text: 'The ATS score feature is a game changer. I never knew my resume was missing so many keywords.', name: 'Sofia L.', role: 'DevOps Engineer @ AWS' },
  { text: 'Mock interviews with AI scoring helped me overcome my nervousness completely.', name: 'David K.', role: 'Backend Dev @ Razorpay' },
  { text: 'This is easily the most complete free interview prep platform I have found.', name: 'Nisha V.', role: 'ML Engineer @ Flipkart' },
  { text: 'The learning path for Data Analyst was perfectly structured. Exactly what I needed.', name: 'Chen W.', role: 'Data Analyst @ Deloitte' },
]

const FAQS = [
  { q: 'Is HireReady Resume AI really free?', a: 'Yes, completely free forever. You only need a Groq API key (also free) to use the AI features. No credit card, no subscription.' },
  { q: 'What AI model does it use?', a: 'HireReady Resume AI uses Groq llama-3.3-70b-versatile â€” one of the fastest and most capable open-source LLMs, completely free on Groq free tier.' },
  { q: 'How do I get a Groq API key?', a: 'Visit console.groq.com, sign up for free, and create an API key. Add it to the .env file as VITE_GROQ_API_KEY.' },
  { q: 'Can I export my resume to PDF?', a: 'Yes. The Resume Builder has an Export PDF button that generates a properly formatted A4 PDF with your chosen template.' },
  { q: 'How many resume templates are available?', a: 'There are 13 templates inspired by Reactive Resume: Azurill, Bronzor, Chikorita, Ditto, Gengar, Glalie, Kakuna, Lapras, Leafish, Onyx, Pikachu, Rhyhorn, and Ditgar.' },
  { q: 'Does it support all job roles?', a: 'Yes. HireReady Resume AI supports 14+ roles including Software Developer, Frontend/Backend/Full Stack Dev, Data Analyst, Data Scientist, ML Engineer, DevOps, Product Manager, UI/UX Designer, Marketing Manager, Business Analyst, MERN Developer, and Java Developer.' },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={open ? styles.faqItemOpen : styles.faqItem}>
      <button className={styles.faqQ} onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className={styles.faqA}>{a}</div>}
    </div>
  )
}

export default function Landing() {
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <Link to="/" className={styles.navLogo}><Zap size={18} /><span>HireReady</span></Link>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#templates">Templates</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#faq">FAQ</a>
          </div>
          <Link to="/auth" className={styles.navCta}>Get Started <ArrowRight size={14} /></Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroBadge}><Sparkles size={12} /><span>Powered by Groq AI</span></div>
        <h1 className={styles.heroTitle}>
          Finally,<br />
          <span className={styles.heroAccent}>a free and open-source</span><br />
          interview prep suite.
        </h1>
        <p className={styles.heroSub}>
          HireReady Resume AI simplifies the process of building resumes, practicing interviews,
          closing skill gaps, and tracking your readiness â€” all in one place, completely free.
        </p>
        <div className={styles.heroBtns}>
          <Link to="/auth" className={styles.btnPrimary}>Get Started <ArrowRight size={15} /></Link>
          <a href="#features" className={styles.btnGhost}>Learn More</a>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}><span className={styles.heroStatNum}>10k+</span><span className={styles.heroStatLabel}>Users Prepared</span></div>
          <div className={styles.heroStatDiv} />
          <div className={styles.heroStat}><span className={styles.heroStatNum}>13</span><span className={styles.heroStatLabel}>Resume Templates</span></div>
          <div className={styles.heroStatDiv} />
          <div className={styles.heroStat}><span className={styles.heroStatNum}>6</span><span className={styles.heroStatLabel}>AI Modules</span></div>
        </div>
      </section>

      <section id="features" className={styles.section}>
        <div className={styles.sectionTag}>Features</div>
        <h2 className={styles.sectionTitle}>Everything you need to get hired.</h2>
        <p className={styles.sectionSub}>Built with privacy in mind, powered by open-source AI, and completely free forever.</p>
        <div className={styles.featuresGrid}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className={styles.featureCard}>
              <div className={styles.featureIconWrap}><Icon size={20} strokeWidth={1.8} /></div>
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="templates" className={styles.templatesSection}>
        <div className={styles.templatesSectionInner}>
          <div className={styles.sectionTag}>Templates</div>
          <h2 className={styles.sectionTitle}>Explore our diverse selection of templates.</h2>
          <p className={styles.sectionSub}>Each template is designed to fit different styles, professions, and personalities. HireReady Resume AI offers {TEMPLATES.length} templates, with more on the way.</p>
        </div>
        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeTrack}>
            {[...TEMPLATES, ...TEMPLATES].map((t, i) => (
              <div key={i} className={styles.templateCard}>
                <img src={t.img} alt={t.name} className={styles.templateImg} />
                <div className={styles.templateName}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeTrackReverse}>
            {[...TEMPLATES.slice().reverse(), ...TEMPLATES.slice().reverse()].map((t, i) => (
              <div key={i} className={styles.templateCard}>
                <img src={t.img} alt={t.name} className={styles.templateImg} />
                <div className={styles.templateName}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.templatesCta}>
          <Link to="/resume" className={styles.btnPrimary}>Build Your Resume <ArrowRight size={15} /></Link>
        </div>
      </section>

      <section id="testimonials" className={styles.section}>
        <div className={styles.sectionTag}>Testimonials</div>
        <h2 className={styles.sectionTitle}>People who got hired.</h2>
        <p className={styles.sectionSub}>Thousands of candidates have used HireReady Resume AI to land their dream jobs.</p>
        <div className={styles.testimonialsWrap}>
          <div className={styles.testimonialsRow}>
            {[...TESTIMONIALS.slice(0,5),...TESTIMONIALS.slice(0,5)].map((t,i) => (
              <div key={i} className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>â˜…â˜…â˜…â˜…â˜…</div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.name[0]}</div>
                  <div><div className={styles.testimonialName}>{t.name}</div><div className={styles.testimonialRole}>{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.testimonialsRowReverse}>
            {[...TESTIMONIALS.slice(5),...TESTIMONIALS.slice(5)].map((t,i) => (
              <div key={i} className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>â˜…â˜…â˜…â˜…â˜…</div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.name[0]}</div>
                  <div><div className={styles.testimonialName}>{t.name}</div><div className={styles.testimonialRole}>{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className={styles.section}>
        <div className={styles.sectionTag}>FAQ</div>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqList}>{FAQS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}</div>
      </section>

      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerInner}>
          <h2 className={styles.ctaTitle}>By the community,<br />for the community.</h2>
          <p className={styles.ctaSub}>HireReady Resume AI is free and open-source. Start your interview prep journey today â€” no account required, no credit card, no limits.</p>
          <div className={styles.ctaBtns}>
            <Link to="/auth" className={styles.btnPrimary}>Get Started Free <ArrowRight size={15} /></Link>
            <Link to="/resume" className={styles.btnGhost}>Build Resume</Link>
          </div>
          <div className={styles.ctaChecks}>
            {['No credit card required','Completely free','AI-powered by Groq'].map(t => (
              <span key={t}><CheckCircle size={13} /> {t}</span>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}><Zap size={18} /><span>HireReady</span></div>
            <p className={styles.footerTagline}>HireReady Resume AI — Your AI-powered career coach for resumes, mock interviews, skill gaps, and coding challenges.</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>Modules</div>
              <Link to="/auth">Dashboard</Link>
              <Link to="/resume">Resume Builder</Link>
              <Link to="/questions">Interview Q&A</Link>
              <Link to="/mock">Mock Interview</Link>
              <Link to="/learn">Learning Path</Link>
              <Link to="/skills">Skill Gap</Link>
              <Link to="/analytics">Analytics</Link>
            </div>
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>Resources</div>
              <a href="https://console.groq.com" target="_blank" rel="noreferrer">Get Groq API Key</a>
              <a href="https://rxresu.me" target="_blank" rel="noreferrer">Reactive Resume</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>Licensed under MIT.</span>
          <span>Made with <Heart size={12} className={styles.heart} /> for job seekers everywhere.</span>
          <span>HireReady Resume AI v1.0.0</span>
        </div>
      </footer>
    </div>
  )
}

