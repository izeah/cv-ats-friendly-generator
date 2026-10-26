// Footer finale: the team hangs out by the office coffee machine and takes turns
// dropping CV tips. They start chatting once the scene scrolls into view; press
// the machine (or a person) to hear the next tip.
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { MascotAvatar, type Who } from "@/components/Mascot";
import { useI18n } from "@/lib/i18n";
import { cn, prefersReducedMotion } from "@/lib/utils";

// Seats around the machine, as % of the stage (x from left, y from bottom).
const SEATS: { who: Who; x: number; y: number; align: "start" | "center" | "end" }[] = [
    { who: "rina", x: 12, y: 6, align: "start" },
    { who: "arya", x: 31, y: 44, align: "center" },
    { who: "sekar", x: 69, y: 44, align: "center" },
    { who: "dimas", x: 88, y: 6, align: "end" },
];

function CoffeeMachine({ brewing }: { brewing: boolean }) {
    return (
        <svg viewBox="0 0 160 190" className="w-full h-auto overflow-visible" aria-hidden="true">
            {/* Steam */}
            <g fill="none" stroke="#f5f4ec" strokeWidth={3.5} strokeLinecap="round" opacity={0.75}>
                {[62, 80, 98].map((x, i) => (
                    <path
                        key={x}
                        d={`M${x} 66c-6-8 6-14 0-22s6-14 0-22`}
                        className="pantry-steam"
                        style={{ animationDelay: `${i * 0.5}s` } as CSSProperties}
                    />
                ))}
            </g>
            <g stroke="#10230c" strokeWidth={3.5} strokeLinejoin="round">
                <rect x={24} y={70} width={112} height={112} rx={14} fill="#f5f4ec" />
                <rect x={24} y={70} width={112} height={26} rx={12} fill="#fce519" />
                <circle cx={46} cy={83} r={5} fill="#30be60" strokeWidth={2.5} />
                <rect x={64} y={78} width={58} height={10} rx={5} fill="#10380b" strokeWidth={2} />
                <rect x={58} y={104} width={44} height={14} rx={4} fill="#2b3b2f" />
                <rect x={50} y={150} width={60} height={10} rx={3} fill="#2b3b2f" />
                {/* Cup */}
                <path d="M62 126h36l-4 24H66z" fill="#fffefa" />
                <path d="M98 131h6a6 6 0 0 1 0 12h-7" fill="none" />
            </g>
            <rect
                x={66}
                y={130}
                width={28}
                height={17}
                fill="#7a4a2a"
                className="transition-transform duration-700 ease-out"
                style={{ transformBox: "fill-box", transformOrigin: "bottom", transform: `scaleY(${brewing ? 1 : 0.35})` }}
            />
            {brewing && <path d="M80 118v10" stroke="#7a4a2a" strokeWidth={4} strokeLinecap="round" />}
        </svg>
    );
}

export default function PantryScene() {
    const { t } = useI18n();
    const s = t.scene;
    const ref = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);
    // -1 = the greeting; then an index into s.tips.
    const [tip, setTip] = useState(-1);
    const [brewing, setBrewing] = useState(false);
    const reduced = prefersReducedMotion();

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const next = useCallback(() => setTip((i) => (i + 1) % s.tips.length), [s.tips.length]);

    // Auto-rotate while the scene is on screen.
    useEffect(() => {
        if (!visible || reduced) return;
        const id = window.setTimeout(next, tip === -1 ? 3200 : 5200);
        return () => clearTimeout(id);
    }, [visible, reduced, tip, next]);

    const brew = () => {
        setBrewing(true);
        window.setTimeout(() => setBrewing(false), 900);
        next();
    };

    const speaker: Who = tip === -1 ? "arya" : s.tips[tip].who;
    const text = tip === -1 ? s.greeting : s.tips[tip].text;
    // Asking a person directly jumps to their next tip.
    const ask = (who: Who) => {
        const from = Math.max(tip, 0);
        for (let k = 1; k <= s.tips.length; k++) {
            const i = (from + k) % s.tips.length;
            if (s.tips[i].who === who) return setTip(i);
        }
    };

    return (
        <section
            ref={ref}
            aria-label={s.label}
            data-lit={visible || undefined}
            className="relative mt-14 sm:mt-20 px-4 overflow-hidden"
        >
            {/* Giant faint wordmark behind the scene */}
            <p
                className="pointer-events-none select-none absolute left-1/2 -translate-x-1/2 bottom-[-0.18em] h-display text-[clamp(120px,24vw,340px)] leading-none whitespace-nowrap text-marigold/[0.05]"
                aria-hidden="true"
            >
                CV ATS
            </p>
            <div
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[-20%] w-[min(900px,140vw)] aspect-square rounded-full"
                style={{ background: "radial-gradient(closest-side, rgb(252 229 25 / 0.16), rgb(252 229 25 / 0.04) 55%, transparent)" }}
                aria-hidden="true"
            />

            <div className="relative mx-auto max-w-[980px] h-[330px] sm:h-[430px]">
                <button
                    type="button"
                    onClick={brew}
                    aria-label={s.brew}
                    title={s.brew}
                    className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[clamp(104px,15vw,170px)] cursor-pointer rounded-2xl transition-transform hover:-translate-y-1 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marigold"
                >
                    <CoffeeMachine brewing={brewing} />
                </button>

                {SEATS.map((seat) => {
                    const talking = seat.who === speaker;
                    const person = t.team[seat.who];
                    return (
                        <div
                            key={seat.who}
                            className={cn("absolute -translate-x-1/2", talking && "z-10")}
                            style={{ left: `${seat.x}%`, bottom: `${seat.y}%` }}
                        >
                            {talking && (
                                <p
                                    key={tip}
                                    className={cn(
                                        "animate-pop-in absolute bottom-full mb-3 w-max max-w-[min(13rem,58vw)] rounded-2xl border-2 border-forest bg-cream px-3.5 py-2.5 text-[13px] font-semibold leading-snug text-forest shadow-stamp-sm",
                                        seat.align === "start" && "left-0",
                                        seat.align === "end" && "right-0",
                                        seat.align === "center" && "left-1/2 -translate-x-1/2",
                                    )}
                                >
                                    {text}
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={() => ask(seat.who)}
                                className={cn(
                                    "group flex flex-col items-center gap-1.5 cursor-pointer transition-transform duration-300 focus-visible:outline-none",
                                    talking ? "-translate-y-1.5" : "hover:-translate-y-1",
                                )}
                                aria-label={`${person.name}, ${person.role}`}
                            >
                                <MascotAvatar
                                    who={seat.who}
                                    className={cn(
                                        "w-[clamp(60px,9.5vw,104px)] shadow-[3px_4px_0_0_rgb(0_0_0/0.35)] group-focus-visible:ring-4 group-focus-visible:ring-marigold",
                                        talking && "ring-4 ring-marigold/60",
                                    )}
                                />
                                <span className={cn("font-mono text-[11px] sm:text-xs", talking ? "text-marigold" : "text-cream/70")}>
                                    {person.name}
                                </span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
