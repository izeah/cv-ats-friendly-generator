import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from '@/pages/Landing'
import ScrollToTop from '@/components/ScrollToTop'
import { LanguageProvider } from '@/components/Language'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'

// Landing stays eager: it's the SEO entry. Everything else loads on demand.
const CVForm = lazy(() => import('@/pages/CVForm'))
const CVPreview = lazy(() => import('@/pages/CVPreview'))
const Legal = lazy(() => import('@/pages/Legal'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function PageFallback() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true">
      <div className="max-w-[850px] mx-auto px-4 py-8 sm:py-12 space-y-3">
        <Skeleton className="h-11 w-2/3 rounded-2xl" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/create" element={<CVForm />} />
              <Route path="/cv/:slug" element={<CVPreview />} />
              <Route path="/cv-share" element={<CVPreview />} />
              <Route path="/privacy" element={<Legal doc="privacy" />} />
              <Route path="/terms" element={<Legal doc="terms" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <ScrollToTop />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  )
}

export default App
