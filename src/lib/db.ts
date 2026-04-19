import Dexie, { type EntityTable } from 'dexie'

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
  phone: string
  city: string
  about: string
  workExperiences: WorkExperience[]
  skills: string[]
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

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
    await db.cvs.update(data.email, {
      ...data,
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
    await db.cvs.update(email, { isArchived: !cv.isArchived, updatedAt: new Date() })
  }
}

export async function deleteCVByEmail(email: string): Promise<void> {
  await db.cvs.delete(email)
}
