import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Code2,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    FolderKanban,
    Calendar,
    Sparkles,
    Save,
    Eye,
    FileText,
    Type,
    CircleAlert,
    CircleCheck,
    LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Sidebar from "@/components/Sidebar";
import { LanguageSwitcher } from "@/components/Language";
import {
    saveCVData,
    getCVByEmail,
    type CVData,
    type WorkExperience,
    type Project,
} from "@/lib/db";
import { cn, generateSlug, monthName } from "@/lib/utils";
import { fill, useI18n, usePageMeta } from "@/lib/i18n";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) =>
    (CURRENT_YEAR - i).toString(),
);

const SELECT_CLASS =
    "h-11 w-full rounded-full border border-foreground/35 bg-input px-3 py-2 text-sm font-medium text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-foreground/25 focus:border-foreground cursor-pointer aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/20";

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/** True only when both ends are filled in and the end comes before the start. */
function endBeforeStart(r: Pick<Project, "startMonth" | "startYear" | "endMonth" | "endYear">) {
    if (!r.startMonth || !r.startYear || !r.endMonth || !r.endYear) return false;
    return Number(r.endYear) * 12 + Number(r.endMonth) < Number(r.startYear) * 12 + Number(r.startMonth);
}

function createEmptyProject(): Project {
    return {
        id: uuidv4(),
        title: "",
        description: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        technologies: [],
    };
}

function createEmptyExperience(): WorkExperience {
    return {
        id: uuidv4(),
        company: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        description: "",
        projects: [createEmptyProject()],
    };
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
    return (
        <p id={id} className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-destructive">
            <CircleAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {children}
        </p>
    );
}

type DateField = "startMonth" | "startYear" | "endMonth" | "endYear";

/** Start/end month + year selects with an inline "end before start" error. */
function DateRange({
    idPrefix,
    value,
    onChange,
    endHint,
    small,
}: {
    idPrefix: string;
    value: Record<DateField, string>;
    onChange: (field: DateField, v: string) => void;
    endHint: string;
    small?: boolean;
}) {
    const { t, lang } = useI18n();
    const f = t.form;
    const invalid = endBeforeStart(value);
    const errorId = `${idPrefix}-date-error`;
    const label = small ? "text-xs" : "flex items-center gap-1.5";

    const pair = (which: "start" | "end") => (
        <div className="grid grid-cols-2 gap-2 mt-1.5">
            <select
                id={`${idPrefix}-${which}Month`}
                aria-label={`${which === "start" ? f.startDate : f.endDate} — ${f.month}`}
                value={value[`${which}Month`]}
                onChange={(e) => onChange(`${which}Month`, e.target.value)}
                className={SELECT_CLASS}
                aria-invalid={which === "end" && invalid}
                aria-describedby={which === "end" && invalid ? errorId : undefined}
            >
                <option value="">{f.month}</option>
                {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={String(i + 1)}>
                        {monthName(i + 1, lang, "long")}
                    </option>
                ))}
            </select>
            <select
                aria-label={`${which === "start" ? f.startDate : f.endDate} — ${f.year}`}
                value={value[`${which}Year`]}
                onChange={(e) => onChange(`${which}Year`, e.target.value)}
                className={SELECT_CLASS}
                aria-invalid={which === "end" && invalid}
                aria-describedby={which === "end" && invalid ? errorId : undefined}
            >
                <option value="">{f.year}</option>
                {YEARS.map((y) => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <div className={cn("grid gap-4", small ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
            <div>
                <Label className={label}>
                    {!small && <Calendar className="w-3.5 h-3.5" aria-hidden="true" />} {f.startDate}
                </Label>
                {pair("start")}
            </div>
            <div>
                <Label className={label}>
                    {!small && <Calendar className="w-3.5 h-3.5" aria-hidden="true" />} {f.endDate}{" "}
                    <span className="text-muted-foreground text-xs font-medium">{endHint}</span>
                </Label>
                {pair("end")}
                {invalid && <FieldError id={errorId}>{f.errors.endBeforeStart}</FieldError>}
            </div>
        </div>
    );
}

/** Removable tag list with an empty-state hint. */
function TagList({ tags, onRemove, empty, large }: { tags: string[]; onRemove: (tag: string) => void; empty: string; large?: boolean }) {
    const { t } = useI18n();
    if (tags.length === 0) {
        return (
            <p className="mt-3 rounded-2xl border border-dashed border-forest/30 px-4 py-3 text-xs sm:text-sm text-muted-foreground">
                {empty}
            </p>
        );
    }
    return (
        <div className={cn("flex flex-wrap mt-2", large ? "gap-2 mt-3" : "gap-1.5")}>
            {tags.map((tag) => (
                <Badge key={tag} variant="default" className={cn("p-0 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors", large && "text-sm")}>
                    <button
                        type="button"
                        onClick={() => onRemove(tag)}
                        className={cn("flex items-center gap-1 cursor-pointer", large ? "px-3 py-1" : "px-3 py-0.5")}
                        aria-label={fill(t.form.removeTag, { name: tag })}
                    >
                        {large && <Code2 className="w-3 h-3" aria-hidden="true" />}
                        {tag} <span aria-hidden="true">×</span>
                    </button>
                </Badge>
            ))}
        </div>
    );
}

/** Splits "a, b, c" into new unique tags. */
function addTags(current: string[], input: string): string[] {
    const next = [...current];
    input
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((item) => {
            if (!next.includes(item)) next.push(item);
        });
    return next;
}

// ========================
// ProjectForm Component
// ========================
interface ProjectFormProps {
    project: Project;
    projectIndex: number;
    idPrefix: string;
    onUpdate: (field: keyof Project, value: string | string[]) => void;
    onRemove: () => void;
    canRemove: boolean;
}

function ProjectForm({
    project,
    projectIndex,
    idPrefix,
    onUpdate,
    onRemove,
    canRemove,
}: ProjectFormProps) {
    const { t } = useI18n();
    const f = t.form;
    const [techInput, setTechInput] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);

    const addTech = () => {
        if (!techInput.trim()) return;
        onUpdate("technologies", addTags(project.technologies, techInput));
        setTechInput("");
    };

    return (
        <div className="relative border border-forest/30 rounded-3xl bg-background/50 overflow-hidden animate-scale-in">
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <FolderKanban className="w-4 h-4 text-primary/70 shrink-0" aria-hidden="true" />
                    <span className="text-sm font-bold text-foreground truncate">
                        {project.title || fill(f.projectUntitled, { n: projectIndex + 1 })}
                        {!project.title && project.description && (
                            <span className="text-muted-foreground ml-1">
                                — {project.description.slice(0, 40)}...
                            </span>
                        )}
                    </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {canRemove && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            aria-label={f.removeProject}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    )}
                    {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    ) : (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    )}
                </div>
            </div>

            {!isCollapsed && (
                <div className="p-4 pt-0 space-y-4 animate-slide-down">
                    <div>
                        <Label htmlFor={`${idPrefix}-title`} className="text-xs flex items-center gap-1">
                            <Type className="w-3 h-3" aria-hidden="true" /> {f.projectTitle}
                        </Label>
                        <Input
                            id={`${idPrefix}-title`}
                            value={project.title}
                            onChange={(e) => onUpdate("title", e.target.value)}
                            placeholder={f.placeholders.projectTitle}
                            className="mt-1.5 text-sm"
                        />
                    </div>

                    <div>
                        <Label htmlFor={`${idPrefix}-desc`} className="text-xs">{f.projectDesc}</Label>
                        <Textarea
                            id={`${idPrefix}-desc`}
                            value={project.description}
                            onChange={(e) => onUpdate("description", e.target.value)}
                            placeholder={f.placeholders.projectDesc}
                            className="mt-1.5 text-sm"
                            rows={3}
                        />
                    </div>

                    <DateRange
                        idPrefix={idPrefix}
                        value={project}
                        onChange={(field, v) => onUpdate(field, v)}
                        endHint={f.emptyOngoing}
                        small
                    />

                    <div>
                        <Label htmlFor={`${idPrefix}-tech`} className="text-xs">{f.technologies}</Label>
                        <div className="flex gap-2 mt-1.5">
                            <Input
                                id={`${idPrefix}-tech`}
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === ",") {
                                        e.preventDefault();
                                        addTech();
                                    }
                                }}
                                placeholder={f.placeholders.tech}
                                className="text-sm"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addTech}
                                className="shrink-0 h-11 w-11 px-0"
                                aria-label={f.addTech}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        <TagList
                            tags={project.technologies}
                            onRemove={(tech) => onUpdate("technologies", project.technologies.filter((x) => x !== tech))}
                            empty={f.noTech}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// ========================
// ExperienceForm Component
// ========================
interface ExperienceFormProps {
    experience: WorkExperience;
    expIndex: number;
    onUpdate: (
        expIndex: number,
        field: keyof WorkExperience,
        value: unknown,
    ) => void;
    onRemove: (expIndex: number) => void;
    canRemove: boolean;
}

function ExperienceForm({
    experience,
    expIndex,
    onUpdate,
    onRemove,
    canRemove,
}: ExperienceFormProps) {
    const { t } = useI18n();
    const f = t.form;
    const [isCollapsed, setIsCollapsed] = useState(false);

    const updateProject = (
        projIndex: number,
        field: keyof Project,
        value: string | string[],
    ) => {
        const newProjects = [...experience.projects];
        newProjects[projIndex] = { ...newProjects[projIndex], [field]: value };
        onUpdate(expIndex, "projects", newProjects);
    };

    const addProject = () => {
        onUpdate(expIndex, "projects", [
            ...experience.projects,
            createEmptyProject(),
        ]);
    };

    const removeProject = (projIndex: number) => {
        if (experience.projects.length > 1) {
            onUpdate(
                expIndex,
                "projects",
                experience.projects.filter((_, i) => i !== projIndex),
            );
        }
    };

    const projectCount = experience.projects.length;

    return (
        <Card className="overflow-hidden animate-slide-up">
            <div
                className="flex items-center justify-between p-5 sm:p-7 cursor-pointer hover:bg-secondary/40 transition-colors"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-marigold flex items-center justify-center border border-foreground shrink-0" aria-hidden="true">
                        <Briefcase className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                        <span className="font-display text-xl font-bold uppercase tracking-[-0.02em] leading-tight text-foreground truncate block">
                            {experience.company || fill(f.experienceUntitled, { n: expIndex + 1 })}
                        </span>
                        <p className="text-xs text-muted-foreground">
                            {fill(projectCount > 1 ? f.projectCountPlural : f.projectCount, { n: projectCount })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {canRemove && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            aria-label={f.removeExperience}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(expIndex);
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                    {isCollapsed ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                    ) : (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                    )}
                </div>
            </div>

            {!isCollapsed && (
                <CardContent className="space-y-5 animate-slide-down">
                    <Separator className="bg-forest/15" />

                    <div>
                        <Label htmlFor={`company-${expIndex}`}>{f.company}</Label>
                        <Input
                            id={`company-${expIndex}`}
                            value={experience.company}
                            onChange={(e) => onUpdate(expIndex, "company", e.target.value)}
                            placeholder={f.placeholders.company}
                            className="mt-1.5"
                        />
                    </div>

                    <DateRange
                        idPrefix={`exp-${expIndex}`}
                        value={experience}
                        onChange={(field, v) => onUpdate(expIndex, field, v)}
                        endHint={f.emptyPresent}
                    />

                    <div>
                        <Label htmlFor={`desc-${expIndex}`}>{f.jobDesc}</Label>
                        <Textarea
                            id={`desc-${expIndex}`}
                            value={experience.description}
                            onChange={(e) => onUpdate(expIndex, "description", e.target.value)}
                            placeholder={f.placeholders.jobDesc}
                            className="mt-1.5"
                            rows={3}
                        />
                    </div>

                    <Separator className="bg-forest/15" />

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="flex items-center gap-1.5 text-sm font-bold">
                                <FolderKanban className="w-4 h-4 text-primary/70" aria-hidden="true" /> {f.projectsHandled}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addProject}
                                className="text-xs h-7"
                            >
                                <Plus className="w-3 h-3" aria-hidden="true" /> {f.addProject}
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {experience.projects.map((project, projIndex) => (
                                <ProjectForm
                                    key={project.id}
                                    project={project}
                                    projectIndex={projIndex}
                                    idPrefix={`exp-${expIndex}-proj-${projIndex}`}
                                    onUpdate={(field, value) => updateProject(projIndex, field, value)}
                                    onRemove={() => removeProject(projIndex)}
                                    canRemove={experience.projects.length > 1}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

function FormSkeleton({ label }: { label: string }) {
    return (
        <div className="space-y-6" aria-busy="true" aria-label={label}>
            {[5, 1, 3].map((fields, i) => (
                <div key={i} className="rounded-card border border-forest/20 bg-card p-7 space-y-5">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 shrink-0" />
                        <Skeleton className="h-6 w-48 rounded-xl" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {Array.from({ length: fields }, (_, j) => (
                            <div key={j} className="space-y-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-11 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function SectionIcon({ icon: Icon }: { icon: typeof User }) {
    return (
        <span className="w-10 h-10 rounded-full bg-marigold border border-foreground flex items-center justify-center shrink-0" aria-hidden="true">
            <Icon className="w-4 h-4" strokeWidth={1.75} />
        </span>
    );
}

// ========================
// Main CVForm
// ========================
export default function CVForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t } = useI18n();
    const f = t.form;
    usePageMeta(t.meta.create);
    const [savingMode, setSavingMode] = useState<"save" | "preview" | null>(null);
    const saving = savingMode !== null;
    const [justSaved, setJustSaved] = useState(false);
    const [saveError, setSaveError] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [sidebarRefresh, setSidebarRefresh] = useState(0);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Form state
    const [fullName, setFullName] = useState("");
    const [occupation, setOccupation] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [about, setAbout] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState("");
    const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
        createEmptyExperience(),
    ]);
    // Which ?email= the form currently holds; anything else is still loading.
    const [loadedFor, setLoadedFor] = useState<string | null>(null);

    // Validation: required fields show after the first save attempt; date ranges right away.
    const nameError = !fullName.trim() ? f.errors.nameRequired : null;
    const emailError = !email.trim() ? f.errors.emailRequired : !isValidEmail(email) ? f.errors.emailInvalid : null;
    const dateErrors = workExperiences.reduce(
        (n, exp) => n + (endBeforeStart(exp) ? 1 : 0) + exp.projects.filter(endBeforeStart).length,
        0,
    );
    const errorCount = (nameError ? 1 : 0) + (emailError ? 1 : 0) + dateErrors;
    const showNameError = submitted && !!nameError;
    const showEmailError = submitted && !!emailError;

    const resetForm = () => {
        setFullName("");
        setOccupation("");
        setEmail("");
        setPhone("");
        setCity("");
        setAbout("");
        setSkills([]);
        setSkillInput("");
        setWorkExperiences([createEmptyExperience()]);
        setSubmitted(false);
        setSaveError(false);
    };

    const loadCVData = async (targetEmail: string) => {
        const existing = await getCVByEmail(targetEmail.trim().toLowerCase());
        if (existing) {
            setFullName(existing.fullName);
            setOccupation(existing.occupation || "");
            setEmail(existing.email);
            setPhone(existing.phone);
            setCity(existing.city);
            setAbout(existing.about || "");
            setSkills(existing.skills);
            setWorkExperiences(
                existing.workExperiences.length > 0
                    ? existing.workExperiences
                    : [createEmptyExperience()],
            );
        }
        setLoadedFor(targetEmail);
    };

    // Auto-load from URL param on mount / URL change
    const emailParam = searchParams.get("email");
    const loadingCV = !!emailParam && loadedFor !== emailParam;
    useEffect(() => {
        if (emailParam) {
            loadCVData(emailParam);
        } else {
            resetForm();
        }
    }, [emailParam]);

    const handleSidebarSelect = (selectedEmail: string) => {
        if (!selectedEmail) {
            resetForm();
        }
    };

    const updateExperience = (
        expIndex: number,
        field: keyof WorkExperience,
        value: unknown,
    ) => {
        setWorkExperiences((prev) => {
            const updated = [...prev];
            updated[expIndex] = { ...updated[expIndex], [field]: value };
            return updated;
        });
    };
    const addExperience = () => {
        setWorkExperiences((prev) => [...prev, createEmptyExperience()]);
    };
    const removeExperience = (expIndex: number) => {
        if (workExperiences.length > 1)
            setWorkExperiences((prev) => prev.filter((_, i) => i !== expIndex));
    };

    const addSkill = () => {
        if (!skillInput.trim()) return;
        setSkills((prev) => addTags(prev, skillInput));
        setSkillInput("");
    };

    const buildCV = (): CVData => ({
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        occupation: occupation.trim(),
        phone: phone.trim(),
        city: city.trim(),
        about: about.trim(),
        workExperiences,
        skills,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const handleSave = async (preview: boolean = false) => {
        setSubmitted(true);
        setSaveError(false);
        if (errorCount > 0) {
            // Wait for the error states to render, then take the user to the first one.
            setTimeout(() => {
                const first = document.querySelector<HTMLElement>('main [aria-invalid="true"]');
                first?.focus();
                first?.scrollIntoView({ block: "center", behavior: "smooth" });
            });
            return;
        }
        setSavingMode(preview ? "preview" : "save");
        try {
            const cvData = buildCV();
            await saveCVData(cvData);
            // Short pause so the saving state is visible
            await new Promise((resolve) => setTimeout(resolve, 500));
            setSidebarRefresh((prev) => prev + 1);
            if (preview) {
                navigate(`/cv/${generateSlug(cvData.email)}`);
            } else {
                setJustSaved(true);
                setTimeout(() => setJustSaved(false), 2000);
            }
        } catch (err) {
            console.error("Save failed:", err);
            setSaveError(true);
        } finally {
            setSavingMode(null);
        }
    };

    // Auto-save every 10 seconds once the CV has a name and a valid email
    useEffect(() => {
        const autoSaveInterval = setInterval(async () => {
            if (fullName.trim() && isValidEmail(email)) {
                try {
                    await saveCVData(buildCV());
                } catch (err) {
                    console.error("Auto-save failed:", err);
                }
            }
        }, 10000);

        return () => clearInterval(autoSaveInterval);
    }, [fullName, email, phone, city, about, workExperiences, skills]);

    const saveIcon = savingMode === "save"
        ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
        : justSaved
          ? <CircleCheck className="w-3.5 h-3.5 text-success" aria-hidden="true" />
          : <Save className="w-3.5 h-3.5" aria-hidden="true" />;
    const saveLabel = savingMode === "save" ? f.saving : justSaved ? f.saved : f.save;

    const field = (
        id: "fullName" | "occupation" | "email" | "phone" | "city",
        icon: typeof User,
        value: string,
        setValue: (v: string) => void,
        opts: { type?: string; error?: string | null; required?: boolean } = {},
    ) => {
        const Icon = icon;
        const errorId = `${id}-error`;
        return (
            <div>
                <Label htmlFor={id} className="flex items-center gap-1.5 text-xs">
                    <Icon className="w-3 h-3" aria-hidden="true" /> {f[id]}
                    {opts.required && (
                        <span className="text-destructive" aria-hidden="true">*</span>
                    )}
                    {opts.required && <span className="sr-only">({f.required})</span>}
                </Label>
                <Input
                    id={id}
                    type={opts.type}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={f.placeholders[id]}
                    className="mt-1.5"
                    aria-required={opts.required || undefined}
                    aria-invalid={!!opts.error}
                    aria-describedby={opts.error ? errorId : undefined}
                    autoComplete={id === "fullName" ? "name" : id === "email" ? "email" : id === "phone" ? "tel" : id === "city" ? "address-level2" : "organization-title"}
                />
                {opts.error && <FieldError id={errorId}>{opts.error}</FieldError>}
            </div>
        );
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar
                currentEmail={email}
                onSelectCV={handleSidebarSelect}
                onImported={(importedEmail) => {
                    // Same URL won't re-trigger the load effect, so reload here
                    // before auto-save writes the stale form back over the import.
                    if (importedEmail === email.trim().toLowerCase())
                        loadCVData(importedEmail);
                }}
                refreshTrigger={sidebarRefresh}
                isCollapsed={sidebarCollapsed}
                onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <div className="flex-1 min-w-0">
                {/* Header */}
                <header className="sticky top-0 z-50 glass border-b border-forest/15">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="pl-12 lg:pl-0 min-w-0">
                                <h1 className="font-display text-xl font-bold uppercase leading-none">
                                    {email || loadingCV ? f.editCV : f.newCV}
                                </h1>
                                {email && (
                                    <p className="text-[11px] text-muted-foreground mt-1 truncate">
                                        {email}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <LanguageSwitcher compact />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                aria-label={saveLabel}
                            >
                                {saveIcon} <span className="hidden sm:inline">{saveLabel}</span>
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                aria-label={f.preview}
                            >
                                {savingMode === "preview" ? (
                                    <LoaderCircle className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                                ) : (
                                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                )}
                                <span className="hidden sm:inline">{f.preview}</span>
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 relative z-10">
                    {loadingCV && <FormSkeleton label={f.loading} />}
                    <div className={loadingCV ? "hidden" : "space-y-6"}>
                        {(saveError || (submitted && errorCount > 0)) && (
                            <div role="alert" className="flex items-start gap-3 rounded-3xl border border-destructive bg-destructive/10 px-5 py-4 text-sm font-bold text-destructive">
                                <CircleAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
                                <p>{saveError ? f.errors.saveFailed : fill(f.errors.summary, { n: errorCount })}</p>
                            </div>
                        )}

                        {/* Personal Info */}
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-5">
                                <CardTitle className="flex items-center gap-3">
                                    <SectionIcon icon={User} />
                                    {f.personalTitle}
                                </CardTitle>
                                <CardDescription className="text-xs">{f.personalDesc}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {field("fullName", User, fullName, setFullName, { required: true, error: showNameError ? nameError : null })}
                                    {field("occupation", Briefcase, occupation, setOccupation)}
                                    {field("email", Mail, email, setEmail, { type: "email", required: true, error: showEmailError ? emailError : null })}
                                    {field("phone", Phone, phone, setPhone, { type: "tel" })}
                                    {field("city", MapPin, city, setCity)}
                                </div>
                            </CardContent>
                        </Card>

                        {/* About */}
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-5">
                                <CardTitle className="flex items-center gap-3">
                                    <SectionIcon icon={FileText} />
                                    <label htmlFor="about">{f.aboutTitle}</label>
                                </CardTitle>
                                <CardDescription className="text-xs">{f.aboutDesc}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    id="about"
                                    value={about}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 500)
                                            setAbout(e.target.value);
                                    }}
                                    placeholder={f.placeholders.about}
                                    rows={4}
                                    aria-describedby="about-count"
                                />
                                <p id="about-count" className={cn("text-xs mt-1.5 text-right", about.length >= 480 ? "text-destructive font-bold" : "text-muted-foreground")}>
                                    {about.length}/500
                                </p>
                            </CardContent>
                        </Card>

                        {/* Work Experience */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-display text-2xl font-bold uppercase tracking-[-0.03em] leading-none flex items-center gap-3">
                                        <SectionIcon icon={Briefcase} />
                                        {f.experienceTitle}
                                    </h2>
                                    <p className="text-xs text-muted-foreground mt-2">{f.experienceDesc}</p>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addExperience}>
                                    <Plus className="w-4 h-4" aria-hidden="true" /> {f.add}
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {workExperiences.map((exp, i) => (
                                    <ExperienceForm
                                        key={exp.id}
                                        experience={exp}
                                        expIndex={i}
                                        onUpdate={updateExperience}
                                        onRemove={removeExperience}
                                        canRemove={workExperiences.length > 1}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-5">
                                <CardTitle className="flex items-center gap-3">
                                    <SectionIcon icon={Code2} />
                                    <label htmlFor="skills">{f.skillsTitle}</label>
                                </CardTitle>
                                <CardDescription className="text-xs">{f.skillsDesc}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Input
                                        id="skills"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === ",") {
                                                e.preventDefault();
                                                addSkill();
                                            }
                                        }}
                                        placeholder={f.placeholders.skills}
                                        className="text-sm"
                                    />
                                    <Button type="button" variant="outline" onClick={addSkill} className="shrink-0">
                                        <Plus className="w-4 h-4" aria-hidden="true" /> {f.add}
                                    </Button>
                                </div>
                                <TagList
                                    tags={skills}
                                    onRemove={(skill) => setSkills((prev) => prev.filter((s) => s !== skill))}
                                    empty={f.noSkills}
                                    large
                                />
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pb-10">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className="flex-1"
                                onClick={() => handleSave(false)}
                                disabled={saving}
                            >
                                {savingMode === "save" ? (
                                    <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" />
                                ) : (
                                    <Save className="w-4 h-4" aria-hidden="true" />
                                )}
                                {savingMode === "save" ? f.saving : justSaved ? f.saved : f.saveDraft}
                            </Button>
                            <Button type="button" size="lg" className="flex-1" onClick={() => handleSave(true)} disabled={saving}>
                                {savingMode === "preview" ? (
                                    <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" />
                                ) : (
                                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                                )}
                                {savingMode === "preview" ? f.building : f.previewBuild}
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
