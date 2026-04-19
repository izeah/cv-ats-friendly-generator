import { jsPDF } from 'jspdf'
import type { CVData } from './db'
import { formatDate } from './utils'

// ===== ATS-Friendly PDF Generator =====
// Uses jsPDF native text rendering for true ATS compatibility.
// Text is selectable, searchable, and parseable by ATS systems.

const PAGE_WIDTH = 210  // A4 mm
const PAGE_HEIGHT = 297
const MARGIN_LEFT = 18
const MARGIN_RIGHT = 18
const MARGIN_TOP = 18
const MARGIN_BOTTOM = 18
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
const LINE_HEIGHT = 5.2
const SECTION_GAP = 6
const ACCENT_COLOR: [number, number, number] = [79, 70, 229] // Indigo-600
const TEXT_COLOR: [number, number, number] = [15, 23, 42] // Slate-900
const MUTED_COLOR: [number, number, number] = [100, 116, 139] // Slate-500
const DARK_COLOR: [number, number, number] = [30, 41, 59] // Slate-800

export function generateATSPDF(cv: CVData): void {
  const pdf = new jsPDF('p', 'mm', 'a4')
  let y = MARGIN_TOP

  // ===== Helper: Check page break =====
  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
      pdf.addPage()
      y = MARGIN_TOP
    }
  }

  // ===== Helper: Wrap text into lines =====
  function wrapText(text: string, maxWidth: number, fontSize: number, fontStyle: string = 'normal'): string[] {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', fontStyle)
    return pdf.splitTextToSize(text, maxWidth) as string[]
  }

  // ===== Helper: Parse description into list items =====
  function parseDescriptionItems(text: string): string[] | null {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return null // Need at least 2 lines to be considered a list

    // Pattern to detect list markers: ✅, -, •, *, number (1. 2. etc), or common emoticons
    const listMarkerPattern = /^[\s]*(✅|✔|✓|-|–|•|\*|\d+\.|\[x\]|→|▪|◾|◆|❯|❱|◊|◈|🟩|🟪|🟨|🟦|⭐|💫|✨|⚡|🔥|📌|📍|🎯|📝|✍|👉|☑|☐|●|○)\s*/

    // Check if most lines match the pattern (at least 50%)
    const matchingLines = lines.filter(line => listMarkerPattern.test(line.trim()))
    if (matchingLines.length < Math.ceil(lines.length * 0.5)) return null

    // Parse items: remove marker and keep the text
    return lines.map(line => {
      const trimmed = line.trim()
      const match = trimmed.match(listMarkerPattern)
      if (match) {
        return trimmed.substring(match[0].length).trim()
      }
      return trimmed
    }).filter(item => item.length > 0)
  }

  // ===== Helper: Draw multiple bullets =====
  function drawBullets(items: string[], indent: number = 4): void {
    items.forEach(item => {
      drawBullet(item, indent)
    })
  }

  // ===== Helper: Draw text block =====
  function drawText(
    text: string,
    fontSize: number,
    color: [number, number, number],
    fontStyle: string = 'normal',
    maxWidth: number = CONTENT_WIDTH,
    xOffset: number = 0,
    lineSpacing: number = LINE_HEIGHT
  ): void {
    const lines = wrapText(text, maxWidth, fontSize, fontStyle)
    lines.forEach((line: string) => {
      checkPageBreak(lineSpacing)
      pdf.setFontSize(fontSize)
      pdf.setFont('helvetica', fontStyle)
      pdf.setTextColor(...color)
      pdf.text(line, MARGIN_LEFT + xOffset, y)
      y += lineSpacing
    })
  }

  // ===== Helper: Draw section header with underline =====
  function drawSectionHeader(title: string): void {
    checkPageBreak(12)
    y += SECTION_GAP
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...TEXT_COLOR)
    pdf.text(title.toUpperCase(), MARGIN_LEFT, y)
    y += 2
    // Underline
    pdf.setDrawColor(...ACCENT_COLOR)
    pdf.setLineWidth(0.6)
    pdf.line(MARGIN_LEFT, y, MARGIN_LEFT + CONTENT_WIDTH, y)
    y += 4
  }

  // ===== Helper: Draw bullet point =====
  function drawBullet(text: string, indent: number = 4): void {
    const bulletX = MARGIN_LEFT + indent
    const textX = bulletX + 4
    const maxW = CONTENT_WIDTH - indent - 4
    const lines = wrapText(text, maxW, 9.5, 'normal')

    checkPageBreak(lines.length * LINE_HEIGHT + 1)
    // Bullet dot
    pdf.setFillColor(...TEXT_COLOR)
    pdf.circle(bulletX + 1, y - 1.3, 0.7, 'F')

    lines.forEach((line: string, idx: number) => {
      pdf.setFontSize(9.5)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(...DARK_COLOR)
      pdf.text(line, idx === 0 ? textX : textX, y)
      y += LINE_HEIGHT
    })
  }

  // ============================================================
  // ===== CV HEADER =====
  // ============================================================

  // Full Name
  pdf.setFontSize(22)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(...TEXT_COLOR)
  pdf.text(cv.fullName, PAGE_WIDTH / 2, y, { align: 'center' })
  y += 7

  // Contact line
  const contactParts: string[] = []
  if (cv.email) contactParts.push(cv.email)
  if (cv.phone) contactParts.push(cv.phone)
  if (cv.city) contactParts.push(cv.city)

  if (contactParts.length > 0) {
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...MUTED_COLOR)
    pdf.text(contactParts.join('  |  '), PAGE_WIDTH / 2, y, { align: 'center' })
    y += 5
  }

  // Thin separator
  pdf.setDrawColor(...ACCENT_COLOR)
  pdf.setLineWidth(0.4)
  pdf.line(MARGIN_LEFT + 20, y, PAGE_WIDTH - MARGIN_RIGHT - 20, y)
  y += 3

  // ============================================================
  // ===== ABOUT / SUMMARY =====
  // ============================================================

  if (cv.about && cv.about.trim()) {
    drawSectionHeader('Summary')
    drawText(cv.about.trim(), 9.5, DARK_COLOR, 'normal')
    y += 1
  }

  // ============================================================
  // ===== TECHNICAL SKILLS =====
  // ============================================================

  if (cv.skills.length > 0) {
    drawSectionHeader('Technical Skills')
    const skillText = cv.skills.join(', ')
    drawText(skillText, 9.5, DARK_COLOR, 'normal')
    y += 1
  }

  // ============================================================
  // ===== WORK EXPERIENCE =====
  // ============================================================

  const validExps = cv.workExperiences.filter(e => e.company)
  if (validExps.length > 0) {
    drawSectionHeader('Work Experience')

    validExps.forEach((exp, expIdx) => {
      const startDate = formatDate(exp.startMonth, exp.startYear)
      const endDate = exp.endMonth && exp.endYear
        ? formatDate(exp.endMonth, exp.endYear)
        : 'Present'
      const dateRange = startDate ? `${startDate} – ${endDate}` : ''

      // Company name + date (on same line)
      checkPageBreak(10)

      // Company name (bold)
      pdf.setFontSize(10.5)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(...TEXT_COLOR)
      pdf.text(exp.company, MARGIN_LEFT, y)

      // Date range (right-aligned)
      if (dateRange) {
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...ACCENT_COLOR)
        pdf.text(dateRange, PAGE_WIDTH - MARGIN_RIGHT, y, { align: 'right' })
      }
      y += LINE_HEIGHT

      // Job description (italic)
      if (exp.description) {
        drawText(exp.description, 9, MUTED_COLOR, 'italic')
      }

      y += 1.5

      // Projects
      const validProjects = exp.projects.filter(p => p.description || p.title)
      validProjects.forEach((project) => {
        const projStart = formatDate(project.startMonth, project.startYear)
        const projEnd = project.endMonth && project.endYear
          ? formatDate(project.endMonth, project.endYear)
          : 'Present'
        const projDateRange = projStart ? `${projStart} – ${projEnd}` : ''

        // Project title (bold)
        if (project.title) {
          checkPageBreak(8)
          pdf.setFontSize(9.5)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(...DARK_COLOR)
          pdf.text(project.title, MARGIN_LEFT + 4, y)

          if (projDateRange) {
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'normal')
            pdf.setTextColor(...MUTED_COLOR)
            pdf.text(projDateRange, PAGE_WIDTH - MARGIN_RIGHT, y, { align: 'right' })
          }
          y += LINE_HEIGHT
        }

        // Project description as bullet(s)
        if (project.description) {
          const items = parseDescriptionItems(project.description)
          if (items) {
            // Description has list items - render as multiple bullets
            drawBullets(items, 4)
          } else {
            // Regular description - render as single bullet
            drawBullet(project.description, 4)
          }
        }

        // Technologies
        if (project.technologies.length > 0) {
          checkPageBreak(6)
          const techStr = `Tech: ${project.technologies.join(', ')}`
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'italic')
          pdf.setTextColor(...MUTED_COLOR)
          const techLines = pdf.splitTextToSize(techStr, CONTENT_WIDTH - 8) as string[]
          techLines.forEach((line: string) => {
            pdf.text(line, MARGIN_LEFT + 8, y)
            y += 4
          })
        }

        y += 2
      })

      // Separator between companies
      if (expIdx < validExps.length - 1) {
        y += 2
      }
    })
  }

  // ============================================================
  // ===== SAVE =====
  // ============================================================

  pdf.save(`CV_${cv.fullName.replace(/\s+/g, '_')}.pdf`)
}
