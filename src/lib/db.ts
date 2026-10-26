import Dexie, { type EntityTable } from 'dexie'
import { v4 as uuidv4 } from 'uuid'

// ===== Type Definitions =====

export interface Project {
  id: string
  title: string
  description: string
  startMonth: string
  startYear: string
  endMonth: string
  endYear: string
  technologies: string[]
}

export interface WorkExperience {
  id: string
  company: string
  startMonth: string
  startYear: string
  endMonth: string
  endYear: string
  description: string
  projects: Project[]
}

export interface CVData {
  email: string  // primary key
  fullName: string
  occupation?: string
  phone: string
  city: string
  about: string
  workExperiences: WorkExperience[]
  skills: string[]
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
  /** Name shown in the sidebar and search. The CV itself keeps fullName. */
  label?: string
  isPinned?: boolean
  pinnedAt?: Date
}

/** What the sidebar and search call a CV: its list label, else the name on it. */
export const cvTitle = (cv: Pick<CVData, 'label' | 'fullName'>): string =>
  cv.label?.trim() || cv.fullName

// ===== Database =====

class CVDatabase extends Dexie {
  cvs!: EntityTable<CVData, 'email'>

  constructor() {
    super('CVForgeDB')
    this.version(1).stores({
      cvs: 'email, fullName, updatedAt'
    })
    this.version(2).stores({
      cvs: 'email, fullName, updatedAt, isArchived'
    }).upgrade(tx => {
      return tx.table('cvs').toCollection().modify(cv => {
        if (cv.about === undefined) cv.about = ''
        if (cv.isArchived === undefined) cv.isArchived = false
        if (cv.workExperiences) {
          cv.workExperiences.forEach((exp: WorkExperience) => {
            if (exp.projects) {
              exp.projects.forEach((proj: Project) => {
                if (proj.title === undefined) proj.title = ''
              })
            }
          })
        }
      })
    })
    this.version(3).stores({
      cvs: 'email, fullName, updatedAt, isArchived, createdAt'
    })
  }
}

export const db = new CVDatabase()

// ===== CRUD Operations =====

export async function saveCVData(data: CVData): Promise<void> {
  const existing = await db.cvs.get(data.email)
  if (existing) {
    // The form sends a fresh createdAt on every save; keep the first one.
    await db.cvs.update(data.email, {
      ...data,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    })
  } else {
    await db.cvs.add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
}

export async function getCVByEmail(email: string): Promise<CVData | undefined> {
  return db.cvs.get(email)
}

export async function getCVBySlug(slug: string): Promise<CVData | undefined> {
  const allCVs = await db.cvs.toArray()
  return allCVs.find(cv => {
    const cvSlug = btoa(cv.email).replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    return cvSlug === slug
  })
}

export async function getAllCVs(includeArchived = false): Promise<CVData[]> {
  const all = await db.cvs.orderBy('createdAt').reverse().toArray()
  if (includeArchived) return all
  return all.filter(cv => !cv.isArchived)
}

export async function getArchivedCVs(): Promise<CVData[]> {
  const all = await db.cvs.orderBy('createdAt').reverse().toArray()
  return all.filter(cv => cv.isArchived)
}

export async function toggleArchive(email: string): Promise<void> {
  const cv = await db.cvs.get(email)
  if (cv) {
    // Archiving also unpins: the pinned list only shows active CVs.
    await db.cvs.update(email, {
      isArchived: !cv.isArchived,
      ...(cv.isArchived ? {} : { isPinned: false, pinnedAt: undefined }),
      updatedAt: new Date(),
    })
  }
}

/** Sets the list label. Empty, or the same as the name on the CV, clears it. */
export async function renameCV(email: string, label: string): Promise<void> {
  const cv = await db.cvs.get(email)
  if (!cv) return
  const clean = label.trim()
  await db.cvs.update(email, { label: clean && clean !== cv.fullName ? clean : undefined })
}

export async function togglePin(email: string): Promise<void> {
  const cv = await db.cvs.get(email)
  if (!cv) return
  await db.cvs.update(email, cv.isPinned ? { isPinned: false, pinnedAt: undefined } : { isPinned: true, pinnedAt: new Date() })
}

export async function deleteCVByEmail(email: string): Promise<void> {
  await db.cvs.delete(email)
}

// ===== JSON Import / Export =====

export function downloadCVJson(cv: CVData): void {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(cv, null, 2)], { type: 'application/json' })
  )
  const a = document.createElement('a')
  a.href = url
  a.download = `${cv.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cv'}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url))
}

// Share links carry the same JSON as the export (minus indentation) as URL-safe
// base64 in the hash: /cv-share#<data>. The hash never reaches the server.
export function cvShareUrl(cv: CVData): string {
  // The list label and pin belong to this device, not to whoever opens the link.
  const shared: Partial<CVData> = { ...cv }
  delete shared.label
  delete shared.isPinned
  delete shared.pinnedAt
  let bin = ''
  new TextEncoder().encode(JSON.stringify(shared)).forEach(b => (bin += String.fromCharCode(b)))
  const data = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${location.origin}/cv-share#${data}`
}

export function decodeCVShare(data: string): CVData {
  let text: string
  try {
    const b64 = data.trim().replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
    text = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bin, c => c.charCodeAt(0)))
  } catch {
    throw new Error('broken_link')
  }
  return parseCVJson(text)
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '')
const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : []
const objList = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? v.filter(o => o !== null && typeof o === 'object') : []

// Imported files are untrusted: keep only known fields, coerce types, fill defaults.
// Throws Error('invalid_json' | 'not_cv'); the UI translates the code.
export function parseCVJson(text: string): CVData {
  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('invalid_json')
  }
  const email = str(raw?.email).trim().toLowerCase()
  const fullName = str(raw?.fullName).trim()
  if (!email || !fullName || !Array.isArray(raw.workExperiences) || !Array.isArray(raw.skills)) {
    throw new Error('not_cv')
  }
  const now = new Date()
  return {
    email,
    fullName,
    occupation: str(raw.occupation),
    phone: str(raw.phone),
    city: str(raw.city),
    about: str(raw.about),
    skills: strList(raw.skills),
    workExperiences: objList(raw.workExperiences).map(exp => ({
      id: str(exp.id) || uuidv4(),
      company: str(exp.company),
      startMonth: str(exp.startMonth),
      startYear: str(exp.startYear),
      endMonth: str(exp.endMonth),
      endYear: str(exp.endYear),
      description: str(exp.description),
      projects: objList(exp.projects).map(p => ({
        id: str(p.id) || uuidv4(),
        title: str(p.title),
        description: str(p.description),
        startMonth: str(p.startMonth),
        startYear: str(p.startYear),
        endMonth: str(p.endMonth),
        endYear: str(p.endYear),
        technologies: strList(p.technologies),
      })),
    })),
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    label: str(raw.label).trim() || undefined,
  }
}
