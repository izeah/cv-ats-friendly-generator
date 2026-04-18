import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from '@/pages/Landing'
import CVForm from '@/pages/CVForm'
import CVPreview from '@/pages/CVPreview'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<CVForm />} />
        <Route path="/cv/:slug" element={<CVPreview />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
