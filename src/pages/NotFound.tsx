import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteFooter, SiteHeader } from '@/components/SiteChrome'
import { Mascot } from '@/components/Mascot'
import { useI18n, usePageMeta } from '@/lib/i18n'

export default function NotFound() {
  const { t } = useI18n()
  const navigate = useNavigate()
  usePageMeta(t.meta.notFound)

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 grid place-items-center px-5 py-16 sm:py-24">
        <div className="grid md:grid-cols-[auto_1fr] items-center gap-8 md:gap-14 max-w-3xl animate-fade-in">
          <div className="relative mx-auto w-44 sm:w-56">
            <p className="absolute -top-10 left-1/2 -translate-x-1/2 h-display text-[110px] sm:text-[140px] text-forest/10 select-none" aria-hidden="true">
              404
            </p>
            <Mascot who="dimas" pose="magnify" className="relative w-full" />
          </div>
          <div className="text-center md:text-left">
            <p className="kicker mb-3">{t.notFound.kicker}</p>
            <h1 className="h-display text-5xl sm:text-6xl">{t.notFound.title}</h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-md mx-auto md:mx-0">{t.notFound.body}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-7">
              <Button variant="marigold" size="lg" onClick={() => navigate('/create')}>
                {t.common.buildCV} <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/')}>{t.notFound.home}</Button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
