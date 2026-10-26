import { useEffect, useState, type ReactNode } from "react";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { detectLang, dictionaries, I18nContext, saveLang, useI18n, type Lang } from "@/lib/i18n";

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Lang>(detectLang);

    useEffect(() => {
        saveLang(lang);
        document.documentElement.lang = lang;
    }, [lang]);

    return (
        <I18nContext.Provider value={{ lang, setLang, t: dictionaries[lang] }}>
            {children}
        </I18nContext.Provider>
    );
}

/** EN | ID toggle shown on every page. */
export function LanguageSwitcher({ className, compact, dark }: { className?: string; compact?: boolean; dark?: boolean }) {
    const { lang, setLang, t } = useI18n();
    return (
        <div
            role="group"
            aria-label={t.common.language}
            className={cn(
                "inline-flex items-center gap-0.5 rounded-full border-2 p-0.5 shrink-0 transition-colors duration-300",
                dark ? "border-cream/35 bg-transparent text-cream" : "border-forest bg-card text-forest",
                className,
            )}
        >
            {!compact && <Languages className="w-3.5 h-3.5 mx-1.5" aria-hidden="true" />}
            {(["en", "id"] as const).map((code) => (
                <Tooltip key={code} label={code === "en" ? "English" : "Bahasa Indonesia"}>
                    <button
                        type="button"
                        aria-pressed={lang === code}
                        lang={code}
                        aria-label={code === "en" ? "English" : "Bahasa Indonesia"}
                        onClick={() => setLang(code)}
                        className={cn(
                            "h-7 min-w-8 px-2 rounded-full text-[11px] font-bold uppercase transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold",
                            lang === code
                                ? dark
                                    ? "bg-marigold text-forest"
                                    : "bg-forest text-cream"
                                : dark
                                  ? "text-cream hover:bg-cream/10"
                                  : "text-forest hover:bg-secondary",
                        )}
                    >
                        {code}
                    </button>
                </Tooltip>
            ))}
        </div>
    );
}
