import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react'

/** A key plus modifiers. `mod` is Cmd on macOS and Ctrl everywhere else. */
export type Shortcut = { key: string; mod?: boolean; shift?: boolean }

// One registry, so the tooltips, the palette footer and the handlers always agree.
// Browser-reserved combos (new tab, private window, devtools) are avoided.
export const SHORTCUTS = {
  search: { key: 'k', mod: true },
  newCV: { key: 'o', mod: true, shift: true },
  importCV: { key: 'u', mod: true, shift: true },
  toggleSidebar: { key: 'b', mod: true },
  home: { key: 'h', mod: true, shift: true },
  save: { key: 's', mod: true },
  savePreview: { key: 'Enter', mod: true },
  edit: { key: 'e', mod: true },
  share: { key: 'l', mod: true, shift: true },
  pdf: { key: 'p', mod: true },
  // Inside the search palette
  open: { key: 'Enter' },
  openNewTab: { key: 'Enter', mod: true },
  rename: { key: 'e', mod: true, shift: true },
  remove: { key: 'd', mod: true, shift: true },
  close: { key: 'Escape' },
  up: { key: 'ArrowUp' },
  down: { key: 'ArrowDown' },
} satisfies Record<string, Shortcut>

function detectMac(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  return /mac|iphone|ipad|ipod/i.test(nav.userAgentData?.platform || nav.platform || nav.userAgent)
}

export const isMac = detectMac()

const LABELS: Record<string, [mac: string, other: string]> = {
  mod: ['⌘', 'Ctrl'],
  shift: ['⇧', 'Shift'],
  Enter: ['↵', 'Enter'],
  Escape: ['esc', 'Esc'],
  ArrowUp: ['↑', '↑'],
  ArrowDown: ['↓', '↓'],
}

const label = (name: string) => LABELS[name]?.[isMac ? 0 : 1] ?? name.toUpperCase()

/** Key caps in the platform's order: ⇧ ⌘ K on macOS, Ctrl Shift K elsewhere. */
export function shortcutKeys(s: Shortcut): string[] {
  const mods = isMac
    ? [s.shift && 'shift', s.mod && 'mod']
    : [s.mod && 'mod', s.shift && 'shift']
  return [...mods.filter((m): m is string => !!m), s.key].map(label)
}

/** The same combo for the aria-keyshortcuts attribute, e.g. "Meta+Shift+O". */
export function ariaKeys(s: Shortcut): string {
  const key = s.key.length === 1 ? s.key.toUpperCase() : s.key
  return [s.mod && (isMac ? 'Meta' : 'Control'), s.shift && 'Shift', key].filter(Boolean).join('+')
}

export function matches(e: KeyboardEvent | ReactKeyboardEvent, s: Shortcut): boolean {
  const mod = isMac ? e.metaKey : e.ctrlKey
  const stray = isMac ? e.ctrlKey : e.metaKey
  return (
    mod === !!s.mod &&
    e.shiftKey === !!s.shift &&
    !e.altKey &&
    !stray &&
    e.key.toLowerCase() === s.key.toLowerCase()
  )
}

/** Runs `handler` when the shortcut is pressed anywhere on the page. Page shortcuts
 *  (save, PDF…) stay quiet while focus is inside a dialog; pass `inDialogs` for the
 *  ones the search palette lists, so they work from there too. */
export function useShortcut(
  s: Shortcut,
  handler: (e: KeyboardEvent) => void,
  { enabled = true, inDialogs = false }: { enabled?: boolean; inDialogs?: boolean } = {},
) {
  const latest = useRef(handler)
  useEffect(() => {
    latest.current = handler
  })
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing || e.defaultPrevented || e.repeat || !matches(e, s)) return
      if (!inDialogs && e.target instanceof Element && e.target.closest('[role="dialog"]')) return
      e.preventDefault()
      latest.current(e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [s, enabled, inDialogs])
}
