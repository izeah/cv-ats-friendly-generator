import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Plus,
    ChevronRight,
    Trash2,
    Archive,
    ArchiveRestore,
    Menu,
    X,
    Eye,
    ChevronLeft,
    MoreVertical,
    Download,
    Upload,
    CircleCheck,
    CircleAlert,
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
import { Skeleton } from "@/components/ui/skeleton";
import { LogoMark, Wordmark, SmallCactus } from "@/components/Illustrations";

interface SidebarProps {
    currentEmail?: string;
    onSelectCV?: (email: string) => void;
    onImported?: (email: string) => void;
    refreshTrigger?: number;
    isCollapsed?: boolean;
    onToggleSidebar?: () => void;
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
    const [cvs, setCvs] = useState<CVData[]>([]);
    const [loading, setLoading] = useState(true);
    const [archivedCvs, setArchivedCvs] = useState<CVData[]>([]);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [deleteConfirmEmail, setDeleteConfirmEmail] = useState<string | null>(
        null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    const loadData = async () => {
        const [active, archived] = await Promise.all([
            getAllCVs(false),
            getArchivedCVs(),
        ]);
        setCvs(active);
        setArchivedCvs(archived);
        setLoading(false);
    };

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

    const handlePreview = (email: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/cv/${generateSlug(email)}`);
        setIsMobileOpen(false);
    };

    const handleDelete = async (email: string) => {
        await deleteCVByEmail(email);
        setDeleteConfirmEmail(null);
        setOpenDropdown(null);
        await loadData();
        if (currentEmail === email) {
            navigate("/create");
        }
    };

    const handleArchive = async (email: string) => {
        await toggleArchive(email);
        await loadData();
    };

    const handleExport = (cv: CVData) => {
        downloadCVJson(cv);
        setToast({ type: "success", message: `Exported ${cv.fullName}` });
    };

    const importCV = async (cv: CVData) => {
        try {
            await db.cvs.put(cv);
            setShowArchived(false);
            await loadData();
            handleSelect(cv.email);
            onImported?.(cv.email);
            setToast({ type: "success", message: `Imported ${cv.fullName}` });
        } catch (err) {
            console.error("Import failed:", err);
            setToast({ type: "error", message: "Failed to save imported CV." });
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
        try {
            const cv = parseCVJson(await file.text());
            if (await getCVByEmail(cv.email)) setPendingImport(cv);
            else await importCV(cv);
        } catch (err) {
            setToast({
                type: "error",
                message: err instanceof Error ? err.message : "Import failed.",
            });
        }
    };

    const handleNewCV = () => {
        navigate("/create");
        onSelectCV?.("");
        setIsMobileOpen(false);
    };

    const displayCvs = showArchived ? archivedCvs : cvs;

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-forest/15">
                <div className="flex items-center justify-between">
                    <div
                        className={cn(
                            "group flex items-center gap-2.5 cursor-pointer relative",
                            isCollapsed && "justify-center w-9 h-9",
                        )}
                        onClick={() => {
                            if (isCollapsed) {
                                onToggleSidebar?.();
                            } else {
                                navigate("/");
                            }
                        }}
                        title={isCollapsed ? "Expand sidebar" : "Go to home"}
                    >
                        <div className="w-9 h-9 flex items-center justify-center shrink-0 relative">
                            <LogoMark
                                className={cn(
                                    "w-9 h-9 transition-opacity",
                                    isCollapsed && "group-hover:opacity-0",
                                )}
                            />
                            {isCollapsed && (
                                <span className="absolute inset-0 rounded-[10px] bg-forest flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-4 h-4 text-cream" />
                                </span>
                            )}
                        </div>
                        {!isCollapsed && (
                            <h1>
                                <Wordmark className="text-[13px]" />
                            </h1>
                        )}
                    </div>
                    {/* Collapse button - desktop only */}
                    <button
                        onClick={() => onToggleSidebar?.()}
                        className="hidden lg:flex w-6 h-6 rounded items-center justify-center hover:bg-muted/50 text-muted-foreground transition-colors"
                    >
                        {!isCollapsed && (
                            <ChevronLeft className="w-3.5 h-3.5" />
                        )}
                    </button>
                    {/* Close button - mobile only */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden flex w-6 h-6 rounded items-center justify-center hover:bg-muted/50 text-muted-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* New CV + Import buttons */}
            <div className={cn("p-3 flex gap-2", isCollapsed && "flex-col")}>
                <Button
                   
                    size={isCollapsed ? "icon" : "sm"}
                    className={cn("flex-1", isCollapsed && "w-8 h-8 flex-none")}
                    onClick={handleNewCV}
                >
                    <Plus className="w-4 h-4" />
                    {!isCollapsed && <span className="ml-1">New CV</span>}
                </Button>
                <Button
                    variant="outline"
                    size={isCollapsed ? "icon" : "sm"}
                    className={cn(isCollapsed && "w-8 h-8")}
                    onClick={() => fileInputRef.current?.click()}
                    title="Import CV from JSON"
                >
                    <Upload className="w-4 h-4" />
                    {!isCollapsed && <span>Import</span>}
                </Button>
            </div>

            {/* Tabs: Active / Archived */}
            {!isCollapsed && (
                <div className="px-3 flex gap-1">
                    <button
                        onClick={() => setShowArchived(false)}
                        className={cn(
                            "flex-1 text-xs py-1.5 px-2 rounded-full font-bold transition-colors",
                            !showArchived
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                        )}
                    >
                        Active 
                        <span className="ml-1 inline-flex min-w-5 h-5 px-1.5 items-center justify-center rounded-full bg-marigold text-forest text-[10px] tabular-nums">
                            {cvs.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setShowArchived(true)}
                        className={cn(
                            "flex-1 text-xs py-1.5 px-2 rounded-full font-bold transition-colors",
                            showArchived
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                        )}
                    >
                        Archived 
                        <span className="ml-1 inline-flex min-w-5 h-5 px-1.5 items-center justify-center rounded-full bg-marigold text-forest text-[10px] tabular-nums">
                            {archivedCvs.length}
                        </span>
                    </button>
                </div>
            )}

            {/* CV List */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
                {loading &&
                    [0, 1, 2].map((i) => (
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
                {!loading && displayCvs.length === 0 && (
                    <div className="text-center py-8 px-3">
                        {!isCollapsed && (
                            <>
                                <SmallCactus className="w-14 mx-auto mb-3 text-forest origin-bottom animate-sway" />
                                <p className="text-xs font-bold text-muted-foreground">
                                    {showArchived
                                        ? "No archived CVs"
                                        : "No CVs yet. Create one!"}
                                </p>
                            </>
                        )}
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
                                    ? "bg-secondary border border-foreground"
                                    : "hover:bg-secondary/60 border border-transparent",
                            )}
                        >
                            <div
                                className={cn(
                                    "flex items-center gap-2.5 p-2.5",
                                    isCollapsed && "justify-center p-2",
                                )}
                                onClick={() => handleSelect(cv.email)}
                            >
                                {/* Avatar */}
                                <div
                                    className={cn(
                                        "shrink-0 rounded-full flex items-center justify-center font-display text-sm font-bold border",
                                        isActive
                                            ? "w-8 h-8 bg-marigold text-forest border-foreground"
                                            : "w-8 h-8 bg-card text-forest border-forest/30",
                                    )}
                                >
                                    {cv.fullName.charAt(0).toUpperCase()}
                                </div>

                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={cn(
                                                "text-sm font-bold truncate",
                                                isActive
                                                    ? "text-primary"
                                                    : "text-foreground",
                                            )}
                                        >
                                            {cv.fullName}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            {cv.email}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Actions - Three-dot menu */}
                            {!isCollapsed && (
                                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 hidden lg:group-hover:flex lg:hidden md:flex items-center">
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenDropdown(
                                                    openDropdown === cv.email
                                                        ? null
                                                        : cv.email,
                                                );
                                            }}
                                            className="p-1.5 rounded-full hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                                            title="More options"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {/* Dropdown menu */}
                                        {openDropdown === cv.email && (
                                            <div className="absolute right-0 mt-1 w-44 bg-card border border-foreground rounded-2xl shadow-stamp z-50 overflow-hidden animate-fade-in">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePreview(
                                                            cv.email,
                                                            e,
                                                        );
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors border-b border-forest/10 last:border-b-0"
                                                >
                                                    <Eye className="w-4 h-4 text-primary/70" />
                                                    Preview
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleExport(cv);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors border-b border-forest/10 last:border-b-0"
                                                >
                                                    <Download className="w-4 h-4 text-info/70" />
                                                    Export JSON
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleArchive(cv.email);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors border-b border-forest/10 last:border-b-0"
                                                >
                                                    {cv.isArchived ? (
                                                        <>
                                                            <ArchiveRestore className="w-4 h-4 text-warning/70" />
                                                            Unarchive
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Archive className="w-4 h-4 text-warning/70" />
                                                            Archive
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirmEmail(
                                                            cv.email,
                                                        );
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors border-b border-forest/10 last:border-b-0"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Mobile actions - Always show on mobile */}
                            {!isCollapsed && (
                                <div className="md:hidden flex lg:hidden items-center absolute right-2.5 top-1/2 -translate-y-1/2">
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenDropdown(
                                                    openDropdown === cv.email
                                                        ? null
                                                        : cv.email,
                                                );
                                            }}
                                            className="p-1.5 rounded-full hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                                            title="More options"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {/* Dropdown menu for mobile */}
                                        {openDropdown === cv.email && (
                                            <div className="absolute right-0 mt-1 w-44 bg-card border border-foreground rounded-2xl shadow-stamp z-50 overflow-hidden animate-fade-in">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePreview(
                                                            cv.email,
                                                            e,
                                                        );
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors border-b border-forest/10 last:border-b-0"
                                                >
                                                    <Eye className="w-4 h-4 text-primary/70" />
                                                    Preview
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleExport(cv);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors border-b border-forest/10 last:border-b-0"
                                                >
                                                    <Download className="w-4 h-4 text-info/70" />
                                                    Export JSON
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleArchive(cv.email);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors border-b border-forest/10 last:border-b-0"
                                                >
                                                    {cv.isArchived ? (
                                                        <>
                                                            <ArchiveRestore className="w-4 h-4 text-warning/70" />
                                                            Unarchive
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Archive className="w-4 h-4 text-warning/70" />
                                                            Archive
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirmEmail(
                                                            cv.email,
                                                        );
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors border-b border-forest/10 last:border-b-0"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Delete Confirmation Modal - Portalled to body */}
                            {deleteConfirmEmail === cv.email &&
                                createPortal(
                                    <>
                                        {/* Modal backdrop */}
                                        <div
                                            className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-[100] animate-fade-in"
                                            onClick={() =>
                                                setDeleteConfirmEmail(null)
                                            }
                                        />
                                        {/* Modal */}
                                        <div className="fixed inset-0 flex items-center justify-center z-[101] animate-fade-in p-4">
                                            <div className="bg-card border border-foreground rounded-card shadow-stamp max-w-sm w-full animate-scale-in">
                                                <div className="p-8">
                                                    <h2 className="font-display text-3xl font-bold uppercase leading-none text-foreground mb-3">
                                                        Delete CV
                                                    </h2>
                                                    <p className="text-sm text-muted-foreground mb-6">
                                                        Are you sure you want to
                                                        delete{" "}
                                                        <span className="font-medium text-foreground">
                                                            {cv.fullName}
                                                        </span>
                                                        ? This action cannot be
                                                        undone.
                                                    </p>
                                                    <div className="flex gap-3 justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() =>
                                                                setDeleteConfirmEmail(
                                                                    null,
                                                                )
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    cv.email,
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>,
                                    document.body,
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

            {/* Import conflict modal */}
            {pendingImport && (
                <>
                    <div
                        className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-[100] animate-fade-in"
                        onClick={() => setPendingImport(null)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-[101] animate-fade-in p-4 pointer-events-none">
                        <div className="bg-card border border-foreground rounded-card shadow-stamp max-w-sm w-full animate-scale-in pointer-events-auto">
                            <div className="p-8">
                                <h2 className="font-display text-3xl font-bold uppercase leading-none text-foreground mb-3">
                                    Replace existing CV?
                                </h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    A CV for{" "}
                                    <span className="font-medium text-foreground break-all">
                                        {pendingImport.email}
                                    </span>{" "}
                                    already exists. Importing will overwrite it
                                    with{" "}
                                    <span className="font-medium text-foreground">
                                        {pendingImport.fullName}
                                    </span>{" "}
                                    from the file. This action cannot be undone.
                                </p>
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setPendingImport(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => importCV(pendingImport)}
                                    >
                                        Replace
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Toast */}
            {toast && (
                <div
                    role="status"
                    className={cn(
                        "fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-sm z-[110] flex items-center gap-2.5 px-5 py-3 rounded-full text-sm font-bold animate-slide-up",
                        toast.type === "success"
                            ? "bg-forest text-cream"
                            : "bg-destructive text-destructive-foreground",
                    )}
                >
                    {toast.type === "success" ? (
                        <CircleCheck className="w-4 h-4 text-marigold shrink-0" />
                    ) : (
                        <CircleAlert className="w-4 h-4 shrink-0" />
                    )}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Mobile hamburger */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="fixed top-3 left-3 z-[60] lg:hidden w-9 h-9 rounded-full bg-card border border-foreground flex items-center justify-center text-foreground hover:bg-muted/50 transition-colors"
            >
                <Menu className="w-4 h-4" />
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
