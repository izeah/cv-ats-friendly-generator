import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/utils";

/** Fades [data-reveal] elements up as they scroll into view. Marks them with
 *  data-in (not a class) so React re-renders never strip the state. Re-runs when
 *  `key` changes, e.g. after a language switch swaps the content. */
export function useReveal(key?: unknown) {
    useEffect(() => {
        const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])");
        if (typeof IntersectionObserver === "undefined" || prefersReducedMotion()) {
            els.forEach((el) => el.setAttribute("data-in", ""));
            return;
        }
        const io = new IntersectionObserver(
            (entries) =>
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.setAttribute("data-in", "");
                    io.unobserve(entry.target);
                }),
            { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [key]);
}
