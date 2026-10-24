import type { CSSProperties } from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Month names in the UI language: "Aug 2021" (en) / "Agu 2021" (id). */
export function monthName(month: number, lang: 'en' | 'id', style: 'short' | 'long' = 'short'): string {
  return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', { month: style }).format(new Date(2000, month - 1, 1))
}

export function formatDate(month: string, year: string, lang: 'en' | 'id' = 'en'): string {
  if (!month || !year) return ''
  return `${monthName(parseInt(month), lang)} ${year}`
}

export function generateSlug(email: string): string {
  return btoa(email).replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
}

export function prefersReducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Reveal delay for a [data-reveal] element, in seconds (see useReveal). */
export function stagger(seconds: number): CSSProperties {
  return { '--d': `${seconds}s` } as CSSProperties
}
