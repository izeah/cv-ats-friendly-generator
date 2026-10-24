// Sticky story: the steps scroll by on the left while one "screen" stays pinned
// on the right and swaps its panel to match the step in the middle of the
// viewport. On phones the screen pins to the top as a band above the text.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Step = { label: string; title: string; description: string; tag: string };

// Marigold creeps into the screen as the story moves on.
const SCREEN_TINTS = ["#fffefa", "#fffbe2", "#fff5b3", "#ffef80"];

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
    const progress = last > 0 ? active / last : 1;
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
                            "story-step grid content-center gap-3.5 py-8 min-h-[58vh]",
                            i === 0 && "lg:min-h-[calc(100svh-4rem)]",
                            i === last ? "lg:min-h-[66svh]" : "lg:min-h-[64vh]",
                        )}
                    >
                        <p className="flex items-center gap-2.5 font-script text-2xl font-bold text-script">
                            <span className="rounded-full bg-forest text-cream font-sans text-xs font-bold tracking-wider px-2.5 py-1">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            {step.label}
                        </p>
                        <h3 className="h-display text-[clamp(26px,2.7vw,38px)] max-w-[17ch]">{step.title}</h3>
                        <p className="text-[16.5px] leading-relaxed text-muted-foreground max-w-[42ch]">{step.description}</p>
                    </li>
                ))}
            </ol>

            {/* The pinned screen. order-first on phones so it sticks above the steps. */}
            <div
                className="order-first lg:order-none lg:col-start-2 lg:row-start-1 self-stretch lg:self-start sticky top-16 z-10 -mx-5 px-5 pt-3 pb-4 bg-[var(--story-bg,var(--color-background))] lg:mx-0 lg:px-0 lg:bg-transparent lg:h-[calc(100svh-4rem)] lg:flex lg:flex-col lg:justify-center lg:gap-5 lg:py-6"
                style={{ "--p": progress } as CSSProperties}
            >
                <div className="flex items-center gap-3 mb-3 lg:mb-0" aria-hidden="true">
                    <span className="text-[11px] font-bold text-muted-foreground">{meter[0]}</span>
                    <div className="relative flex-1 flex items-center justify-between h-9">
                        <span className="absolute inset-x-0 top-1/2 h-1 -mt-0.5 rounded-full bg-forest/12" />
                        <span
                            className="absolute left-0 top-1/2 h-1 -mt-0.5 rounded-full bg-forest transition-[width] duration-500 ease-out"
                            style={{ width: `calc(var(--p) * 100%)` }}
                        />
                        {steps.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                tabIndex={-1}
                                onClick={() => jump(i)}
                                className={cn(
                                    "relative z-[1] grid place-items-center w-8 h-8 rounded-full border-2 text-[11px] font-bold cursor-pointer transition-all duration-300",
                                    i === active
                                        ? "bg-marigold border-forest text-forest shadow-stamp-sm scale-115"
                                        : i < active
                                          ? "bg-forest border-forest text-cream"
                                          : "bg-card border-forest/30 text-muted-foreground",
                                )}
                            >
                                {String(i + 1).padStart(2, "0")}
                            </button>
                        ))}
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground">{meter[1]}</span>
                </div>

                <div className="relative">
                    <div
                        className="grid-paper relative h-[230px] sm:h-[280px] lg:h-[min(400px,calc(100svh-15rem))] rounded-[18px] border-2 border-forest shadow-stamp overflow-hidden transition-colors duration-700"
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
                                    <p className="flex items-baseline gap-2">
                                        <span className="h-display text-3xl sm:text-4xl">{String(i + 1).padStart(2, "0")}</span>
                                        <span className="font-script text-xl sm:text-2xl font-bold text-script">{step.label}</span>
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
