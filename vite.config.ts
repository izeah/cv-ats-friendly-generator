import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { id as idDict } from './src/lib/i18n-dict'

// Link-preview bots and crawlers don't run JS, so each public route ships its own
// HTML file with static, Indonesian metadata. Vercel's cleanUrls serves
// /create → create.html etc.; anything else falls back to index.html.
const SITE = 'https://cv-generator.izeah.my.id'

const ROUTES = [
  { file: 'index.html', path: '/', meta: idDict.meta.home, share: false, index: true },
  { file: 'create.html', path: '/create', meta: idDict.meta.create, share: false, index: true },
  { file: 'privacy.html', path: '/privacy', meta: idDict.meta.privacy, share: false, index: true },
  { file: 'terms.html', path: '/terms', meta: idDict.meta.terms, share: false, index: true },
  { file: 'cv-share.html', path: '/cv-share', meta: idDict.meta.share, share: true, index: false },
]

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function metaBlock(r: (typeof ROUTES)[number]): string {
  const url = SITE + r.path
  const image = `${SITE}/${r.share ? 'og-share.png' : 'og-image.png'}`
  const alt = r.share
    ? 'Ada CV yang dibagikan untukmu — buka untuk melihat dan mengunduh PDF-nya'
    : 'CV ATS Friendly Builder — buat CV ramah ATS gratis untuk Backend Developer'
  const tags = [
    `<title>${esc(r.meta.title)}</title>`,
    `<meta name="description" content="${esc(r.meta.description)}" />`,
    `<meta name="robots" content="${r.index ? 'index, follow' : 'noindex, follow'}" />`,
    r.index ? `<link rel="canonical" href="${url}" />` : '',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="CV ATS Friendly Builder" />`,
    `<meta property="og:locale" content="id_ID" />`,
    `<meta property="og:locale:alternate" content="en_US" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(r.meta.title)}" />`,
    `<meta property="og:description" content="${esc(r.meta.description)}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(alt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(r.meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(r.meta.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<meta name="twitter:image:alt" content="${esc(alt)}" />`,
  ]
  if (r.path === '/') {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'CV ATS Friendly Builder',
      url: `${SITE}/`,
      description: r.meta.description,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any',
      inLanguage: ['id', 'en'],
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
    }
    tags.push(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`)
  }
  return `<!-- route-meta:start -->\n    ${tags.filter(Boolean).join('\n    ')}\n    <!-- route-meta:end -->`
}

function routeMeta(): Plugin {
  return {
    name: 'route-meta',
    enforce: 'post',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace('<!-- route-meta -->', metaBlock(ROUTES[0])),
    },
    generateBundle(_, bundle) {
      const index = bundle['index.html']
      if (!index || index.type !== 'asset') return
      const html = String(index.source)
      for (const route of ROUTES.slice(1)) {
        this.emitFile({
          type: 'asset',
          fileName: route.file,
          source: html.replace(/<!-- route-meta:start -->[\s\S]*?<!-- route-meta:end -->/, metaBlock(route)),
        })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), routeMeta()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
