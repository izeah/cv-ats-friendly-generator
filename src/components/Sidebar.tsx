import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    db,
    getAllCVs,
    getArchivedCVs,
    getCVByEmail,
    deleteCVByEmail,
    toggleArchive,
    downloadCVJson,
    parseCVJson,
    type CVData,
} from "@/lib/db";
import { generateSlug, cn } from "@/lib/utils";
import { fill, rich, useI18n } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoMark, Wordmark } from "@/components/Illustrations";
import { Mascot } from "@/components/Mascot";

interface SidebarProps {
    currentEmail?: string;
    onSelectCV?: (email: string) => void;
    onImported?: (email: string) => void;
    refreshTrigger?: number;
    isCollapsed?: boolean;
    onToggleSidebar?: () => void;
}

const menuItem =
    "w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-secondary transition-colors border-b border-forest/10 last:border-b-0";

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

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
    return (
        <>
            <div className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-[100] animate-fade-in" onClick={onClose} />
            <div className="fixed inset-0 flex items-center justify-center z-[101] animate-fade-in p-4 pointer-events-none">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={title}
                    className="bg-card border-2 border-forest rounded-card shadow-stamp max-w-sm w-full animate-scale-in pointer-events-auto p-8"
                >
                    <h2 className="h-display text-3xl text-foreground mb-3">{title}</h2>
                    {children}
                </div>
            </div>
        </>
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
    const { t } = useI18n();
    const s = t.sidebar;
    const [cvs, setCvs] = useState<CVData[]>([]);
    const [loading, setLoading] = useState(true);
    const [archivedCvs, setArchivedCvs] = useState<CVData[]>([]);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CVData | null>(null);
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

    const displayCvs = showArchived ? archivedCvs : cvs;

    const renderMenu = (cv: CVData) => (
        <div className="absolute right-0 mt-1 w-44 bg-card border-2 border-forest rounded-2xl shadow-stamp z-50 overflow-hidden animate-fade-in">
            <button
                className={cn(menuItem, "text-foreground")}
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/cv/${generateSlug(cv.email)}`);
                    setIsMobileOpen(false);
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

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={cn("border-b border-forest/15", isCollapsed ? "py-4" : "p-4")}>
                <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
                    <button
                        type="button"
                        className={cn(
                            "group flex items-center gap-2.5 cursor-pointer relative text-left",
                            isCollapsed && "justify-center w-9 h-9",
                        )}
                        onClick={() => {
                            if (isCollapsed) {
                                onToggleSidebar?.();
                            } else {
                                navigate("/");
                            }
                        }}
                        title={isCollapsed ? s.expand : s.goHome}
                        aria-label={isCollapsed ? s.expand : `${t.common.brand} — ${s.goHome}`}
                    >
                        <span className="w-9 h-9 flex items-center justify-center shrink-0 relative">
                            <LogoMark
                                className={cn(
                                    "w-9 h-9 transition-opacity",
                                    isCollapsed && "group-hover:opacity-0",
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
                    {/* Hide button - desktop only */}
                    {!isCollapsed && (
                        <button
                            onClick={() => onToggleSidebar?.()}
                            aria-label={s.collapse}
                            title={s.collapse}
                            className={cn(toggleButton, "hidden lg:flex")}
                        >
                            <SidebarIcon open className="w-5 h-5" />
                        </button>
                    )}
                    {/* Close button - mobile only */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        aria-label={s.closeMenu}
                        title={s.closeMenu}
                        className={cn(toggleButton, "flex lg:hidden")}
                    >
                        <SidebarIcon open className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* New CV + Import buttons */}
            <div className={cn("p-3 flex gap-2", isCollapsed && "flex-col")}>
                <Button
                    size={isCollapsed ? "icon" : "sm"}
                    className={cn("flex-1", isCollapsed && "w-8 h-8 flex-none")}
                    onClick={handleNewCV}
                    aria-label={s.newCV}
                >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    {!isCollapsed && <span className="ml-1">{s.newCV}</span>}
                </Button>
                <Button
                    variant="outline"
                    size={isCollapsed ? "icon" : "sm"}
                    className={cn(isCollapsed && "w-8 h-8")}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                    title={s.importTitle}
                    aria-label={s.importTitle}
                >
                    {importing ? (
                        <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : (
                        <Upload className="w-4 h-4" aria-hidden="true" />
                    )}
                    {!isCollapsed && <span>{importing ? s.importing : s.import}</span>}
                </Button>
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
                {displayCvs.map((cv) => {
                    const isActive =
                        currentEmail === cv.email &&
                        location.pathname === "/create";
                    return (
                        <div
                            key={cv.email}
                            className={cn(
                                "group relative rounded-2xl transition-all duration-150 cursor-pointer",
                                isActive
                                    ? "bg-secondary border-2 border-forest"
                                    : "hover:bg-secondary/60 border-2 border-transparent",
                            )}
                        >
                            <div
                                className={cn(
                                    "flex items-center gap-2.5 p-2.5",
                                    isCollapsed && "justify-center p-2",
                                )}
                                onClick={() => handleSelect(cv.email)}
                                title={isCollapsed ? cv.fullName : undefined}
                            >
                                {/* Avatar */}
                                <div
                                    className={cn(
                                        "shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-display text-sm font-bold border-2",
                                        isActive
                                            ? "bg-marigold text-forest border-forest"
                                            : "bg-card text-forest border-forest/30",
                                    )}
                                    aria-hidden="true"
                                >
                                    {cv.fullName.charAt(0).toUpperCase()}
                                </div>

                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0 pr-6">
                                        <p className={cn("text-sm font-bold truncate", isActive ? "text-primary" : "text-foreground")}>
                                            {cv.fullName}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground truncate">{cv.email}</p>
                                    </div>
                                )}
                            </div>

                            {/* Three-dot menu: always visible on touch screens, on hover for desktop */}
                            {!isCollapsed && (
                                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex lg:hidden lg:group-hover:flex lg:group-focus-within:flex items-center">
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenDropdown(openDropdown === cv.email ? null : cv.email);
                                            }}
                                            className="p-1.5 rounded-full hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                                            title={s.moreOptions}
                                            aria-label={`${s.moreOptions}: ${cv.fullName}`}
                                            aria-expanded={openDropdown === cv.email}
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        {openDropdown === cv.email && renderMenu(cv)}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
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

            {deleteTarget && (
                <Modal title={s.deleteTitle} onClose={() => setDeleteTarget(null)}>
                    <p className="text-sm text-muted-foreground mb-6">
                        {rich(s.deleteBody, {
                            name: <span className="font-bold text-foreground">{deleteTarget.fullName}</span>,
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
            <button
                onClick={() => setIsMobileOpen(true)}
                aria-label={s.openMenu}
                title={s.openMenu}
                className="fixed top-3 left-3 z-[60] lg:hidden w-9 h-9 rounded-full bg-card border-2 border-forest flex items-center justify-center text-foreground hover:bg-muted/50 transition-colors"
            >
                <SidebarIcon open={false} className="w-[18px] h-[18px]" />
            </button>

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
