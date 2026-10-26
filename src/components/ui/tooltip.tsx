import * as T from "@radix-ui/react-tooltip";
import type { ReactElement, ReactNode } from "react";
import { ariaKeys, type Shortcut } from "@/lib/shortcuts";
import { ShortcutKeys } from "@/components/ui/kbd";

/** Tooltips open the moment the pointer arrives, every time. */
export function TooltipProvider({ children }: { children: ReactNode }) {
    return (
        <T.Provider delayDuration={0} skipDelayDuration={0}>
            {children}
        </T.Provider>
    );
}

/** Sticker tooltip in place of the browser's title bubble, with the shortcut beside
 *  the label when the control has one. Wrap a single focusable element. */
export function Tooltip({
    label,
    shortcut,
    side = "bottom",
    align = "center",
    disabled,
    children,
}: {
    label: string;
    shortcut?: Shortcut;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    disabled?: boolean;
    children: ReactElement;
}) {
    if (disabled) return children;
    return (
        <T.Root>
            <T.Trigger asChild aria-keyshortcuts={shortcut ? ariaKeys(shortcut) : undefined}>
                {children}
            </T.Trigger>
            <T.Portal>
                <T.Content
                    side={side}
                    align={align}
                    sideOffset={8}
                    collisionPadding={8}
                    className="tooltip z-[200] flex items-center gap-2 rounded-xl border-2 border-forest-deep bg-forest px-2.5 py-1.5 text-xs font-bold text-cream shadow-[2px_2px_0_0_var(--color-marigold)] select-none"
                >
                    <span>{label}</span>
                    {shortcut && <ShortcutKeys shortcut={shortcut} className="text-sm text-cream/90" />}
                </T.Content>
            </T.Portal>
        </T.Root>
    );
}
