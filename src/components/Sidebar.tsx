import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Sparkles,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    getAllCVs,
    getArchivedCVs,
    deleteCVByEmail,
    toggleArchive,
    type CVData,
} from "@/lib/db";
import { generateSlug, cn } from "@/lib/utils";

interface SidebarProps {
    currentEmail?: string;
    onSelectCV?: (email: string) => void;
    refreshTrigger?: number;
    isCollapsed?: boolean;
    onToggleSidebar?: () => void;
}

export default function Sidebar({
    currentEmail,
    onSelectCV,
    refreshTrigger,
    isCollapsed = false,
    onToggleSidebar,
}: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [cvs, setCvs] = useState<CVData[]>([]);
    const [archivedCvs, setArchivedCvs] = useState<CVData[]>([]);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [deleteConfirmEmail, setDeleteConfirmEmail] = useState<string | null>(
        null,
    );

    const loadData = async () => {
        const active = await getAllCVs(false);
        setCvs(active);
        const archived = await getArchivedCVs();
        setArchivedCvs(archived);
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

    const handleNewCV = () => {
        navigate("/create");
        onSelectCV?.("");
        setIsMobileOpen(false);
    };

    const displayCvs = showArchived ? archivedCvs : cvs;

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-border/40">
                <div className="flex items-center justify-between">
                    <div
                        className={cn(
                            "group flex items-center gap-2.5 cursor-pointer relative",
                            isCollapsed && "justify-center w-8 h-8",
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
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 relative">
                            <Sparkles
                                className={cn(
                                    "w-4 h-4 text-white transition-opacity",
                                    isCollapsed && "group-hover:opacity-0",
                                )}
                            />
                            {isCollapsed && (
                                <ChevronRight className="absolute w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </div>
                        {!isCollapsed && (
                            <div>
                                <h1 className="text-sm font-bold tracking-tight">
                                    CV Forge
                                </h1>
                                <p className="text-[9px] text-muted-foreground -mt-0.5">
                                    ATS-Friendly
                                </p>
                            </div>
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

            {/* New CV button */}
            <div className="p-3">
                <Button
                    variant="gradient"
                    size={isCollapsed ? "icon" : "sm"}
                    className={cn("w-full", isCollapsed && "w-8 h-8")}
                    onClick={handleNewCV}
                >
                    <Plus className="w-4 h-4" />
                    {!isCollapsed && <span className="ml-1">New CV</span>}
                </Button>
            </div>

            {/* Tabs: Active / Archived */}
            {!isCollapsed && (
                <div className="px-3 flex gap-1">
                    <button
                        onClick={() => setShowArchived(false)}
                        className={cn(
                            "flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors",
                            !showArchived
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                        )}
                    >
                        Active ({cvs.length})
                    </button>
                    <button
                        onClick={() => setShowArchived(true)}
                        className={cn(
                            "flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors",
                            showArchived
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                        )}
                    >
                        Archived ({archivedCvs.length})
                    </button>
                </div>
            )}

            {/* CV List */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
                {displayCvs.length === 0 && (
                    <div className="text-center py-8 px-3">
                        {!isCollapsed && (
                            <p className="text-xs text-muted-foreground">
                                {showArchived
                                    ? "No archived CVs"
                                    : "No CVs yet. Create one!"}
                            </p>
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
                                "group relative rounded-lg transition-all duration-150 cursor-pointer",
                                isActive
                                    ? "bg-primary/10 border border-primary/20"
                                    : "hover:bg-muted/40 border border-transparent",
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
                                        "shrink-0 rounded-md flex items-center justify-center text-xs font-bold border",
                                        isActive
                                            ? "w-8 h-8 bg-primary/20 text-primary border-primary/30"
                                            : "w-8 h-8 bg-muted/50 text-muted-foreground border-border/40",
                                    )}
                                >
                                    {cv.fullName.charAt(0).toUpperCase()}
                                </div>

                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={cn(
                                                "text-sm font-medium truncate",
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
                                            className="p-1.5 rounded hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                                            title="More options"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {/* Dropdown menu */}
                                        {openDropdown === cv.email && (
                                            <div className="absolute right-0 mt-1 w-40 bg-card border border-border/60 rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePreview(
                                                            cv.email,
                                                            e,
                                                        );
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors border-b border-border/20 last:border-b-0"
                                                >
                                                    <Eye className="w-4 h-4 text-primary/70" />
                                                    Preview
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleArchive(cv.email);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors border-b border-border/20 last:border-b-0"
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
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors border-b border-border/20 last:border-b-0"
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
                                            className="p-1.5 rounded hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                                            title="More options"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {/* Dropdown menu for mobile */}
                                        {openDropdown === cv.email && (
                                            <div className="absolute right-0 mt-1 w-40 bg-card border border-border/60 rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePreview(
                                                            cv.email,
                                                            e,
                                                        );
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors border-b border-border/20 last:border-b-0"
                                                >
                                                    <Eye className="w-4 h-4 text-primary/70" />
                                                    Preview
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleArchive(cv.email);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors border-b border-border/20 last:border-b-0"
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
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors border-b border-border/20 last:border-b-0"
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
                                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-fade-in"
                                            onClick={() =>
                                                setDeleteConfirmEmail(null)
                                            }
                                        />
                                        {/* Modal */}
                                        <div className="fixed inset-0 flex items-center justify-center z-[101] animate-fade-in p-4">
                                            <div className="bg-card border border-border/60 rounded-lg shadow-lg max-w-sm w-full animate-scale-in">
                                                <div className="p-6">
                                                    <h2 className="text-lg font-semibold text-foreground mb-2">
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
            {/* Mobile hamburger */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="fixed top-3 left-3 z-[60] lg:hidden w-9 h-9 rounded-lg glass border border-border/40 flex items-center justify-center text-foreground hover:bg-muted/50 transition-colors"
            >
                <Menu className="w-4 h-4" />
            </button>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden animate-fade-in"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <div
                className={cn(
                    "fixed top-0 left-0 h-full w-72 z-[80] bg-card border-r border-border/40 transition-transform duration-300 lg:hidden",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                {sidebarContent}
            </div>

            {/* Desktop sidebar */}
            <div
                className={cn(
                    "hidden lg:flex flex-col h-screen sticky top-0 border-r border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 shrink-0",
                    isCollapsed ? "w-[56px]" : "w-64",
                )}
            >
                {sidebarContent}
            </div>
        </>
    );
}
