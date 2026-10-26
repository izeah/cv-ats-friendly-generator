import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import {
    Plus,
    Trash2,
    Archive,
    ArchiveRestore,
    Eye,
    MoreVertical,
    Download,
    Upload,
    CircleCheck,
    CircleAlert,
    LoaderCircle,
    Search,
    Pin,
    PinOff,
    Pencil,
    ExternalLink,
    House,
    Languages,
    PanelLeft,
    ShieldCheck,
    ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    db,
    getAllCVs,
    getArchivedCVs,
    getCVByEmail,
    deleteCVByEmail,
    toggleArchive,
    togglePin,
    renameCV,
    downloadCVJson,
    parseCVJson,
    cvTitle,
    type CVData,
} from "@/lib/db";
import { generateSlug, cn } from "@/lib/utils";
import { fill, rich, useI18n } from "@/lib/i18n";
import { SHORTCUTS, useShortcut } from "@/lib/shortcuts";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { LogoMark, Wordmark } from "@/components/Illustrations";
import { Mascot } from "@/components/Mascot";
import { SearchPalette, type PaletteAction } from "@/components/SearchPalette";

interface SidebarProps {
    currentEmail?: string;
    onSelectCV?: (email: string) => void;
    onImported?: (email: string) => void;
    refreshTrigger?: number;
    isCollapsed?: boolean;
    onToggleSidebar?: () => void;
}

const menuItem = "w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-left hover:bg-secondary transition-colors";

/** Show/hide sidebar toggle: a window with its side panel drawn full height
 *  while the sidebar is open, shrunk to a short bar while it is hidden. */
function SidebarIcon({ open, className }: { open: boolean; className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <rect x="2.75" y="4" width="18.5" height="16" rx="4" />
            {open ? <path d="M10 4v16" /> : <path d="M7.25 9v6" />}
        </svg>
    );
}

const toggleButton =
    "w-8 h-8 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors";

const byPinnedAt = (a: CVData, b: CVData) =>
    new Date(b.pinnedAt ?? 0).getTime() - new Date(a.pinnedAt ?? 0).getTime();

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
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

function RenameModal({ cv, onSave, onClose }: { cv: CVData; onSave: (label: string) => void; onClose: () => void }) {
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

export default function Sidebar({
    currentEmail,
    onSelectCV,
    onImported,
    refreshTrigger,
    isCollapsed = false,
    onToggleSidebar,
}: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, lang, setLang } = useI18n();
    const s = t.sidebar;
    const [cvs, setCvs] = useState<CVData[]>([]);
    const [loading, setLoading] = useState(true);
    const [archivedCvs, setArchivedCvs] = useState<CVData[]>([]);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CVData | null>(null);
    const [renameTarget, setRenameTarget] = useState<CVData | null>(null);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);
    const [pendingImport, setPendingImport] = useState<CVData | null>(null);
    const [toast, setToast] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(timer);
    }, [toast]);

    // setState in the .then callback, not the effect body: the effect only kicks off the IndexedDB read.
    const loadData = () =>
        Promise.all([getAllCVs(false), getArchivedCVs()]).then(([active, archived]) => {
            setCvs(active);
            setArchivedCvs(archived);
            setLoading(false);
        });

    useEffect(() => {
        loadData();
    }, [refreshTrigger]);

    useEffect(() => {
        const handleClickOutside = () => {
            setOpenDropdown(null);
        };
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const handleSelect = (email: string) => {
        onSelectCV?.(email);
        navigate(`/create?email=${encodeURIComponent(email)}`);
        setIsMobileOpen(false);
    };

    const handleDelete = async (email: string) => {
        await deleteCVByEmail(email);
        setDeleteTarget(null);
        await loadData();
        if (currentEmail === email) {
            // Clear the open form too, or auto-save would write the deleted CV back.
            onSelectCV?.("");
            navigate("/create");
        }
    };

    const handleArchive = async (email: string) => {
        await toggleArchive(email);
        await loadData();
    };

    const handleTogglePin = async (cv: CVData) => {
        await togglePin(cv.email);
        await loadData();
    };

    const handleRename = async (label: string) => {
        if (!renameTarget) return;
        await renameCV(renameTarget.email, label);
        setRenameTarget(null);
        await loadData();
    };

    const openInNewTab = (cv: CVData) => {
        window.open(`/create?email=${encodeURIComponent(cv.email)}`, "_blank", "noopener");
    };

    const openPreview = (cv: CVData) => {
        navigate(`/cv/${generateSlug(cv.email)}`);
        setIsMobileOpen(false);
    };

    const handleExport = (cv: CVData) => {
        downloadCVJson(cv);
        setToast({ type: "success", message: fill(s.toastExported, { name: cv.fullName }) });
    };

    const importCV = async (cv: CVData) => {
        try {
            await db.cvs.put(cv);
            setShowArchived(false);
            await loadData();
            handleSelect(cv.email);
            onImported?.(cv.email);
            setToast({ type: "success", message: fill(s.toastImported, { name: cv.fullName }) });
        } catch (err) {
            console.error("Import failed:", err);
            setToast({ type: "error", message: s.toastImportFailed });
        } finally {
            setPendingImport(null);
        }
    };

    const handleImportFile = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow picking the same file again
        if (!file) return;
        setImporting(true);
        try {
            const cv = parseCVJson(await file.text());
            if (await getCVByEmail(cv.email)) setPendingImport(cv);
            else await importCV(cv);
        } catch (err) {
            const code = err instanceof Error ? err.message : "";
            setToast({
                type: "error",
                message: code in s.importErrors ? s.importErrors[code as keyof typeof s.importErrors] : s.importErrors.generic,
            });
        } finally {
            setImporting(false);
        }
    };

    const handleNewCV = () => {
        navigate("/create");
        onSelectCV?.("");
        setIsMobileOpen(false);
    };

    const pickImportFile = () => fileInputRef.current?.click();

    // The rail collapses on desktop; on phones the same shortcut opens and closes the drawer.
    const toggleSidebar = () => {
        if (window.matchMedia("(min-width: 1024px)").matches) onToggleSidebar?.();
        else setIsMobileOpen((open) => !open);
    };

    // Off while a confirm/rename dialog is up; on inside the palette, which lists them.
    const keys = { enabled: !deleteTarget && !renameTarget && !pendingImport, inDialogs: true };
    useShortcut(SHORTCUTS.search, () => setPaletteOpen((open) => !open), keys);
    useShortcut(SHORTCUTS.newCV, () => { setPaletteOpen(false); handleNewCV(); }, keys);
    useShortcut(SHORTCUTS.importCV, () => { setPaletteOpen(false); pickImportFile(); }, keys);
    useShortcut(SHORTCUTS.toggleSidebar, toggleSidebar, keys);
    useShortcut(SHORTCUTS.home, () => { setPaletteOpen(false); navigate("/"); }, keys);

    const hints = t.search.hints;
    const paletteActions: PaletteAction[] = [
        { id: "new", label: s.newCV, hint: hints.newCV, icon: Plus, tone: "marigold", shortcut: SHORTCUTS.newCV, run: handleNewCV },
        { id: "import", label: s.importTitle, hint: hints.importCV, icon: Upload, tone: "sky", shortcut: SHORTCUTS.importCV, run: pickImportFile },
        {
            id: "sidebar",
            label: isCollapsed ? s.expand : s.collapse,
            hint: isCollapsed ? hints.showSidebar : hints.hideSidebar,
            icon: PanelLeft,
            tone: "sage",
            shortcut: SHORTCUTS.toggleSidebar,
            run: toggleSidebar,
        },
        { id: "language", label: t.search.switchLanguage, hint: hints.language, icon: Languages, tone: "coral", run: () => setLang(lang === "en" ? "id" : "en") },
        { id: "home", label: s.goHome, hint: hints.home, icon: House, tone: "cream", shortcut: SHORTCUTS.home, run: () => navigate("/") },
        { id: "privacy", label: t.common.privacy, hint: hints.privacy, icon: ShieldCheck, tone: "cream", run: () => navigate("/privacy") },
        { id: "terms", label: t.common.terms, hint: hints.terms, icon: ScrollText, tone: "cream", run: () => navigate("/terms") },
    ];

    const displayCvs = showArchived ? archivedCvs : cvs;
    const pinnedCvs = showArchived ? [] : displayCvs.filter((cv) => cv.isPinned).sort(byPinnedAt);
    const otherCvs = showArchived ? displayCvs : displayCvs.filter((cv) => !cv.isPinned);
    const sectioned = pinnedCvs.length > 0;
    // Tooltips sit beside the narrow rail, under the buttons when the sidebar is open.
    const tipSide = isCollapsed ? "right" : "bottom";

    const renderMenu = (cv: CVData) => (
        <div className="absolute right-0 mt-1 w-52 bg-card border-2 border-forest rounded-2xl shadow-stamp z-50 p-1.5 origin-top-right animate-[tooltip-in_0.14s_cubic-bezier(0.16,1,0.3,1)]">
            <button
                className={cn(menuItem, "text-foreground")}
                onClick={(e) => {
                    e.stopPropagation();
                    setRenameTarget(cv);
                    setOpenDropdown(null);
                }}
            >
                <Pencil className="w-4 h-4 text-primary/70" aria-hidden="true" />
                {s.rename}
            </button>
            <button
                className={cn(menuItem, "text-foreground")}
                onClick={(e) => {
                    e.stopPropagation();
                    openInNewTab(cv);
                    setOpenDropdown(null);
                }}
            >
                <ExternalLink className="w-4 h-4 text-primary/70" aria-hidden="true" />
                {s.openNewTab}
            </button>
            {!cv.isArchived && (
                <button
                    className={cn(menuItem, "text-foreground")}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(cv);
                        setOpenDropdown(null);
                    }}
                >
                    {cv.isPinned ? (
                        <PinOff className="w-4 h-4 text-primary/70" aria-hidden="true" />
                    ) : (
                        <Pin className="w-4 h-4 text-primary/70" aria-hidden="true" />
                    )}
                    {cv.isPinned ? s.unpin : s.pin}
                </button>
            )}
            <button
                className={cn(menuItem, "text-foreground")}
                onClick={(e) => {
                    e.stopPropagation();
                    openPreview(cv);
                    setOpenDropdown(null);
                }}
            >
                <Eye className="w-4 h-4 text-primary/70" aria-hidden="true" />
                {s.preview}
            </button>
            <button
                className={cn(menuItem, "text-foreground")}
                onClick={(e) => {
                    e.stopPropagation();
                    handleExport(cv);
                    setOpenDropdown(null);
                }}
            >
                <Download className="w-4 h-4 text-info/70" aria-hidden="true" />
                {s.exportJson}
            </button>
            <button
                className={cn(menuItem, "text-foreground")}
                onClick={(e) => {
                    e.stopPropagation();
                    handleArchive(cv.email);
                    setOpenDropdown(null);
                }}
            >
                {cv.isArchived ? (
                    <>
                        <ArchiveRestore className="w-4 h-4 text-warning/70" aria-hidden="true" />
                        {s.unarchive}
                    </>
                ) : (
                    <>
                        <Archive className="w-4 h-4 text-warning/70" aria-hidden="true" />
                        {s.archive}
                    </>
                )}
            </button>
            <div className="my-1 h-px bg-forest/15" role="separator" />
            <button
                className={cn(menuItem, "text-destructive hover:bg-destructive/10")}
                onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(cv);
                    setOpenDropdown(null);
                }}
            >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                {s.delete}
            </button>
        </div>
    );

    const tab = (archived: boolean, label: string, count: number) => (
        <button
            onClick={() => setShowArchived(archived)}
            aria-pressed={showArchived === archived}
            className={cn(
                "flex-1 text-xs py-1.5 px-2 rounded-full font-bold transition-colors",
                showArchived === archived
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
            )}
        >
            {label}
            <span className="ml-1 inline-flex min-w-5 h-5 px-1.5 items-center justify-center rounded-full bg-marigold text-forest text-[10px] tabular-nums">
                {count}
            </span>
        </button>
    );

    const sectionLabel = (label: string) =>
        !isCollapsed && (
            <p className="px-2.5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        );

    const renderItem = (cv: CVData) => {
        const isActive = currentEmail === cv.email && location.pathname === "/create";
        const title = cvTitle(cv);
        const menuOpen = openDropdown === cv.email;
        // Room for the hover buttons: pin + menu on active CVs, menu only in the archive.
        const actionRoom = cv.isArchived
            ? "pr-8 lg:pr-0 lg:group-hover:pr-8 lg:group-focus-within:pr-8"
            : "pr-16 lg:pr-0 lg:group-hover:pr-16 lg:group-focus-within:pr-16";
        return (
            <div
                key={cv.email}
                className={cn(
                    "group relative rounded-2xl transition-all duration-150",
                    // The hover buttons sit in a transformed box (its own stacking context),
                    // so lift the whole row while its menu is open or later rows cover it.
                    menuOpen && "z-30",
                    isActive
                        ? "bg-secondary border-2 border-forest"
                        : "hover:bg-secondary/60 border-2 border-transparent",
                )}
            >
                <Tooltip label={title} side="right" disabled={!isCollapsed}>
                    <button
                        type="button"
                        className={cn(
                            "w-full flex items-center gap-2.5 p-2.5 text-left rounded-[14px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold",
                            isCollapsed && "justify-center p-2",
                        )}
                        onClick={() => handleSelect(cv.email)}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={isCollapsed ? title : undefined}
                    >
                        {/* Avatar */}
                        <span
                            className={cn(
                                "shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-display text-sm font-bold border-2",
                                isActive
                                    ? "bg-marigold text-forest border-forest"
                                    : "bg-card text-forest border-forest/30",
                            )}
                            aria-hidden="true"
                        >
                            {cv.fullName.charAt(0).toUpperCase()}
                        </span>

                        {!isCollapsed && (
                            <span className={cn("flex-1 min-w-0", actionRoom, menuOpen && "lg:pr-16")}>
                                <span className={cn("block text-sm font-bold truncate", isActive ? "text-primary" : "text-foreground")}>
                                    {title}
                                </span>
                                <span className="block text-[10px] text-muted-foreground truncate">{cv.email}</span>
                            </span>
                        )}
                    </button>
                </Tooltip>

                {/* Pin + three-dot menu: always visible on touch screens, on hover for desktop */}
                {!isCollapsed && (
                    <div
                        className={cn(
                            "absolute right-1.5 top-1/2 -translate-y-1/2 flex lg:hidden lg:group-hover:flex lg:group-focus-within:flex items-center gap-0.5",
                            menuOpen && "lg:flex",
                        )}
                    >
                        {!cv.isArchived && (
                            <Tooltip label={cv.isPinned ? s.unpin : s.pin}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTogglePin(cv);
                                    }}
                                    className="p-1.5 rounded-full hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={`${cv.isPinned ? s.unpin : s.pin}: ${title}`}
                                    aria-pressed={!!cv.isPinned}
                                >
                                    <Pin className={cn("w-4 h-4", cv.isPinned && "fill-current text-foreground")} />
                                </button>
                            </Tooltip>
                        )}
                        <div className="relative">
                            <Tooltip label={s.moreOptions} disabled={menuOpen}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenDropdown(menuOpen ? null : cv.email);
                                    }}
                                    className="p-1.5 rounded-full hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={`${s.moreOptions}: ${title}`}
                                    aria-expanded={menuOpen}
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </Tooltip>
                            {menuOpen && renderMenu(cv)}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={cn("border-b border-forest/15", isCollapsed ? "py-4" : "p-4")}>
                <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
                    <Tooltip
                        label={isCollapsed ? s.expand : s.goHome}
                        shortcut={isCollapsed ? SHORTCUTS.toggleSidebar : SHORTCUTS.home}
                        side={tipSide}
                        align={isCollapsed ? "center" : "start"}
                    >
                        <button
                            type="button"
                            className={cn(
                                "group flex items-center gap-2.5 cursor-pointer relative text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold",
                                isCollapsed && "justify-center w-9 h-9",
                            )}
                            onClick={() => {
                                if (isCollapsed) {
                                    onToggleSidebar?.();
                                } else {
                                    navigate("/");
                                }
                            }}
                            aria-label={isCollapsed ? s.expand : `${t.common.brand} — ${s.goHome}`}
                        >
                            <span className="w-9 h-9 flex items-center justify-center shrink-0 relative">
                                <LogoMark
                                    className={cn(
                                        "w-9 h-9 transition-opacity",
                                        isCollapsed && "group-hover:opacity-0 group-focus-visible:opacity-0",
                                    )}
                                />
                                {isCollapsed && (
                                    <span className="absolute inset-0 rounded-[10px] bg-forest flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                                        <SidebarIcon open={false} className="w-5 h-5 text-cream" />
                                    </span>
                                )}
                            </span>
                            {!isCollapsed && <Wordmark className="text-[13px]" />}
                        </button>
                    </Tooltip>
                    <div className="flex items-center gap-0.5">
                        {!isCollapsed && (
                            <Tooltip label={s.search} shortcut={SHORTCUTS.search}>
                                <button onClick={() => setPaletteOpen(true)} aria-label={s.search} className={cn(toggleButton, "flex")}>
                                    <Search className="w-[18px] h-[18px]" />
                                </button>
                            </Tooltip>
                        )}
                        {/* Hide button - desktop only */}
                        {!isCollapsed && (
                            <Tooltip label={s.collapse} shortcut={SHORTCUTS.toggleSidebar}>
                                <button
                                    onClick={() => onToggleSidebar?.()}
                                    aria-label={s.collapse}
                                    className={cn(toggleButton, "hidden lg:flex")}
                                >
                                    <SidebarIcon open className="w-5 h-5" />
                                </button>
                            </Tooltip>
                        )}
                        {/* Close button - mobile only */}
                        <Tooltip label={s.closeMenu} shortcut={SHORTCUTS.toggleSidebar}>
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                aria-label={s.closeMenu}
                                className={cn(toggleButton, "flex lg:hidden")}
                            >
                                <SidebarIcon open className="w-5 h-5" />
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* New CV + Import (+ Search on the narrow rail) */}
            <div className={cn("p-3 flex gap-2", isCollapsed && "flex-col")}>
                <Tooltip label={s.newCV} shortcut={SHORTCUTS.newCV} side={tipSide}>
                    <Button
                        size={isCollapsed ? "icon" : "sm"}
                        className={cn("flex-1", isCollapsed && "w-8 h-8 flex-none")}
                        onClick={handleNewCV}
                        aria-label={s.newCV}
                    >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        {!isCollapsed && <span className="ml-1">{s.newCV}</span>}
                    </Button>
                </Tooltip>
                <Tooltip label={s.importTitle} shortcut={SHORTCUTS.importCV} side={tipSide}>
                    <Button
                        variant="outline"
                        size={isCollapsed ? "icon" : "sm"}
                        className={cn(isCollapsed && "w-8 h-8")}
                        onClick={pickImportFile}
                        disabled={importing}
                        aria-label={s.importTitle}
                    >
                        {importing ? (
                            <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" />
                        ) : (
                            <Upload className="w-4 h-4" aria-hidden="true" />
                        )}
                        {!isCollapsed && <span>{importing ? s.importing : s.import}</span>}
                    </Button>
                </Tooltip>
                {isCollapsed && (
                    <Tooltip label={s.search} shortcut={SHORTCUTS.search} side="right">
                        <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => setPaletteOpen(true)} aria-label={s.search}>
                            <Search className="w-4 h-4" aria-hidden="true" />
                        </Button>
                    </Tooltip>
                )}
            </div>

            {/* Tabs: Active / Archived */}
            {!isCollapsed && (
                <div className="px-3 flex gap-1">
                    {tab(false, s.active, cvs.length)}
                    {tab(true, s.archived, archivedCvs.length)}
                </div>
            )}

            {/* CV List */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5" aria-busy={loading}>
                {loading && (
                    <div aria-label={s.loading}>
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                aria-hidden="true"
                                className={cn("flex items-center gap-2.5 p-2.5", isCollapsed && "justify-center p-2")}
                            >
                                <Skeleton className="w-8 h-8 shrink-0" />
                                {!isCollapsed && (
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-3 w-3/4" />
                                        <Skeleton className="h-2 w-1/2" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {!loading && displayCvs.length === 0 && !isCollapsed && (
                    <div className="text-center py-8 px-4">
                        {showArchived ? (
                            <span className="w-12 h-12 mx-auto mb-3 rounded-full bg-secondary border border-forest/30 flex items-center justify-center" aria-hidden="true">
                                <Archive className="w-5 h-5" strokeWidth={1.75} />
                            </span>
                        ) : (
                            <Mascot who="arya" pose="idle" className="w-24 mx-auto mb-3" />
                        )}
                        <p className="text-sm font-bold">{showArchived ? s.emptyArchived : s.emptyActive}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {showArchived ? s.emptyArchivedHint : s.emptyActiveHint}
                        </p>
                    </div>
                )}
                {sectioned && sectionLabel(s.pinnedSection)}
                {pinnedCvs.map(renderItem)}
                {sectioned &&
                    (isCollapsed ? (
                        <div className="mx-2 my-1.5 h-px bg-forest/15" role="separator" />
                    ) : (
                        sectionLabel(s.deviceSection)
                    ))}
                {otherCvs.map(renderItem)}
            </div>
        </div>
    );

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleImportFile}
            />

            <SearchPalette
                open={paletteOpen}
                onOpenChange={setPaletteOpen}
                active={cvs}
                archived={archivedCvs}
                currentEmail={currentEmail}
                actions={paletteActions}
                onOpen={(cv) => handleSelect(cv.email)}
                onOpenNewTab={openInNewTab}
                onPreview={openPreview}
                onRename={setRenameTarget}
                onDelete={setDeleteTarget}
                onTogglePin={handleTogglePin}
            />

            {renameTarget && <RenameModal cv={renameTarget} onSave={handleRename} onClose={() => setRenameTarget(null)} />}

            {deleteTarget && (
                <Modal title={s.deleteTitle} onClose={() => setDeleteTarget(null)}>
                    <p className="text-sm text-muted-foreground mb-6">
                        {rich(s.deleteBody, {
                            name: <span className="font-bold text-foreground">{cvTitle(deleteTarget)}</span>,
                        })}
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                            {t.common.cancel}
                        </Button>
                        <Button variant="destructive" onClick={() => handleDelete(deleteTarget.email)}>
                            {t.common.delete}
                        </Button>
                    </div>
                </Modal>
            )}

            {pendingImport && (
                <Modal title={s.replaceTitle} onClose={() => setPendingImport(null)}>
                    <p className="text-sm text-muted-foreground mb-6">
                        {rich(s.replaceBody, {
                            email: <span className="font-bold text-foreground break-all">{pendingImport.email}</span>,
                            name: <span className="font-bold text-foreground">{pendingImport.fullName}</span>,
                        })}
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={() => setPendingImport(null)}>
                            {t.common.cancel}
                        </Button>
                        <Button variant="destructive" onClick={() => importCV(pendingImport)}>
                            {t.common.replace}
                        </Button>
                    </div>
                </Modal>
            )}

            {/* Toast */}
            {toast && (
                <div
                    role={toast.type === "error" ? "alert" : "status"}
                    className={cn(
                        "fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-sm z-[110] flex items-center gap-2.5 px-5 py-3 rounded-full text-sm font-bold animate-slide-up",
                        toast.type === "success"
                            ? "bg-forest text-cream"
                            : "bg-destructive text-destructive-foreground",
                    )}
                >
                    {toast.type === "success" ? (
                        <CircleCheck className="w-4 h-4 text-marigold shrink-0" aria-hidden="true" />
                    ) : (
                        <CircleAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
                    )}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Mobile hamburger */}
            <Tooltip label={s.openMenu} shortcut={SHORTCUTS.toggleSidebar}>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    aria-label={s.openMenu}
                    className="fixed top-3 left-3 z-[60] lg:hidden w-9 h-9 rounded-full bg-card border-2 border-forest flex items-center justify-center text-foreground hover:bg-muted/50 transition-colors"
                >
                    <SidebarIcon open={false} className="w-[18px] h-[18px]" />
                </button>
            </Tooltip>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-forest/50 backdrop-blur-sm z-[70] lg:hidden animate-fade-in"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <div
                inert={!isMobileOpen}
                className={cn(
                    "fixed top-0 left-0 h-full w-72 z-[80] bg-card border-r border-foreground transition-transform duration-300 lg:hidden",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                {sidebarContent}
            </div>

            {/* Desktop sidebar */}
            <div
                className={cn(
                    "hidden lg:flex flex-col h-screen sticky top-0 border-r border-forest/20 bg-card transition-all duration-300 shrink-0",
                    isCollapsed ? "w-[56px]" : "w-64",
                )}
            >
                {sidebarContent}
            </div>
        </>
    );
}
