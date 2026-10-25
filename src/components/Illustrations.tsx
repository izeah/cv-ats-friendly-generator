// Brand marks: the logo symbol and the two-line wordmark.
import { cn } from "@/lib/utils";

// "Brackets": two code brackets form a CV page (its top-right corner folded), and
// the middle line is the one that gets read, in marigold. Masters and the usage
// guide live in docs/brand/; these paths are copied from those files.
const MARK = {
    brackets:
        "M50 36H90A6 6 0 0 1 96 42V56A6 6 0 0 1 90 62H70A6 6 0 0 0 64 68V188A6 6 0 0 0 70 194H90A6 6 0 0 1 96 200V214A6 6 0 0 1 90 220H50A14 14 0 0 1 36 206V50A14 14 0 0 1 50 36ZM166 36H188L220 68V206A14 14 0 0 1 206 220H166A6 6 0 0 1 160 214V200A6 6 0 0 1 166 194H186A6 6 0 0 0 192 188V68A6 6 0 0 0 186 62H166A6 6 0 0 1 160 56V42A6 6 0 0 1 166 36Z",
    lines: "M93.5 84.5H162.5A9.5 9.5 0 0 1 162.5 103.5H93.5A9.5 9.5 0 0 1 93.5 84.5ZM93.5 152.5H150.5A9.5 9.5 0 0 1 150.5 171.5H93.5A9.5 9.5 0 0 1 93.5 152.5Z",
    accent: "M93.5 118.5H138.5A9.5 9.5 0 0 1 138.5 137.5H93.5A9.5 9.5 0 0 1 93.5 118.5Z",
};
// Heavier cut with two lines, for 32 px and below.
const SMALL = {
    brackets:
        "M46 40H94A8 8 0 0 1 102 48V68A8 8 0 0 1 94 76H76A6 6 0 0 0 70 82V174A6 6 0 0 0 76 180H94A8 8 0 0 1 102 188V208A8 8 0 0 1 94 216H46A16 16 0 0 1 30 200V56A16 16 0 0 1 46 40ZM162 40H186L226 80V200A16 16 0 0 1 210 216H162A8 8 0 0 1 154 208V188A8 8 0 0 1 162 180H180A6 6 0 0 0 186 174V82A6 6 0 0 0 180 76H162A8 8 0 0 1 154 68V48A8 8 0 0 1 162 40Z",
    lines: "M108 88H158A16 16 0 0 1 158 120H108A16 16 0 0 1 108 88Z",
    accent: "M108 136H132A16 16 0 0 1 132 168H108A16 16 0 0 1 108 136Z",
};
// Light-on-dark reads heavier, so the reversed drawing is a little thinner.
const REVERSED = {
    brackets:
        "M50.75 36.75H90.75A6 6 0 0 1 96.75 42.75V55.25A6 6 0 0 1 90.75 61.25H69.25A6 6 0 0 0 63.25 67.25V188.75A6 6 0 0 0 69.25 194.75H90.75A6 6 0 0 1 96.75 200.75V213.25A6 6 0 0 1 90.75 219.25H50.75A14 14 0 0 1 36.75 205.25V50.75A14 14 0 0 1 50.75 36.75ZM165.25 36.75H187.25L219.25 68.75V205.25A14 14 0 0 1 205.25 219.25H165.25A6 6 0 0 1 159.25 213.25V200.75A6 6 0 0 1 165.25 194.75H186.75A6 6 0 0 0 192.75 188.75V67.25A6 6 0 0 0 186.75 61.25H165.25A6 6 0 0 1 159.25 55.25V42.75A6 6 0 0 1 165.25 36.75Z",
    lines: "M92.75 85.25H163.25A8.75 8.75 0 0 1 163.25 102.75H92.75A8.75 8.75 0 0 1 92.75 85.25ZM92.75 153.25H151.25A8.75 8.75 0 0 1 151.25 170.75H92.75A8.75 8.75 0 0 1 92.75 153.25Z",
    accent: "M92.75 119.25H139.25A8.75 8.75 0 0 1 139.25 136.75H92.75A8.75 8.75 0 0 1 92.75 119.25Z",
};

/** Brand mark. On light surfaces: the forest tile. `onDark`: the bare mark in paper
 *  and marigold. `small`: the heavier two-line cut for 32 px and below.
 *  Decorative by default; pass `label` when the mark stands alone so screen readers announce it. */
export function LogoMark({
    className,
    animated = true,
    label,
    onDark,
    small,
}: {
    className?: string;
    animated?: boolean;
    label?: string;
    onDark?: boolean;
    small?: boolean;
}) {
    const m = onDark ? REVERSED : small ? SMALL : MARK;
    const art = (
        <>
            <path d={m.brackets + m.lines} className="fill-cream" />
            <path d={m.accent} className={cn("fill-marigold", animated && "logo-line")} />
        </>
    );
    return (
        <svg
            viewBox="0 0 256 256"
            className={cn("shrink-0", className)}
            {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
        >
            {label && <title>{label}</title>}
            {onDark ? (
                art
            ) : (
                <>
                    <rect width="256" height="256" rx="58" className="fill-forest" />
                    <g transform={small ? "translate(17.92 17.92) scale(0.86)" : "translate(25.6 25.6) scale(0.8)"}>{art}</g>
                </>
            )}
        </svg>
    );
}

/** Two-line lockup of the product name; size it with the parent's font-size. */
export function Wordmark({ className }: { className?: string }) {
    return (
        <span className={cn("flex flex-col leading-none", className)}>
            <span className="font-display font-bold tracking-[-0.04em] text-[1.18em]">CV ATS Friendly</span>
            <span className="font-mono font-bold uppercase tracking-[0.32em] text-[0.58em] mt-[0.35em] opacity-80">Builder</span>
        </span>
    );
}
