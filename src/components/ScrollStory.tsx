// Sticky story: the steps scroll by on the left while one "screen" stays pinned
// on the right and swaps its panel to match the step in the middle of the
// viewport. On phones the screen pins to the top as a band above the text.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Step = { label: string; title: string; description: string; tag: string };

// Marigold creeps into the screen as the story moves on.
const SCREEN_TINTS = ["#fffefa", "#fffcea", "#fff8c8", "#fff3a3", "#ffee7a"];

const pad = (i: number) => String(i).padStart(2, "0");

// Dashes for the meter line: marigold on the stretch already walked (and on
// dark surfaces), muted ink for the road ahead on light ones.
const DASH_LIT = (gap: string) => `repeating-linear-gradient(90deg, var(--color-marigold) 0 16px, ${gap} 16px 24px)`;
const DASH_DIM = "repeating-linear-gradient(90deg, rgb(16 56 11 / 0.22) 0 16px, transparent 16px 24px)";

/** Numbered stops on a dashed line, the current one marigold with a halo and a
 *  handwritten caption underneath. `dark` for forest surfaces. */
export function StepMeter({
    count,
    active,
    ends,
    caption,
    dark,
    onPick,
    className,
}: {
    count: number;
    active: number;
    ends: [string, string];
    caption?: string;
    dark?: boolean;
    onPick?: (index: number) => void;
    className?: string;
}) {
    const progress = count > 1 ? active / (count - 1) : 0;
    const Dot = onPick ? "button" : "span";
    return (
        <div className={cn("flex items-center gap-3 sm:gap-5", className)} aria-hidden="true">
            <span className={cn("hidden min-[420px]:inline text-[13px] sm:text-sm font-bold", dark ? "text-cream/85" : "text-muted-foreground")}>{ends[0]}</span>
            <div className="relative flex-1 flex items-center justify-between h-14">
                {/* Line runs centre to centre of the first and last stop */}
                <span
                    className="absolute left-[18px] right-[18px] top-1/2 h-[3px] -translate-y-1/2"
                    style={{ background: dark ? DASH_LIT("rgb(245 244 236 / 0.3)") : DASH_DIM }}
                />
                {!dark && (
                    <span
                        className="absolute left-[18px] top-1/2 h-[3px] -translate-y-1/2 transition-[width] duration-500 ease-out"
                        style={{ width: `calc((100% - 36px) * ${progress})`, background: DASH_LIT("var(--color-forest)") }}
                    />
                )}
                {Array.from({ length: count }, (_, i) => {
                    const current = i === active;
                    return (
                        <span key={i} className="relative z-[1] grid place-items-center w-9 h-9">
                            {current && (
                                <span className={cn("absolute w-16 h-16 rounded-full", dark ? "bg-black/25" : "bg-marigold/35")} />
                            )}
                            <Dot
                                {...(onPick ? { type: "button" as const, tabIndex: -1, onClick: () => onPick(i) } : {})}
                                className={cn(
                                    "relative grid place-items-center rounded-full font-bold tabular-nums transition-all duration-300",
                                    onPick && "cursor-pointer",
                                    current
                                        ? "w-11 h-11 text-[15px] bg-marigold text-forest-deep border-[3px] border-forest-deep"
                                        : cn(
                                              "w-9 h-9 text-[13px] border-2",
                                              dark
                                                  ? "bg-forest border-cream/35 text-cream/90"
                                                  : i < active
                                                    ? "bg-forest border-forest text-cream"
                                                    : "bg-card border-forest/30 text-muted-foreground",
                                          ),
                                )}
                            >
                                {pad(i)}
                            </Dot>
                            {current && caption && (
                                <span
                                    className={cn(
                                        "absolute top-full mt-3 font-script text-xl font-bold whitespace-nowrap",
                                        i === 0 ? "left-0" : i === count - 1 ? "right-0" : "left-1/2 -translate-x-1/2",
                                        dark ? "text-marigold" : "text-script",
                                    )}
                                >
                                    {caption}
                                </span>
                            )}
                        </span>
                    );
                })}
            </div>
            <span className={cn("hidden min-[420px]:inline text-[13px] sm:text-sm font-bold", dark ? "text-cream/85" : "text-muted-foreground")}>{ends[1]}</span>
        </div>
    );
}

export function ScrollStory({
    steps,
    meter,
    renderPanel,
    renderMascot,
    action,
}: {
    steps: Step[];
    /** Labels at the two ends of the progress meter. */
    meter: [string, string];
    renderPanel: (index: number) => ReactNode;
    /** Drawn over the screen's corner; re-keyed per step so it pops in. */
    renderMascot?: (index: number) => ReactNode;
    action?: ReactNode;
}) {
    const [active, setActive] = useState(0);
    const items = useRef<(HTMLLIElement | null)[]>([]);

    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) =>
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
                }),
            // A thin line a little below the middle: the step crossing it is the current one.
            { rootMargin: "-55% 0px -44% 0px" },
        );
        items.current.forEach((el) => el && io.observe(el));
        return () => io.disconnect();
    }, [steps.length]);

    const last = steps.length - 1;
    const jump = (i: number) =>
        items.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-[0.92fr_1.08fr] lg:gap-x-16">
            <ol className="lg:col-start-1 lg:row-start-1">
                {steps.map((step, i) => (
                    <li
                        key={i}
                        ref={(el) => {
                            items.current[i] = el;
                        }}
                        data-index={i}
                        data-current={i === active || undefined}
                        className={cn(
                            "story-step grid content-center gap-3.5 py-8 min-h-[56vh]",
                            i === 0 && "lg:min-h-[calc(100svh-4rem)]",
                            i === last ? "lg:min-h-[66svh]" : "lg:min-h-[60vh]",
                        )}
                    >
                        <p className="flex items-center gap-2.5 font-script text-2xl font-bold text-script">
                            <span className="rounded-full bg-forest text-cream font-sans text-xs font-bold tracking-wider px-2.5 py-1">
                                {pad(i)}
                            </span>
                            {step.label}
                        </p>
                        <h3 className="h-display text-[clamp(26px,2.7vw,38px)] max-w-[17ch]">{step.title}</h3>
                        <p className="text-[16.5px] leading-relaxed text-muted-foreground max-w-[42ch]">{step.description}</p>
                    </li>
                ))}
            </ol>

            {/* The pinned screen. order-first on phones so it sticks above the steps. */}
            <div className="order-first lg:order-none lg:col-start-2 lg:row-start-1 self-stretch lg:self-start sticky top-16 z-10 -mx-5 px-5 pt-2 pb-4 bg-[var(--story-bg,var(--color-background))] lg:mx-0 lg:px-0 lg:bg-transparent lg:h-[calc(100svh-4rem)] lg:flex lg:flex-col lg:justify-center lg:gap-4 lg:py-6">
                <StepMeter
                    count={steps.length}
                    active={active}
                    ends={meter}
                    caption={steps[active].label}
                    onPick={jump}
                    className="mb-9 lg:mb-7"
                />

                <div className="relative">
                    <div
                        className="grid-paper relative h-[220px] sm:h-[280px] lg:h-[min(390px,calc(100svh-17rem))] rounded-[18px] border-2 border-forest shadow-stamp overflow-hidden transition-colors duration-700"
                        style={{ backgroundColor: SCREEN_TINTS[Math.min(active, SCREEN_TINTS.length - 1)] }}
                    >
                        {steps.map((step, i) => (
                            <div
                                key={i}
                                data-current={i === active || undefined}
                                aria-hidden={i !== active}
                                className="story-panel absolute inset-0 grid grid-rows-[auto_1fr] p-4 sm:p-6"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <p className="flex items-baseline gap-2 min-w-0">
                                        <span className="h-display text-3xl sm:text-4xl">{pad(i)}</span>
                                        <span className="font-script text-xl sm:text-2xl font-bold text-script truncate pr-1.5">{step.label}</span>
                                    </p>
                                    <span className="rounded-full border-2 border-forest bg-card px-3 py-1 text-xs font-bold whitespace-nowrap">
                                        {step.tag}
                                    </span>
                                </div>
                                <div className="self-center justify-self-center w-full max-w-[300px] sm:max-w-[400px] pr-14 sm:pr-0">
                                    {renderPanel(i)}
                                </div>
                            </div>
                        ))}
                    </div>
                    {renderMascot && (
                        <div key={active} className="absolute -right-2 sm:-right-5 -bottom-3 w-24 sm:w-32 lg:w-36 animate-pop-in pointer-events-none">
                            {renderMascot(active)}
                        </div>
                    )}
                </div>

                {action && <div className="hidden lg:block pt-2">{action}</div>}
            </div>

            {action && <div className="lg:hidden pt-4">{action}</div>}
        </div>
    );
}
