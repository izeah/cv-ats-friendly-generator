import { SiteFooter, SiteHeader } from '@/components/SiteChrome'
import { Mascot } from '@/components/Mascot'
import { useI18n, usePageMeta } from '@/lib/i18n'

/** Privacy Policy and Terms of Service share one layout; the copy lives in the dictionaries. */
export default function Legal({ doc }: { doc: 'privacy' | 'terms' }) {
  const { t } = useI18n()
  const page = t.legal[doc]
  usePageMeta(t.meta[doc])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 sm:px-10 py-14 sm:py-20">
        <div className="relative sm:pr-40">
          <Mascot who="rina" pose="check" className="absolute -top-6 right-0 w-36 hidden sm:block" />
          <p className="kicker mb-3">{t.legal.updated}</p>
          <h1 className="h-display text-5xl sm:text-6xl">{page.title}</h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{page.intro}</p>
        </div>

        <div className="mt-12 rounded-card border-2 border-forest bg-card shadow-stamp p-6 sm:p-10 space-y-9">
          {page.sections.map((section, i) => (
            <section key={section.h}>
              <h2 className="h-display text-2xl sm:text-[28px] leading-tight flex items-baseline gap-3">
                <span className="font-mono text-sm font-bold text-forest/40 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
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
