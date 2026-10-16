// Hand-drawn line art in the Textla style: flat, unshaded, single-colour strokes.
// Every piece draws with currentColor so it can sit on cream or on Forest Ink.
// Motion classes (animate-sway, animate-drift, …) live in index.css.
import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

type ArtProps = SVGProps<SVGSVGElement>;

const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    vectorEffect: "non-scaling-stroke",
} as const;

/** Brand mark: a CV sheet crossed by a Marigold ATS scan beam, plus a generator sparkle. */
export function LogoMark({ className, animated = true }: { className?: string; animated?: boolean }) {
    return (
        <svg viewBox="0 0 64 64" className={cn("shrink-0", className)} aria-hidden="true">
            <rect width="64" height="64" rx="16" className="fill-forest" />
            <path d="M20 11h15l9 9v31a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2V13a2 2 0 0 1 2-2z" className="fill-parchment" />
            <path d="M35 11v7a2 2 0 0 0 2 2h7z" className="fill-sage" />
            <circle cx="24" cy="20" r="3" className="fill-forest" />
            <path d="M30 19.5h4M30 23.5h8M23 41h17M23 46h11" className="stroke-forest" strokeWidth="2.2" strokeLinecap="round" />
            <g className={animated ? "logo-scan" : undefined}>
                <rect x="18" y="26" width="26" height="12" className="fill-marigold" opacity=".35" />
                <rect x="9" y="29" width="46" height="6" rx="3" className="fill-marigold" />
            </g>
            <path
                d="M51.5 39.5l1.6 4.9 4.9 1.6-4.9 1.6-1.6 4.9-1.6-4.9-4.9-1.6 4.9-1.6z"
                className={cn("fill-marigold", animated && "twinkle")}
            />
        </svg>
    );
}

/** Two-line lockup of the product name; size it with the parent's font-size. */
export function Wordmark({ className }: { className?: string }) {
    return (
        <span className={cn("flex flex-col leading-none", className)}>
            <span className="font-display font-bold uppercase tracking-[-0.02em] text-[1.3em]">CV ATS Friendly</span>
            <span className="font-bold uppercase tracking-[0.3em] text-[0.62em] mt-[0.3em]">Generator</span>
        </span>
    );
}

export function Cactus(props: ArtProps) {
    return (
        <svg viewBox="0 0 120 200" aria-hidden="true" {...props}>
            <g {...stroke}>
                <path d="M50 192V62c0-17 20-17 20 0v130" />
                <path d="M50 134H38c-9 0-13-6-13-14V94c0-11 13-11 13 0v24h12" />
                <path d="M70 112h12c9 0 13-6 13-14V76c0-11-13-11-13 0v20H70" />
                <path d="M60 58v132M31 96v20M88 74v20" strokeDasharray="2 7" />
                <path d="M47 84l-4-2M47 104l-4-2M73 92l4-2M73 128l4-2M47 150l-4-2M73 166l4-2" />
                <path d="M54 50c2-7 10-7 12 0M60 45v-5" />
                <path d="M6 192h108M20 192c4-6 10-6 14 0M84 192c5-7 12-7 16 0" />
            </g>
        </svg>
    );
}

export function SmallCactus(props: ArtProps) {
    return (
        <svg viewBox="0 0 80 100" aria-hidden="true" {...props}>
            <g {...stroke}>
                <path d="M28 92V46c0-22 24-22 24 0v46" />
                <path d="M28 64h-8c-6 0-9-4-9-10V44c0-8 9-8 9 0v8h8" />
                <path d="M40 36v54" strokeDasharray="2 6" />
                <path d="M8 92h64M18 92c3-5 8-5 11 0" />
            </g>
        </svg>
    );
}

export function Cloud(props: ArtProps) {
    return (
        <svg viewBox="0 0 120 60" aria-hidden="true" {...props}>
            <path
                {...stroke}
                d="M20 50C8 50 8 34 20 34c0-14 18-18 26-8 4-14 28-16 34 0 12-6 26 4 20 16 10 2 8 8 0 8z"
            />
        </svg>
    );
}

export function Sun(props: ArtProps) {
    const rays = Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        const r1 = 22;
        const r2 = i % 2 ? 30 : 34;
        return `M${40 + r1 * Math.cos(a)} ${40 + r1 * Math.sin(a)}L${40 + r2 * Math.cos(a)} ${40 + r2 * Math.sin(a)}`;
    }).join("");
    return (
        <svg viewBox="0 0 80 80" aria-hidden="true" {...props}>
            <g {...stroke}>
                <circle cx="40" cy="40" r="15" />
                <path d={rays} />
            </g>
        </svg>
    );
}

export function CVSheet(props: ArtProps) {
    return (
        <svg viewBox="0 0 90 112" aria-hidden="true" {...props}>
            <g {...stroke}>
                <path d="M10 6h52l20 20v80H10z" />
                <path d="M62 6v20h20" />
                <circle cx="27" cy="34" r="8" />
                <path d="M42 30h28M42 39h20M20 56h52M20 66h52M20 76h36M20 88h46" />
            </g>
        </svg>
    );
}

export function PaperPlane(props: ArtProps) {
    return (
        <svg viewBox="0 0 120 80" aria-hidden="true" {...props}>
            <g {...stroke}>
                <path d="M30 40L112 6 86 72 66 50z" />
                <path d="M66 50l46-44M66 50l-2 18 12-10" />
                <path d="M4 70c10-12 20-12 28-4" strokeDasharray="3 6" />
            </g>
        </svg>
    );
}

/** FAQ art: a question bubble answered by a Marigold bubble that keeps "typing". */
export function QuestionBubbles(props: ArtProps) {
    return (
        <svg viewBox="0 0 150 124" aria-hidden="true" {...props}>
            <g {...stroke}>
                <path d="M18 8h66a12 12 0 0 1 12 12v38a12 12 0 0 1-12 12H40l-14 13V70h-8A12 12 0 0 1 6 58V20A12 12 0 0 1 18 8z" />
                <g className="wiggle">
                    <path d="M42 31a9.5 9.5 0 1 1 13.5 8.6c-3 1.5-4.5 3.4-4.5 6.6" />
                    <circle cx="51" cy="55" r="1.6" fill="currentColor" />
                </g>
                <path d="M104 10l7-6M108 20l9-2M100 2l2-6" />
            </g>
            <path
                d="M92 62h40a11 11 0 0 1 11 11v20a11 11 0 0 1-11 11h-3v12l-13-12H92a11 11 0 0 1-11-11V73a11 11 0 0 1 11-11z"
                className="fill-marigold"
                {...stroke}
            />
            {[100, 112, 124].map((cx, i) => (
                <circle key={cx} cx={cx} cy="83" r="2.6" fill="currentColor" className="typing-dot" style={{ animationDelay: `${i * 0.18}s` }} />
            ))}
        </svg>
    );
}

export function Birds(props: ArtProps) {
    return (
        <svg viewBox="0 0 80 40" aria-hidden="true" {...props}>
            <g {...stroke}>
                <path className="flap" d="M4 24c6-7 12-7 16 0 4-7 10-7 16 0" />
                <path className="flap" style={{ animationDelay: "0.3s" }} d="M44 10c4-5 8-5 11 0 3-5 7-5 11 0" />
            </g>
        </svg>
    );
}

export function Balloon(props: ArtProps) {
    return (
        <svg viewBox="0 0 70 112" aria-hidden="true" {...props}>
            <g {...stroke}>
                <path d="M35 6C18 6 8 19 8 33c0 16 15 28 21 40h12c6-12 21-24 21-40C62 19 52 6 35 6z" />
                <path d="M35 6c-8 10-10 40-6 67M35 6c8 10 10 40 6 67M10 30h50" />
                <path d="M29 73l1 14M41 73l-1 14" />
                <path d="M28 87h14l-2 11H30z" />
            </g>
        </svg>
    );
}

export function Sparkle(props: ArtProps) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
            <path {...stroke} d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" />
        </svg>
    );
}

export function Tumbleweed(props: ArtProps) {
    return (
        <svg viewBox="0 0 60 60" aria-hidden="true" {...props}>
            <g {...stroke}>
                <circle cx="30" cy="30" r="24" />
                <path d="M12 22c10 4 26 2 36-6M10 36c14-2 28 4 38 10M20 10c4 14 2 30-6 42M38 8c-6 12-4 30 6 44M18 44c8-10 18-14 30-12" />
            </g>
        </svg>
    );
}
