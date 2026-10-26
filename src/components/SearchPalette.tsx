// Search palette: the dark sticker panel opened from the sidebar (⌘K / Ctrl K).
// One list of actions and CVs, a preview of the highlighted row when maximized,
// and keyboard control throughout: ↑↓ to move, ↵ to open, ⌘↵ for a new tab,
// ⇧⌘E to rename, ⇧⌘D to delete, esc to close.
import * as Dialog from "@radix-ui/react-dialog";
import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
    Search,
    X,
    Maximize2,
    Minimize2,
    ExternalLink,
    Pencil,
    Trash2,
    Pin,
    Eye,
    Mail,
    Phone,
    MapPin,
    type LucideIcon,
} from "lucide-react";
import { cvTitle, type CVData } from "@/lib/db";
import { fill, useI18n } from "@/lib/i18n";
import { SHORTCUTS, matches, shortcutKeys, type Shortcut } from "@/lib/shortcuts";
import { Kbd, ShortcutKeys } from "@/components/ui/kbd";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type PaletteAction = {
    id: string;
    label: string;
    hint: string;
    icon: LucideIcon;
    tone: keyof typeof TONES;
    shortcut?: Shortcut;
    run: () => void;
};

type Row = { id: string; kind: "action"; action: PaletteAction } | { id: string; kind: "cv"; cv: CVData };
type Section = { title: string; rows: Row[] };

interface SearchPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    active: CVData[];
    archived: CVData[];
    currentEmail?: string;
    actions: PaletteAction[];
    onOpen: (cv: CVData) => void;
    onOpenNewTab: (cv: CVData) => void;
    onPreview: (cv: CVData) => void;
    onRename: (cv: CVData) => void;
    onDelete: (cv: CVData) => void;
    onTogglePin: (cv: CVData) => void;
}

const TONES = {
    marigold: "bg-marigold",
    sky: "bg-sky",
    sage: "bg-sage",
    coral: "bg-coral",
    cream: "bg-cream",
};

// Hard offset shadow for the icon tiles, dark enough to read on forest.
const TILE = "grid place-items-center border-2 border-forest-deep text-forest-deep shadow-[2px_2px_0_0_rgb(0_0_0/0.5)] shrink-0";

const EXPANDED_KEY = "cv-search-expanded";
const DAY = 864e5;

function readExpanded(): boolean {
    try {
        return localStorage.getItem(EXPANDED_KEY) !== "0";
    } catch {
        return true;
    }
}

function saveExpanded(value: boolean) {
    try {
        localStorage.setItem(EXPANDED_KEY, value ? "1" : "0");
    } catch {
        // storage blocked: the choice just won't stick
    }
}

const norm = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const haystack = (cv: CVData) =>
    norm(
        [cvTitle(cv), cv.fullName, cv.email, cv.occupation ?? "", cv.city, ...cv.skills, ...cv.workExperiences.map((w) => w.company)].join(" "),
    );

const time = (d: Date) => new Date(d).getTime();

/** "4 days ago" / "4 hari yang lalu", in the interface language. */
function ago(date: Date, lang: string, now: number): string {
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
    const seconds = (time(date) - now) / 1000;
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ["year", 31536000],
        ["month", 2592000],
        ["week", 604800],
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60],
    ];
    for (const [unit, size] of units) {
        if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
    }
    return rtf.format(0, "second");
}

export function SearchPalette(props: SearchPaletteProps) {
    return (
        <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[90] bg-forest-deep/55 backdrop-blur-[2px] animate-fade-in" />
                <div className="fixed inset-0 z-[91] flex items-start justify-center px-3 sm:px-6 pt-[6svh] sm:pt-[9svh] pointer-events-none">
                    {/* Mounted only while open, so every opening starts with an empty query. */}
                    <PaletteBody {...props} />
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function PaletteBody({
    onOpenChange,
    active,
    archived,
    currentEmail,
    actions,
    onOpen,
    onOpenNewTab,
    onPreview,
    onRename,
    onDelete,
    onTogglePin,
}: SearchPaletteProps) {
    const { t, lang } = useI18n();
    const s = t.search;
    const sb = t.sidebar;
    const uid = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState<"active" | "archived">("active");
    const [selected, setSelected] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(readExpanded);
    // One clock reading per opening keeps the date groups and "x days ago" consistent.
    const [now] = useState(() => Date.now());

    const sections = useMemo<Section[]>(() => {
        const terms = norm(query).split(/\s+/).filter(Boolean);
        const hit = (text: string) => terms.every((term) => text.includes(term));
        const cvRow = (cv: CVData): Row => ({ id: `cv:${cv.email}`, kind: "cv", cv });
        const out: Section[] = [];
        const byAge = (cvs: CVData[]) => {
            const groups: [string, CVData[]][] = [[s.last7, []], [s.last30, []], [s.older, []]];
            for (const cv of [...cvs].sort((a, b) => time(b.updatedAt) - time(a.updatedAt))) {
                const days = (now - time(cv.updatedAt)) / DAY;
                groups[days <= 7 ? 0 : days <= 30 ? 1 : 2][1].push(cv);
            }
            for (const [title, list] of groups) if (list.length) out.push({ title, rows: list.map(cvRow) });
        };

        if (tab === "archived") {
            byAge(archived.filter((cv) => hit(haystack(cv))));
            return out;
        }
        const acts = actions.filter((a) => hit(norm(`${a.label} ${a.hint}`)));
        if (acts.length) out.push({ title: s.actions, rows: acts.map((a) => ({ id: `action:${a.id}`, kind: "action", action: a })) });
        const matching = active.filter((cv) => hit(haystack(cv)));
        const pinned = matching
            .filter((cv) => cv.isPinned)
            .sort((a, b) => time(b.pinnedAt ?? b.updatedAt) - time(a.pinnedAt ?? a.updatedAt));
        if (pinned.length) out.push({ title: s.pinned, rows: pinned.map(cvRow) });
        byAge(matching.filter((cv) => !cv.isPinned));
        return out;
    }, [query, tab, active, archived, actions, s, now]);

    const rows = sections.flatMap((section) => section.rows);
    const current = rows.find((row) => row.id === selected) ?? rows[0];
    const optionId = (row: Row) => `${uid}-${row.id}`;

    const close = () => onOpenChange(false);

    const activate = (row: Row) => {
        close();
        if (row.kind === "action") row.action.run();
        else onOpen(row.cv);
    };

    const move = (step: number) => {
        if (!rows.length) return;
        const index = current ? rows.indexOf(current) : -1;
        const next = rows[(index + step + rows.length) % rows.length];
        setSelected(next.id);
        requestAnimationFrame(() => document.getElementById(optionId(next))?.scrollIntoView({ block: "nearest" }));
    };

    const onKeyDown = (e: KeyboardEvent) => {
        // Buttons inside the panel keep their own Enter/Space behaviour.
        if (e.nativeEvent.isComposing || e.target instanceof HTMLButtonElement) return;
        if (matches(e, SHORTCUTS.down) || matches(e, SHORTCUTS.up)) {
            e.preventDefault();
            move(matches(e, SHORTCUTS.down) ? 1 : -1);
            return;
        }
        if (!current) return;
        const cv = current.kind === "cv" ? current.cv : null;
        if (cv && matches(e, SHORTCUTS.openNewTab)) {
            e.preventDefault();
            onOpenNewTab(cv);
        } else if (matches(e, SHORTCUTS.open)) {
            e.preventDefault();
            activate(current);
        } else if (cv && matches(e, SHORTCUTS.rename)) {
            e.preventDefault();
            onRename(cv);
        } else if (cv && matches(e, SHORTCUTS.remove)) {
            e.preventDefault();
            onDelete(cv);
        }
    };

    const toggleExpanded = () => {
        setExpanded((value) => {
            saveExpanded(!value);
            return !value;
        });
        inputRef.current?.focus();
    };

    const tabs = (
        <div role="tablist" aria-label={s.dialog} className="flex shrink-0 rounded-full bg-cream/[0.08] p-1">
            {(["active", "archived"] as const).map((key) => {
                const count = key === "active" ? active.length : archived.length;
                return (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={tab === key}
                        onClick={() => {
                            setTab(key);
                            setSelected(null);
                            inputRef.current?.focus();
                        }}
                        className={cn(
                            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-colors cursor-pointer",
                            tab === key ? "bg-cream text-forest-deep" : "text-cream/70 hover:text-cream",
                        )}
                    >
                        {key === "active" ? sb.active : sb.archived}
                        <span className="tabular-nums text-xs opacity-70">{count}</span>
                    </button>
                );
            })}
        </div>
    );

    const rowActions = (cv: CVData) => (
        <span className="hidden desk:flex items-center gap-0.5 -my-1">
            {!cv.isArchived && (
                <RowButton label={cv.isPinned ? sb.unpin : sb.pin} onClick={() => onTogglePin(cv)} pressed={!!cv.isPinned}>
                    <Pin className={cn("w-4 h-4", cv.isPinned && "fill-current")} />
                </RowButton>
            )}
            <RowButton label={sb.openNewTab} shortcut={SHORTCUTS.openNewTab} onClick={() => onOpenNewTab(cv)}>
                <ExternalLink className="w-4 h-4" />
            </RowButton>
            <RowButton label={sb.rename} shortcut={SHORTCUTS.rename} onClick={() => onRename(cv)}>
                <Pencil className="w-4 h-4" />
            </RowButton>
            <RowButton label={sb.delete} shortcut={SHORTCUTS.remove} onClick={() => onDelete(cv)}>
                <Trash2 className="w-4 h-4" />
            </RowButton>
        </span>
    );

    const renderRow = (row: Row) => {
        const isSelected = current?.id === row.id;
        const cv = row.kind === "cv" ? row.cv : null;
        const Icon = row.kind === "action" ? row.action.icon : null;
        return (
            <div
                key={row.id}
                id={optionId(row)}
                role="option"
                aria-selected={isSelected}
                // Mouse only: on touch, a tap opens the row straight away, no highlight.
                onPointerMove={(e) => e.pointerType === "mouse" && !isSelected && setSelected(row.id)}
                onClick={() => activate(row)}
                className={cn(
                    "flex items-center gap-3 min-h-12 rounded-2xl px-3 py-2 cursor-pointer transition-colors",
                    isSelected ? "desk:bg-cream/10 desk:shadow-[inset_0_0_0_2px_var(--color-marigold)]" : "desk:hover:bg-cream/5",
                )}
            >
                {row.kind === "action" && Icon ? (
                    <span className={cn(TILE, "w-8 h-8 rounded-[10px]", TONES[row.action.tone])}>
                        <Icon className="w-4 h-4" strokeWidth={2.25} aria-hidden="true" />
                    </span>
                ) : cv ? (
                    <span
                        className={cn(
                            "grid place-items-center w-8 h-8 rounded-full border-2 font-display text-sm font-bold shrink-0",
                            cv.email === currentEmail ? "bg-marigold text-forest-deep border-forest-deep" : "bg-cream/10 text-cream border-cream/35",
                        )}
                        aria-hidden="true"
                    >
                        {cv.fullName.charAt(0).toUpperCase()}
                    </span>
                ) : null}
                <span className="flex-1 min-w-0 truncate text-[15px] font-bold">
                    {row.kind === "action" ? row.action.label : cvTitle(row.cv)}
                </span>
                {row.kind === "action" ? (
                    row.action.shortcut && <ShortcutKeys shortcut={row.action.shortcut} className="text-cream/60 text-[15px]" />
                ) : cv && isSelected ? (
                    <>
                        {rowActions(cv)}
                        <span className="desk:hidden text-xs text-cream/55 whitespace-nowrap">{ago(cv.updatedAt, lang, now)}</span>
                    </>
                ) : cv ? (
                    <span className="text-xs text-cream/55 whitespace-nowrap">{ago(cv.updatedAt, lang, now)}</span>
                ) : null}
            </div>
        );
    };

    return (
        <Dialog.Content
            aria-describedby={undefined}
            onKeyDown={onKeyDown}
            className={cn(
                "palette on-dark pointer-events-auto flex flex-col w-full max-h-[86svh] rounded-[26px] border-2 border-cream/80 bg-forest-deep text-cream shadow-stamp-marigold overflow-hidden",
                expanded ? "max-w-[720px] md:max-w-[1040px] md:h-[min(660px,82svh)]" : "max-w-[720px]",
            )}
        >
            <Dialog.Title className="sr-only">{s.dialog}</Dialog.Title>

            {/* Search field */}
            <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 border-b border-cream/[0.12]">
                <span className={cn(TILE, "w-11 h-11 rounded-xl bg-marigold")} aria-hidden="true">
                    <Search className="w-5 h-5" strokeWidth={2.5} />
                </span>
                <input
                    ref={inputRef}
                    role="combobox"
                    aria-expanded="true"
                    aria-controls={`${uid}-list`}
                    aria-autocomplete="list"
                    aria-activedescendant={current ? optionId(current) : undefined}
                    aria-label={s.placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setSelected(null);
                    }}
                    placeholder={s.placeholder}
                    className="flex-1 min-w-0 bg-transparent font-display text-lg sm:text-2xl tracking-tight text-cream placeholder:text-cream/45 outline-none"
                    spellCheck={false}
                    autoComplete="off"
                />
                <div className="hidden sm:block">{tabs}</div>
                <Dialog.Close
                    className="shrink-0 rounded-lg p-1 text-cream/70 hover:text-cream cursor-pointer"
                    aria-label={s.close}
                    aria-keyshortcuts="Escape"
                >
                    <Kbd className="text-[13px] px-2">{shortcutKeys(SHORTCUTS.close)[0]}</Kbd>
                    {/* No Esc key on a phone: a plain close icon instead */}
                    <X className="hotkey-alt w-6 h-6" aria-hidden="true" />
                </Dialog.Close>
            </div>
            <div className="sm:hidden px-4 pt-3">{tabs}</div>

            {/* Results, and the preview beside them when maximized */}
            <div
                className={cn(
                    "flex-1 min-h-0 flex",
                    expanded && "md:grid md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:grid-rows-[minmax(0,1fr)]",
                )}
            >
                <div
                    id={`${uid}-list`}
                    role="listbox"
                    aria-label={s.dialog}
                    className={cn(
                        "flex-1 min-w-0 overflow-y-auto overscroll-contain px-2.5 sm:px-3 py-3",
                        expanded ? "max-h-[min(460px,58svh)] md:max-h-none md:border-r md:border-cream/[0.12]" : "max-h-[min(460px,58svh)]",
                    )}
                >
                    {sections.map((section) => (
                        <div key={section.title} role="group" aria-label={section.title} className="mb-3 last:mb-0">
                            <p className="px-3 pt-1 pb-1.5 text-xs font-bold text-cream/55" aria-hidden="true">
                                {section.title}
                            </p>
                            {section.rows.map(renderRow)}
                        </div>
                    ))}
                    {rows.length === 0 && (
                        <div className="px-4 py-12 text-center">
                            <p className="font-bold">
                                {query ? fill(s.empty, { q: query }) : tab === "archived" ? sb.emptyArchived : sb.emptyActive}
                            </p>
                            <p className="mt-1 text-sm text-cream/60">{query ? s.emptyHint : tab === "archived" ? sb.emptyArchivedHint : sb.emptyActiveHint}</p>
                        </div>
                    )}
                </div>

                {expanded && (
                    <div className="hidden md:block min-w-0 min-h-0 overflow-y-auto p-6 lg:p-7">
                        {current?.kind === "cv" && (
                            <CVPreviewPane
                                cv={current.cv}
                                now={now}
                                isCurrent={current.cv.email === currentEmail}
                                onOpen={() => activate(current)}
                                onPreview={() => {
                                    close();
                                    onPreview(current.cv);
                                }}
                            />
                        )}
                        {current?.kind === "action" && <ActionPreview action={current.action} />}
                    </div>
                )}
            </div>

            {/* Footer: size toggle, key hints, actions for the highlighted row. Not in phone
                mode, where a tap on a row simply opens it. */}
            <div className="hidden desk:flex items-center gap-3 px-3 sm:px-5 py-2.5 border-t border-cream/[0.12] text-xs text-cream/60">
                <Tooltip label={expanded ? s.minimize : s.maximize} side="top">
                    <button
                        type="button"
                        onClick={toggleExpanded}
                        aria-label={expanded ? s.minimize : s.maximize}
                        aria-pressed={expanded}
                        className="hidden md:grid place-items-center w-8 h-8 rounded-lg text-cream/80 hover:text-cream hover:bg-cream/10 cursor-pointer"
                    >
                        {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </Tooltip>
                <span className="hotkey hidden sm:flex items-center gap-1.5" aria-hidden="true">
                    <ShortcutKeys shortcut={SHORTCUTS.up} className="text-sm" />
                    <ShortcutKeys shortcut={SHORTCUTS.down} className="text-sm" />
                    {s.select}
                </span>
                <span className="hotkey hidden lg:flex items-center gap-1.5" aria-hidden="true">
                    <ShortcutKeys shortcut={SHORTCUTS.close} className="text-sm" />
                    {s.close}
                </span>
                <div className="ml-auto flex items-center gap-1">
                    {current?.kind === "cv" ? (
                        <>
                            <FooterAction label={s.open} shortcut={SHORTCUTS.open} onClick={() => activate(current)} />
                            <FooterAction label={sb.rename} shortcut={SHORTCUTS.rename} onClick={() => onRename(current.cv)} />
                            <FooterAction label={sb.delete} shortcut={SHORTCUTS.remove} onClick={() => onDelete(current.cv)} />
                        </>
                    ) : current?.kind === "action" ? (
                        <FooterAction label={s.run} shortcut={SHORTCUTS.open} onClick={() => activate(current)} />
                    ) : null}
                    <span className="hidden md:inline pl-2 tabular-nums">{fill(s.items, { n: rows.length })}</span>
                </div>
            </div>
        </Dialog.Content>
    );
}

function RowButton({
    label,
    shortcut,
    pressed,
    onClick,
    children,
}: {
    label: string;
    shortcut?: Shortcut;
    pressed?: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <Tooltip label={label} shortcut={shortcut} side="top">
            <button
                type="button"
                aria-label={label}
                aria-pressed={pressed}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className="grid place-items-center w-8 h-8 rounded-lg text-cream/75 hover:text-cream hover:bg-cream/10 cursor-pointer"
            >
                {children}
            </button>
        </Tooltip>
    );
}

function FooterAction({ label, shortcut, onClick }: { label: string; shortcut: Shortcut; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-bold text-cream/85 hover:text-cream hover:bg-cream/10 cursor-pointer"
        >
            {label}
            <ShortcutKeys shortcut={shortcut} className="text-sm text-cream/60" />
        </button>
    );
}

function ActionPreview({ action }: { action: PaletteAction }) {
    const Icon = action.icon;
    return (
        <div className="h-full flex flex-col items-start justify-center gap-4 pb-6">
            <span className={cn(TILE, "w-16 h-16 rounded-2xl shadow-[4px_4px_0_0_rgb(0_0_0/0.5)]", TONES[action.tone])}>
                <Icon className="w-7 h-7" strokeWidth={2.25} aria-hidden="true" />
            </span>
            <h2 className="h-display text-[34px]">{action.label}</h2>
            <p className="text-[15px] text-cream/70 max-w-[38ch]">{action.hint}</p>
            {action.shortcut && <ShortcutKeys shortcut={action.shortcut} className="text-base text-cream/80" />}
        </div>
    );
}

function CVPreviewPane({
    cv,
    now,
    isCurrent,
    onOpen,
    onPreview,
}: {
    cv: CVData;
    now: number;
    isCurrent: boolean;
    onOpen: () => void;
    onPreview: () => void;
}) {
    const { t, lang } = useI18n();
    const s = t.search;
    const sb = t.sidebar;
    const jobs = cv.workExperiences.filter((w) => w.company.trim());
    const empty = !cv.about && !cv.skills.length && !jobs.length;
    const contact = [
        { icon: Mail, text: cv.email },
        { icon: Phone, text: cv.phone },
        { icon: MapPin, text: cv.city },
    ].filter((c) => c.text);

    return (
        <div className="space-y-5">
            <div>
                {(isCurrent || cv.isPinned || cv.isArchived) && (
                    <p className="flex flex-wrap items-center gap-1.5 mb-2.5 text-[11px] font-bold">
                        {isCurrent && <span className="rounded-full bg-marigold text-forest-deep px-2.5 py-0.5">{s.current}</span>}
                        {cv.isPinned && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-cream/30 px-2.5 py-0.5">
                                <Pin className="w-3 h-3 fill-current" aria-hidden="true" /> {s.pinned}
                            </span>
                        )}
                        {cv.isArchived && <span className="rounded-full border border-cream/30 px-2.5 py-0.5">{sb.archived}</span>}
                    </p>
                )}
                <h2 className="h-display text-[30px] break-words">{cvTitle(cv)}</h2>
                <p className="mt-2 text-sm text-cream/60">
                    {fill(s.updated, { time: ago(cv.updatedAt, lang, now) })} · {fill(s.created, { time: ago(cv.createdAt, lang, now) })}
                </p>
                {cv.label && <p className="mt-1 text-sm text-cream/60">{fill(s.nameOnCV, { name: cv.fullName })}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
                <button
                    type="button"
                    onClick={onOpen}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-marigold text-forest-deep border-2 border-forest-deep font-bold text-sm shadow-[3px_3px_0_0_rgb(0_0_0/0.5)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                >
                    {s.openEditor}
                    <ShortcutKeys shortcut={SHORTCUTS.open} className="text-sm" />
                </button>
                <button
                    type="button"
                    onClick={onPreview}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-full border-2 border-cream/60 text-cream font-bold text-sm hover:bg-cream/10 cursor-pointer"
                >
                    <Eye className="w-4 h-4" aria-hidden="true" />
                    {sb.preview}
                </button>
            </div>

            {/* A small sheet of the CV itself */}
            <article className="on-light rounded-2xl border-2 border-forest-deep bg-card text-forest p-5 shadow-[4px_4px_0_0_rgb(0_0_0/0.4)]">
                <p className="h-display text-xl">{cv.fullName}</p>
                {cv.occupation && <p className="mt-1 text-sm font-bold text-script">{cv.occupation}</p>}
                {contact.length > 0 && (
                    <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {contact.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-1.5 min-w-0">
                                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                                <span className="truncate">{text}</span>
                            </li>
                        ))}
                    </ul>
                )}
                {cv.about && <p className="mt-3 text-sm leading-relaxed line-clamp-4">{cv.about}</p>}
                {cv.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {cv.skills.slice(0, 8).map((skill) => (
                            <span key={skill} className="rounded-full border border-forest/25 bg-secondary px-2 py-0.5 text-[11px] font-bold">
                                {skill}
                            </span>
                        ))}
                        {cv.skills.length > 8 && (
                            <span className="px-1 py-0.5 text-[11px] font-bold text-muted-foreground">
                                {fill(s.moreSkills, { n: cv.skills.length - 8 })}
                            </span>
                        )}
                    </div>
                )}
                {jobs.length > 0 && (
                    <ul className="mt-3.5 space-y-1.5 border-t border-forest/15 pt-3 text-sm">
                        {jobs.slice(0, 3).map((job) => (
                            <li key={job.id} className="flex items-baseline justify-between gap-3">
                                <span className="font-bold truncate">{job.company}</span>
                                {job.startYear && (
                                    <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                                        {job.startYear}–{job.endYear || s.present}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                {empty && <p className="mt-3 text-sm text-muted-foreground">{s.noDetails}</p>}
            </article>

        </div>
    );
}
