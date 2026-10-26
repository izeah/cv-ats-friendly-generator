import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { shortcutKeys, type Shortcut } from "@/lib/shortcuts";

/** One key cap, styled like inline code. It takes the surrounding text colour,
 *  so the same chip works on paper, on forest and inside the tooltip. Hidden on
 *  phones and touch-only screens (.hotkey). */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <kbd
            className={cn(
                "hotkey inline-flex min-w-[1.75em] h-[1.75em] items-center justify-center rounded-[0.4em] border border-current/25 bg-current/10 px-[0.45em] font-mono text-[0.8em] font-semibold leading-none",
                className,
            )}
        >
            {children}
        </kbd>
    );
}

/** A whole shortcut as key caps (⇧ ⌘ K on macOS, Ctrl Shift K elsewhere). Decorative:
 *  the control it belongs to carries aria-keyshortcuts for screen readers. */
export function ShortcutKeys({ shortcut, className }: { shortcut: Shortcut; className?: string }) {
    return (
        <span className={cn("hotkey inline-flex items-center gap-0.5 shrink-0", className)} aria-hidden="true">
            {shortcutKeys(shortcut).map((key) => (
                <Kbd key={key}>{key}</Kbd>
            ))}
        </span>
    );
}
