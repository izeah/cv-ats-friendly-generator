import { useEffect, useRef, useState } from "react";

/** Flips to true the first time the element scrolls into view. */
export function useInView<T extends Element>(threshold = 0.25) {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(
        () => typeof IntersectionObserver === "undefined",
    );
    useEffect(() => {
        const el = ref.current;
        if (!el || inView) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    io.disconnect();
                }
            },
            { threshold },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [inView, threshold]);
    return [ref, inView] as const;
}
