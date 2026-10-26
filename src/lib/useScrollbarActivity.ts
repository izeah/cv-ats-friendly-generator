import { useEffect } from 'react'

/** Marks whichever element is scrolling (the page included) with data-scrolling,
 *  and clears it once scrolling has been idle for `idleMs`. The CSS shows the
 *  scrollbar thumb only while the mark is there. */
export function useScrollbarActivity(idleMs = 900) {
  useEffect(() => {
    const timers = new Map<Element, number>()
    const onScroll = (e: Event) => {
      const el = e.target instanceof Element ? e.target : document.documentElement
      if (!el.hasAttribute('data-scrolling')) el.setAttribute('data-scrolling', '')
      clearTimeout(timers.get(el))
      timers.set(
        el,
        window.setTimeout(() => {
          el.removeAttribute('data-scrolling')
          timers.delete(el)
        }, idleMs),
      )
    }
    // Scroll events don't bubble, so listen in the capture phase to hear every scroller.
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true })
      timers.forEach((timer, el) => {
        clearTimeout(timer)
        el.removeAttribute('data-scrolling')
      })
    }
  }, [idleMs])
}
