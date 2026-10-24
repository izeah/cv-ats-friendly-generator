import { useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

/** Floating "back to top" pill that appears once the page is scrolled down.
 *  Also starts each newly opened page at the top. */
export default function ScrollToTop() {
    const [visible, setVisible] = useState(() => window.scrollY > 600);
    const { pathname, hash } = useLocation();
    const navType = useNavigationType();
    const { t } = useI18n();
    // CV pages and the landing page have a fixed bottom bar on phones; sit above it.
    const onCVPage = pathname.startsWith("/cv");
    const onLanding = pathname === "/";

    // Links and redirects open at the top. Back/forward (POP) keeps the browser's own scroll restore,
    // and "/#faq" is scrolled to by Landing. "instant" beats the CSS smooth scrolling on <html>.
    useLayoutEffect(() => {
        if (navType !== "POP" && !hash) window.scrollTo({ top: 0, behavior: "instant" });
    }, [pathname, hash, navType]);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 600);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <button
            type="button"
            aria-label={t.common.backToTop}
            title={t.common.backToTop}
            onClick={() =>
                window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })
            }
            className={cn(
                "no-print fixed right-4 sm:right-6 z-[90] w-12 h-12 rounded-full bg-marigold text-forest border-2 border-forest shadow-stamp-sm flex items-center justify-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-stamp focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marigold/60",
                onCVPage ? "bottom-24 sm:bottom-6" : onLanding ? "bottom-24 md:bottom-6" : "bottom-6",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
            )}
            tabIndex={visible ? 0 : -1}
        >
            <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
        </button>
    );
}
