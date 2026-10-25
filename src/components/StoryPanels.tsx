// Extra screens for the "zero to hired" story, sized like the SVG vignettes
// (280:160). Their loops are CSS keyframes in index.css (panel-cycle, panel-scan, stamp-in).
import type { CSSProperties, ReactNode } from "react";
import { CalendarCheck } from "lucide-react";
import { MascotAvatar } from "@/components/Mascot";
import { useI18n } from "@/lib/i18n";

const at = (s: number) => ({ "--pd": `${s}s` }) as CSSProperties;

function Frame({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div
            role="img"
            aria-label={label}
            className="grid-paper relative overflow-hidden rounded-3xl border border-forest/15 bg-background/50 aspect-[280/160]"
        >
            {children}
        </div>
    );
}

/** 00: a pretty two-column template the ATS can barely read. */
export function StartPanel() {
    const p = useI18n().t.how.panels.start;
    return (
        <Frame label={p.label}>
            <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-[58%] aspect-[3/2] flex rounded-lg border-2 border-forest bg-card overflow-hidden">
                <div className="w-[36%] bg-forest/85 p-2 flex flex-col items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-marigold border-2 border-cream/70" />
                    {[80, 60, 70].map((w) => (
                        <span key={w} className="h-1 rounded-full bg-cream/60" style={{ width: `${w}%` }} />
                    ))}
                </div>
                <div className="flex-1 p-2 space-y-1.5">
                    {[90, 70, 80].map((w) => (
                        <span key={w} className="block h-1 rounded-full bg-forest/20" style={{ width: `${w}%` }} />
                    ))}
                    <div className="grid grid-cols-2 gap-1 pt-0.5">
                        {[0, 1, 2, 3].map((i) => (
                            <span key={i} className="h-3 rounded-sm border border-forest/25" />
                        ))}
                    </div>
                </div>
                <span className="panel-scan absolute inset-x-0 h-5 bg-gradient-to-b from-transparent via-marigold/60 to-transparent" />
            </div>
            {[
                { left: "64%", top: "20%", d: 0.8 },
                { left: "70%", top: "52%", d: 1.3 },
            ].map((q) => (
                <span
                    key={q.left}
                    className="panel-cycle absolute grid place-items-center w-5 h-5 rounded-full border-2 border-forest bg-coral text-[11px] font-bold text-forest"
                    style={{ left: q.left, top: q.top, ...at(q.d) }}
                >
                    ?
                </span>
            ))}
            <span
                className="panel-cycle absolute left-3 bottom-3 rounded-full border-2 border-forest bg-coral px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-forest"
                style={at(1.8)}
            >
                {p.chip}
            </span>
        </Frame>
    );
}

/** 03: the recruiter's message and a calendar invite. */
export function InvitePanel() {
    const p = useI18n().t.how.panels.invite;
    return (
        <Frame label={p.label}>
            <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-center gap-2.5">
                <div className="panel-cycle flex items-end gap-2" style={at(0.2)}>
                    <MascotAvatar who="rina" className="w-8 sm:w-9" />
                    <p className="max-w-[78%] rounded-2xl rounded-bl-md border-2 border-forest/20 bg-white px-3 py-2 text-[11px] sm:text-xs font-semibold leading-snug text-forest">
                        {p.message}
                    </p>
                </div>
                <div className="panel-cycle ml-10 sm:ml-11 self-start" style={at(1)}>
                    <span className="inline-flex items-center gap-2 rounded-xl border-2 border-forest bg-marigold px-3 py-1.5 text-[11px] sm:text-xs font-bold text-forest shadow-stamp-sm">
                        <CalendarCheck className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
                        {p.event}
                    </span>
                </div>
            </div>
        </Frame>
    );
}

/** 04: the offer letter gets its stamp. */
export function OfferPanel() {
    const p = useI18n().t.how.panels.offer;
    return (
        <Frame label={p.label}>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[56%] aspect-[4/3] rounded-lg border-2 border-forest bg-card overflow-hidden">
                <div className="bg-forest px-2.5 py-1.5 text-[9px] sm:text-[10px] font-bold text-cream truncate">{p.title}</div>
                <div className="p-2.5 space-y-1.5">
                    {[92, 80, 86, 55].map((w) => (
                        <span key={w} className="block h-1 rounded-full bg-forest/20" style={{ width: `${w}%` }} />
                    ))}
                    <svg viewBox="0 0 60 14" className="w-12 pt-1 text-forest" aria-hidden="true">
                        <path d="M2 10c6-8 9 2 14-3s6 4 11-1 8 3 12 0 6-2 9 0" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
                    </svg>
                </div>
            </div>
            <span className="stamp-in absolute right-[14%] top-[22%] rounded-lg border-[3px] border-forest bg-marigold px-2.5 py-0.5 h-display text-lg sm:text-xl text-forest">
                {p.stamp}
            </span>
        </Frame>
    );
}
