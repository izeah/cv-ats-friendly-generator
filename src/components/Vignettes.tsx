// Mini animated scenes for the step and feature cards, in the style of
// ngodingpakeai.com: one SVG per card on a dashed grid, where small UI pieces
// draw, pop and rise in sequence over an 8s loop, then reset.
import type { CSSProperties, ReactNode } from "react";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { useInView } from "@/lib/useInView";
import { useLoop } from "@/lib/useLoop";
import { useI18n } from "@/lib/i18n";

const STEPS = 16; // 16 × 500ms = 8s
const LAST = STEPS - 1; // everything fades out on the last step, then rebuilds
const spring = "cubic-bezier(0.34, 1.56, 0.64, 1)";

type On = (n: number) => boolean;

const pop = (v: boolean): CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? "scale(1)" : "scale(0.4)",
    transformBox: "fill-box",
    transformOrigin: "center",
    transition: `opacity .3s ease, transform .45s ${spring}`,
});
const rise = (v: boolean): CSSProperties => ({
    opacity: v ? 1 : 0,
    transform: v ? "translateY(0)" : "translateY(8px)",
    transition: "opacity .4s ease, transform .5s ease",
});
const grow = (scale: number): CSSProperties => ({
    transform: `scaleX(${scale})`,
    transformBox: "fill-box",
    transformOrigin: "left center",
    transition: "transform .5s ease-out",
});
const draw = (v: boolean): CSSProperties => ({
    strokeDasharray: 1,
    strokeDashoffset: v ? 0 : 1,
    transition: "stroke-dashoffset .6s ease-out",
});
const move = (x: number, y: number, visible = true): CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: `translate(${x}px, ${y}px)`,
    transition: "transform .6s cubic-bezier(.65,0,.35,1), opacity .3s ease",
});

const line = { strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Grid() {
    return (
        <g className="stroke-forest" strokeOpacity={0.12} strokeWidth={1} strokeDasharray="2 4">
            {Array.from({ length: 13 }, (_, i) => (
                <line key={`v${i}`} x1={20 + i * 20} y1={0} x2={20 + i * 20} y2={160} />
            ))}
            {Array.from({ length: 7 }, (_, i) => (
                <line key={`h${i}`} x1={0} y1={20 + i * 20} x2={280} y2={20 + i * 20} />
            ))}
        </g>
    );
}

function Pill({ x, y, w, text, dark = true }: { x: number; y: number; w: number; text: string; dark?: boolean }) {
    return (
        <g>
            <rect x={x} y={y} width={w} height={16} rx={8} className={dark ? "fill-forest" : "fill-marigold stroke-forest"} strokeWidth={1.2} />
            <text x={x + w / 2} y={y + 11} textAnchor="middle" fontSize={8} fontWeight={700} className={dark ? "fill-cream" : "fill-forest"}>
                {text}
            </text>
        </g>
    );
}

function Check({ cx, cy, r = 6 }: { cx: number; cy: number; r?: number }) {
    return (
        <g>
            <circle cx={cx} cy={cy} r={r} className="fill-marigold stroke-forest" strokeWidth={1.2} />
            <path d={`M${cx - r / 2} ${cy}l${r / 3} ${r / 3} ${r * 0.6} -${r * 0.6}`} className="stroke-forest" {...line} />
        </g>
    );
}

function Cursor({ style }: { style: CSSProperties }) {
    return (
        <path
            d="M0 0v13l3.6-3 2.6 5.4 2.2-1-2.5-5.2H11z"
            className="fill-forest stroke-parchment"
            strokeWidth={1}
            strokeLinejoin="round"
            style={style}
        />
    );
}

function Chevrons({ x, y, visible, count = 3 }: { x: number; y: number; visible: boolean; count?: number }) {
    return (
        <g style={{ opacity: visible ? 1 : 0, transition: "opacity .3s" }}>
            {Array.from({ length: count }, (_, i) => (
                <path
                    key={i}
                    d={`M${x + i * 9} ${y - 5}l5 5-5 5`}
                    className="chev stroke-forest"
                    {...line}
                    style={{ animationDelay: `${(i * 0.2) % 1.2}s` }}
                />
            ))}
        </g>
    );
}

/** Frame + 8s clock. `render` gets on(n): true from step n until the loop resets. */
function Vignette({
    label,
    offset = 0,
    steps = STEPS,
    render,
    className,
}: {
    label: string;
    offset?: number;
    steps?: number;
    render: (on: On, step: number) => ReactNode;
    className?: string;
}) {
    const [ref, inView] = useInView<HTMLDivElement>(0.2);
    const reduced = prefersReducedMotion();
    const last = steps - 1;
    const tick = useLoop(steps, 500, inView && !reduced);
    const step = reduced ? last - 1 : (tick + offset) % steps;
    const on: On = (n) => step >= n && step < last;
    return (
        <div
            ref={ref}
            role="img"
            aria-label={label}
            className={cn("relative overflow-hidden rounded-3xl border border-forest/15 bg-background/50", className)}
        >
            <svg viewBox="0 0 280 160" className="block w-full h-auto" fill="none">
                <Grid />
                {render(on, step)}
            </svg>
        </div>
    );
}

// ===== Steps =====

export function FormVignette({ offset }: { offset?: number }) {
    const v = useI18n().t.vignettes.form;
    const rows = [
        { y: 50, w: 64 },
        { y: 74, w: 82 },
        { y: 98, w: 50 },
    ];
    return (
        <Vignette
            label={v.label}
            offset={offset}
            render={(on, step) => {
                const active = step < 5 ? 0 : step < 8 ? 1 : 2;
                return (
                    <>
                        <g style={move(0, rows[active].y - 50, on(1))}>
                            <path d="M30 66l18-18 6 6-18 18z" className="fill-marigold stroke-forest" {...line} />
                            <path d="M30 66l-4 10 10-4M45 51l6 6" className="stroke-forest" {...line} />
                        </g>
                        <rect x={70} y={16} width={140} height={130} rx={14} className="fill-parchment stroke-forest" strokeWidth={1.5} />
                        <g style={rise(on(1))}>
                            <circle cx={88} cy={33} r={7} className="fill-marigold stroke-forest" strokeWidth={1.2} />
                            <rect x={100} y={28} width={52} height={5} rx={2.5} className="fill-forest" />
                            <rect x={100} y={36} width={32} height={3} rx={1.5} className="fill-forest" opacity={0.35} />
                        </g>
                        {rows.map((r, i) => {
                            const s = 2 + i * 3;
                            return (
                                <g key={i}>
                                    <g style={rise(on(s))}>
                                        <rect x={84} y={r.y} width={28} height={3} rx={1.5} className="fill-forest" opacity={0.5} />
                                        <rect x={84} y={r.y + 6} width={112} height={14} rx={7} className="fill-white stroke-forest" strokeWidth={1.2} />
                                    </g>
                                    <rect x={91} y={r.y + 11} width={r.w} height={4} rx={2} className="fill-forest" style={grow(on(s + 1) ? 1 : 0)} />
                                    <g style={pop(on(s + 2))}>
                                        <Check cx={186} cy={r.y + 13} />
                                    </g>
                                </g>
                            );
                        })}
                        {step >= 3 && step < 11 && (
                            <rect x={93 + rows[active].w} y={rows[active].y + 9} width={1.5} height={8} className="fill-forest blink" />
                        )}
                        <g style={pop(on(11))}>
                            <Pill x={136} y={124} w={64} text={`${v.saved} ✓`} />
                        </g>
                    </>
                );
            }}
        />
    );
}

export function PreviewVignette({ offset }: { offset?: number }) {
    const v = useI18n().t.vignettes.preview;
    return (
        <Vignette
            label={v.label}
            offset={offset}
            render={(on, step) => {
                const atB = step >= 8;
                const showChip = (step >= 6 && step < 8) || (step >= 9 && step < 12);
                return (
                    <>
                        <rect x={74} y={12} width={132} height={138} rx={12} className="fill-parchment stroke-forest" strokeWidth={1.5} />
                        <g style={rise(on(1))}>
                            <rect x={88} y={24} width={64} height={8} rx={4} className="fill-forest" />
                            <rect x={88} y={36} width={40} height={4} rx={2} className="fill-forest" opacity={0.35} />
                        </g>
                        <rect x={88} y={52} width={30} height={3} rx={1.5} className="fill-forest" opacity={0.6} style={rise(on(2))} />
                        {[100, 86, 70].map((w, i) => (
                            <rect key={i} x={88} y={60 + i * 7} width={w} height={3.5} rx={1.75} className="fill-forest" opacity={0.25} style={grow(on(2 + (i > 1 ? 1 : 0)) ? 1 : 0)} />
                        ))}
                        <rect x={88} y={90} width={30} height={3} rx={1.5} className="fill-forest" opacity={0.6} style={rise(on(3))} />
                        <rect x={86} y={96} width={104} height={7} rx={3.5} className="fill-marigold" opacity={0.7} style={grow(on(10) ? 1 : 0)} />
                        {[96, 80].map((w, i) => (
                            <rect key={i} x={88} y={98 + i * 7} width={w} height={3.5} rx={1.75} className="fill-forest" opacity={0.25} style={grow(on(3 + i) ? 1 : 0)} />
                        ))}
                        <g style={pop(on(4))}>
                            {[0, 1, 2].map((i) => (
                                <rect key={i} x={88 + i * 26} y={120} width={22} height={9} rx={4.5} className="fill-forest" />
                            ))}
                        </g>
                        <g style={move(0, atB ? 38 : 0, on(5))}>
                            <rect x={82} y={46} width={116} height={34} rx={6} className="stroke-marigold" strokeWidth={2} strokeDasharray="4 3" />
                            {[
                                [82, 46],
                                [198, 46],
                                [82, 80],
                                [198, 80],
                            ].map(([x, y]) => (
                                <rect key={`${x}${y}`} x={x - 2.5} y={y - 2.5} width={5} height={5} className="fill-parchment stroke-forest" strokeWidth={1} />
                            ))}
                        </g>
                        <Cursor style={move(196, atB ? 112 : 74, on(5))} />
                        <g style={pop(showChip)}>
                            <Pill x={210} y={atB ? 98 : 60} w={52} text={`✎ ${v.polish}`} dark={false} />
                        </g>
                        <g style={pop(on(11))}>
                            <Pill x={162} y={18} w={36} text={v.live} />
                        </g>
                    </>
                );
            }}
        />
    );
}

export function ExportVignette({ offset }: { offset?: number }) {
    const v = useI18n().t.vignettes.export;
    return (
        <Vignette
            label={v.label}
            offset={offset}
            render={(on, step) => {
                const progress = step >= 6 && step < LAST ? 1 : step >= 5 && step < LAST ? 0.7 : on(4) ? 0.35 : 0;
                return (
                    <>
                        <g style={rise(on(1))}>
                            <rect x={22} y={38} width={64} height={84} rx={8} className="fill-parchment stroke-forest" strokeWidth={1.5} />
                            <rect x={32} y={50} width={30} height={5} rx={2.5} className="fill-forest" />
                            {[40, 34, 42, 28].map((w, i) => (
                                <rect key={i} x={32} y={64 + i * 9} width={w} height={3.5} rx={1.75} className="fill-forest" opacity={0.25} />
                            ))}
                        </g>
                        <Chevrons x={100} y={80} visible={on(2)} />
                        <g style={pop(on(3))}>
                            <path d="M148 30h44l18 18v64h-62z" className="fill-parchment stroke-forest" {...line} />
                            <path d="M192 30v18h18" className="stroke-forest" {...line} />
                            <rect x={158} y={80} width={36} height={16} rx={4} className="fill-marigold stroke-forest" strokeWidth={1.2} />
                            <text x={176} y={91.5} textAnchor="middle" fontSize={9} fontWeight={800} className="fill-forest">PDF</text>
                        </g>
                        <g style={{ opacity: on(4) ? 1 : 0, transition: "opacity .3s" }}>
                            <rect x={148} y={120} width={62} height={7} rx={3.5} className="stroke-forest" strokeWidth={1.2} />
                            <rect x={148} y={120} width={62} height={7} rx={3.5} className="fill-forest" style={grow(progress)} />
                        </g>
                        <path d="M214 70h16" pathLength={1} className="stroke-forest" {...line} style={draw(on(7))} />
                        <g style={rise(on(7))}>
                            <rect x={232} y={56} width={36} height={26} rx={4} className="fill-white stroke-forest" strokeWidth={1.5} />
                            <path d="M232 58l18 13 18-13" className="stroke-forest" {...line} />
                        </g>
                        <g style={pop(on(8))}>
                            <Check cx={266} cy={56} />
                        </g>
                        <g style={pop(on(9))}>
                            <Pill x={222} y={92} w={50} text={v.sent} />
                        </g>
                    </>
                );
            }}
        />
    );
}

// ===== Features =====

export function AtsVignette({ offset }: { offset?: number }) {
    const v = useI18n().t.vignettes.ats;
    const ys = [28, 58, 88, 118];
    return (
        <Vignette
            label={v.label}
            offset={offset}
            render={(on, step) => {
                const beam = Math.min(Math.max(step - 2, 0), 3);
                return (
                    <>
                        <g style={rise(on(1))}>
                            <rect x={22} y={14} width={92} height={132} rx={10} className="fill-parchment stroke-forest" strokeWidth={1.5} />
                            <rect x={34} y={26} width={44} height={6} rx={3} className="fill-forest" />
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <rect key={i} x={34} y={44 + i * 12} width={i % 3 === 0 ? 40 : 66} height={3.5} rx={1.75} className="fill-forest" opacity={0.25} />
                            ))}
                        </g>
                        <g style={move(0, ys[beam] - 6, on(2) && step <= 5)}>
                            <rect x={16} y={0} width={104} height={14} className="fill-marigold" opacity={0.45} />
                            <line x1={16} y1={7} x2={120} y2={7} className="stroke-marigold" strokeWidth={2} />
                        </g>
                        {v.tags.map((tag, i) => (
                            <g key={tag}>
                                <path d={`M116 ${ys[i] + 9}H146`} pathLength={1} className="stroke-forest" strokeOpacity={0.4} {...line} style={draw(on(3 + i))} />
                                <g style={pop(on(3 + i))}>
                                    <rect x={146} y={ys[i]} width={86} height={18} rx={9} className="fill-white stroke-forest" strokeWidth={1.2} />
                                    <circle cx={157} cy={ys[i] + 9} r={3.5} className="fill-marigold stroke-forest" strokeWidth={1} />
                                    <text x={166} y={ys[i] + 12.5} fontSize={8.5} fontWeight={700} className="fill-forest">{tag}</text>
                                </g>
                            </g>
                        ))}
                        <g style={pop(on(8))}>
                            <Pill x={200} y={4} w={64} text={`${v.parsed} ✓`} />
                        </g>
                    </>
                );
            }}
        />
    );
}

export function PdfVignette({ offset }: { offset?: number }) {
    const v = useI18n().t.vignettes.pdf;
    return (
        <Vignette
            label={v.label}
            offset={offset}
            render={(on, step) => {
                const progress = step >= 6 && step < LAST ? 1 : step >= 5 && step < LAST ? 0.65 : on(4) ? 0.3 : 0;
                const pressed = step === 3;
                return (
                    <>
                        <rect x={30} y={18} width={220} height={124} rx={14} className="fill-parchment stroke-forest" strokeWidth={1.5} />
                        {[44, 54, 64].map((cx) => (
                            <circle key={cx} cx={cx} cy={30} r={3} className="fill-forest" opacity={0.25} />
                        ))}
                        <g style={rise(on(1))}>
                            <g style={{ transform: pressed ? "scale(.93)" : "scale(1)", transformBox: "fill-box", transformOrigin: "center", transition: "transform .2s" }}>
                                <rect x={92} y={48} width={96} height={24} rx={12} className="fill-forest" />
                                <text x={140} y={63.5} textAnchor="middle" fontSize={9} fontWeight={700} className="fill-cream">↓ {v.button}</text>
                            </g>
                        </g>
                        <Cursor style={move(on(2) ? 172 : 214, on(2) ? 62 : 118, on(1))} />
                        <g style={{ opacity: on(4) ? 1 : 0, transition: "opacity .3s" }}>
                            <rect x={80} y={86} width={120} height={8} rx={4} className="stroke-forest" strokeWidth={1.2} />
                            <rect x={80} y={86} width={120} height={8} rx={4} className="fill-marigold" style={grow(progress)} />
                        </g>
                        <g style={pop(on(7))}>
                            <rect x={82} y={106} width={112} height={22} rx={11} className="fill-white stroke-forest" strokeWidth={1.2} />
                            <path d="M94 111h7l4 4v8h-11z" className="stroke-forest" strokeWidth={1.2} strokeLinejoin="round" />
                            <text x={112} y={120.5} fontSize={8.5} fontWeight={700} className="fill-forest">jane-doe-cv.pdf</text>
                        </g>
                        <g style={pop(on(8))}>
                            <Check cx={204} cy={117} r={7} />
                        </g>
                    </>
                );
            }}
        />
    );
}

export function BackendVignette({ offset }: { offset?: number }) {
    const v = useI18n().t.vignettes.backend;
    return (
        <Vignette
            label={v.label}
            offset={offset}
            render={(on, step) => {
                const caretY = step < 2 ? 52 : step < 4 ? 72 : step < 6 ? 92 : 112;
                return (
                    <>
                        <rect x={22} y={16} width={236} height={128} rx={12} className="fill-forest" />
                        {[38, 48, 58].map((cx) => (
                            <circle key={cx} cx={cx} cy={29} r={3} className="fill-cream" opacity={0.4} />
                        ))}
                        <line x1={22} y1={40} x2={258} y2={40} className="stroke-cream" strokeOpacity={0.15} />
                        {v.lines.map((text, i) => (
                            <text
                                key={text}
                                x={36}
                                y={60 + i * 20}
                                fontSize={9.5}
                                fontWeight={600}
                                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                                className={i === 2 ? "fill-marigold" : "fill-cream"}
                                style={rise(on(2 + i * 2))}
                            >
                                {text}
                            </text>
                        ))}
                        {step >= 1 && step < 9 && <rect x={36} y={caretY} width={6} height={10} className="fill-cream blink" />}
                        {[
                            { x: 36, w: 28, t: "Go" },
                            { x: 70, w: 42, t: "Kafka" },
                            { x: 118, w: 54, t: "Postgres" },
                        ].map((chip, i) => (
                            <g key={chip.t} style={pop(on(7 + i))}>
                                <rect x={chip.x} y={120} width={chip.w} height={15} rx={7.5} className="fill-marigold" />
                                <text x={chip.x + chip.w / 2} y={130.5} textAnchor="middle" fontSize={8} fontWeight={800} className="fill-forest">{chip.t}</text>
                            </g>
                        ))}
                    </>
                );
            }}
        />
    );
}

export function InstantVignette({ offset }: { offset?: number }) {
    const v = useI18n().t.vignettes.instant;
    return (
        <Vignette
            label={v.label}
            offset={offset}
            render={(on) => (
                <>
                    <g style={rise(on(1))}>
                        <rect x={20} y={38} width={80} height={84} rx={10} className="fill-parchment stroke-forest" strokeWidth={1.5} />
                        {[0, 1, 2].map((i) => (
                            <g key={i}>
                                <rect x={30} y={50 + i * 22} width={22} height={3} rx={1.5} className="fill-forest" opacity={0.5} />
                                <rect x={30} y={56 + i * 22} width={60} height={9} rx={4.5} className="fill-white stroke-forest" strokeWidth={1} />
                            </g>
                        ))}
                    </g>
                    {/* Chevrons run all the way to the CV sheet; the bolt sits on top of them. */}
                    <Chevrons x={106} y={80} count={8} visible={on(2)} />
                    <g style={pop(on(3))}>
                        <path d="M148 52l-16 30h12l-6 24 20-32h-12l8-22z" className="fill-marigold stroke-forest" {...line} />
                    </g>
                    <g style={rise(on(4))}>
                        <rect x={178} y={26} width={82} height={108} rx={10} className="fill-parchment stroke-forest" strokeWidth={1.5} />
                        <circle cx={194} cy={42} r={7} className="fill-marigold stroke-forest" strokeWidth={1.2} />
                    </g>
                    <rect x={206} y={38} width={42} height={5} rx={2.5} className="fill-forest" style={grow(on(5) ? 1 : 0)} />
                    {[56, 44, 52, 36].map((w, i) => (
                        <rect key={i} x={188} y={62 + i * 10} width={w} height={3.5} rx={1.75} className="fill-forest" opacity={0.25} style={grow(on(6 + (i > 1 ? 1 : 0)) ? 1 : 0)} />
                    ))}
                    <g style={pop(on(8))}>
                        {[0, 1].map((i) => (
                            <rect key={i} x={188 + i * 26} y={112} width={22} height={9} rx={4.5} className="fill-forest" />
                        ))}
                    </g>
                    <g style={pop(on(9))}>
                        <Pill x={108} y={118} w={56} text={`⚡ ${v.badge}`} dark={false} />
                    </g>
                </>
            )}
        />
    );
}

export function PrivacyVignette({ offset }: { offset?: number }) {
    const v = useI18n().t.vignettes.privacy;
    return (
        <Vignette
            label={v.label}
            offset={offset}
            render={(on) => (
                <>
                    <rect x={18} y={18} width={172} height={124} rx={12} className="fill-parchment stroke-forest" strokeWidth={1.5} />
                    {[30, 40, 50].map((cx) => (
                        <circle key={cx} cx={cx} cy={30} r={3} className="fill-forest" opacity={0.25} />
                    ))}
                    <g style={rise(on(1))}>
                        <rect x={66} y={23} width={76} height={14} rx={7} className="fill-sage" />
                        <text x={104} y={32.5} textAnchor="middle" fontSize={8} fontWeight={700} className="fill-forest">{v.browser}</text>
                    </g>
                    <g style={pop(on(2))}>
                        <path d="M86 72v28c0 4 8 7 18 7s18-3 18-7V72" className="fill-white stroke-forest" {...line} />
                        <ellipse cx={104} cy={72} rx={18} ry={6} className="fill-white stroke-forest" strokeWidth={1.5} />
                        <path d="M86 86c0 4 8 7 18 7s18-3 18-7" className="stroke-forest" {...line} />
                    </g>
                    <g style={{ opacity: on(3) ? 1 : 0, transition: "opacity .4s" }}>
                        <g className="orbit" style={{ transformBox: "view-box", transformOrigin: "104px 88px" }}>
                            {[0, 120, 240].map((deg) => {
                                const a = (deg * Math.PI) / 180;
                                return <circle key={deg} cx={104 + 36 * Math.cos(a)} cy={88 + 30 * Math.sin(a)} r={3.5} className="fill-marigold stroke-forest" strokeWidth={1} />;
                            })}
                        </g>
                    </g>
                    {/* A cloud appears, then gets struck through: the CV never goes online. */}
                    <g style={rise(on(4))}>
                        <path
                            d="M214 88c-10 0-10-14 0-14 0-11 14-15 21-6 3-10 20-10 23 1 10-2 14 10 5 15 6 1 5 4 0 4z"
                            className="fill-white stroke-forest"
                            {...line}
                            style={{ opacity: on(6) ? 0.45 : 1, transition: "opacity .5s" }}
                        />
                    </g>
                    <path d="M208 98L268 58" pathLength={1} className="stroke-marigold" strokeWidth={7} strokeLinecap="round" style={draw(on(5))} />
                    <path d="M208 98L268 58" pathLength={1} className="stroke-forest" strokeWidth={2.5} strokeLinecap="round" style={draw(on(5))} />
                    <g style={pop(on(6))}>
                        <Pill x={202} y={110} w={68} text={v.offline} />
                    </g>
                    <g style={pop(on(7))}>
                        <circle cx={182} cy={24} r={10} className="fill-forest" />
                        <rect x={177} y={23} width={10} height={7} rx={1.5} className="fill-cream" />
                        <path d="M179 23v-2.5a3 3 0 0 1 6 0V23" className="stroke-cream" strokeWidth={1.4} />
                    </g>
                </>
            )}
        />
    );
}

/** Mini CV lines shown on a device screen once it holds the CV. */
function ScreenCV({ x, y, w, visible }: { x: number; y: number; w: number; visible: boolean }) {
    return (
        <g style={{ opacity: visible ? 1 : 0, transition: "opacity .4s" }}>
            <circle cx={x + 5} cy={y + 5} r={4} className="fill-marigold stroke-forest" strokeWidth={1} />
            <rect x={x + 13} y={y + 2.5} width={w - 15} height={4} rx={2} className="fill-forest" style={grow(visible ? 1 : 0)} />
            {[0.9, 0.7, 0.8].map((f, i) => (
                <rect key={i} x={x} y={y + 15 + i * 7} width={w * f} height={3} rx={1.5} className="fill-forest" opacity={0.25} style={grow(visible ? 1 : 0)} />
            ))}
        </g>
    );
}

// Back and forth: laptop → JSON → phone, then phone → JSON → laptop. 28 steps = 14s.
const BACKUP_HALF = 14;

export function BackupVignette({ offset }: { offset?: number }) {
    const v = useI18n().t.vignettes.backup;
    return (
        <Vignette
            label={v.label}
            offset={offset}
            steps={BACKUP_HALF * 2}
            render={(_on, step) => {
                const toPhone = step < BACKUP_HALF;
                const s = step % BACKUP_HALF;
                const laptop = { file: [52, 54], pill: [22, 124] };
                const phone = { file: [219, 54], pill: [190, 134] };
                const from = toPhone ? laptop : phone;
                const to = toPhone ? phone : laptop;
                const filePos = s < 4 ? from.file : s < 5 ? [128, 2] : to.file;
                const fileVisible = s >= 2 && s < 7;
                const laptopHasCV = toPhone || s >= 7;
                const phoneHasCV = !toPhone || s >= 7;
                return (
                    <>
                        <rect x={20} y={44} width={88} height={58} rx={6} className="fill-parchment stroke-forest" strokeWidth={1.5} />
                        <path d="M10 106h108l-7 9H17z" className="fill-sage stroke-forest" {...line} />
                        <ScreenCV x={32} y={56} w={64} visible={laptopHasCV} />
                        <rect x={206} y={28} width={52} height={100} rx={10} className="fill-parchment stroke-forest" strokeWidth={1.5} />
                        <line x1={224} y1={36} x2={240} y2={36} className="stroke-forest" strokeWidth={2} strokeLinecap="round" />
                        <ScreenCV x={214} y={50} w={36} visible={phoneHasCV} />
                        <path
                            d="M64 44C100-8 196-8 232 26"
                            className="stroke-forest"
                            strokeOpacity={0.35}
                            strokeWidth={1.5}
                            strokeDasharray="3 5"
                            style={{ opacity: s >= 2 && s < 8 ? 1 : 0, transition: "opacity .4s" }}
                        />
                        <g style={move(filePos[0], filePos[1], fileVisible)}>
                            <g style={{ transform: s === 6 ? "scale(.6)" : "scale(1)", transformBox: "fill-box", transformOrigin: "center", transition: "transform .4s" }}>
                                <path d="M0 0h18l8 8v24H0z" className="fill-marigold stroke-forest" {...line} />
                                <text x={12} y={23} textAnchor="middle" fontSize={9} fontWeight={800} className="fill-forest">{"{ }"}</text>
                            </g>
                        </g>
                        <g style={pop(s >= 1 && s < 5)}>
                            <Pill x={from.pill[0]} y={from.pill[1]} w={84} text={`${v.backup} → JSON`} dark={false} />
                        </g>
                        <g style={pop(s >= 6 && s < 9)}>
                            <Pill x={to.pill[0]} y={to.pill[1]} w={74} text={`JSON → ${v.import}`} dark={false} />
                        </g>
                        <g style={pop(s >= 9 && s < 13)}>
                            <Pill x={to.pill[0]} y={to.pill[1]} w={74} text={`${v.restored} ✓`} />
                        </g>
                    </>
                );
            }}
        />
    );
}
