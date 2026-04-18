import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(month: string, year: string): string {
  if (!month || !year) return ''
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  const monthIndex = parseInt(month) - 1
  return `${monthNames[monthIndex]} ${year}`
}

export function generateSlug(email: string): string {
  return btoa(email).replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
}
