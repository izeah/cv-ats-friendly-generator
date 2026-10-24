// Brand marks. The line-art scenery that used to live here was replaced by the
// mascots in Mascot.tsx.
import { cn } from "@/lib/utils";

/** Brand mark: a CV sheet crossed by a Marigold ATS scan beam, plus a builder sparkle. */
/** Decorative by default; pass `label` when the mark stands alone so screen readers announce it. */
export function LogoMark({ className, animated = true, label, onDark }: { className?: string; animated?: boolean; label?: string; onDark?: boolean }) {
    return (
        <svg
            viewBox="0 0 64 64"
            className={cn("shrink-0", className)}
            {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
        >
            {label && <title>{label}</title>}
            {onDark ? (
                <rect x="1" y="1" width="62" height="62" rx="15" className="fill-forest-deep stroke-cream/40" strokeWidth="2" />
            ) : (
                <rect width="64" height="64" rx="16" className="fill-forest" />
            )}
            <path d="M20 11h15l9 9v31a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2V13a2 2 0 0 1 2-2z" className="fill-parchment" />
            <path d="M35 11v7a2 2 0 0 0 2 2h7z" className="fill-sage" />
            <circle cx="24" cy="20" r="3" className="fill-forest" />
            <path d="M30 19.5h4M30 23.5h8M23 41h17M23 46h11" className="stroke-forest" strokeWidth="2.2" strokeLinecap="round" />
            <g className={animated ? "logo-scan" : undefined}>
                <rect x="18" y="26" width="26" height="12" className="fill-marigold" opacity=".35" />
                <rect x="9" y="29" width="46" height="6" rx="3" className="fill-marigold" />
            </g>
            <path
                d="M51.5 39.5l1.6 4.9 4.9 1.6-4.9 1.6-1.6 4.9-1.6-4.9-4.9-1.6 4.9-1.6z"
                className={cn("fill-marigold", animated && "twinkle")}
            />
        </svg>
    );
}

/** Two-line lockup of the product name; size it with the parent's font-size. */
export function Wordmark({ className }: { className?: string }) {
    return (
        <span className={cn("flex flex-col leading-none", className)}>
            <span className="font-display font-bold tracking-[-0.04em] text-[1.18em]">CV ATS Friendly</span>
            <span className="font-mono font-bold uppercase tracking-[0.32em] text-[0.58em] mt-[0.35em] opacity-80">Builder</span>
        </span>
    );
}
