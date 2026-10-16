import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Sparkles, ArrowRight, Download, Braces, Share2, ChevronRight, ChevronDown, Check, Archive, Briefcase, FilePlus2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAllCVs, type CVData } from '@/lib/db'
import { cn, generateSlug } from '@/lib/utils'
import { rich, useI18n, usePageMeta } from '@/lib/i18n'
import { PipelineDiagram, StepFlow } from '@/components/FlowDiagrams'
import { HeroMockup, RecruiterChat } from '@/components/LandingAnimations'
import {
  AtsVignette, BackendVignette, BackupVignette, InstantVignette, PdfVignette, PrivacyVignette,
} from '@/components/Vignettes'
import { LanguageSwitcher } from '@/components/Language'
import { BrandLink, SiteFooter } from '@/components/SiteChrome'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Cactus, SmallCactus, Cloud, Sun, CVSheet, QuestionBubbles, Balloon, Birds, Sparkle,
} from '@/components/Illustrations'

// Same order as t.features.items.
const FEATURE_SCENES = [AtsVignette, PdfVignette, BackendVignette, InstantVignette, PrivacyVignette, BackupVignette]
const SHARING_ICONS = [Share2, Download, Braces, Archive]

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

/** Mobile-only bar that slides in once the hero CTA has scrolled away. */
function StickyCTA() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [show, setShow] = useState(() => window.scrollY > 640)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      inert={!show}
      className={cn(
        'md:hidden fixed inset-x-0 bottom-0 z-[80] glass border-t border-forest/20 px-4 py-3 transition-transform duration-300',
        show ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      <div className="flex items-center gap-3">
        <p className="flex-1 text-xs font-bold leading-tight">{t.sticky.text}</p>
        <Button variant="marigold" onClick={() => navigate('/create')}>
          {t.sticky.button} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [recentCVs, setRecentCVs] = useState<CVData[] | null>(null)
  usePageMeta(t.meta.home)

  useEffect(() => {
    getAllCVs().then(cvs => setRecentCVs(cvs.slice(0, 5)))
  }, [])

  return (
    <div className="min-h-screen overflow-x-clip pb-20 md:pb-0">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-forest/15">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-10 h-16 flex items-center justify-between gap-4">
          <BrandLink />
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold">
            <a href="#features" className="hover:underline underline-offset-4">{t.nav.features}</a>
            <a href="#how" className="hover:underline underline-offset-4">{t.nav.how}</a>
            <a href="#faq" className="hover:underline underline-offset-4">{t.nav.faq}</a>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact className="sm:hidden" />
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <Button size="sm" onClick={() => navigate('/create')} className="hidden sm:inline-flex">
              {t.common.buildCV} <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="top" className="max-w-[1200px] mx-auto px-5 sm:px-10 pt-10 sm:pt-20 pb-20 sm:pb-28">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 lg:gap-12 items-center">
          <div className="animate-fade-in">
            <p className="inline-flex items-center gap-2 rounded-full bg-forest text-cream px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider mb-6 sm:mb-7">
              <Sparkles className="w-3.5 h-3.5 text-marigold" aria-hidden="true" /> {t.hero.badge}
            </p>
            <h1 className="isolate font-display font-bold uppercase text-[52px] sm:text-[88px] lg:text-[104px] leading-[0.86] tracking-[-0.03em]">
              {t.hero.titleA}<br />{t.hero.titleB}{' '}
              <span className="relative inline-block italic pr-2">
                <span className="absolute left-0 right-0 bottom-[0.06em] h-[0.32em] bg-marigold -z-10 -rotate-1" aria-hidden="true" />
                {t.hero.titleC}
              </span>
            </h1>
            <p className="mt-6 sm:mt-7 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
              {rich(t.hero.lead, { who: <span className="text-foreground font-bold">{t.hero.leadWho}</span> })}
            </p>
            <div className="mt-8 sm:mt-9 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Button variant="marigold" size="lg" onClick={() => navigate('/create')} className="group">
                {t.hero.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <a href="#how" className="inline-flex items-center gap-1 font-bold px-1 py-2 hover:underline underline-offset-4">
                {t.hero.secondary} <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            <ul className="mt-9 sm:mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
              {t.hero.checks.map(text => (
                <li key={text} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-marigold border border-foreground flex items-center justify-center" aria-hidden="true">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <HeroMockup />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative scroll-mt-20 max-w-[1200px] mx-auto px-5 sm:px-10 py-20 sm:py-28">
        <Balloon className="absolute top-16 right-6 sm:right-16 w-14 sm:w-20 text-forest animate-bob" />
        <Cloud className="absolute top-40 right-32 w-24 text-forest animate-drift [animation-delay:-4s] hidden md:block" />
        <SectionHeading eyebrow={t.features.eyebrow} title={<>{t.features.titleA}<br />{t.features.titleB}</>}>
          {t.features.lead}
        </SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.features.items.map((feature, i) => {
            const Scene = FEATURE_SCENES[i]
            return (
              <div
                key={i}
                className="rounded-card border border-foreground bg-card shadow-stamp p-4 sm:p-5 transition-transform duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <Scene offset={(i % 3) * 2} />
                <div className="px-3 pt-6 pb-3">
                  <h3 className="font-display text-3xl font-bold uppercase tracking-[-0.03em] leading-none mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works — pipeline diagram + step flowchart */}
      <section id="how" className="scroll-mt-20 border-y border-forest/15 bg-parchment/60">
        <div className="relative max-w-[1200px] mx-auto px-5 sm:px-10 py-20 sm:py-28">
          <Cloud className="absolute top-14 right-6 sm:right-20 w-28 text-forest animate-drift" />
          <CVSheet className="absolute top-36 right-40 w-12 text-forest animate-bob [animation-delay:-2s] hidden lg:block" />
          <Sparkle className="twinkle absolute top-[46%] left-[8%] w-6 text-forest hidden md:block" />
          <Sparkle className="twinkle absolute bottom-[38%] right-[9%] w-5 text-forest [animation-delay:-1.2s] hidden md:block" />
          <SectionHeading eyebrow={t.how.eyebrow} title={<>{t.how.titleA}<br />{t.how.titleB}</>}>
            {t.how.lead}
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
            <SectionHeading eyebrow={t.sharing.eyebrow} title={<>{t.sharing.titleA}<br />{t.sharing.titleB}</>} />
            <ul className="space-y-7 -mt-4">
              {t.sharing.items.map((item, i) => {
                const Icon = SHARING_ICONS[i]
                return (
                  <li key={item.title} className="flex gap-5">
                    <span className="w-12 h-12 rounded-full bg-marigold border border-foreground flex items-center justify-center shrink-0" aria-hidden="true">
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="font-display text-2xl font-bold uppercase tracking-[-0.03em] leading-tight">{item.title}</p>
                      <p className="text-muted-foreground">{item.text}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
          <RecruiterChat />
        </div>
      </section>

      {/* Stat band */}
      <section className="relative overflow-hidden bg-marigold border-y border-forest">
        <Sparkle className="twinkle absolute top-6 right-8 w-7 text-forest" />
        <Sparkle className="twinkle absolute bottom-6 left-[45%] w-5 text-forest [animation-delay:-0.8s]" />
        <Birds className="absolute top-8 left-[30%] w-14 text-forest animate-drift hidden sm:block" />
        <div className="relative max-w-[1200px] mx-auto px-5 sm:px-10 py-16 sm:py-20 grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
          {t.stats.map(s => (
            <div key={s.label}>
              <p className="font-display text-5xl sm:text-6xl font-bold uppercase leading-none tracking-[-0.03em]">{s.value}</p>
              <p className="mt-2 font-bold">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Saved CVs: skeleton → list or empty state */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 pt-20 sm:pt-28" aria-busy={recentCVs === null}>
        <h2 className="font-display text-4xl font-bold uppercase tracking-[-0.03em] mb-8 flex items-center gap-3">
          <Briefcase className="w-7 h-7" strokeWidth={1.75} aria-hidden="true" /> {t.saved.title}
        </h2>
        {recentCVs === null && (
          <div className="grid sm:grid-cols-2 gap-4" aria-label={t.saved.loading}>
            {[0, 1].map(i => (
              <div key={i} className="flex items-center gap-3 rounded-full border border-forest/20 pl-2 pr-5 py-2">
                <Skeleton className="w-11 h-11 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-2.5 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}
        {recentCVs?.length === 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-card border border-dashed border-forest/40 bg-card/60 px-7 py-7">
            <span className="w-14 h-14 rounded-full bg-marigold border border-foreground flex items-center justify-center shrink-0" aria-hidden="true">
              <FilePlus2 className="w-6 h-6" strokeWidth={1.75} />
            </span>
            <div className="flex-1">
              <p className="font-display text-2xl font-bold uppercase tracking-[-0.02em] leading-tight">{t.saved.emptyTitle}</p>
              <p className="text-muted-foreground">{t.saved.emptyText}</p>
            </div>
            <Button onClick={() => navigate('/create')}>
              {t.saved.emptyCta} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
        {recentCVs && recentCVs.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {recentCVs.map(cv => (
              <button
                key={cv.email}
                className="group flex items-center justify-between gap-3 text-left rounded-full border border-foreground bg-card pl-2 pr-5 py-2 hover:bg-secondary transition-colors cursor-pointer"
                onClick={() => navigate(`/cv/${generateSlug(cv.email)}`)}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="w-11 h-11 rounded-full bg-marigold border border-foreground flex items-center justify-center font-display text-lg font-bold shrink-0" aria-hidden="true">
                    {cv.fullName.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold truncate">{cv.fullName}</span>
                    <span className="block text-xs text-muted-foreground truncate">{cv.email}</span>
                  </span>
                </span>
                <ChevronRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* FAQ — Monad accordion rows */}
      <section id="faq" className="scroll-mt-20 max-w-[1200px] mx-auto px-5 sm:px-10 py-20 sm:py-28">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-10 lg:gap-16">
          <div className="lg:sticky lg:top-28 self-start">
            <SectionHeading eyebrow={t.faq.eyebrow} title={<>{t.faq.titleA}<br />{t.faq.titleB}</>}>
              {t.faq.lead}
            </SectionHeading>
            <QuestionBubbles className="w-36 sm:w-44 text-forest -mt-4 animate-bob" />
          </div>
          <div className="border-t border-forest/25">
            {t.faq.items.map(f => (
              <details key={f.q} className="faq-item group border-b border-forest/25">
                <summary className="flex items-center justify-between gap-6 py-7 sm:py-9 cursor-pointer list-none">
                  <span className="font-display text-2xl sm:text-[28px] font-bold uppercase tracking-[-0.02em] leading-tight">
                    {f.q}
                  </span>
                  <span className="w-10 h-10 rounded-full border border-foreground flex items-center justify-center shrink-0 transition-all duration-300 group-open:rotate-180 group-open:bg-marigold" aria-hidden="true">
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
          <Sun className="absolute top-8 right-10 w-20 text-cream/70 hidden sm:block animate-spin-slow" />
          <Birds className="absolute top-12 right-40 w-16 text-cream/70 animate-drift hidden sm:block" />
          <SmallCactus className="absolute bottom-0 right-40 w-16 text-cream/60 hidden md:block origin-bottom animate-sway [animation-delay:-1.5s]" />
          <Cactus className="absolute -bottom-2 right-6 w-28 sm:w-36 text-cream/80 origin-bottom animate-sway" />
          <CVSheet className="absolute top-10 left-[55%] w-16 text-cream/40 hidden lg:block animate-bob" />
          <div className="relative max-w-xl">
            <h2 className="font-display text-5xl sm:text-7xl font-bold uppercase leading-[0.88] tracking-[-0.03em]">
              {t.cta.titleA}<br />{t.cta.titleB}
            </h2>
            <p className="mt-5 text-lg text-cream/80 max-w-md">{t.cta.text}</p>
            <Button variant="marigold" size="lg" onClick={() => navigate('/create')} className="mt-8 group">
              {t.cta.button}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
      <StickyCTA />
    </div>
  )
}
