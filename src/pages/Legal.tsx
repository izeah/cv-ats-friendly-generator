import { SiteFooter, SiteHeader } from '@/components/SiteChrome'
import { useI18n, usePageMeta } from '@/lib/i18n'
import { CVSheet } from '@/components/Illustrations'

/** Privacy Policy and Terms of Service share one layout; the copy lives in the dictionaries. */
export default function Legal({ doc }: { doc: 'privacy' | 'terms' }) {
  const { t } = useI18n()
  const page = t.legal[doc]
  usePageMeta(t.meta[doc])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 sm:px-10 py-14 sm:py-20">
        <div className="relative">
          <CVSheet className="absolute -top-4 right-0 w-14 text-forest animate-bob hidden sm:block" />
          <p className="inline-flex items-center gap-2 rounded-full border border-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider mb-5">
            <span className="w-2 h-2 rounded-full bg-fern" /> {t.legal.updated}
          </p>
          <h1 className="font-display font-bold uppercase text-5xl sm:text-6xl leading-[0.9] tracking-[-0.03em]">
            {page.title}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{page.intro}</p>
        </div>

        <div className="mt-12 rounded-card border border-foreground bg-card shadow-stamp p-7 sm:p-10 space-y-9">
          {page.sections.map((section, i) => (
            <section key={section.h}>
              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-[-0.02em] leading-tight flex items-baseline gap-3">
                <span className="text-forest/30 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                {section.h}
              </h2>
              {section.p.map(text => (
                <p key={text} className="mt-3 text-muted-foreground leading-relaxed">{text}</p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
