// Testimonials as DM threads: messages type in one by one, the reply gets a
// reaction, an outcome stamp lands, then the next story starts.
import { useEffect, useRef, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { fill, useI18n } from "@/lib/i18n";
import { useInView } from "@/lib/useInView";
import { LogoMark } from "@/components/Illustrations";

const springy = "cubic-bezier(0.34, 1.56, 0.64, 1)";

function TypingDots({ dark }: { dark?: boolean }) {
    return (
        <span className="flex h-4 items-center gap-1 px-1">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className={cn("typing-dot w-1.5 h-1.5 rounded-full", dark ? "bg-cream" : "bg-forest")}
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </span>
    );
}

/** Scrolls a horizontal list so its i-th item sits in the middle (no-op when the list doesn't scroll). */
function centerItem(list: HTMLElement | null, i: number, smooth: boolean) {
    const item = list?.children[i] as HTMLElement | undefined;
    if (!list || !item) return;
    const offset = item.getBoundingClientRect().left - list.getBoundingClientRect().left;
    list.scrollTo({
        left: list.scrollLeft + offset - (list.clientWidth - item.offsetWidth) / 2,
        behavior: smooth ? "smooth" : "auto",
    });
}

export default function Testimonials() {
    const { t } = useI18n();
    const tm = t.testimonials;
    const [ref, inView] = useInView<HTMLDivElement>(0.3);
    const reduced = prefersReducedMotion();
    const [idx, setIdx] = useState(0);
    const story = tm.items[idx];
    const total = story.messages.length;
    const [shown, setShown] = useState(reduced ? total : 0);
    const [typing, setTyping] = useState(false);
    const [stamped, setStamped] = useState(reduced);
    const [leaving, setLeaving] = useState(false);
    const next = story.messages[shown];
    const lastThem = story.messages.map((m) => m.from).lastIndexOf("them");
    const listRef = useRef<HTMLUListElement>(null);
    const settle = useRef(0);

    // Mobile: the people row follows the active story, and glides back to it once the user stops scrolling.
    useEffect(() => centerItem(listRef.current, idx, !reduced), [idx, reduced]);
    const onListScroll = () => {
        clearTimeout(settle.current);
        settle.current = window.setTimeout(() => centerItem(listRef.current, idx, !reduced), 700);
    };

    const select = (i: number) => {
        setIdx(i);
        setTyping(false);
        setLeaving(false);
        setShown(reduced ? tm.items[i].messages.length : 0);
        setStamped(reduced);
    };

    useEffect(() => {
        if (!inView || reduced) return;
        const timers: number[] = [];
        const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
        if (shown < total) {
            const pause = shown === 0 ? 500 : 650;
            at(pause, () => setTyping(true));
            at(pause + (next?.from === "them" ? 1300 : 900), () => {
                setTyping(false);
                setShown((n) => n + 1);
            });
        } else if (!stamped) {
            at(600, () => setStamped(true));
        } else {
            at(3400, () => setLeaving(true));
            at(3900, () => {
                setLeaving(false);
                setShown(0);
                setStamped(false);
                setIdx((i) => (i + 1) % tm.items.length);
            });
        }
        return () => timers.forEach(clearTimeout);
    }, [inView, reduced, shown, stamped, idx, total, next?.from, tm.items.length]);

    const progress = (shown + (stamped ? 1 : 0)) / (total + 1);

    return (
        <div ref={ref} className="grid lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-16 items-start">
            <div className="min-w-0">
                <h2 className="font-display font-bold uppercase text-5xl sm:text-6xl leading-[0.9] tracking-[-0.03em]">
                    {tm.titleA}
                    <br />
                    {tm.titleB}
                </h2>
                <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-md">{tm.lead}</p>

                <ul
                    ref={listRef}
                    onScroll={onListScroll}
                    className="mt-8 flex lg:flex-col gap-3 overflow-x-auto pb-2 -mx-5 px-5 sm:-mx-10 sm:px-10 lg:mx-0 lg:px-0 lg:overflow-visible"
                >
                    {tm.items.map((person, i) => {
                        const active = i === idx;
                        return (
                            <li key={person.name} className="shrink-0">
                                <button
                                    type="button"
                                    onClick={() => select(i)}
                                    aria-pressed={active}
                                    aria-label={fill(tm.pick, { name: person.name })}
                                    className={cn(
                                        "relative overflow-hidden w-60 lg:w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors cursor-pointer",
                                        active ? "bg-forest text-cream border-forest" : "bg-card border-forest/25 hover:bg-secondary",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "w-10 h-10 rounded-full border flex items-center justify-center font-display font-bold shrink-0",
                                            active ? "bg-marigold text-forest border-marigold" : "bg-sage border-forest/30",
                                        )}
                                        aria-hidden="true"
                                    >
                                        {person.initials}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block font-bold truncate">{person.name}</span>
                                        <span className={cn("block text-xs truncate", active ? "text-cream/75" : "text-muted-foreground")}>
                                            {person.outcome}
                                        </span>
                                    </span>
                                    {active && (
                                        <span
                                            className="absolute left-0 bottom-0 h-1 bg-marigold transition-[width] duration-700 ease-out"
                                            style={{ width: `${progress * 100}%` }}
                                            aria-hidden="true"
                                        />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="relative pb-6 min-w-0">
                <div className="relative rounded-card border border-foreground bg-card shadow-stamp p-5 sm:p-7">
                    <div className="flex items-center gap-3 pb-4 mb-5 border-b border-forest/15">
                        <span
                            key={`avatar-${idx}`}
                            className="animate-pop-in w-11 h-11 rounded-full bg-sage border border-forest/40 flex items-center justify-center font-display text-lg font-bold shrink-0"
                            aria-hidden="true"
                        >
                            {story.initials}
                        </span>
                        <div key={`who-${idx}`} className="animate-pop-in min-w-0">
                            <p className="font-bold leading-tight truncate">{story.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{story.role}</p>
                        </div>
                    </div>

                    <div
                        className={cn(
                            "space-y-3 min-h-[500px] sm:min-h-[400px] transition-opacity duration-500",
                            leaving && "opacity-0",
                        )}
                    >
                        {story.messages.slice(0, shown).map((m, i) => {
                            const ours = m.from === "us";
                            return (
                                <div key={`${idx}-${i}`} className={cn("animate-pop-in flex items-end gap-2", ours && "flex-row-reverse")}>
                                    {ours ? (
                                        <LogoMark className="w-8 h-8" />
                                    ) : (
                                        <span
                                            className="w-8 h-8 rounded-full bg-sage border border-forest/40 flex items-center justify-center text-[11px] font-bold shrink-0"
                                            aria-hidden="true"
                                        >
                                            {story.initials}
                                        </span>
                                    )}
                                    <div
                                        className={cn(
                                            "relative max-w-[80%] px-4 py-3 text-sm font-semibold leading-snug border",
                                            ours
                                                ? "bg-forest text-cream border-forest rounded-[22px] rounded-br-md"
                                                : "bg-white text-forest border-forest/25 rounded-[22px] rounded-bl-md",
                                        )}
                                    >
                                        {m.text}
                                        {i === lastThem && shown > lastThem + 1 && (
                                            <span
                                                className="animate-pop-in absolute -bottom-3 right-3 rounded-full bg-card border border-forest/30 px-1.5 py-0.5 text-sm leading-none"
                                                aria-hidden="true"
                                            >
                                                {story.reaction}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {typing && next && (
                            <div className={cn("animate-pop-in flex items-end gap-2", next.from === "us" && "flex-row-reverse")} aria-hidden="true">
                                {next.from === "us" ? (
                                    <LogoMark className="w-8 h-8" />
                                ) : (
                                    <span className="w-8 h-8 rounded-full bg-sage border border-forest/40 flex items-center justify-center text-[11px] font-bold shrink-0">
                                        {story.initials}
                                    </span>
                                )}
                                <div
                                    className={cn(
                                        "px-4 py-3 border",
                                        next.from === "us"
                                            ? "bg-forest border-forest rounded-[22px] rounded-br-md"
                                            : "bg-white border-forest/25 rounded-[22px] rounded-bl-md",
                                    )}
                                >
                                    <TypingDots dark={next.from === "us"} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Outcome stamp lands on the card once the thread is done */}
                <div
                    className="absolute bottom-0 left-6 sm:left-auto sm:right-8 flex items-center gap-2 rounded-full bg-marigold border-2 border-forest px-4 py-2 text-sm font-bold transition-all duration-500"
                    style={{
                        opacity: stamped && !leaving ? 1 : 0,
                        transform: stamped && !leaving ? "scale(1) rotate(-4deg)" : "scale(1.7) rotate(-18deg)",
                        transitionTimingFunction: springy,
                    }}
                    aria-live="polite"
                >
                    <BadgeCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {stamped && story.outcome}
                </div>
            </div>
        </div>
    );
}
