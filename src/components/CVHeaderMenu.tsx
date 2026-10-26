// Phone header actions for the CV form: a New CV button and a menu with everything
// the desktop header and the sidebar row menu offer for the open CV.
import { useEffect, useRef, useState } from "react";
import {
    Archive,
    ArchiveRestore,
    Download,
    ExternalLink,
    Eye,
    LoaderCircle,
    MoreVertical,
    Pencil,
    Pin,
    PinOff,
    Save,
    SquarePen,
    Trash2,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteModal, RenameModal, Toast, type ToastState } from "@/components/CVDialogs";
import {
    deleteCVByEmail,
    downloadCVJson,
    getCVByEmail,
    renameCV,
    toggleArchive,
    togglePin,
    type CVData,
} from "@/lib/db";
import { fill, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface CVHeaderMenuProps {
    /** Email of the CV in the form; the CV-specific items need it saved first. */
    email: string;
    savingMode: "save" | "preview" | null;
    onSave: () => void;
    onPreview: () => void;
    onNewCV: () => void;
    /** Something about the stored CV changed (pin, label, archive): refresh lists. */
    onChanged: () => void;
    /** The open CV was deleted. */
    onDeleted: () => void;
    className?: string;
}

const item =
    "w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm text-left text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:pointer-events-none";

export default function CVHeaderMenu({
    email,
    savingMode,
    onSave,
    onPreview,
    onNewCV,
    onChanged,
    onDeleted,
    className,
}: CVHeaderMenuProps) {
    const { t } = useI18n();
    const s = t.sidebar;
    const f = t.form;
    const [open, setOpen] = useState(false);
    // The stored record, read when the menu opens (null: not saved yet).
    const [cv, setCv] = useState<CVData | null>(null);
    const [renameTarget, setRenameTarget] = useState<CVData | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CVData | null>(null);
    const [toast, setToast] = useState<ToastState>(null);
    const wrap = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(timer);
    }, [toast]);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: PointerEvent) => {
            if (!wrap.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("pointerdown", onDown);
        window.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onDown);
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const toggle = () => {
        if (open) return setOpen(false);
        setOpen(true);
        if (email) getCVByEmail(email).then((found) => setCv(found ?? null));
        else setCv(null);
    };

    const run = (fn: () => void) => () => {
        setOpen(false);
        fn();
    };

    const entries: ({ icon: LucideIcon; label: string; onClick: () => void; disabled?: boolean; danger?: boolean } | "divider")[] = [
        { icon: savingMode === "save" ? LoaderCircle : Save, label: f.save, onClick: onSave, disabled: !!savingMode },
        { icon: savingMode === "preview" ? LoaderCircle : Eye, label: f.preview, onClick: onPreview, disabled: !!savingMode },
        "divider",
        {
            icon: cv?.isPinned ? PinOff : Pin,
            label: cv?.isPinned ? s.unpin : s.pin,
            onClick: async () => {
                if (!cv) return;
                await togglePin(cv.email);
                onChanged();
            },
            disabled: !cv || cv.isArchived,
        },
        { icon: Pencil, label: s.rename, onClick: () => cv && setRenameTarget(cv), disabled: !cv },
        {
            icon: ExternalLink,
            label: s.openNewTab,
            onClick: () => cv && window.open(`/create?email=${encodeURIComponent(cv.email)}`, "_blank", "noopener"),
            disabled: !cv,
        },
        {
            icon: Download,
            label: s.exportJson,
            onClick: () => {
                if (!cv) return;
                downloadCVJson(cv);
                setToast({ type: "success", message: fill(s.toastExported, { name: cv.fullName }) });
            },
            disabled: !cv,
        },
        {
            icon: cv?.isArchived ? ArchiveRestore : Archive,
            label: cv?.isArchived ? s.unarchive : s.archive,
            onClick: async () => {
                if (!cv) return;
                await toggleArchive(cv.email);
                onChanged();
            },
            disabled: !cv,
        },
        "divider",
        { icon: Trash2, label: s.delete, onClick: () => cv && setDeleteTarget(cv), disabled: !cv, danger: true },
    ];

    return (
        <div ref={wrap} className={cn("relative flex items-center gap-2", className)}>
            <Button variant="outline" size="icon" className="w-9 h-9" onClick={onNewCV} aria-label={s.newCV}>
                <SquarePen className="w-4 h-4" aria-hidden="true" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                className="w-9 h-9"
                onClick={toggle}
                aria-label={s.moreOptions}
                aria-haspopup="true"
                aria-expanded={open}
            >
                <MoreVertical className="w-4 h-4" aria-hidden="true" />
            </Button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-card border-2 border-forest rounded-2xl shadow-stamp z-[60] p-1.5 origin-top-right animate-[tooltip-in_0.14s_cubic-bezier(0.16,1,0.3,1)]">
                    {entries.map((entry, i) =>
                        entry === "divider" ? (
                            <div key={i} className="my-1 h-px bg-forest/15" role="separator" />
                        ) : (
                            <button
                                key={entry.label}
                                type="button"
                                className={cn(item, entry.danger && "text-destructive hover:bg-destructive/10")}
                                onClick={run(entry.onClick)}
                                disabled={entry.disabled}
                            >
                                <entry.icon
                                    className={cn("w-4 h-4", !entry.danger && "text-primary/70", entry.icon === LoaderCircle && "animate-spin")}
                                    aria-hidden="true"
                                />
                                {entry.label}
                            </button>
                        ),
                    )}
                </div>
            )}

            {renameTarget && (
                <RenameModal
                    cv={renameTarget}
                    onClose={() => setRenameTarget(null)}
                    onSave={async (label) => {
                        await renameCV(renameTarget.email, label);
                        setRenameTarget(null);
                        onChanged();
                    }}
                />
            )}
            {deleteTarget && (
                <DeleteModal
                    cv={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={async () => {
                        await deleteCVByEmail(deleteTarget.email);
                        setDeleteTarget(null);
                        onChanged();
                        onDeleted();
                    }}
                />
            )}
            <Toast toast={toast} />
        </div>
    );
}
