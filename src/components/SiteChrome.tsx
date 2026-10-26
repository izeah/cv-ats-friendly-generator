import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/Language";
import { LogoMark, Wordmark } from "@/components/Illustrations";
import PantryScene from "@/components/PantryScene";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Logo link to home. */
export function BrandLink({ size = "md", onDark }: { size?: "sm" | "md"; onDark?: boolean }) {
    const { t } = useI18n();
    return (
        <Link to="/" className="flex items-center gap-2.5 min-w-0" aria-label={`${t.common.brand} — ${t.common.home}`}>
            <LogoMark onDark={onDark} className={size === "sm" ? "w-8 h-8" : "w-10 h-10"} />
            <Wordmark className={size === "sm" ? "text-[11px]" : "text-[15px]"} />
        </Link>
    );
}

/** Landing sections, reachable from every page ("/#faq" scrolls on the landing page itself). */
function useSections() {
    const { t } = useI18n();
    return [
        { id: "features", label: t.nav.features },
        { id: "how", label: t.nav.how },
        { id: "share", label: t.nav.share },
        { id: "stories", label: t.nav.testimonials },
        { id: "faq", label: t.nav.faq },
    ];
}

type Theme = "light" | "dark" | "accent";

/** Reads the [data-header] theme of whatever section sits under the bar, plus which
 *  nav section is in view. One rAF-throttled scroll listener; ~10 rects per frame. */
function useHeaderTheme(sectionIds: string[]) {
    const { pathname } = useLocation();
    const [state, setState] = useState<{ theme: Theme; top: boolean; active: string | null }>({
        theme: "light",
        top: true,
        active: null,
    });
    const ids = sectionIds.join(",");

    useEffect(() => {
        let frame = 0;
        const read = () => {
            frame = 0;
            const line = 32; // middle of the 64px bar
            let theme: Theme = "light";
            document.querySelectorAll<HTMLElement>("[data-header]").forEach((el) => {
                const r = el.getBoundingClientRect();
                if (r.top <= line && r.bottom > line) theme = el.dataset.header as Theme;
            });
            const probe = window.innerHeight * 0.4;
            let active: string | null = null;
            ids.split(",").forEach((id) => {
                const r = document.getElementById(id)?.getBoundingClientRect();
                if (r && r.top <= probe && r.bottom > probe) active = id;
            });
            const top = window.scrollY < 8;
            setState((s) => (s.theme === theme && s.top === top && s.active === active ? s : { theme, top, active }));
        };
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(read);
        };
        read();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [pathname, ids]);

    return state;
}

/** Sticky top bar. Transparent over the dark hero, then it takes on the colour of
 *  the section underneath (data-header="dark" | "light" | "accent"). */
export function SiteHeader() {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { pathname, hash } = useLocation();
    const sections = useSections();
    const { theme, top, active } = useHeaderTheme(sections.map((s) => s.id));
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

    const dark = theme === "dark" && !open;
    const clear = dark && top;

    return (
        <>
            {/* Outside the header: its backdrop-filter would clip a fixed child to the bar. Sits above the sticky CTA. */}
            {open && <div className="lg:hidden fixed inset-0 z-[95] bg-forest/40 animate-fade-in" aria-hidden="true" />}
            <header
                data-theme={theme}
                className={cn(
                    "no-print sticky top-0 border-b transition-[background-color,border-color,color] duration-300",
                    open ? "z-[96]" : "z-50",
                    clear
                        ? "bg-transparent border-transparent text-cream"
                        : dark
                          ? "bg-forest/90 backdrop-blur-md border-cream/15 text-cream"
                          : theme === "accent"
                            ? "bg-marigold/95 backdrop-blur-md border-forest/20 text-forest"
                            : "glass border-forest/10 text-forest",
                )}
            >
                <div className="relative max-w-[1240px] mx-auto px-5 sm:px-10 h-16 flex items-center justify-between gap-3">
                    <BrandLink onDark={dark} />
                    <nav className="hidden lg:flex items-center gap-7 text-sm font-bold" aria-label={t.common.home}>
                        {sections.map((s) => (
                            <a
                                key={s.id}
                                href={`/#${s.id}`}
                                aria-current={active === s.id ? "true" : undefined}
                                className={cn(
                                    "relative py-1 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[3px] after:rounded-full after:origin-left after:transition-transform after:duration-300",
                                    dark ? "after:bg-marigold" : "after:bg-forest",
                                    active === s.id ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
                                )}
                            >
                                {s.label}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher compact dark={dark} className="sm:hidden" />
                        <LanguageSwitcher dark={dark} className="hidden sm:inline-flex" />
                        <Button
                            size="sm"
                            variant={dark ? "marigold" : "default"}
                            onClick={() => navigate("/create")}
                            className={cn("hidden sm:inline-flex h-9 px-4", dark && "shadow-none hover:shadow-stamp-sm")}
                        >
                            {t.common.buildCV} <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                        <button
                            ref={toggle}
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            aria-expanded={open}
                            aria-controls="mobile-menu"
                            aria-label={open ? t.nav.close : t.nav.open}
                            className={cn(
                                "lg:hidden w-10 h-10 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors",
                                dark ? "border-cream/35 text-cream hover:bg-cream/10" : "border-forest bg-card hover:bg-secondary",
                            )}
                        >
                            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {open && (
                    <div
                        ref={panel}
                        id="mobile-menu"
                        className="lg:hidden absolute inset-x-0 top-full border-b-2 border-forest bg-card text-forest animate-slide-down"
                    >
                        <nav className="max-w-[1240px] mx-auto px-5 sm:px-10 py-4 flex flex-col" aria-label={t.common.home}>
                            {sections.map((s) => (
                                <a
                                    key={s.id}
                                    href={`/#${s.id}`}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center justify-between py-3.5 border-b border-forest/10 h-display text-2xl"
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
    const sections = useSections();
    const col = "font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-cream/55 mb-4";
    const link = "inline-flex items-center gap-1.5 text-[17px] font-bold text-cream hover:text-marigold transition-colors";
    return (
        <footer data-header="dark" className="no-print on-dark relative overflow-hidden bg-forest-deep text-cream">
            <div className="relative max-w-[1240px] mx-auto px-5 sm:px-10 pt-16 sm:pt-20">
                <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
                    <div>
                        <BrandLink onDark />
                        <p className="mt-5 max-w-sm text-cream/70 leading-relaxed">{t.footer.tagline}</p>
                    </div>
                    <div>
                        <p className={col}>{t.footer.product}</p>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/create" className={link}>
                                    {t.common.buildCV} <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                                </Link>
                            </li>
                            {sections.slice(1, 2).concat(sections.slice(4)).map((s) => (
                                <li key={s.id}>
                                    <a href={`/#${s.id}`} className={link}>
                                        {s.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className={col}>{t.footer.legal}</p>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/privacy" className={link}>{t.common.privacy}</Link>
                            </li>
                            <li>
                                <Link to="/terms" className={link}>{t.common.terms}</Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-14 pt-6 border-t border-cream/15 flex flex-col sm:flex-row gap-2 justify-between text-xs text-cream/55">
                    <p>© {new Date().getFullYear()} CV ATS Friendly Builder · {t.footer.rights}</p>
                    <p className="font-mono">cv-generator.izeah.my.id</p>
                </div>
            </div>
            <PantryScene />
        </footer>
    );
}
