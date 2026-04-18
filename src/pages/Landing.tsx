import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Sparkles, ArrowRight, FileText, Share2, Download, Code2,
  Zap, Shield, Eye, Briefcase, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAllCVs, type CVData } from '@/lib/db'
import { generateSlug } from '@/lib/utils'

const features = [
  {
    icon: FileText,
    title: 'ATS-Optimized',
    description: 'Clean, parseable format that passes through Applicant Tracking Systems with zero friction.',
    color: 'text-primary',
    bg: 'from-primary/10 to-primary/5',
  },
  {
    icon: Share2,
    title: 'Shareable Link',
    description: 'Get a unique online link for your CV. Share it with recruiters instantly via any channel.',
    color: 'text-purple-400',
    bg: 'from-purple-500/10 to-purple-500/5',
  },
  {
    icon: Download,
    title: 'PDF Export',
    description: 'Download a pixel-perfect PDF version ready for formal applications and job portals.',
    color: 'text-pink-400',
    bg: 'from-pink-500/10 to-pink-500/5',
  },
  {
    icon: Code2,
    title: 'Backend Focused',
    description: 'Tailored for Backend Developers. Showcase your projects, tech stack, and system design skills.',
    color: 'text-emerald-400',
    bg: 'from-emerald-500/10 to-emerald-500/5',
  },
  {
    icon: Zap,
    title: 'Instant Generation',
    description: 'Fill the form, hit generate. Your professional CV is ready in seconds — no sign-up required.',
    color: 'text-amber-400',
    bg: 'from-amber-500/10 to-amber-500/5',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'All data stored locally in your browser. Zero server uploads. Your data stays with you.',
    color: 'text-blue-400',
    bg: 'from-blue-500/10 to-blue-500/5',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [recentCVs, setRecentCVs] = useState<CVData[]>([])

  useEffect(() => {
    getAllCVs().then(cvs => setRecentCVs(cvs.slice(0, 5)))
  }, [])

  return (
    <div className="min-h-screen noise-bg">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">CV Forge</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">ATS-Friendly Generator</p>
            </div>
          </div>
          <Button variant="gradient" size="sm" onClick={() => navigate('/create')}>
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Create CV
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <Badge variant="default" className="px-4 py-1.5 text-sm font-medium">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Free — No Sign-up Required
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Build a CV That
              <br />
              <span className="gradient-text">Gets You Interviewed</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Craft an ATS-optimized, recruiter-ready CV specifically designed for
              <span className="text-foreground font-medium"> Backend Developers</span>.
              Share it online or export to PDF — all in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button variant="gradient" size="xl" onClick={() => navigate('/create')} className="group">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Building Your CV
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>ATS Compliant</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span>Live Preview</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" />
                <span>PDF Download</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Everything You Need to <span className="gradient-text">Stand Out</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Purpose-built for Backend Developers who want to leave a lasting impression on recruiters and hiring managers.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <Card
              key={feature.title}
              className="group border-border/40 bg-card/30 hover:bg-card/60 hover:border-primary/20 transition-all duration-300 cursor-default overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardContent className="p-6 space-y-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.bg} flex items-center justify-center border border-border/40 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Three Steps to Your <span className="gradient-text">Dream CV</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Fill the Form',
              description: 'Enter your personal info, work experience, project details, and tech skills.',
              icon: FileText,
            },
            {
              step: '02',
              title: 'Preview & Polish',
              description: 'See your beautifully formatted CV instantly. Make adjustments as needed.',
              icon: Eye,
            },
            {
              step: '03',
              title: 'Share or Download',
              description: 'Copy your shareable link or export a crisp PDF for job applications.',
              icon: Share2,
            },
          ].map((item, i) => (
            <div
              key={item.step}
              className="relative text-center p-6 rounded-xl border border-border/40 bg-card/20 hover:border-primary/30 transition-all duration-300 group"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="text-5xl font-black gradient-text opacity-20 absolute top-4 right-6">{item.step}</div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/10 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent CVs */}
      {recentCVs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 relative z-10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Your Saved CVs
          </h2>
          <div className="space-y-2">
            {recentCVs.map(cv => (
              <div
                key={cv.email}
                className="group flex items-center justify-between p-4 rounded-lg border border-border/40 bg-card/30 hover:bg-card/60 hover:border-primary/20 transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/cv/${generateSlug(cv.email)}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                    <span className="text-sm font-bold text-primary">
                      {cv.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{cv.fullName}</p>
                    <p className="text-xs text-muted-foreground">{cv.email}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 blur-xl" />
          <div className="relative glass rounded-2xl p-8 sm:p-12 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Ready to Land Your Next Role?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Build a CV that passes ATS filters, impresses hiring managers,
              and gets you to the interview stage.
            </p>
            <Button variant="gradient" size="xl" onClick={() => navigate('/create')} className="mt-4 group">
              <Sparkles className="w-5 h-5 mr-2" />
              Create Your CV Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium">CV Forge</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built for Backend Developers. All data stored locally in your browser.
          </p>
        </div>
      </footer>
    </div>
  )
}
