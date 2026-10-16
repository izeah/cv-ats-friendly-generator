// Looping motion pieces for the landing page: the hero CV mockup that "generates"
// and passes an ATS scan, and a recruiter chat that cycles through five threads.
import { useEffect, useState } from "react";
import { FileText, Paperclip } from "lucide-react";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { useInView } from "@/lib/useInView";
import { Birds, Cactus, Cloud, PaperPlane, SmallCactus, Sun } from "@/components/Illustrations";

/** Counts 0..steps-1 forever, one step per `ms`. */
function useLoop(steps: number, ms: number, enabled: boolean) {
    const [tick, setTick] = useState(0);
    useEffect(() => {
        if (!enabled) return;
        const id = setInterval(() => setTick((t) => (t + 1) % steps), ms);
        return () => clearInterval(id);
    }, [steps, ms, enabled]);
    return tick;
}

// Timeline, one step = 450ms: type name → fill sections → pop skills →
// ATS scan sweeps → "Parsed" tags + "ATS-ready" stamp → hold → restart.
const STEPS = 26;
const SCAN = 14;
const DONE = 17;
const SECTIONS = [
    { label: "Summary", start: 3, parsedAt: 15, widths: [92, 78, 64] },
    { label: "Experience", start: 6, parsedAt: 16, widths: [94, 82, 70, 52] },
];
const SKILLS = ["Go", "PostgreSQL", "Kafka", "Docker"];
const springy = "cubic-bezier(0.34, 1.56, 0.64, 1)";

function Dots({ className }: { className?: string }) {
    return (
        <span className="inline-flex items-center gap-0.5">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className={cn("typing-dot w-1 h-1 rounded-full", className)}
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </span>
    );
}

export function HeroMockup() {
    const reduced = prefersReducedMotion();
    const tick = useLoop(STEPS, 450, !reduced);
    const step = reduced ? STEPS - 1 : tick;
    const on = (n: number) => step >= n;
    const grow = (n: number) => ({ transform: `scaleX(${on(n) ? 1 : 0})` });

    return (
        <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none">
            <div className="absolute -top-12 right-0 w-24 animate-float">
                <Sun className="w-full text-forest animate-spin-slow" />
            </div>
            <Cloud className="absolute top-4 -left-12 w-28 text-forest animate-drift hidden sm:block" />
            <Birds className="absolute -top-10 left-1/3 w-16 text-forest animate-drift [animation-duration:14s]" />
            <Cactus className="absolute -bottom-6 -right-6 sm:-right-14 w-28 sm:w-36 text-forest origin-bottom animate-sway" />
            <SmallCactus className="absolute -bottom-3 -left-8 w-14 text-forest origin-bottom animate-sway [animation-delay:-2s] hidden sm:block" />

            <div className="relative rounded-card border border-foreground bg-card shadow-stamp rotate-[-1.5deg]">
                <div className="relative overflow-hidden rounded-card p-6 sm:p-8">
                    {step >= SCAN && step < DONE && (
                        <div
                            className="pointer-events-none absolute inset-x-0 z-10 h-24 bg-gradient-to-b from-transparent via-marigold/60 to-transparent"
                            style={{ animation: "scan-sweep 1.35s ease-in-out both" }}
                        >
                            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-marigold" />
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-6">
                        <span className="inline-flex items-center gap-2 rounded-full bg-forest text-cream pl-1.5 pr-3.5 py-1.5 text-xs font-bold">
                            <span className="w-5 h-5 rounded-full bg-marigold text-forest flex items-center justify-center">
                                <Paperclip className="w-3 h-3" />
                            </span>
                            {on(DONE) ? (
                                "jane-doe-cv.pdf"
                            ) : (
                                <>
                                    Generating <Dots className="bg-cream" />
                                </>
                            )}
                        </span>
                        <span
                            className="rounded-full bg-marigold border border-foreground px-3 py-1 text-[11px] font-bold uppercase transition-all duration-500"
                            style={{
                                opacity: on(DONE) ? 1 : 0,
                                transform: on(DONE) ? "scale(1) rotate(-6deg)" : "scale(1.8) rotate(-24deg)",
                                transitionTimingFunction: springy,
                            }}
                        >
                            ATS-ready
                        </span>
                    </div>

                    <p
                        className="font-display text-4xl font-bold uppercase leading-none tracking-[-0.03em]"
                        style={{
                            clipPath: on(1) ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
                            transition: "clip-path 0.9s steps(8, end)",
                        }}
                    >
                        Jane Doe
                    </p>
                    <p
                        className="text-sm font-bold text-muted-foreground mt-1 mb-5 transition-all duration-500"
                        style={{ opacity: on(2) ? 1 : 0, transform: on(2) ? "none" : "translateY(6px)" }}
                    >
                        Senior Backend Engineer · Jakarta
                    </p>

                    {SECTIONS.map((sec) => (
                        <div key={sec.label} className="mb-5">
                            <div
                                className="flex items-center justify-between mb-2 transition-opacity duration-300"
                                style={{ opacity: on(sec.start) ? 1 : 0 }}
                            >
                                <p className="text-[11px] font-bold uppercase tracking-widest">{sec.label}</p>
                                <span
                                    className="rounded-full bg-forest text-cream px-2 py-0.5 text-[10px] font-bold uppercase transition-all duration-300"
                                    style={{
                                        opacity: on(sec.parsedAt) ? 1 : 0,
                                        transform: on(sec.parsedAt) ? "none" : "translateY(4px)",
                                    }}
                                >
                                    Parsed
                                </span>
                            </div>
                            <div className="h-px bg-forest/20 mb-3 origin-left transition-transform duration-500" style={grow(sec.start)} />
                            <div className="space-y-2">
                                {sec.widths.map((w, i) => (
                                    <div
                                        key={i}
                                        className="h-2 rounded-full bg-forest/15 origin-left transition-transform duration-500 ease-out"
                                        style={{ width: `${w}%`, ...grow(sec.start + i) }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="flex flex-wrap gap-1.5">
                        {SKILLS.map((s, i) => (
                            <span
                                key={s}
                                className="rounded-full bg-forest text-cream px-3 py-1 text-xs font-bold transition-all duration-300"
                                style={{
                                    opacity: on(10 + i) ? 1 : 0,
                                    transform: on(10 + i) ? "scale(1)" : "scale(0.6)",
                                    transitionTimingFunction: springy,
                                }}
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

type Message = { from: "them" | "me"; text: string; file?: string };
type Thread = { name: string; company: string; initials: string; messages: Message[] };

// Fictional recruiters and companies.
const THREADS: Thread[] = [
    {
        name: "Rina",
        company: "Nusa Pay",
        initials: "RN",
        messages: [
            { from: "them", text: "Hi Jane! Loved your profile. Could you send over your latest CV?" },
            { from: "me", text: "Sure — here it is.", file: "jane-doe-cv.pdf" },
            { from: "them", text: "Clean format, our ATS read every section. Free for a call on Monday?" },
            { from: "me", text: "Monday works. Talk then!" },
        ],
    },
    {
        name: "Dimas",
        company: "Kopi Cloud",
        initials: "DM",
        messages: [
            { from: "them", text: "Your Kafka project caught our eye. What kind of throughput was it?" },
            { from: "me", text: "Around 2M events a day — the details are in my Projects section." },
            { from: "them", text: "That's exactly our scale. Sending a technical interview invite now." },
            { from: "me", text: "Thanks Dimas, looking forward to it!" },
        ],
    },
    {
        name: "Sarah",
        company: "Lumbung Data",
        initials: "SR",
        messages: [
            { from: "me", text: "Hi Sarah, just following up on my Backend Engineer application." },
            { from: "them", text: "Hi Jane! Your CV made it through our ATS screening — you're shortlisted." },
            { from: "me", text: "That's great news! What's the next step?" },
            { from: "them", text: "A 45-minute system design chat. I'll share time slots today." },
        ],
    },
    {
        name: "Kevin",
        company: "Rantai Logistics",
        initials: "KV",
        messages: [
            { from: "them", text: "Could you send an updated CV with your latest project?" },
            { from: "me", text: "Updated and exported — took me two minutes.", file: "jane-doe-cv-v2.pdf" },
            { from: "them", text: "That was fast! Forwarding it to the hiring manager." },
            { from: "me", text: "Appreciate it, Kevin." },
        ],
    },
    {
        name: "Ayu",
        company: "Arunika Tech",
        initials: "AY",
        messages: [
            { from: "them", text: "Great news, Jane — the team would love to make you an offer!" },
            { from: "me", text: "That's amazing. Thank you so much!" },
            { from: "them", text: "I'll email the full details this afternoon." },
            { from: "me", text: "Can't wait to read it. Thanks, Ayu!" },
        ],
    },
];

function Avatar({ mine, initials }: { mine: boolean; initials: string }) {
    return (
        <span
            className={cn(
                "w-8 h-8 rounded-full border border-foreground flex items-center justify-center text-[11px] font-bold shrink-0",
                mine ? "bg-forest text-cream" : "bg-marigold",
            )}
        >
            {mine ? "JD" : initials}
        </span>
    );
}

function Bubble({ mine, children }: { mine: boolean; children: React.ReactNode }) {
    return (
        <div
            className={cn(
                "max-w-[80%] px-4 py-3 text-sm font-semibold leading-snug border",
                mine
                    ? "bg-forest text-cream border-forest rounded-[24px] rounded-br-md"
                    : "bg-white text-forest border-forest/30 rounded-[24px] rounded-bl-md",
            )}
        >
            {children}
        </div>
    );
}

export function RecruiterChat() {
    const [ref, inView] = useInView<HTMLDivElement>(0.3);
    const reduced = prefersReducedMotion();
    const [thread, setThread] = useState(0);
    const [shown, setShown] = useState(reduced ? THREADS[0].messages.length : 0);
    const [typing, setTyping] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const t = THREADS[thread];
    const next = t.messages[shown];

    useEffect(() => {
        if (!inView || reduced) return;
        const timers: number[] = [];
        const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
        if (shown < t.messages.length) {
            const pause = shown === 0 ? 500 : 700;
            at(pause, () => setTyping(true));
            at(pause + 1100, () => {
                setTyping(false);
                setShown((n) => n + 1);
            });
        } else {
            at(2800, () => setLeaving(true));
            at(3300, () => {
                setLeaving(false);
                setShown(0);
                setThread((n) => (n + 1) % THREADS.length);
            });
        }
        return () => timers.forEach(clearTimeout);
    }, [inView, reduced, shown, thread, t.messages.length]);

    return (
        <div ref={ref} className="relative">
            <PaperPlane className="absolute -top-16 right-4 w-28 text-forest animate-plane" />
            <Birds className="absolute -top-12 left-8 w-14 text-forest animate-drift" />
            <div className="relative rounded-card border border-foreground bg-card shadow-stamp p-5 sm:p-7">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-forest/15">
                    <span
                        key={`avatar-${thread}`}
                        className="animate-pop-in w-10 h-10 rounded-full bg-marigold border border-foreground flex items-center justify-center font-display font-bold shrink-0"
                    >
                        {t.initials}
                    </span>
                    <div className="min-w-0">
                        <p key={`name-${thread}`} className="animate-pop-in font-bold leading-tight truncate">
                            {t.name} · {t.company}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs font-bold text-success mt-0.5">
                            <span className="relative flex w-2 h-2">
                                <span className="absolute inset-0 rounded-full bg-fern animate-ping" />
                                <span className="relative w-2 h-2 rounded-full bg-fern" />
                            </span>
                            {typing && next?.from === "them" ? "typing…" : "online"}
                        </p>
                    </div>
                    <div className="ml-auto flex gap-1 shrink-0" aria-hidden="true">
                        {THREADS.map((_, i) => (
                            <span
                                key={i}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    i === thread ? "w-5 bg-forest" : "w-1.5 bg-forest/25",
                                )}
                            />
                        ))}
                    </div>
                </div>

                <div
                    className={cn(
                        "space-y-3 min-h-[420px] sm:min-h-[340px] transition-opacity duration-500",
                        leaving && "opacity-0",
                    )}
                >
                    {t.messages.slice(0, shown).map((m, i) => {
                        const mine = m.from === "me";
                        return (
                            <div key={`${thread}-${i}`} className={cn("animate-pop-in flex items-end gap-2", mine && "flex-row-reverse")}>
                                <Avatar mine={mine} initials={t.initials} />
                                <Bubble mine={mine}>
                                    {m.text}
                                    {m.file && (
                                        <span className="mt-2 flex items-center gap-2 rounded-full bg-cream text-forest px-3 py-1.5 text-xs font-bold">
                                            <FileText className="w-3.5 h-3.5" /> {m.file}
                                        </span>
                                    )}
                                </Bubble>
                            </div>
                        );
                    })}
                    {typing && next && (
                        <div className={cn("animate-pop-in flex items-end gap-2", next.from === "me" && "flex-row-reverse")}>
                            <Avatar mine={next.from === "me"} initials={t.initials} />
                            <Bubble mine={next.from === "me"}>
                                <span className="flex h-4 items-center px-1">
                                    <Dots className={cn("w-1.5 h-1.5", next.from === "me" ? "bg-cream" : "bg-forest")} />
                                </span>
                            </Bubble>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
