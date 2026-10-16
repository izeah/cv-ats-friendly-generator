import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteFooter, SiteHeader } from '@/components/SiteChrome'
import { SmallCactus, Tumbleweed } from '@/components/Illustrations'
import { useI18n, usePageMeta } from '@/lib/i18n'

export default function NotFound() {
  const { t } = useI18n()
  const navigate = useNavigate()
  usePageMeta(t.meta.notFound)

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="text-center space-y-5 animate-fade-in">
          <div className="relative w-48 h-28 mx-auto">
            <SmallCactus className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 text-forest origin-bottom animate-sway" />
            <Tumbleweed className="absolute bottom-0 left-1/2 w-9 text-forest animate-roll" />
          </div>
          <p className="font-display text-7xl font-bold text-forest/20 leading-none">404</p>
          <h1 className="font-display text-5xl font-bold uppercase tracking-[-0.03em] leading-none">{t.notFound.title}</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">{t.notFound.body}</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button variant="marigold" onClick={() => navigate('/create')}>
              {t.common.buildCV} <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>{t.notFound.home}</Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
