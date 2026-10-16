import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Mail, Phone, MapPin, ArrowLeft, Download, Share2,
  Briefcase, Code2, FolderKanban, Calendar, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCVBySlug, type CVData } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { generateATSPDF } from '@/lib/pdf-generator'
import { SmallCactus, Tumbleweed } from '@/components/Illustrations'
import { Skeleton } from '@/components/ui/skeleton'

export default function CVPreview() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [cv, setCv] = useState<CVData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      if (!slug) return
      const data = await getCVBySlug(slug)
      setCv(data ?? null)
      setLoading(false)
    }
    load()
  }, [slug])

  const exportToPDF = async () => {
    if (!cv) return
    setExporting(true)
    try {
      generateATSPDF(cv)
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const shareLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleEdit = () => {
    if (cv) {
      navigate(`/create?email=${encodeURIComponent(cv.email)}`)
    } else {
      navigate('/create')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background" aria-busy="true" aria-label="Loading your CV">
        <div className="sticky top-0 z-50 glass border-b border-forest/15">
          <div className="max-w-[850px] mx-auto px-4 py-3 flex items-center justify-between">
            <Skeleton className="h-8 w-28" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
        <div className="max-w-[850px] mx-auto px-4 py-8 sm:py-12">
          <div className="rounded-card border border-forest/20 bg-card p-6 sm:p-10 space-y-9">
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
      <div className="min-h-screen flex items-center justify-center bg-background px-5">
        <div className="text-center animate-fade-in space-y-4">
          <div className="relative w-48 h-28 mx-auto">
            <SmallCactus className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 text-forest origin-bottom animate-sway" />
            <Tumbleweed className="absolute bottom-0 left-1/2 w-9 text-forest animate-roll" />
          </div>
          <h2 className="font-display text-5xl font-bold uppercase tracking-[-0.03em] leading-none">CV Not Found</h2>
          <p className="text-muted-foreground max-w-sm">
            This CV doesn't exist or hasn't been generated yet.
            The data is stored locally in your browser.
          </p>
          <Button variant="outline" onClick={handleEdit}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to edit
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-0">
      {/* Controls Bar */}
      <div className="sticky top-0 z-50 glass border-b border-forest/15 no-print">
        <div className="max-w-[850px] mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to edit
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={shareLink}>
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-success" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied!' : 'Share'}
            </Button>
            <Button size="sm" onClick={exportToPDF} disabled={exporting}>
              <Download className="w-3.5 h-3.5 mr-1" />
              {exporting ? '...' : 'PDF'}
            </Button>
          </div>
        </div>
      </div>

      {/* CV Document — clean paper card */}
      <div className="max-w-[850px] mx-auto px-4 py-8 sm:py-12 relative z-10">
        <div className="rounded-card border border-foreground overflow-hidden bg-card shadow-stamp">

          {/* ===== CV Header ===== */}
          <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 border-b border-forest/15">
            <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-[-0.03em] leading-none text-foreground mb-2">
              {cv.fullName}
            </h1>
            {cv.occupation && (
              <p className="text-foreground font-bold mb-4">{cv.occupation}</p>
            )}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
              {cv.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary/60" />{cv.email}
                </span>
              )}
              {cv.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary/60" />{cv.phone}
                </span>
              )}
              {cv.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary/60" />{cv.city}
                </span>
              )}
            </div>
          </div>

          <div className="px-6 sm:px-10 py-6 space-y-7">

            {/* ===== About ===== */}
            {cv.about && (
              <section>
                <h2 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2.5">
                  Summary
                </h2>
                <div className="w-full h-[1px] bg-forest/20 mb-3" />
                <p className="text-sm text-foreground/80 leading-relaxed">{cv.about}</p>
              </section>
            )}

            {/* ===== Technical Skills ===== */}
            {cv.skills.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2.5">
                  <Code2 className="w-4 h-4 text-primary/60" />
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">
                    Technical Skills
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
            {cv.workExperiences.length > 0 && cv.workExperiences.some(e => e.company) && (
              <section>
                <div className="flex items-center gap-2 mb-2.5">
                  <Briefcase className="w-4 h-4 text-primary/60" />
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">
                    Work Experience
                  </h2>
                </div>
                <div className="w-full h-[1px] bg-forest/20 mb-4" />

                <div className="space-y-6">
                  {cv.workExperiences.filter(e => e.company).map((exp) => {
                    const startDate = formatDate(exp.startMonth, exp.startYear)
                    const endDate = exp.endMonth && exp.endYear
                      ? formatDate(exp.endMonth, exp.endYear)
                      : 'Present'

                    return (
                      <div key={exp.id}>
                        {/* Company */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-1.5">
                          <h3 className="text-sm font-bold text-foreground">{exp.company}</h3>
                          {startDate && (
                            <span className="flex items-center gap-1 text-xs text-primary/80 font-medium mt-0.5 sm:mt-0 whitespace-nowrap">
                              <Calendar className="w-3 h-3" />{startDate} — {endDate}
                            </span>
                          )}
                        </div>
                        {exp.description && (
                          <p className="text-xs text-foreground leading-relaxed mb-2">
                            {exp.description}
                          </p>
                        )}

                        {/* Projects */}
                        {exp.projects.filter(p => p.description || p.title).length > 0 && (
                          <div className="mt-2 space-y-3 pl-3.5 border-l border-forest/25">
                            {exp.projects.filter(p => p.description || p.title).map((project) => {
                              const projStart = formatDate(project.startMonth, project.startYear)
                              const projEnd = project.endMonth && project.endYear
                                ? formatDate(project.endMonth, project.endYear)
                                : 'Present'

                              return (
                                <div key={project.id} className="relative">
                                  {/* Dot */}
                                  <div className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-marigold border border-forest" />

                                  {/* Project title */}
                                  {project.title && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 mb-1">
                                      <h4 className="text-sm font-semibold text-foreground/90 flex items-center gap-1.5">
                                        <FolderKanban className="w-3 h-3 text-primary/50" />
                                        {project.title}
                                      </h4>
                                      {projStart && (
                                        <span className="flex items-center gap-1 text-[10px] text-primary/80 font-medium whitespace-nowrap">
                                          <Calendar className="w-2.5 h-2.5" />{projStart} — {projEnd}
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

          {/* Footer */}
          <div className="px-6 sm:px-10 py-4 border-t border-forest/15 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Generated by CV ATS Friendly Generator
            </p>
          </div>
        </div>

        {/* Mobile Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 glass border-t border-forest/15 p-3 sm:hidden no-print">
          <div className="flex gap-2 max-w-[850px] mx-auto">
            <Button variant="outline" size="default" className="flex-1 px-3" onClick={handleEdit}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to edit
            </Button>
            <Button variant="outline" size="default" className="flex-1 px-3" onClick={shareLink}>
              <Share2 className="w-4 h-4 mr-1" />{copied ? 'Copied!' : 'Share'}
            </Button>
            <Button size="default" className="flex-1 px-3" onClick={exportToPDF} disabled={exporting}>
              <Download className="w-4 h-4 mr-1" />{exporting ? '...' : 'PDF'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
