import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from '@/pages/Landing'
import CVForm from '@/pages/CVForm'
import CVPreview from '@/pages/CVPreview'
import Legal from '@/pages/Legal'
import NotFound from '@/pages/NotFound'
import ScrollToTop from '@/components/ScrollToTop'
import { LanguageProvider } from '@/components/Language'

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<CVForm />} />
          <Route path="/cv/:slug" element={<CVPreview />} />
          <Route path="/cv-share" element={<CVPreview />} />
          <Route path="/privacy" element={<Legal doc="privacy" />} />
          <Route path="/terms" element={<Legal doc="terms" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ScrollToTop />
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
