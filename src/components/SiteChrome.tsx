import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/Language";
import { LogoMark, Wordmark } from "@/components/Illustrations";
import { useI18n } from "@/lib/i18n";

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

/** Sticky top bar for content pages (legal, 404). `children` replaces the default actions. */
export function SiteHeader({ children }: { children?: ReactNode }) {
    const { t } = useI18n();
    const navigate = useNavigate();
    return (
        <header className="sticky top-0 z-50 glass border-b border-forest/15">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-10 h-16 flex items-center justify-between gap-3">
                <BrandLink />
                <div className="flex items-center gap-2">
                    <LanguageSwitcher compact className="sm:hidden" />
                    <LanguageSwitcher className="hidden sm:inline-flex" />
                    {children ?? (
                        <Button size="sm" onClick={() => navigate("/create")} className="hidden sm:inline-flex">
                            {t.common.buildCV} <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            </div>
        </header>
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
