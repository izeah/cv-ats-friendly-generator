import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/utils";

// One pointer listener for every mascot on the page. Each frame, every
// registered element gets --lx / --ly in [-1, 1]: where the pointer sits
// relative to the element's eyes, so the pupils can glance at it.
const watched = new Set<Element>();
let px = 0;
let py = 0;
let frame = 0;

function update() {
    frame = 0;
    watched.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const dx = px - (r.left + r.width / 2);
        const dy = py - (r.top + r.height * 0.38);
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 260);
        (el as HTMLElement).style.setProperty("--lx", ((dx / d) * k).toFixed(3));
        (el as HTMLElement).style.setProperty("--ly", ((dy / d) * k).toFixed(3));
    });
}

function onMove(e: PointerEvent) {
    px = e.clientX;
    py = e.clientY;
    if (!frame) frame = requestAnimationFrame(update);
}

/** Lets an element's pupils follow a mouse pointer (no-op on touch and reduced motion). */
export function useLook<T extends Element>(enabled = true) {
    const ref = useRef<T>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el || !enabled || prefersReducedMotion() || !matchMedia("(pointer: fine)").matches) return;
        watched.add(el);
        if (watched.size === 1) window.addEventListener("pointermove", onMove, { passive: true });
        return () => {
            watched.delete(el);
            if (watched.size === 0) window.removeEventListener("pointermove", onMove);
        };
    }, [enabled]);
    return ref;
}
