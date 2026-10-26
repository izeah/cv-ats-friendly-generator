// Dialogs and the toast shared by the sidebar and the phone header menu.
import { useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cvTitle, type CVData } from "@/lib/db";
import { rich, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type ToastState = { type: "success" | "error"; message: string } | null;

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
    // Radix stacks dialogs, so these open cleanly on top of the search palette.
    return (
        <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-[100] animate-fade-in" />
                <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
                    <Dialog.Content
                        aria-describedby={undefined}
                        className="bg-card border-2 border-forest rounded-card shadow-stamp max-w-sm w-full animate-scale-in pointer-events-auto p-8"
                    >
                        <Dialog.Title className="h-display text-3xl text-foreground mb-3">{title}</Dialog.Title>
                        {children}
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export function RenameModal({ cv, onSave, onClose }: { cv: CVData; onSave: (label: string) => void; onClose: () => void }) {
    const { t } = useI18n();
    const s = t.sidebar;
    const [value, setValue] = useState(cvTitle(cv));
    return (
        <Modal title={s.renameTitle} onClose={onClose}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSave(value);
                }}
            >
                <Label htmlFor="cv-label" className="text-xs">
                    {s.renameLabel}
                </Label>
                <Input
                    id="cv-label"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={(e) => e.currentTarget.select()}
                    maxLength={80}
                    className="mt-1.5"
                    autoComplete="off"
                />
                <p className="text-xs text-muted-foreground mt-2.5">
                    {rich(s.renameHint, { name: <span className="font-bold text-foreground">{cv.fullName}</span> })}
                </p>
                {cv.label && (
                    <button type="button" className="link-mark text-xs font-bold mt-3 cursor-pointer" onClick={() => onSave("")}>
                        {s.renameReset}
                    </button>
                )}
                <div className="flex gap-3 justify-end mt-6">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        {t.common.cancel}
                    </Button>
                    <Button type="submit">{t.common.save}</Button>
                </div>
            </form>
        </Modal>
    );
}

export function DeleteModal({ cv, onConfirm, onClose }: { cv: CVData; onConfirm: () => void; onClose: () => void }) {
    const { t } = useI18n();
    const s = t.sidebar;
    return (
        <Modal title={s.deleteTitle} onClose={onClose}>
            <p className="text-sm text-muted-foreground mb-6">
                {rich(s.deleteBody, { name: <span className="font-bold text-foreground">{cvTitle(cv)}</span> })}
            </p>
            <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={onClose}>
                    {t.common.cancel}
                </Button>
                <Button variant="destructive" onClick={onConfirm}>
                    {t.common.delete}
                </Button>
            </div>
        </Modal>
    );
}

export function Toast({ toast }: { toast: ToastState }) {
    if (!toast) return null;
    return (
        <div
            role={toast.type === "error" ? "alert" : "status"}
            className={cn(
                "fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-sm z-[110] flex items-center gap-2.5 px-5 py-3 rounded-full text-sm font-bold animate-slide-up",
                toast.type === "success" ? "bg-forest text-cream" : "bg-destructive text-destructive-foreground",
            )}
        >
            {toast.type === "success" ? (
                <CircleCheck className="w-4 h-4 text-marigold shrink-0" aria-hidden="true" />
            ) : (
                <CircleAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span>{toast.message}</span>
        </div>
    );
}
