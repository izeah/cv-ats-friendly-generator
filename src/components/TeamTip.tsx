import { useState } from "react";
import { MascotAvatar } from "@/components/Mascot";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** One CV tip from the team (the same ones they trade in the footer), with a button to hear another. */
export default function TeamTip({ className }: { className?: string }) {
    const { t } = useI18n();
    const s = t.scene;
    const [i, setI] = useState(0);
    const tip = s.tips[i % s.tips.length];
    const person = t.team[tip.who];

    return (
        <aside className={cn("flex items-start gap-3.5 rounded-2xl border-2 border-forest bg-card px-4 py-3.5 shadow-stamp-sm", className)}>
            <MascotAvatar key={tip.who} who={tip.who} className="w-11 sm:w-12 animate-pop-in" />
            <div className="flex-1 min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-2 text-xs">
                    <span className="font-script text-lg font-bold text-script leading-none">{s.tipsTitle}</span>
                    <span className="font-bold">{person.name}</span>
                    <span className="text-muted-foreground">{person.role}</span>
                </p>
                <p key={i} className="mt-1 text-sm font-semibold leading-snug animate-fade-in">{tip.text}</p>
            </div>
            <button
                type="button"
                onClick={() => setI((n) => n + 1)}
                className="shrink-0 self-center rounded-full border-2 border-forest px-3 py-1 text-xs font-bold hover:bg-marigold transition-colors cursor-pointer"
            >
                {s.next}
            </button>
        </aside>
    );
}
