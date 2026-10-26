import type { ReactNode } from "react";
import { cn, stagger } from "@/lib/utils";

/** The marigold sticker behind a heading's punchline. */
export function Hl({ children }: { children: ReactNode }) {
    return (
        <span className="hl">
            <span>{children}</span>
        </span>
    );
}

/** Section opener: handwritten kicker, big heading, and a lead that sits to the right on wide screens. */
export function SectionHead({
    kicker,
    title,
    lead,
    className,
    stacked,
}: {
    kicker?: string;
    title: ReactNode;
    lead?: ReactNode;
    className?: string;
    /** Keep the lead under the heading instead of beside it. */
    stacked?: boolean;
}) {
    return (
        <header
            className={cn(
                "grid gap-x-16 gap-y-5 mb-11 sm:mb-16",
                !stacked && "lg:grid-cols-[1.2fr_0.8fr] lg:items-end",
                className,
            )}
        >
            <div data-reveal>
                {kicker && <p className="kicker mb-3">{kicker}</p>}
                <h2 className="h-display text-[clamp(34px,4.4vw,58px)] max-w-[17ch]">{title}</h2>
            </div>
            {lead && (
                <p data-reveal style={stagger(0.1)} className="text-lg text-muted-foreground leading-relaxed max-w-md">
                    {lead}
                </p>
            )}
        </header>
    );
}
