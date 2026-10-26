// The cast: two senior backend engineers (Arya, Sekar) and two recruiters
// (Rina, Dimas), drawn as flat stickers with a thick ink outline. One SVG per
// character; the pose swaps arms, props and expression. Idle motion (breathing,
// blinking, glancing at the pointer) lives in index.css under "Mascots".
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLook } from "@/lib/useLook";

export type Who = "arya" | "sekar" | "rina" | "dimas";
export type Pose = "idle" | "wave" | "type" | "think" | "cheer" | "phone" | "check" | "magnify";

const INK = "#10230c";
const PAPER = "#fffefa";
const MARIGOLD = "#fce519";
const CORAL = "#f4a07c";
const SKY = "#a9d4ef";
const SAGE = "#dbe8ac";
const FERN = "#30be60";

type Cast = {
    skin: string;
    skinShade: string;
    hair: string;
    top: string;
    topShade: string;
    /** Avatar circle colour */
    bg: string;
    blink: string;
    /** Blush strength: softer on deeper skin so it reads as warmth, not a smudge */
    blush: number;
};

const CAST: Record<Who, Cast> = {
    arya: { skin: "#c98b5e", skinShade: "#a96f47", hair: "#261c16", top: "#2f6f5e", topShade: "#245647", bg: MARIGOLD, blink: "-0.4s", blush: 0.45 },
    sekar: { skin: "#e3ae86", skinShade: "#c48c64", hair: "#c96f4a", top: "#4f7ea8", topShade: "#3d6489", bg: SAGE, blink: "-2.1s", blush: 0.55 },
    rina: { skin: "#d8a07a", skinShade: "#b98059", hair: "#3a261c", top: "#24446b", topShade: "#1a3352", bg: CORAL, blink: "-1.3s", blush: 0.5 },
    dimas: { skin: "#a86d48", skinShade: "#8a5536", hair: "#1b1512", top: "#fbfaf4", topShade: "#dcdace", bg: SKY, blink: "-3s", blush: 0.3 },
};

const line = { fill: "none", stroke: INK, strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const outline = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" } as const;

/** An outlined sleeve: an ink tube with the fabric colour on top. */
function Arm({ d, color }: { d: string; color: string }) {
    return (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} stroke={INK} strokeWidth={20} />
            <path d={d} stroke={color} strokeWidth={14} />
        </g>
    );
}

function Hand({ x, y, skin }: { x: number; y: number; skin: string }) {
    return <circle cx={x} cy={y} r={9} fill={skin} {...outline} />;
}

// ===== Per-character layers =====

/** Hair or hijab drawn behind the head and torso. */
function Back({ who, c }: { who: Who; c: Cast }) {
    if (who === "rina") {
        return (
            <path
                d="M64 82C58 52 80 37 101 37c23 0 42 16 36 46 5 24 9 44 3 62-10 5-21 2-25-6H85c-4 8-15 11-25 6-6-18-1-39 4-63z"
                fill={c.hair}
                {...outline}
            />
        );
    }
    if (who === "sekar") {
        // Hijab: falls from the crown over the shoulders like a cape.
        return (
            <path
                d="M100 35c-34 0-46 28-44 56 1 20 8 34 16 42-11 8-21 16-25 28 22 15 84 15 106 0-4-12-14-20-25-28 8-8 15-22 16-42 2-28-10-56-44-56z"
                fill={c.hair}
                {...outline}
            />
        );
    }
    return null;
}

function Torso({ who, c }: { who: Who; c: Cast }) {
    const body = "M40 222c0-50 18-82 60-84 42 2 60 34 60 84z";
    return (
        <g>
            <path d="M88 104v26c4 6 20 6 24 0v-26z" fill={c.skinShade} {...outline} />
            <path d={body} fill={c.top} {...outline} />
            {who === "arya" && (
                <g>
                    {/* Hoodie: hood rim, drawstrings, pocket */}
                    <path d="M70 146c8-12 52-12 60 0-8 12-52 12-60 0z" fill={c.topShade} {...outline} />
                    <path d="M92 152l-2 22M108 152l2 22" stroke={PAPER} strokeWidth={3} strokeLinecap="round" />
                    <circle cx={90} cy={176} r={2.6} fill={MARIGOLD} stroke={INK} strokeWidth={1.5} />
                    <circle cx={110} cy={176} r={2.6} fill={MARIGOLD} stroke={INK} strokeWidth={1.5} />
                    <path d="M70 222l6-22c16-6 32-6 48 0l6 22" {...line} stroke={c.topShade} strokeWidth={3} />
                </g>
            )}
            {who === "sekar" && (
                <g>
                    {/* Denim overshirt: placket and a chest pocket with a pen */}
                    <path d="M100 168v54" {...line} strokeWidth={2} />
                    <path d="M116 184h18v16c-6 3-12 3-18 0z" fill={c.topShade} {...outline} strokeWidth={2.5} />
                    <path d="M121 184v-9" stroke={MARIGOLD} strokeWidth={3.5} strokeLinecap="round" />
                </g>
            )}
            {who === "rina" && (
                <g>
                    {/* Blazer over a cream top, lapels, lanyard */}
                    <path d="M84 139l16 40 16-40c-10-3-22-3-32 0z" fill={PAPER} {...outline} strokeWidth={2.5} />
                    <path d="M84 139l-6 18 10 4-6 12 18 6M116 139l6 18-10 4 6 12-18 6" fill={c.top} {...outline} strokeWidth={2.5} />
                    <path d="M91 140l7 46M109 140l-7 46" stroke={MARIGOLD} strokeWidth={3} strokeLinecap="round" />
                    <rect x={90} y={184} width={20} height={25} rx={3} fill={PAPER} {...outline} strokeWidth={2.5} />
                    <rect x={94} y={189} width={7} height={7} rx={1.5} fill={c.top} />
                    <path d="M94 201h12M94 205h8" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
                </g>
            )}
            {who === "dimas" && (
                <g>
                    {/* Shirt: collar, buttons, lanyard */}
                    <path d="M100 222v-82" {...line} strokeWidth={1.6} />
                    <circle cx={100} cy={170} r={1.8} fill={INK} />
                    <circle cx={100} cy={206} r={1.8} fill={INK} />
                    <path d="M85 137l13 16 2-14zM115 137l-13 16-2-14z" fill={PAPER} {...outline} strokeWidth={2.5} />
                    <path d="M89 144l8 44M111 144l-8 44" stroke="#2f6f5e" strokeWidth={3} strokeLinecap="round" />
                    <rect x={90} y={186} width={20} height={25} rx={3} fill={MARIGOLD} {...outline} strokeWidth={2.5} />
                    <rect x={94} y={191} width={7} height={7} rx={1.5} fill={PAPER} stroke={INK} strokeWidth={1.2} />
                    <path d="M94 203h12M94 207h8" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
                </g>
            )}
        </g>
    );
}

/** Head shape plus whatever sits on it (hair fringe, hijab band, headphones). */
function Head({ who, c, children }: { who: Who; c: Cast; children: ReactNode }) {
    const hijab = who === "sekar";
    return (
        <g className="m-head">
            {!hijab && (
                <g>
                    <ellipse cx={66} cy={87} rx={6.5} ry={8.5} fill={c.skin} {...outline} />
                    <ellipse cx={134} cy={87} rx={6.5} ry={8.5} fill={c.skin} {...outline} />
                </g>
            )}
            {hijab ? (
                <g>
                    {/* Under-cap band, then the face opening */}
                    <ellipse cx={100} cy={83} rx={33} ry={36} fill="#a85738" {...outline} />
                    <ellipse cx={100} cy={87} rx={30} ry={32} fill={c.skin} {...outline} />
                    <path d="M82 125c10 7 26 7 36 0" {...line} stroke="#a85738" strokeWidth={2.5} />
                    <circle cx={127} cy={122} r={3.5} fill={MARIGOLD} stroke={INK} strokeWidth={2} />
                </g>
            ) : (
                <ellipse cx={100} cy={80} rx={34} ry={37} fill={c.skin} {...outline} />
            )}

            {children}

            {who === "arya" && (
                <g>
                    <path d="M74 99c3 14 14 22 26 22s23-8 26-22c-6 7-15 11-26 11s-20-4-26-11z" fill={c.hair} opacity={0.16} />
                    <path
                        d="M65 88c-6-27 9-48 33-50 26-2 44 15 37 50-2-9-6-15-12-19-10 5-24 6-34 0 2-4 3-8 2-12-8 9-17 18-26 31z"
                        fill={c.hair}
                        {...outline}
                    />
                    {/* Headphones */}
                    <path d="M61 86c-4-52 82-52 78 0" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
                    <path d="M61 86c-4-52 82-52 78 0" fill="none" stroke="#3b4a3f" strokeWidth={4} strokeLinecap="round" />
                    <rect x={53} y={75} width={15} height={25} rx={6.5} fill={MARIGOLD} {...outline} />
                    <rect x={132} y={75} width={15} height={25} rx={6.5} fill={MARIGOLD} {...outline} />
                </g>
            )}
            {who === "rina" && (
                <g>
                    <path d="M66 86c-3-30 15-46 36-46 21 0 37 17 32 46-6-16-16-26-30-29-8 10-22 21-38 29z" fill={c.hair} {...outline} />
                    <circle cx={67} cy={101} r={2.8} fill={MARIGOLD} stroke={INK} strokeWidth={1.5} />
                    <circle cx={133} cy={101} r={2.8} fill={MARIGOLD} stroke={INK} strokeWidth={1.5} />
                </g>
            )}
            {who === "dimas" && (
                <g>
                    <path d="M66 84c-5-30 13-45 34-45 24 0 40 14 34 41-4-8-10-13-18-15-14-2-30 0-40-6-4 7-7 15-10 25z" fill={c.hair} {...outline} />
                    <path d="M88 58c4-6 8-10 14-12" {...line} stroke="#3d322b" strokeWidth={2} />
                </g>
            )}
        </g>
    );
}

// ===== Faces =====

type Gaze = { x: number; y: number } | null;
type Mouth = "smile" | "grin" | "flat" | "open" | "o";

const POSES: Record<Pose, { gaze: Gaze; mouth: Mouth; happyEyes?: boolean; browUp?: boolean }> = {
    idle: { gaze: null, mouth: "smile" },
    wave: { gaze: null, mouth: "grin" },
    type: { gaze: { x: 0.1, y: 0.9 }, mouth: "smile" },
    think: { gaze: { x: -0.7, y: -0.9 }, mouth: "flat", browUp: true },
    cheer: { gaze: null, mouth: "open", happyEyes: true },
    phone: { gaze: { x: 0.5, y: 0.9 }, mouth: "smile" },
    check: { gaze: { x: 0, y: 1 }, mouth: "smile" },
    magnify: { gaze: { x: 0.9, y: 0 }, mouth: "o" },
};

function Face({ who, c, pose }: { who: Who; c: Cast; pose: Pose }) {
    const p = POSES[pose];
    const ey = 86;
    const look: CSSProperties | undefined = p.gaze
        ? { transform: `translate(${p.gaze.x * 2.6}px, ${p.gaze.y * 2.2}px)` }
        : undefined;
    return (
        <g>
            <circle cx={79} cy={100} r={5} fill="#ff8a6e" opacity={c.blush} />
            <circle cx={121} cy={100} r={5} fill="#ff8a6e" opacity={c.blush} />
            {/* Brows */}
            <path d={p.browUp ? "M79 70q7-6 14-2" : "M79 74q7-4 14-1"} {...line} strokeWidth={3.2} />
            <path d="M107 73q7-3 14 1" {...line} strokeWidth={3.2} />
            {p.happyEyes ? (
                <g>
                    <path d={`M81 ${ey + 1}q6-7 12 0`} {...line} strokeWidth={3.2} />
                    <path d={`M107 ${ey + 1}q6-7 12 0`} {...line} strokeWidth={3.2} />
                </g>
            ) : (
                <g className={p.gaze ? undefined : "m-look"} style={look}>
                    {[87, 113].map((x) => (
                        <g key={x} className="m-eye">
                            <ellipse cx={x} cy={ey} rx={4.3} ry={5.5} fill={INK} />
                            <circle cx={x + 1.5} cy={ey - 2} r={1.4} fill="#fff" />
                        </g>
                    ))}
                </g>
            )}
            {who === "sekar" && (
                <g fill="none" stroke={INK} strokeWidth={2.6}>
                    <circle cx={87} cy={ey} r={9} fill="#fff" fillOpacity={0.18} />
                    <circle cx={113} cy={ey} r={9} fill="#fff" fillOpacity={0.18} />
                    <path d="M96 85q4-3 8 0" strokeLinecap="round" />
                </g>
            )}
            <path d="M100 91q3.5 5-1 7" {...line} stroke={c.skinShade} strokeWidth={2.4} />
            {p.mouth === "smile" && <path d="M91 104q9 8 18 0" {...line} />}
            {p.mouth === "flat" && <path d="M94 106q6 1 12-1" {...line} />}
            {p.mouth === "o" && <ellipse cx={101} cy={106} rx={3.6} ry={4.2} fill="#6b2a1c" {...outline} strokeWidth={2.5} />}
            {(p.mouth === "grin" || p.mouth === "open") && (
                <g>
                    <path d={p.mouth === "open" ? "M89 102q11 18 22 0z" : "M90 103q10 11 20 0z"} fill="#6b2a1c" {...outline} strokeWidth={2.6} />
                    {p.mouth === "open" && <path d="M95 110q5-4 10 0" fill="none" stroke={CORAL} strokeWidth={3} strokeLinecap="round" />}
                </g>
            )}
        </g>
    );
}

// ===== Poses: arms and props in front of the torso =====

function Front({ c, pose }: { c: Cast; pose: Pose }) {
    switch (pose) {
        case "wave":
            return (
                <g className="m-wave">
                    <Arm d="M146 166q22-14 18-56" color={c.top} />
                    <Hand x={164} y={104} skin={c.skin} />
                    <path d="M172 92l6-5M176 102h7M160 90l1-7" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
                </g>
            );
        case "type":
            return (
                <g>
                    {["</>", "{ }", "✓"].map((g, i) => (
                        <text
                            key={g}
                            x={70 + i * 28}
                            y={166}
                            className="m-glyph"
                            style={{ animationDelay: `${i * 0.8}s` }}
                            fontFamily="ui-monospace, monospace"
                            fontWeight={800}
                            fontSize={13}
                            fill={i === 1 ? MARIGOLD : PAPER}
                            stroke={INK}
                            strokeWidth={3}
                            paintOrder="stroke"
                            textAnchor="middle"
                        >
                            {g}
                        </text>
                    ))}
                    <g className="m-type-l">
                        <rect x={42} y={170} width={116} height={64} rx={9} fill="#2b3b2f" {...outline} />
                        <rect x={92} y={190} width={16} height={16} rx={4} fill={MARIGOLD} {...outline} strokeWidth={2} />
                        <circle cx={60} cy={186} r={6} fill={SAGE} {...outline} strokeWidth={2} />
                        <rect x={128} y={200} width={18} height={11} rx={3} fill={CORAL} {...outline} strokeWidth={2} transform="rotate(-12 137 205)" />
                    </g>
                </g>
            );
        case "think":
            return (
                <g>
                    <Arm d="M148 172q8-36-30-50" color={c.top} />
                    <Hand x={116} y={121} skin={c.skin} />
                    {[
                        [146, 60, 3],
                        [155, 47, 4.5],
                        [168, 31, 6.5],
                    ].map(([x, y, r], i) => (
                        <circle key={i} cx={x} cy={y} r={r} fill={PAPER} {...outline} strokeWidth={2.4} className="m-dot" style={{ animationDelay: `${i * 0.25}s` }} />
                    ))}
                </g>
            );
        case "cheer":
            return (
                <g>
                    <Arm d="M54 168q-20-30-12-70" color={c.top} />
                    <Arm d="M146 168q20-30 12-70" color={c.top} />
                    <Hand x={42} y={94} skin={c.skin} />
                    <Hand x={158} y={94} skin={c.skin} />
                    {[
                        [30, 50, MARIGOLD],
                        [62, 30, CORAL],
                        [100, 16, SKY],
                        [138, 28, FERN],
                        [172, 48, MARIGOLD],
                        [48, 70, SKY],
                        [154, 66, CORAL],
                    ].map(([x, y, fill], i) => (
                        <rect
                            key={i}
                            x={Number(x)}
                            y={Number(y)}
                            width={7}
                            height={11}
                            rx={2}
                            fill={String(fill)}
                            stroke={INK}
                            strokeWidth={1.6}
                            className="m-confetti"
                            style={{ animationDelay: `${(i * 0.26) % 1.8}s` }}
                        />
                    ))}
                </g>
            );
        case "phone":
            return (
                <g>
                    <Arm d="M150 174q10 26-26 18" color={c.top} />
                    <g transform="rotate(-8 115 178)">
                        <rect x={103} y={158} width={25} height={40} rx={5} fill={INK} />
                        <rect x={106} y={162} width={19} height={31} rx={2.5} fill={PAPER} />
                        <rect x={106} y={162} width={19} height={7} rx={2} fill={MARIGOLD} />
                        <path d="M109 175h12M109 180h9M109 185h11" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
                    </g>
                    <Hand x={124} y={190} skin={c.skin} />
                    <g className="m-pop">
                        <rect x={128} y={132} width={34} height={20} rx={10} fill={FERN} {...outline} strokeWidth={2.4} />
                        <path d="M138 142l4 4 8-8" fill="none" stroke={PAPER} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                </g>
            );
        case "check":
            return (
                <g>
                    <Arm d="M52 178q-4 10 12 8" color={c.top} />
                    <Arm d="M148 178q4 10-12 8" color={c.top} />
                    <rect x={64} y={152} width={72} height={76} rx={7} fill={PAPER} {...outline} />
                    <rect x={87} y={146} width={26} height={11} rx={3.5} fill="#10380b" {...outline} strokeWidth={2} />
                    {[170, 186, 202].map((y, i) => (
                        <g key={y}>
                            <path d={`M90 ${y}h${34 - i * 6}`} stroke={INK} strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
                            <g className="m-pop" style={{ animationDelay: `${i * 0.35}s` }}>
                                <circle cx={78} cy={y} r={6} fill={MARIGOLD} stroke={INK} strokeWidth={2} />
                                <path d={`M75 ${y}l2 2.4 4-4.4`} fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                        </g>
                    ))}
                    <Hand x={64} y={186} skin={c.skin} />
                    <Hand x={136} y={186} skin={c.skin} />
                </g>
            );
        case "magnify":
            return (
                <g className="m-scan">
                    <Arm d="M150 172q22-30 2-60" color={c.top} />
                    <path d="M146 110l-12-12" stroke={INK} strokeWidth={7} strokeLinecap="round" />
                    <circle cx={122} cy={87} r={16} fill={c.skin} stroke={INK} strokeWidth={4} />
                    <ellipse cx={117} cy={87} rx={6.5} ry={8} fill={INK} />
                    <circle cx={119.5} cy={84} r={2} fill="#fff" />
                    <path d="M127 76q6 3 7 10" fill="none" stroke="#fff" strokeOpacity={0.8} strokeWidth={2.5} strokeLinecap="round" />
                    <Hand x={150} y={110} skin={c.skin} />
                </g>
            );
        default:
            return (
                <g fill="none" stroke={c.topShade} strokeWidth={3} strokeLinecap="round">
                    <path d="M60 178q4 20 1 44M140 178q-4 20-1 44" />
                </g>
            );
    }
}

type MascotProps = {
    who: Who;
    pose?: Pose;
    className?: string;
    /** Accessible name; decorative (aria-hidden) when omitted. */
    label?: string;
    /** White die-cut edge for busy or dark backgrounds. */
    sticker?: boolean;
};

export function Mascot({ who, pose = "idle", className, label, sticker = true }: MascotProps) {
    const c = CAST[who];
    const ref = useLook<SVGSVGElement>(POSES[pose].gaze === null && !POSES[pose].happyEyes);
    return (
        <svg
            ref={ref}
            viewBox="0 0 200 222"
            className={cn("mascot overflow-visible", sticker && "sticker", className)}
            style={{ "--blink": c.blink } as CSSProperties}
            {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
        >
            <g className={pose === "type" ? undefined : "m-body"}>
                <Back who={who} c={c} />
                <Torso who={who} c={c} />
                <Head who={who} c={c}>
                    <Face who={who} c={c} pose={pose} />
                </Head>
                <Front c={c} pose={pose} />
            </g>
        </svg>
    );
}

/** Head and shoulders in a coloured circle, for chat bubbles, lists and the footer. */
export function MascotAvatar({ who, className, label }: { who: Who; className?: string; label?: string }) {
    const c = CAST[who];
    const ref = useLook<SVGSVGElement>();
    return (
        <span
            className={cn("relative block aspect-square shrink-0 overflow-hidden rounded-full border-2 border-forest", className)}
            style={{ background: c.bg }}
            {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
        >
            <svg ref={ref} viewBox="36 30 128 128" className="mascot absolute inset-0 w-full h-full" style={{ "--blink": c.blink } as CSSProperties}>
                <Back who={who} c={c} />
                <Torso who={who} c={c} />
                <Head who={who} c={c}>
                    <Face who={who} c={c} pose="idle" />
                </Head>
            </svg>
        </span>
    );
}
