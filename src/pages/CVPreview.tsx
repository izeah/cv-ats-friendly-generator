import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Mail, Phone, MapPin, ArrowLeft, Download, Share2, ExternalLink,
  Sparkles, Briefcase, Code2, FolderKanban, Calendar, CheckCircle2
} from 'lucide-react'
import html2canvas from 'html2canvas-pro'
import { jsPDF } from 'jspdf'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getCVBySlug, type CVData } from '@/lib/db'
import { formatDate } from '@/lib/utils'

export default function CVPreview() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const cvRef = useRef<HTMLDivElement>(null)
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
    if (!cvRef.current) return
    setExporting(true)
    try {
      const canvas = await html2canvas(cvRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF('p', 'mm', 'a4')
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`CV_${cv?.fullName?.replace(/\s+/g, '_') || 'Resume'}.pdf`)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center mx-auto mb-4 animate-glow">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading your CV...</p>
        </div>
      </div>
    )
  }

  if (!cv) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <ExternalLink className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">CV Not Found</h2>
          <p className="text-muted-foreground max-w-sm">
            This CV doesn't exist or hasn't been generated yet.
            The data is stored locally in your browser.
          </p>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background noise-bg">
      {/* Controls Bar */}
      <div className="sticky top-0 z-50 glass border-b border-border/40 no-print">
        <div className="max-w-[900px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Home
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/create')}>
              Edit
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={shareLink}>
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-success" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied!' : 'Share Link'}
            </Button>
            <Button variant="gradient" size="sm" onClick={exportToPDF} disabled={exporting}>
              <Download className="w-3.5 h-3.5 mr-1" />
              {exporting ? 'Exporting...' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </div>

      {/* CV Document */}
      <div className="max-w-[900px] mx-auto px-4 py-8 relative z-10">
        <div
          ref={cvRef}
          className="bg-white text-[#1a1a2e] shadow-2xl shadow-primary/5 rounded-lg overflow-hidden"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* ===== CV Header ===== */}
          <div className="bg-gradient-to-r from-[#0f0f1a] via-[#1a1040] to-[#0f0f1a] text-white px-8 sm:px-12 py-8 sm:py-10">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
              {cv.fullName}
            </h1>
            <p className="text-[#a78bfa] font-medium text-sm sm:text-base mb-4">
              Backend Developer
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-300">
              {cv.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#a78bfa]" />
                  {cv.email}
                </span>
              )}
              {cv.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#a78bfa]" />
                  {cv.phone}
                </span>
              )}
              {cv.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#a78bfa]" />
                  {cv.city}
                </span>
              )}
            </div>
          </div>

          <div className="px-8 sm:px-12 py-8 space-y-8">
            {/* ===== Technical Skills ===== */}
            {cv.skills.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Code2 className="w-5 h-5 text-[#6d5aff]" />
                  <h2 className="text-lg font-bold text-[#0f0f1a] uppercase tracking-wider text-[13px]">
                    Technical Skills
                  </h2>
                </div>
                <div className="w-full h-[1px] bg-gradient-to-r from-[#6d5aff] via-[#6d5aff]/40 to-transparent mb-4" />
                <div className="flex flex-wrap gap-2">
                  {cv.skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-[#f0eeff] text-[#4338ca] border border-[#e0dcff]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* ===== Work Experience ===== */}
            {cv.workExperiences.length > 0 && cv.workExperiences.some(e => e.company) && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-[#6d5aff]" />
                  <h2 className="text-lg font-bold text-[#0f0f1a] uppercase tracking-wider text-[13px]">
                    Work Experience
                  </h2>
                </div>
                <div className="w-full h-[1px] bg-gradient-to-r from-[#6d5aff] via-[#6d5aff]/40 to-transparent mb-6" />

                <div className="space-y-8">
                  {cv.workExperiences.filter(e => e.company).map((exp) => {
                    const startDate = formatDate(exp.startMonth, exp.startYear)
                    const endDate = exp.endMonth && exp.endYear
                      ? formatDate(exp.endMonth, exp.endYear)
                      : 'Present'

                    return (
                      <div key={exp.id} className="relative">
                        {/* Company Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                          <div>
                            <h3 className="text-base font-bold text-[#0f0f1a]">
                              {exp.company}
                            </h3>
                            {exp.description && (
                              <p className="text-sm text-[#475569] mt-1 leading-relaxed">
                                {exp.description}
                              </p>
                            )}
                          </div>
                          {startDate && (
                            <span className="flex items-center gap-1 text-xs text-[#6d5aff] font-medium mt-1 sm:mt-0 whitespace-nowrap shrink-0">
                              <Calendar className="w-3 h-3" />
                              {startDate} — {endDate}
                            </span>
                          )}
                        </div>

                        {/* Projects */}
                        {exp.projects.filter(p => p.description).length > 0 && (
                          <div className="mt-4 space-y-4 pl-4 border-l-2 border-[#e0dcff]">
                            {exp.projects.filter(p => p.description).map((project) => {
                              const projStart = formatDate(project.startMonth, project.startYear)
                              const projEnd = project.endMonth && project.endYear
                                ? formatDate(project.endMonth, project.endYear)
                                : 'Present'

                              return (
                                <div key={project.id} className="relative">
                                  {/* Dot indicator */}
                                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#6d5aff] border-2 border-white" />

                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                                    <div className="flex-1">
                                      <div className="flex items-start gap-1.5">
                                        <FolderKanban className="w-3.5 h-3.5 text-[#6d5aff] mt-0.5 shrink-0" />
                                        <p className="text-sm text-[#1e293b] leading-relaxed">
                                          {project.description}
                                        </p>
                                      </div>
                                    </div>
                                    {projStart && (
                                      <span className="text-xs text-[#94a3b8] whitespace-nowrap shrink-0 ml-5 sm:ml-0">
                                        {projStart} — {projEnd}
                                      </span>
                                    )}
                                  </div>

                                  {/* Technologies */}
                                  {project.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2 ml-5">
                                      {project.technologies.map(tech => (
                                        <span
                                          key={tech}
                                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#f8fafc] text-[#475569] border border-[#e2e8f0]"
                                        >
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
          <div className="px-8 sm:px-12 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] text-center">
            <p className="text-[10px] text-[#94a3b8]">
              Generated by CV Forge — ATS-Friendly CV Generator
            </p>
          </div>
        </div>

        {/* Bottom Actions (Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 glass border-t border-border/40 p-3 sm:hidden no-print">
          <div className="flex gap-2 max-w-[900px] mx-auto">
            <Button variant="outline" size="default" className="flex-1" onClick={shareLink}>
              <Share2 className="w-4 h-4 mr-1" />
              {copied ? 'Copied!' : 'Share'}
            </Button>
            <Button variant="gradient" size="default" className="flex-1" onClick={exportToPDF} disabled={exporting}>
              <Download className="w-4 h-4 mr-1" />
              {exporting ? '...' : 'PDF'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
