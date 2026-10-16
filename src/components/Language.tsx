import { useEffect, useState, type ReactNode } from "react";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
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
export function LanguageSwitcher({ className, compact }: { className?: string; compact?: boolean }) {
    const { lang, setLang, t } = useI18n();
    return (
        <div
            role="group"
            aria-label={t.common.language}
            className={cn(
                "inline-flex items-center gap-0.5 rounded-full border border-foreground bg-card p-0.5 shrink-0",
                className,
            )}
        >
            {!compact && <Languages className="w-3.5 h-3.5 mx-1.5" aria-hidden="true" />}
            {(["en", "id"] as const).map((code) => (
                <button
                    key={code}
                    type="button"
                    aria-pressed={lang === code}
                    lang={code}
                    title={code === "en" ? "English" : "Bahasa Indonesia"}
                    aria-label={code === "en" ? "English" : "Bahasa Indonesia"}
                    onClick={() => setLang(code)}
                    className={cn(
                        "h-7 min-w-8 px-2 rounded-full text-[11px] font-bold uppercase transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest",
                        lang === code ? "bg-forest text-cream" : "text-forest hover:bg-secondary",
                    )}
                >
                    {code}
                </button>
            ))}
        </div>
    );
}
