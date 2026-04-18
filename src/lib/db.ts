import Dexie, { type EntityTable } from 'dexie'

// ===== Type Definitions =====

export interface Project {
  id: string
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
  workExperiences: WorkExperience[]
  skills: string[]
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

export async function getAllCVs(): Promise<CVData[]> {
  return db.cvs.orderBy('updatedAt').reverse().toArray()
}

export async function deleteCVByEmail(email: string): Promise<void> {
  await db.cvs.delete(email)
}
