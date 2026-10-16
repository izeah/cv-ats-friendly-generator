import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/Language";
import { LogoMark, Wordmark } from "@/components/Illustrations";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Logo link to home. */
export function BrandLink({ size = "md" }: { size?: "sm" | "md" }) {
    const { t } = useI18n();
    return (
        <Link to="/" className="flex items-center gap-2.5 min-w-0" aria-label={`${t.common.brand} — ${t.common.home}`}>
            <LogoMark className={size === "sm" ? "w-8 h-8" : "w-10 h-10"} />
            <Wordmark className={size === "sm" ? "text-[11px]" : "text-base"} />
        </Link>
    );
}

/** Landing sections, reachable from every page ("/#faq" scrolls on the landing page itself). */
function useSections() {
    const { t } = useI18n();
    return [
        { href: "/#features", label: t.nav.features },
        { href: "/#how", label: t.nav.how },
        { href: "/#share", label: t.nav.share },
        { href: "/#stories", label: t.nav.testimonials },
        { href: "/#faq", label: t.nav.faq },
    ];
}

/** Sticky top bar: section links on desktop, a hamburger dropdown on mobile. */
export function SiteHeader() {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { pathname, hash } = useLocation();
    const sections = useSections();
    // The menu stays open only for the URL it was opened on, so navigating closes it.
    const here = pathname + hash;
    const [openAt, setOpenAt] = useState<string | null>(null);
    const open = openAt === here;
    const setOpen = (v: boolean | ((prev: boolean) => boolean)) =>
        setOpenAt((typeof v === "function" ? v(open) : v) ? here : null);

    const panel = useRef<HTMLDivElement>(null);
    const toggle = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        const close = () => setOpenAt(null);
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
        // A click anywhere outside the dropdown closes it; the toggle button handles itself.
        // composedPath, not contains(): the clicked Menu icon is already swapped for the X by now.
        const onClick = (e: MouseEvent) => {
            const path = e.composedPath();
            if (!path.some((n) => n === panel.current || n === toggle.current)) close();
        };
        window.addEventListener("keydown", onKey);
        document.addEventListener("click", onClick);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("click", onClick);
        };
    }, [open]);

    return (
        <>
            {/* Outside the header: its backdrop-filter would clip a fixed child to the bar. Sits above the sticky CTA. */}
            {open && <div className="lg:hidden fixed inset-0 z-[95] bg-forest/30 animate-fade-in" aria-hidden="true" />}
            <header className={cn("sticky top-0 glass border-b border-forest/15", open ? "z-[96]" : "z-50")}>
                <div className="relative max-w-[1200px] mx-auto px-5 sm:px-10 h-16 flex items-center justify-between gap-3">
                    <BrandLink />
                    <nav className="hidden lg:flex items-center gap-8 text-sm font-bold" aria-label={t.common.home}>
                        {sections.map((s) => (
                            <a key={s.href} href={s.href} className="hover:underline underline-offset-4">
                                {s.label}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher compact className="sm:hidden" />
                        <LanguageSwitcher className="hidden sm:inline-flex" />
                        <Button size="sm" onClick={() => navigate("/create")} className="hidden sm:inline-flex">
                            {t.common.buildCV} <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                        <button
                            ref={toggle}
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            aria-expanded={open}
                            aria-controls="mobile-menu"
                            aria-label={open ? t.nav.close : t.nav.open}
                            className="lg:hidden w-10 h-10 rounded-full border border-foreground bg-card flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors"
                        >
                            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {open && (
                    <div
                        ref={panel}
                        id="mobile-menu"
                        className="lg:hidden absolute inset-x-0 top-full border-b border-foreground bg-card animate-slide-down"
                    >
                        <nav className="max-w-[1200px] mx-auto px-5 sm:px-10 py-4 flex flex-col" aria-label={t.common.home}>
                            {sections.map((s) => (
                                <a
                                    key={s.href}
                                    href={s.href}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center justify-between py-3.5 border-b border-forest/10 font-display text-2xl font-bold uppercase tracking-[-0.02em]"
                                >
                                    {s.label}
                                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                                </a>
                            ))}
                            <Button variant="marigold" size="lg" onClick={() => navigate("/create")} className="mt-5">
                                {t.common.buildCV} <ArrowRight className="w-4 h-4" />
                            </Button>
                            <div className="flex justify-center gap-6 pt-4 text-sm font-bold text-muted-foreground">
                                <Link to="/privacy">{t.common.privacy}</Link>
                                <Link to="/terms">{t.common.terms}</Link>
                            </div>
                        </nav>
                    </div>
                )}
            </header>
        </>
    );
}

export function SiteFooter() {
    const { t } = useI18n();
    return (
        <footer className="border-t border-forest/15">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-2">
                    <LogoMark className="w-9 h-9" />
                    <Wordmark className="text-sm" />
                </div>
                <p className="text-sm text-muted-foreground text-center">{t.footer.tagline}</p>
                <nav className="flex items-center gap-5 text-sm font-bold" aria-label="Legal">
                    <Link to="/privacy" className="hover:underline underline-offset-4">{t.common.privacy}</Link>
                    <Link to="/terms" className="hover:underline underline-offset-4">{t.common.terms}</Link>
                </nav>
            </div>
        </footer>
    );
}
