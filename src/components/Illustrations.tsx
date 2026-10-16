// Hand-drawn line art in the Textla style: flat, unshaded, single-colour strokes.
// Every piece draws with currentColor so it can sit on cream or on Forest Ink.
import type { SVGProps } from "react";
import { Sparkles } from "lucide-react";
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

export function Cactus(props: ArtProps) {
    return (
        <svg viewBox="0 0 120 200" aria-hidden="true" {...props}>
            <g {...stroke}>
                {/* trunk */}
                <path d="M50 192V62c0-17 20-17 20 0v130" />
                {/* left arm */}
                <path d="M50 134H38c-9 0-13-6-13-14V94c0-11 13-11 13 0v24h12" />
                {/* right arm */}
                <path d="M70 112h12c9 0 13-6 13-14V76c0-11-13-11-13 0v20H70" />
                {/* ribs */}
                <path d="M60 58v132M31 96v20M88 74v20" strokeDasharray="2 7" />
                {/* spines */}
                <path d="M47 84l-4-2M47 104l-4-2M73 92l4-2M73 128l4-2M47 150l-4-2M73 166l4-2" />
                {/* bloom */}
                <path d="M54 50c2-7 10-7 12 0M60 45v-5" />
                {/* ground */}
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

export function Magnifier(props: ArtProps) {
    return (
        <svg viewBox="0 0 90 90" aria-hidden="true" {...props}>
            <g {...stroke}>
                <circle cx="36" cy="36" r="24" />
                <path d="M54 54l26 26M50 58l8-8" />
                <path d="M25 37l8 8 15-16" />
            </g>
        </svg>
    );
}

/** Brand mark: Forest Ink disc with a Marigold sparkle. */
export function LogoMark({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                "inline-flex items-center justify-center rounded-full bg-forest text-marigold shrink-0",
                className,
            )}
        >
            <Sparkles className="w-1/2 h-1/2" />
        </span>
    );
}
