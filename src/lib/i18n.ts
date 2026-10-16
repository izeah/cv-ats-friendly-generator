import { createContext, createElement, Fragment, useContext, useEffect, type ReactNode } from 'react'
import { en, id, type Dict } from './i18n-dict'

export type Lang = 'en' | 'id'
export type { Dict }

export const dictionaries: Record<Lang, Dict> = { en, id }

const STORAGE_KEY = 'cv-builder-lang'

/** Saved choice first, otherwise the browser language (Indonesian → id, anything else → en). */
export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'id') return saved
  } catch {
    // storage blocked (private mode, disabled cookies): fall through to the browser language
  }
  return navigator.language?.toLowerCase().startsWith('id') ? 'id' : 'en'
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // ignore: the choice just won't persist
  }
}

export const I18nContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void; t: Dict }>({
  lang: 'en',
  setLang: () => {},
  t: en,
})

export const useI18n = () => useContext(I18nContext)

/** "Exported {name}" + { name: 'Jane' } → "Exported Jane". */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key) => (key in values ? String(values[key]) : m))
}

/** Like fill(), but the values can be React nodes (e.g. a bold name inside a sentence). */
export function rich(template: string, values: Record<string, ReactNode>): ReactNode[] {
  return template.split(/(\{\w+\})/).map((part, i) => {
    const key = part.match(/^\{(\w+)\}$/)?.[1]
    return createElement(Fragment, { key: i }, key && key in values ? values[key] : part)
  })
}

/** Keeps the tab title and meta description in sync with the page and language. */
export function usePageMeta(meta: { title: string; description: string }) {
  useEffect(() => {
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
  }, [meta.title, meta.description])
}
