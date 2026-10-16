// Animated pipeline diagram and step flowchart, modelled on DESIGN-Monad.md:
// pill nodes, thin curved connectors, a glowing hub, data "packets" in motion.
import type { CSSProperties } from "react";
import {
    User,
    Briefcase,
    FolderKanban,
    Code2,
    Download,
    Eye,
    Braces,
    Link2,
    PenLine,
    type LucideIcon,
} from "lucide-react";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { LogoMark } from "@/components/Illustrations";
import { useInView } from "@/lib/useInView";

const delay = (ms: number): CSSProperties => ({
    transitionDelay: `${ms}ms`,
    animationDelay: `${ms}ms`,
});

function NodePill({
    icon: Icon,
    label,
    className,
    style,
}: {
    icon: LucideIcon;
    label: string;
    className?: string;
    style?: CSSProperties;
}) {
    return (
        <div
            className={cn(
                "reveal inline-flex items-center gap-2 rounded-full border border-foreground bg-card py-1.5 pl-1.5 pr-4 text-xs font-bold uppercase tracking-wide whitespace-nowrap",
                className,
            )}
            style={style}
        >
            <span className="w-6 h-6 rounded-full bg-marigold border border-foreground flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
            </span>
            {label}
        </div>
    );
}

function Hub({ className }: { className?: string }) {
    return (
        <div className={cn("relative aspect-square", className)}>
            <div className="absolute -inset-[30%] rounded-full bg-marigold blur-2xl animate-hub-glow" />
            <div className="reveal relative w-full h-full rounded-full bg-forest text-cream border-2 border-forest flex flex-col items-center justify-center text-center shadow-stamp-cream">
                <LogoMark className="w-[42%] h-[42%] mb-1.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-cream/80">
                    ATS formatter
                </span>
            </div>
        </div>
    );
}

const INPUTS = [
    { label: "Profile", icon: User, y: 70 },
    { label: "Experience", icon: Briefcase, y: 170 },
    { label: "Projects", icon: FolderKanban, y: 270 },
    { label: "Skills", icon: Code2, y: 370 },
];

const OUTPUTS = [
    { label: "PDF export", short: "PDF", icon: Download, y: 110 },
    { label: "Share link", short: "Share", icon: Link2, y: 220 },
    { label: "JSON backup", short: "JSON", icon: Braces, y: 330 },
];

// Desktop canvas: 1000 x 440, hub centred at (500, 220) with radius 72.
const W = 1000;
const H = 440;
const IN_X = 230;
const OUT_X = 770;
const inPath = (y: number) => `M${IN_X} ${y}C340 ${y} 340 220 428 220`;
const outPath = (y: number) => `M572 220C660 220 660 ${y} ${OUT_X} ${y}`;

function Connector({ d, order, live }: { d: string; order: number; live: boolean }) {
    return (
        <>
            <path
                d={d}
                pathLength={1}
                className="draw-line stroke-forest/30"
                style={delay(200 + order * 120)}
            />
            <path
                d={d}
                className="flow-line stroke-forest"
                style={{ opacity: live ? 1 : 0, transition: "opacity .6s 1.2s" }}
            />
        </>
    );
}

export function PipelineDiagram() {
    const [ref, inView] = useInView<HTMLDivElement>();
    const animate = inView && !prefersReducedMotion();
    const paths = [...INPUTS.map((n) => inPath(n.y)), ...OUTPUTS.map((n) => outPath(n.y))];

    return (
        <div ref={ref} className={cn(inView && "in-view")}>
            {/* Desktop: horizontal pipeline */}
            <div className="relative hidden md:block" style={{ aspectRatio: `${W} / ${H}` }}>
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    className="absolute inset-0 w-full h-full"
                    fill="none"
                    strokeWidth={1.5}
                    aria-hidden="true"
                >
                    {paths.map((d, i) => (
                        <Connector key={d} d={d} order={i} live={inView} />
                    ))}
                    {animate &&
                        paths.map((d, i) => (
                            <circle key={d} r={5} className="fill-marigold stroke-forest" strokeWidth={1.5}>
                                <animateMotion
                                    dur="2.6s"
                                    begin={`${1.4 + (i % 4) * 0.5}s`}
                                    repeatCount="indefinite"
                                    path={d}
                                />
                            </circle>
                        ))}
                </svg>

                {INPUTS.map((n, i) => (
                    <NodePill
                        key={n.label}
                        icon={n.icon}
                        label={n.label}
                        className="absolute -translate-y-1/2"
                        style={{
                            right: `${100 - (IN_X / W) * 100}%`,
                            top: `${(n.y / H) * 100}%`,
                            ...delay(i * 120),
                        }}
                    />
                ))}
                {OUTPUTS.map((n, i) => (
                    <NodePill
                        key={n.label}
                        icon={n.icon}
                        label={n.label}
                        className="absolute -translate-y-1/2"
                        style={{
                            left: `${(OUT_X / W) * 100}%`,
                            top: `${(n.y / H) * 100}%`,
                            ...delay(900 + i * 120),
                        }}
                    />
                ))}
                <Hub className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[14.4%]" />
            </div>

            {/* Mobile: the same pipeline, top to bottom */}
            <div className="md:hidden flex flex-col items-center">
                <div className="grid grid-cols-2 gap-3 w-full max-w-xs justify-items-center">
                    {INPUTS.map((n, i) => (
                        <NodePill key={n.label} icon={n.icon} label={n.label} style={delay(i * 120)} />
                    ))}
                </div>
                <svg viewBox="0 0 320 70" className="w-full max-w-xs h-16" fill="none" strokeWidth={1.5} aria-hidden="true">
                    {["M80 0C80 40 160 30 160 70", "M240 0C240 40 160 30 160 70"].map((d, i) => (
                        <Connector key={d} d={d} order={i} live={inView} />
                    ))}
                </svg>
                <Hub className="w-32" />
                <svg viewBox="0 0 320 70" className="w-full max-w-xs h-16" fill="none" strokeWidth={1.5} aria-hidden="true">
                    {["M160 0C160 40 53 30 53 70", "M160 0V70", "M160 0C160 40 267 30 267 70"].map((d, i) => (
                        <Connector key={d} d={d} order={i + 2} live={inView} />
                    ))}
                </svg>
                <div className="grid grid-cols-3 gap-2 w-full max-w-xs justify-items-center">
                    {OUTPUTS.map((n, i) => (
                        <NodePill key={n.label} icon={n.icon} label={n.short} style={delay(900 + i * 120)} />
                    ))}
                </div>
            </div>
        </div>
    );
}

const STEPS = [
    {
        icon: PenLine,
        title: "Fill the form",
        description: "Personal info, work history with project breakdowns, and the tech you ship with.",
    },
    {
        icon: Eye,
        title: "Preview & polish",
        description: "See the formatted CV instantly. Jump back to edit as often as you like.",
    },
    {
        icon: Download,
        title: "Export & apply",
        description: "Download a text-based PDF that ATS parsers read cleanly, or back it up as JSON.",
    },
];

function Arrow({ vertical, order }: { vertical?: boolean; order: number }) {
    const d = vertical ? "M20 4V44M12 36L20 44L28 36" : "M4 20H76M68 12L76 20L68 28";
    return (
        <svg
            viewBox={vertical ? "0 0 40 48" : "0 0 80 40"}
            className={cn(
                "shrink-0 text-forest self-center",
                vertical ? "w-8 h-10 md:hidden" : "hidden md:block w-14 lg:w-20",
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={d} pathLength={1} className="draw-line" style={delay(300 + order * 350)} />
        </svg>
    );
}

export function StepFlow() {
    const [ref, inView] = useInView<HTMLOListElement>();
    return (
        <ol ref={ref} className={cn("flex flex-col md:flex-row items-stretch", inView && "in-view")}>
            {STEPS.map((step, i) => (
                <li key={step.title} className="contents">
                    {i > 0 && (
                        <>
                            <Arrow order={i} />
                            <Arrow vertical order={i} />
                        </>
                    )}
                    <div
                        className="reveal flex-1 rounded-card border border-foreground bg-card shadow-stamp p-7 sm:p-8"
                        style={delay(i * 350)}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <span className="w-12 h-12 rounded-full bg-marigold border border-foreground flex items-center justify-center">
                                <step.icon className="w-5 h-5" strokeWidth={1.75} />
                            </span>
                            <span className="font-display text-5xl font-bold text-forest/15 leading-none">
                                0{i + 1}
                            </span>
                        </div>
                        <h3 className="font-display text-3xl font-bold uppercase tracking-[-0.03em] leading-none mb-3">
                            {step.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                </li>
            ))}
        </ol>
    );
}
