import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Mail, Phone, MapPin, ArrowLeft, ArrowRight, Download, Share2,
  Briefcase, Code2, FolderKanban, Calendar, CheckCircle2, LoaderCircle, CircleAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cvShareUrl, decodeCVShare, getCVBySlug, type CVData } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { useI18n, usePageMeta } from '@/lib/i18n'
import { Mascot, MascotAvatar } from '@/components/Mascot'
import { BrandLink } from '@/components/SiteChrome'
import { LanguageSwitcher } from '@/components/Language'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip } from '@/components/ui/tooltip'
import { SHORTCUTS, useShortcut } from '@/lib/shortcuts'

export default function CVPreview() {
  const { slug } = useParams<{ slug: string }>()
  const { hash } = useLocation()
  // /cv/:slug reads this browser's IndexedDB; /cv-share#<data> carries the CV in the link.
  const shared = !slug
  const navigate = useNavigate()
  const { t, lang } = useI18n()
  const p = t.preview
  const [localCV, setLocalCV] = useState<CVData | null>(null)
  const [localLoading, setLocalLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [pdfError, setPdfError] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      if (!slug) return
      const data = await getCVBySlug(slug)
      setLocalCV(data ?? null)
      setLocalLoading(false)
    }
    load()
  }, [slug])

  const sharedCV = useMemo(() => {
    if (!shared) return null
    try {
      return decodeCVShare(hash.slice(1))
    } catch {
      return null
    }
  }, [shared, hash])

  const cv = shared ? sharedCV : localCV
  const loading = !shared && localLoading

  const pageMeta = shared ? t.meta.share : t.meta.preview
  usePageMeta({ title: cv ? `${cv.fullName} — ${pageMeta.title}` : pageMeta.title, description: pageMeta.description })

  const exportToPDF = async () => {
    if (!cv) return
    setExporting(true)
    setPdfError(false)
    // Let the spinner paint before jsPDF blocks the main thread.
    await new Promise(r => setTimeout(r, 30))
    try {
      // jsPDF is large and only needed here, so it loads on first click instead of with every page.
      const { generateATSPDF } = await import('@/lib/pdf-generator')
      generateATSPDF(cv, t.cv, lang)
    } catch (err) {
      console.error('PDF export failed:', err)
      setPdfError(true)
    } finally {
      setExporting(false)
    }
  }

  const shareLink = async () => {
    if (!cv) return
    const url = shared ? window.location.href : cvShareUrl(cv)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard API can be blocked (permissions, older browsers): fall back to a hidden textarea.
      const ta = document.createElement('textarea')
      ta.value = url
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEdit = () => {
    if (cv) {
      navigate(`/create?email=${encodeURIComponent(cv.email)}`)
    } else {
      navigate('/create')
    }
  }

  useShortcut(SHORTCUTS.edit, handleEdit, { enabled: !shared })
  useShortcut(SHORTCUTS.share, shareLink, { enabled: !!cv })
  useShortcut(SHORTCUTS.pdf, () => !exporting && exportToPDF(), { enabled: !!cv })

  const pdfIcon = exporting
    ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
    : <Download className="w-3.5 h-3.5" aria-hidden="true" />
  const shareIcon = copied
    ? <CheckCircle2 className="w-3.5 h-3.5 text-success" aria-hidden="true" />
    : <Share2 className="w-3.5 h-3.5" aria-hidden="true" />

  const header = (
    <div className="sticky top-0 z-50 glass no-print">
      <div className="max-w-[850px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {shared ? (
          <BrandLink size="sm" />
        ) : (
          <Tooltip label={p.backToEdit} shortcut={SHORTCUTS.edit} align="start">
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <ArrowLeft className="w-4 h-4" /> {p.backToEdit}
            </Button>
          </Tooltip>
        )}
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          {cv && (
            <div className="hidden sm:flex items-center gap-2">
              <Tooltip label={p.shareTip} shortcut={SHORTCUTS.share}>
                <Button variant="outline" size="sm" onClick={shareLink}>
                  {shareIcon} {copied ? p.copied : p.share}
                </Button>
              </Tooltip>
              <Tooltip label={p.pdfTip} shortcut={SHORTCUTS.pdf} align="end">
                <Button size="sm" onClick={exportToPDF} disabled={exporting}>
                  {pdfIcon} {exporting ? p.pdfBusy : p.pdf}
                </Button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background" aria-busy="true" aria-label={p.loading}>
        {header}
        <div className="max-w-[850px] mx-auto px-4 py-8 sm:py-12">
          <div className="rounded-card border-2 border-forest/15 bg-card p-6 sm:p-10 space-y-9">
            <div className="space-y-3">
              <Skeleton className="h-11 w-2/3 rounded-2xl" />
              <Skeleton className="h-4 w-1/3" />
              <div className="flex gap-4 pt-1">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            {[3, 2, 4].map((lines, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-3 w-32" />
                {Array.from({ length: lines }, (_, j) => (
                  <Skeleton key={j} className="h-2.5" style={{ width: `${92 - j * 13}%` }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!cv) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {header}
        <div className="flex-1 flex items-center justify-center px-5 py-16">
          <div className="text-center animate-fade-in space-y-4">
            <Mascot who={shared ? 'dimas' : 'arya'} pose="think" className="w-40 mx-auto" />
            <h1 className="h-display text-4xl sm:text-5xl">
              {shared ? p.brokenTitle : p.notFoundTitle}
            </h1>
            <p className="text-muted-foreground max-w-sm mx-auto">{shared ? p.brokenBody : p.notFoundBody}</p>
            {shared ? (
              <Button variant="marigold" onClick={() => navigate('/')}>
                {p.buildOwn} <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="outline" onClick={handleEdit}>
                <ArrowLeft className="w-4 h-4" /> {p.backToEdit}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const hasContent = !!cv.about || cv.skills.length > 0 || cv.workExperiences.some(e => e.company)
  const present = t.cv.present

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-0">
      {header}

      <div className="max-w-[850px] mx-auto px-4 py-6 sm:py-10 relative z-10">
        {/* Above-the-fold CTA for people opening someone else's CV */}
        {shared && (
          <div className="no-print mb-8 flex flex-col sm:flex-row sm:items-center gap-4 rounded-card bg-forest text-cream border-2 border-forest-deep shadow-stamp-marigold px-5 py-5 sm:px-6">
            <MascotAvatar who="rina" className="w-14 hidden sm:block" />
            <div className="flex-1">
              <p className="h-display text-2xl">{p.sharedBannerTitle}</p>
              <p className="text-sm text-cream/80 mt-1.5">{p.sharedBannerText}</p>
            </div>
            <Button variant="marigold" onClick={() => navigate('/create')} className="self-start sm:self-auto">
              {p.sharedBannerCta} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {pdfError && (
          <p role="alert" className="no-print mb-6 flex items-center gap-2 rounded-2xl border border-destructive bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
            <CircleAlert className="w-4 h-4 shrink-0" aria-hidden="true" /> {p.pdfFailed}
          </p>
        )}

        {/* CV Document — clean paper card */}
        <article className="rounded-card border-2 border-forest overflow-hidden bg-card shadow-stamp" lang={lang}>

          {/* ===== CV Header ===== */}
          <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 border-b border-forest/15">
            <h1 className="h-display text-4xl sm:text-5xl text-foreground mb-2">
              {cv.fullName}
            </h1>
            {cv.occupation && (
              <p className="text-foreground font-bold mb-4">{cv.occupation}</p>
            )}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
              {cv.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary/60" aria-hidden="true" />{cv.email}
                </span>
              )}
              {cv.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary/60" aria-hidden="true" />{cv.phone}
                </span>
              )}
              {cv.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary/60" aria-hidden="true" />{cv.city}
                </span>
              )}
            </div>
          </div>

          {!hasContent && (
            <div className="no-print px-6 sm:px-10 py-10 border-b border-forest/15 text-center">
              <Mascot who="arya" pose="type" className="w-32 mx-auto" />
              <p className="mt-4 h-display text-2xl">{p.emptyTitle}</p>
              <p className="text-sm text-muted-foreground mt-1">{p.emptyBody}</p>
              {!shared && (
                <Button variant="outline" size="sm" onClick={handleEdit} className="mt-5">
                  <ArrowLeft className="w-4 h-4" /> {p.backToEdit}
                </Button>
              )}
            </div>
          )}

          {hasContent && (
          <div className="px-6 sm:px-10 py-6 space-y-7 border-b border-forest/15">

            {/* ===== About ===== */}
            {cv.about && (
              <section>
                <h2 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2.5">
                  {t.cv.summary}
                </h2>
                <div className="w-full h-[1px] bg-forest/20 mb-3" />
                <p className="text-sm text-foreground/80 leading-relaxed">{cv.about}</p>
              </section>
            )}

            {/* ===== Technical Skills ===== */}
            {cv.skills.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2.5">
                  <Code2 className="w-4 h-4 text-primary/60" aria-hidden="true" />
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">
                    {t.cv.skills}
                  </h2>
                </div>
                <div className="w-full h-[1px] bg-forest/20 mb-3" />
                <div className="flex flex-wrap gap-1.5">
                  {cv.skills.map(skill => (
                    <span key={skill}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-secondary text-foreground border border-forest/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* ===== Work Experience ===== */}
            {cv.workExperiences.some(e => e.company) && (
              <section>
                <div className="flex items-center gap-2 mb-2.5">
                  <Briefcase className="w-4 h-4 text-primary/60" aria-hidden="true" />
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">
                    {t.cv.experience}
                  </h2>
                </div>
                <div className="w-full h-[1px] bg-forest/20 mb-4" />

                <div className="space-y-6">
                  {cv.workExperiences.filter(e => e.company).map((exp) => {
                    const startDate = formatDate(exp.startMonth, exp.startYear, lang)
                    const endDate = exp.endMonth && exp.endYear
                      ? formatDate(exp.endMonth, exp.endYear, lang)
                      : present

                    return (
                      <div key={exp.id}>
                        {/* Company */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-1.5">
                          <h3 className="text-sm font-bold text-foreground">{exp.company}</h3>
                          {startDate && (
                            <span className="flex items-center gap-1 text-xs text-primary/80 font-medium mt-0.5 sm:mt-0 whitespace-nowrap">
                              <Calendar className="w-3 h-3" aria-hidden="true" />{startDate} — {endDate}
                            </span>
                          )}
                        </div>
                        {exp.description && (
                          <p className="text-xs text-foreground leading-relaxed mb-2">
                            {exp.description}
                          </p>
                        )}

                        {/* Projects */}
                        {exp.projects.some(p => p.description || p.title) && (
                          <div className="mt-2 space-y-3 pl-3.5 border-l border-forest/25">
                            {exp.projects.filter(p => p.description || p.title).map((project) => {
                              const projStart = formatDate(project.startMonth, project.startYear, lang)
                              const projEnd = project.endMonth && project.endYear
                                ? formatDate(project.endMonth, project.endYear, lang)
                                : present

                              return (
                                <div key={project.id} className="relative">
                                  {/* Dot */}
                                  <div className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-marigold border border-forest" />

                                  {/* Project title */}
                                  {project.title && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 mb-1">
                                      <h4 className="text-sm font-semibold text-foreground/90 flex items-center gap-1.5">
                                        <FolderKanban className="w-3 h-3 text-primary/50" aria-hidden="true" />
                                        {project.title}
                                      </h4>
                                      {projStart && (
                                        <span className="flex items-center gap-1 text-[10px] text-primary/80 font-medium whitespace-nowrap">
                                          <Calendar className="w-2.5 h-2.5" aria-hidden="true" />{projStart} — {projEnd}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Description */}
                                  {project.description && (
                                    <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">
                                      {project.description}
                                    </p>
                                  )}

                                  {/* Technologies */}
                                  {project.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {project.technologies.map(tech => (
                                        <span key={tech}
                                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-background text-foreground/80 border border-forest/20">
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
          )}

          {/* Footer */}
          <div className="px-6 sm:px-10 py-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {p.builtWith}
            </p>
          </div>
        </article>

        {/* Mobile Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 glass border-t border-forest/15 p-3 sm:hidden no-print">
          <div className="flex gap-2 max-w-[850px] mx-auto">
            {!shared && (
              <Button variant="outline" size="default" className="flex-1 px-3" onClick={handleEdit}>
                <ArrowLeft className="w-4 h-4" /> {p.backToEdit}
              </Button>
            )}
            <Button variant="outline" size="default" className="flex-1 px-3" onClick={shareLink}>
              {shareIcon} {copied ? p.copied : p.share}
            </Button>
            <Button size="default" className="flex-1 px-3" onClick={exportToPDF} disabled={exporting}>
              {pdfIcon} {exporting ? p.pdfBusy : p.pdf}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
