import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Sparkles, ArrowRight, FileText, Download, Code2, Zap, ShieldCheck, Braces,
  ChevronRight, ChevronDown, Check, Archive, Paperclip, Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAllCVs, type CVData } from '@/lib/db'
import { cn, generateSlug } from '@/lib/utils'
import { PipelineDiagram, StepFlow } from '@/components/FlowDiagrams'
import { useInView } from '@/lib/useInView'
import {
  Cactus, SmallCactus, Cloud, Sun, CVSheet, PaperPlane, Magnifier, LogoMark,
} from '@/components/Illustrations'

const features = [
  {
    icon: FileText,
    title: 'ATS-Optimized',
    description: 'Clean, parseable format that passes through Applicant Tracking Systems with zero friction.',
  },
  {
    icon: Download,
    title: 'PDF Export',
    description: 'Real text, not screenshots — a PDF that job portals and ATS parsers can actually read.',
  },
  {
    icon: Code2,
    title: 'Backend Focused',
    description: 'Tailored for Backend Developers. Showcase your projects, tech stack, and system design skills.',
  },
  {
    icon: Zap,
    title: 'Instant Generation',
    description: 'Fill the form, hit generate. Your professional CV is ready in seconds — no sign-up required.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy First',
    description: 'All data stored locally in your browser. Zero server uploads. Your data stays with you.',
  },
  {
    icon: Braces,
    title: 'Backup & Restore',
    description: 'Export any CV as JSON and import it on another browser or device in one click.',
  },
]

const faqs = [
  {
    q: 'Is CV Forge really free?',
    a: 'Yes. There is no account, no paywall and no watermark. Open the builder and start typing.',
  },
  {
    q: 'Where is my data stored?',
    a: 'In your own browser (IndexedDB). Nothing is uploaded to a server. Clearing your browser\'s site data removes your CVs, so export a JSON backup of anything you want to keep.',
  },
  {
    q: 'What makes the PDF ATS-friendly?',
    a: 'It is generated as real, selectable text in a single column with standard section headings — no images, tables or text boxes that trip up parsers.',
  },
  {
    q: 'Can I move my CVs to another device?',
    a: 'Yes. Choose Export JSON from a CV\'s menu, then use Import on the other browser. If a CV with the same email already exists there, you will be asked before it is replaced.',
  },
  {
    q: 'Who can open my CV preview page?',
    a: 'Only browsers that have the CV saved — the data never leaves your device. To send your CV to a recruiter, download the PDF and attach it.',
  },
  {
    q: 'Can I keep more than one version?',
    a: 'Yes. Each email is its own CV. Archive the ones you are not using right now and restore them whenever you need them.',
  },
]

const stats = [
  { value: '0', label: 'Accounts needed' },
  { value: '100%', label: 'Stored in your browser' },
  { value: '1 click', label: 'To a clean PDF' },
  { value: 'JSON', label: 'Backup & restore' },
]

const chat = [
  { from: 'them', text: 'Hi! Loved your profile. Could you send over your latest CV?' },
  { from: 'me', text: 'Sure — here it is.', file: 'jane-doe-cv.pdf' },
  { from: 'them', text: 'Clean format, our ATS read every section. Free for a call on Monday?' },
  { from: 'me', text: 'Monday works. Talk then!' },
] as const

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="max-w-2xl mb-12 sm:mb-16">
      <p className="inline-flex items-center gap-2 rounded-full border border-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider mb-5">
        <span className="w-2 h-2 rounded-full bg-fern" /> {eyebrow}
      </p>
      <h2 className="font-display font-bold uppercase text-5xl sm:text-6xl leading-[0.9] tracking-[-0.03em]">
        {title}
      </h2>
      {children && <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{children}</p>}
    </div>
  )
}

function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none">
      <Sun className="absolute -top-10 right-2 w-24 text-forest animate-float" />
      <Cloud className="absolute top-6 -left-10 w-28 text-forest hidden sm:block" />
      <Cactus className="absolute -bottom-6 -right-6 sm:-right-14 w-28 sm:w-36 text-forest" />

      <div className="relative rounded-card border border-foreground bg-card shadow-stamp p-6 sm:p-8 rotate-[-1.5deg]">
        <div className="flex items-center justify-between mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-forest text-cream pl-1.5 pr-3.5 py-1.5 text-xs font-bold">
            <span className="w-5 h-5 rounded-full bg-marigold text-forest flex items-center justify-center">
              <Paperclip className="w-3 h-3" />
            </span>
            jane-doe-cv.pdf
          </span>
          <span className="rounded-full bg-marigold border border-foreground px-3 py-1 text-[11px] font-bold uppercase">
            ATS-ready
          </span>
        </div>
        <p className="font-display text-4xl font-bold uppercase leading-none tracking-[-0.03em]">Jane Doe</p>
        <p className="text-sm font-bold text-muted-foreground mt-1 mb-5">Senior Backend Engineer · Jakarta</p>

        {([['Summary', 3], ['Experience', 4]] as const).map(([label, lines]) => (
          <div key={label} className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2">{label}</p>
            <div className="h-px bg-forest/20 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: lines }, (_, i) => (
                <div key={i} className="h-2 rounded-full bg-forest/15" style={{ width: `${92 - i * 14}%` }} />
              ))}
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-1.5">
          {['Go', 'PostgreSQL', 'Kafka', 'Docker'].map(s => (
            <span key={s} className="rounded-full bg-forest text-cream px-3 py-1 text-xs font-bold">{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChatDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3)
  return (
    <div ref={ref} className={cn('relative', inView && 'in-view')}>
      <PaperPlane className="absolute -top-14 right-4 w-28 text-forest animate-float" />
      <div className="relative rounded-card border border-foreground bg-card shadow-stamp p-5 sm:p-7">
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-forest/15">
          <span className="w-10 h-10 rounded-full bg-marigold border border-foreground flex items-center justify-center font-display font-bold">
            RT
          </span>
          <div>
            <p className="font-bold leading-tight">Rina · Talent Acquisition</p>
            <p className="text-xs text-muted-foreground">Illustrative conversation</p>
          </div>
        </div>
        <div className="space-y-3">
          {chat.map((m, i) => (
            <div
              key={i}
              className={cn('reveal flex items-end gap-2', m.from === 'me' && 'flex-row-reverse')}
              style={{ transitionDelay: `${300 + i * 700}ms` }}
            >
              <span className={cn(
                'w-8 h-8 rounded-full border border-foreground flex items-center justify-center text-[11px] font-bold shrink-0',
                m.from === 'me' ? 'bg-forest text-cream' : 'bg-marigold',
              )}>
                {m.from === 'me' ? 'JD' : 'RT'}
              </span>
              <div className={cn(
                'max-w-[80%] px-4 py-3 text-sm font-semibold leading-snug border',
                m.from === 'me'
                  ? 'bg-forest text-cream border-forest rounded-[24px] rounded-br-md'
                  : 'bg-white text-forest border-forest/30 rounded-[24px] rounded-bl-md',
              )}>
                {m.text}
                {'file' in m && (
                  <span className="mt-2 flex items-center gap-2 rounded-full bg-cream text-forest px-3 py-1.5 text-xs font-bold">
                    <FileText className="w-3.5 h-3.5" /> {m.file}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [recentCVs, setRecentCVs] = useState<CVData[]>([])

  useEffect(() => {
    getAllCVs().then(cvs => setRecentCVs(cvs.slice(0, 5)))
  }, [])

  return (
    <div className="min-h-screen overflow-x-clip">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-forest/15">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-10 h-16 flex items-center justify-between gap-6">
          <a href="#top" className="flex items-center gap-2.5">
            <LogoMark className="w-9 h-9" />
            <span className="font-display text-2xl font-bold uppercase tracking-[-0.02em]">CV Forge</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold">
            <a href="#features" className="hover:underline underline-offset-4">Features</a>
            <a href="#how" className="hover:underline underline-offset-4">How it works</a>
            <a href="#faq" className="hover:underline underline-offset-4">FAQ</a>
          </div>
          <Button size="sm" onClick={() => navigate('/create')}>
            Create CV <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section id="top" className="max-w-[1200px] mx-auto px-5 sm:px-10 pt-12 sm:pt-20 pb-20 sm:pb-28">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 lg:gap-12 items-center">
          <div className="animate-fade-in">
            <p className="inline-flex items-center gap-2 rounded-full bg-forest text-cream px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider mb-7">
              <Sparkles className="w-3.5 h-3.5 text-marigold" /> Free · No sign-up
            </p>
            <h1 className="isolate font-display font-bold uppercase text-[52px] sm:text-[88px] lg:text-[104px] leading-[0.86] tracking-[-0.03em]">
              Build a CV<br />that gets you{' '}
              <span className="relative inline-block italic pr-2">
                <span className="absolute left-0 right-0 bottom-[0.06em] h-[0.32em] bg-marigold -z-10 -rotate-1" />
                hired.
              </span>
            </h1>
            <p className="mt-7 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
              An ATS-friendly CV builder for{' '}
              <span className="text-foreground font-bold">Backend Developers</span>. Fill one form,
              preview it instantly, export a clean PDF — everything stays in your browser.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Button variant="marigold" size="lg" onClick={() => navigate('/create')} className="group">
                Start building your CV
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <a href="#how" className="inline-flex items-center gap-1 font-bold px-1 py-2 hover:underline underline-offset-4">
                See how it works <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
              {['ATS compliant', 'Live preview', 'PDF & JSON export'].map(t => (
                <li key={t} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-marigold border border-foreground flex items-center justify-center">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <HeroMockup />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 max-w-[1200px] mx-auto px-5 sm:px-10 py-20 sm:py-28">
        <SectionHeading eyebrow="Features" title={<>Everything you need<br />to stand out</>}>
          Purpose-built for Backend Developers who want to leave a lasting impression on recruiters and hiring managers.
        </SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(feature => (
            <div
              key={feature.title}
              className="group rounded-card border border-foreground bg-card shadow-stamp p-8 transition-transform duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <span className="w-12 h-12 rounded-full bg-marigold border border-foreground flex items-center justify-center mb-6 group-hover:rotate-[-8deg] transition-transform">
                <feature.icon className="w-5 h-5" strokeWidth={1.75} />
              </span>
              <h3 className="font-display text-3xl font-bold uppercase tracking-[-0.03em] leading-none mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — pipeline diagram + step flowchart */}
      <section id="how" className="scroll-mt-20 border-y border-forest/15 bg-parchment/60">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-20 sm:py-28">
          <SectionHeading eyebrow="How it works" title={<>From form to<br />finished CV</>}>
            Everything you type flows through one formatter and comes out ready for a recruiter — as a PDF, a preview page, or a JSON backup.
          </SectionHeading>
          <PipelineDiagram />
          <div className="mt-20 sm:mt-28">
            <StepFlow />
          </div>
        </div>
      </section>

      {/* Chat bubbles */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeading eyebrow="Sharing" title={<>Ready the moment<br />a recruiter asks</>} />
            <ul className="space-y-7 -mt-4">
              {[
                { icon: Download, title: 'Download a clean PDF', text: 'One click, text-based, parsed correctly by ATS software.' },
                { icon: Braces, title: 'Back up as JSON', text: 'Keep a copy or move it to another device.' },
                { icon: Archive, title: 'Keep every version', text: 'Archive CVs you are not using and bring them back anytime.' },
              ].map(item => (
                <li key={item.title} className="flex gap-5">
                  <span className="w-12 h-12 rounded-full bg-marigold border border-foreground flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="font-display text-2xl font-bold uppercase tracking-[-0.03em] leading-tight">{item.title}</p>
                    <p className="text-muted-foreground">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <ChatDemo />
        </div>
      </section>

      {/* Stat band */}
      <section className="bg-marigold border-y border-forest">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-16 sm:py-20 grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
          {stats.map(s => (
            <div key={s.label}>
              <p className="font-display text-5xl sm:text-6xl font-bold uppercase leading-none tracking-[-0.03em]">{s.value}</p>
              <p className="mt-2 font-bold">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Saved CVs */}
      {recentCVs.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-5 sm:px-10 pt-20 sm:pt-28">
          <h2 className="font-display text-4xl font-bold uppercase tracking-[-0.03em] mb-8 flex items-center gap-3">
            <Briefcase className="w-7 h-7" strokeWidth={1.75} /> Your saved CVs
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {recentCVs.map(cv => (
              <button
                key={cv.email}
                className="group flex items-center justify-between gap-3 text-left rounded-full border border-foreground bg-card pl-2 pr-5 py-2 hover:bg-secondary transition-colors cursor-pointer"
                onClick={() => navigate(`/cv/${generateSlug(cv.email)}`)}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="w-11 h-11 rounded-full bg-marigold border border-foreground flex items-center justify-center font-display text-lg font-bold shrink-0">
                    {cv.fullName.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold truncate">{cv.fullName}</span>
                    <span className="block text-xs text-muted-foreground truncate">{cv.email}</span>
                  </span>
                </span>
                <ChevronRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* FAQ — Monad accordion rows */}
      <section id="faq" className="scroll-mt-20 max-w-[1200px] mx-auto px-5 sm:px-10 py-20 sm:py-28">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-10 lg:gap-16">
          <div className="lg:sticky lg:top-28 self-start">
            <SectionHeading eyebrow="FAQ" title={<>Questions,<br />answered</>}>
              Still unsure? Everything about how your data and files are handled.
            </SectionHeading>
            <Magnifier className="hidden lg:block w-28 text-forest -mt-4" />
          </div>
          <div className="border-t border-forest/25">
            {faqs.map(f => (
              <details key={f.q} className="faq-item group border-b border-forest/25">
                <summary className="flex items-center justify-between gap-6 py-7 sm:py-9 cursor-pointer list-none">
                  <span className="font-display text-2xl sm:text-[28px] font-bold uppercase tracking-[-0.02em] leading-tight">
                    {f.q}
                  </span>
                  <span className="w-10 h-10 rounded-full border border-foreground flex items-center justify-center shrink-0 transition-all duration-300 group-open:rotate-180 group-open:bg-marigold">
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </summary>
                <p className="pb-8 -mt-2 max-w-2xl text-lg text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="px-5 sm:px-10 pb-20 sm:pb-28">
        <div className="relative max-w-[1200px] mx-auto overflow-hidden rounded-card bg-forest text-cream px-7 py-14 sm:px-16 sm:py-20">
          <Sun className="absolute top-8 right-10 w-20 text-cream/70 hidden sm:block" />
          <SmallCactus className="absolute bottom-0 right-40 w-16 text-cream/60 hidden md:block" />
          <Cactus className="absolute -bottom-2 right-6 w-28 sm:w-36 text-cream/80" />
          <CVSheet className="absolute top-10 left-[55%] w-16 text-cream/40 hidden lg:block rotate-12" />
          <div className="relative max-w-xl">
            <h2 className="font-display text-5xl sm:text-7xl font-bold uppercase leading-[0.88] tracking-[-0.03em]">
              Ready to land<br />your next role?
            </h2>
            <p className="mt-5 text-lg text-cream/80 max-w-md">
              Build a CV that passes ATS filters, impresses hiring managers, and gets you to the interview stage.
            </p>
            <Button variant="marigold" size="lg" onClick={() => navigate('/create')} className="mt-8 group">
              Create your CV now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-forest/15">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoMark className="w-7 h-7" />
            <span className="font-display text-lg font-bold uppercase">CV Forge</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Built for Backend Developers. All data stored locally in your browser.
          </p>
        </div>
      </footer>
    </div>
  )
}
