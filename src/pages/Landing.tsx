import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight, Download, Braces, Share2, ChevronRight, Plus, Archive, Briefcase, FilePlus2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CVData } from '@/lib/db'
import { cn, generateSlug, stagger } from '@/lib/utils'
import { rich, useI18n, usePageMeta } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'
import { PipelineDiagram } from '@/components/FlowDiagrams'
import { HeroMockup, RecruiterChat } from '@/components/LandingAnimations'
import {
  AtsVignette, BackendVignette, BackupVignette, ExportVignette, FormVignette, InstantVignette, PdfVignette,
  PrivacyVignette,
} from '@/components/Vignettes'
import { InvitePanel, OfferPanel, StartPanel } from '@/components/StoryPanels'
import { SiteFooter, SiteHeader } from '@/components/SiteChrome'
import { ScrollStory, StepMeter } from '@/components/ScrollStory'
import { Hl, SectionHead } from '@/components/Section'
import { Mascot, type Pose, type Who } from '@/components/Mascot'
import Testimonials from '@/components/Testimonials'
import { Skeleton } from '@/components/ui/skeleton'

// Same order as t.features.items and t.how.steps.
const FEATURE_SCENES = [AtsVignette, PdfVignette, BackendVignette, InstantVignette, PrivacyVignette, BackupVignette]
const STEP_SCENES: React.ComponentType<{ offset?: number }>[] = [StartPanel, FormVignette, ExportVignette, InvitePanel, OfferPanel]
const STEP_CAST: [Who, Pose][] = [['arya', 'think'], ['arya', 'type'], ['dimas', 'phone'], ['rina', 'wave'], ['arya', 'cheer']]
const SHARING_ICONS = [Share2, Download, Braces, Archive]

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

/** Dark hero: the grid drifts, and a brighter copy of it follows the pointer. */
function Hero() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const ref = useRef<HTMLElement>(null)

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
    el.setAttribute('data-lit', '')
  }

  return (
    <section
      id="top"
      ref={ref}
      data-header="dark"
      onPointerMove={onMove}
      onPointerLeave={() => ref.current?.removeAttribute('data-lit')}
      className="on-dark relative -mt-16 min-h-svh flex flex-col justify-center overflow-clip bg-forest text-cream"
    >
      <div className="hero-grid" aria-hidden="true"><span /></div>
      <div className="hero-grid is-glow" aria-hidden="true"><span /></div>
      <div className="relative w-full max-w-[1240px] mx-auto px-5 sm:px-10 pt-28 sm:pt-36 pb-20 sm:pb-24 grid lg:grid-cols-[1.08fr_1fr] gap-16 lg:gap-10 items-center">
        <div className="-rotate-2 origin-left">
          <p className="flex flex-wrap items-center gap-x-2 text-xs font-bold text-marigold mb-6 animate-fade-in">
            <span>{t.hero.eyebrow}</span>
            <span aria-hidden="true">·</span>
            <span>{t.hero.eyebrowTail}</span>
            <span className="w-9 h-0.5 bg-marigold ml-1" aria-hidden="true" />
          </p>
          <h1 className="h-display text-[clamp(44px,6.6vw,92px)] leading-[0.98] animate-slide-up">
            {t.hero.titleA}
            <br />
            {t.hero.titleB} <Hl>{t.hero.titleHl}</Hl>
          </h1>
          <p className="mt-7 text-lg sm:text-xl text-cream/75 leading-relaxed max-w-xl">
            {rich(t.hero.lead, { who: <span className="text-cream font-bold">{t.hero.leadWho}</span> })}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Button
              variant="marigold"
              size="lg"
              onClick={() => navigate('/create')}
              className="group shadow-[4px_4px_0_0_var(--color-forest-deep)] hover:shadow-[6px_6px_0_0_var(--color-forest-deep)] active:shadow-[1px_1px_0_0_var(--color-forest-deep)]"
            >
              {t.hero.cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <a href="#how" className="link-mark inline-flex items-center gap-2 font-bold py-2">
              {t.hero.secondary} <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          <p className="mt-3 font-script text-2xl text-marigold/90 -rotate-2 origin-left">{t.hero.scribble}</p>
          <ul className="mt-8 flex flex-wrap gap-x-2 gap-y-1 text-sm text-cream/60">
            {t.hero.proof.map((item, i) => (
              <li key={item} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">·</span>}
                {item}
              </li>
            ))}
          </ul>
        </div>
        <HeroMockup />
      </div>
    </section>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const { hash } = useLocation()
  const { t, lang } = useI18n()
  const [recentCVs, setRecentCVs] = useState<CVData[] | null>(null)
  usePageMeta(t.meta.home)
  useReveal(lang)

  // Arriving from another page via "/#faq": scroll once the section exists.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  // Forest page canvas while the landing is up, so overscroll and the first paint
  // match the dark hero (index.html sets the same flag before any script runs).
  useEffect(() => {
    const root = document.documentElement
    root.dataset.page = 'landing'
    return () => {
      delete root.dataset.page
    }
  }, [])

  useEffect(() => {
    // Dynamic so Dexie stays out of the landing's first load.
    import('@/lib/db').then(({ getAllCVs }) => getAllCVs()).then(cvs => setRecentCVs(cvs.slice(0, 5)))
  }, [])

  const startCTA = (label: string) => (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <Button variant="marigold" size="lg" onClick={() => navigate('/create')} className="group">
        {label}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>
      <span className="font-script text-2xl font-bold text-script -rotate-2">{t.how.scribble}</span>
    </div>
  )

  return (
    <div className="min-h-screen overflow-x-clip pb-20 md:pb-0">
      <SiteHeader />
      <main>
        <Hero />

        {/* Features */}
        <section id="features" data-header="light" className="section scroll-mt-16">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-10">
            <SectionHead
              kicker={t.features.kicker}
              title={<>{t.features.titleA} <Hl>{t.features.titleHl}</Hl></>}
              lead={t.features.lead}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {t.features.items.map((feature, i) => {
                const Scene = FEATURE_SCENES[i]
                return (
                  <div
                    key={i}
                    data-reveal
                    style={stagger((i % 3) * 0.08)}
                    className="rounded-card border-2 border-forest bg-card shadow-stamp p-3.5 sm:p-4 transition-[transform,box-shadow] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-stamp-lg"
                  >
                    <Scene offset={(i % 3) * 2} />
                    <div className="px-2.5 pt-5 pb-2.5">
                      <h3 className="h-display text-[26px] mb-2.5">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works: sticky story, then the pipeline behind it */}
        <section id="how" data-header="light" className="section scroll-mt-16 border-t border-forest/10 bg-paper-mid [--story-bg:var(--color-paper-mid)]">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-10">
            <SectionHead
              kicker={t.how.kicker}
              title={<>{t.how.titleA} <Hl>{t.how.titleHl}</Hl></>}
              lead={t.how.lead}
              className="mb-0 sm:mb-4"
            />
            <ScrollStory
              steps={t.how.steps}
              meter={[t.how.meterStart, t.how.meterEnd]}
              renderPanel={i => {
                const Scene = STEP_SCENES[i]
                return <Scene offset={i * 2} />
              }}
              renderMascot={i => <Mascot who={STEP_CAST[i][0]} pose={STEP_CAST[i][1]} />}
              action={startCTA(t.how.cta)}
            />

            <div className="mt-24 sm:mt-32 text-center">
              <p className="kicker mb-3" data-reveal>{t.how.pipelineKicker}</p>
              <h3 className="h-display text-[clamp(28px,3.4vw,44px)] mb-12 sm:mb-16" data-reveal style={stagger(0.08)}>
                {t.how.pipelineTitle}
              </h3>
              <PipelineDiagram />
            </div>
          </div>
        </section>

        {/* Send to recruiters: dark band */}
        <section id="share" data-header="dark" className="section on-dark scroll-mt-16 relative overflow-clip bg-forest">
          <div className="dot-grid absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="relative max-w-[1240px] mx-auto px-5 sm:px-10 grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div>
              <SectionHead
                stacked
                kicker={t.sharing.kicker}
                title={<>{t.sharing.titleA} <Hl>{t.sharing.titleHl}</Hl></>}
                className="mb-10"
              />
              <ul className="space-y-6">
                {t.sharing.items.map((item, i) => {
                  const Icon = SHARING_ICONS[i]
                  return (
                    <li key={item.title} className="flex gap-5" data-reveal style={stagger(i * 0.08)}>
                      <span className="w-12 h-12 rounded-full bg-marigold text-forest border-2 border-forest-deep flex items-center justify-center shrink-0" aria-hidden="true">
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </span>
                      <div>
                        <p className="h-display text-[22px]">{item.title}</p>
                        <p className="mt-1 text-muted-foreground">{item.text}</p>
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
        <section data-header="accent" className="bg-marigold border-y-2 border-forest">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-10 py-14 sm:py-16 grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
            {t.stats.map((s, i) => (
              <div key={s.label} data-reveal style={stagger(i * 0.08)}>
                <p className="h-display text-5xl sm:text-6xl">{s.value}</p>
                <p className="mt-2 font-bold">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials + saved CVs */}
        <section id="stories" data-header="light" className="section scroll-mt-16">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-10">
            <Testimonials />

            <div className="mt-24 sm:mt-28" aria-busy={recentCVs === null}>
              <h2 className="h-display text-3xl sm:text-4xl mb-7 flex items-center gap-3">
                <Briefcase className="w-7 h-7" strokeWidth={2} aria-hidden="true" /> {t.saved.title}
              </h2>
              {recentCVs === null && (
                <div className="grid sm:grid-cols-2 gap-4" aria-label={t.saved.loading}>
                  {[0, 1].map(i => (
                    <div key={i} className="flex items-center gap-3 rounded-2xl border-2 border-forest/15 pl-2 pr-5 py-2">
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-card border-2 border-dashed border-forest/35 bg-card/70 px-6 py-6">
                  <span className="w-14 h-14 rounded-full bg-marigold border-2 border-forest flex items-center justify-center shrink-0" aria-hidden="true">
                    <FilePlus2 className="w-6 h-6" strokeWidth={2} />
                  </span>
                  <div className="flex-1">
                    <p className="h-display text-2xl">{t.saved.emptyTitle}</p>
                    <p className="text-muted-foreground mt-1">{t.saved.emptyText}</p>
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
                      className="group flex items-center justify-between gap-3 text-left rounded-2xl border-2 border-forest bg-card pl-2 pr-5 py-2 shadow-stamp-sm hover:-translate-y-0.5 hover:shadow-stamp transition-[transform,box-shadow] cursor-pointer"
                      onClick={() => navigate(`/cv/${generateSlug(cv.email)}`)}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="w-11 h-11 rounded-full bg-marigold border-2 border-forest flex items-center justify-center font-display text-lg font-bold shrink-0" aria-hidden="true">
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
            </div>
          </div>
        </section>

        {/* FAQ: sticky heading, accordion card */}
        <section id="faq" data-header="light" className="section scroll-mt-16 border-t border-forest/10 bg-paper-mid">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-10 grid lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-16">
            <div className="lg:sticky lg:top-28 self-start">
              <SectionHead
                stacked
                kicker={t.faq.kicker}
                title={<>{t.faq.titleA} <Hl>{t.faq.titleHl}</Hl></>}
                lead={t.faq.lead}
                className="mb-6"
              />
              <Mascot who="sekar" pose="think" className="hidden lg:block w-44 -ml-2" />
            </div>
            <div className="rounded-card border-2 border-forest bg-card shadow-stamp px-5 sm:px-8" data-reveal>
              {t.faq.items.map((f, i) => (
                <details key={f.q} className={cn('faq-item group', i > 0 && 'border-t border-forest/15')}>
                  <summary className="flex items-center justify-between gap-6 py-5 sm:py-6 cursor-pointer list-none">
                    <span className="text-[17px] sm:text-lg font-bold leading-snug">{f.q}</span>
                    <span className="w-9 h-9 rounded-full bg-forest text-cream flex items-center justify-center shrink-0 transition-transform duration-300 group-open:rotate-45 group-open:bg-marigold group-open:text-forest" aria-hidden="true">
                      <Plus className="w-5 h-5" strokeWidth={2.5} />
                    </span>
                  </summary>
                  <p className="pb-6 -mt-1 max-w-2xl text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing card */}
        <section data-header="light" className="px-5 sm:px-10 pt-6 pb-24 sm:pb-32">
          <div data-reveal className="relative max-w-[1080px] mx-auto rotate-[-1.2deg] rounded-[28px] bg-forest text-cream border-2 border-forest-deep shadow-stamp-marigold px-6 py-14 sm:px-16 sm:py-20 on-dark">
            <div className="text-center">
              <StepMeter
                dark
                count={t.how.steps.length}
                active={0}
                ends={[t.how.meterStart, t.how.meterEnd]}
                caption={t.cta.here}
                className="mx-auto max-w-xl mb-14"
              />
              <h2 className="h-display text-[clamp(38px,6vw,76px)] leading-[1] max-w-3xl mx-auto">
                {t.cta.titleA} <Hl>{t.cta.titleHl}</Hl>
              </h2>
              <p className="mt-6 text-lg text-cream/75 max-w-xl mx-auto">{t.cta.text}</p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                <Button
                  variant="marigold"
                  size="lg"
                  onClick={() => navigate('/create')}
                  className="group shadow-stamp-cream hover:shadow-[6px_6px_0_0_var(--color-cream)] active:shadow-[1px_1px_0_0_var(--color-cream)]"
                >
                  {t.cta.button}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <a href="#faq" className="link-mark inline-flex items-center gap-2 font-bold">
                  {t.cta.secondary} <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <StickyCTA />
    </div>
  )
}
