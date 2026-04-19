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
    ChevronLeft,
    ChevronRight,
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
import Sidebar from "@/components/Sidebar";
import {
    saveCVData,
    getCVByEmail,
    type CVData,
    type WorkExperience,
    type Project,
} from "@/lib/db";
import { generateSlug } from "@/lib/utils";

const MONTHS = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) =>
    (CURRENT_YEAR - i).toString(),
);

const SELECT_CLASS =
    "h-10 w-full rounded-lg border border-border bg-input px-2 py-2 text-sm text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";

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

// ========================
// ProjectForm Component
// ========================
interface ProjectFormProps {
    project: Project;
    projectIndex: number;
    onUpdate: (field: keyof Project, value: string | string[]) => void;
    onRemove: () => void;
    canRemove: boolean;
}

function ProjectForm({
    project,
    projectIndex,
    onUpdate,
    onRemove,
    canRemove,
}: ProjectFormProps) {
    const [techInput, setTechInput] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);

    const addTech = () => {
        const items = techInput
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== "");
        if (items.length > 0) {
            const newTechs = [...project.technologies];
            items.forEach((item) => {
                if (!newTechs.includes(item)) newTechs.push(item);
            });
            onUpdate("technologies", newTechs);
            setTechInput("");
        }
    };

    const removeTech = (tech: string) => {
        onUpdate(
            "technologies",
            project.technologies.filter((t) => t !== tech),
        );
    };

    const handleTechKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTech();
        }
    };

    return (
        <div className="relative border border-border/50 rounded-lg bg-muted/30 overflow-hidden animate-scale-in">
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <FolderKanban className="w-4 h-4 text-primary/70 shrink-0" />
                    <span className="text-sm font-medium text-foreground/80 truncate">
                        {project.title || `Project #${projectIndex + 1}`}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    )}
                    {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    )}
                </div>
            </div>

            {!isCollapsed && (
                <div className="p-4 pt-0 space-y-4 animate-slide-down">
                    {/* Project Title */}
                    <div>
                        <Label className="text-xs flex items-center gap-1">
                            <Type className="w-3 h-3" /> Project Title
                        </Label>
                        <Input
                            value={project.title}
                            onChange={(e) => onUpdate("title", e.target.value)}
                            placeholder="e.g., Payment Gateway Microservice, Real-time Analytics Pipeline"
                            className="mt-1.5 text-sm"
                        />
                    </div>

                    {/* Project Description */}
                    <div>
                        <Label className="text-xs">Project Description</Label>
                        <Textarea
                            value={project.description}
                            onChange={(e) =>
                                onUpdate("description", e.target.value)
                            }
                            placeholder="What did you build? What was the impact? e.g., Built a high-performance REST API serving 10K+ RPM..."
                            className="mt-1.5 text-sm"
                            rows={3}
                        />
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-xs">Start Date</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1.5">
                                <select
                                    value={project.startMonth}
                                    onChange={(e) =>
                                        onUpdate("startMonth", e.target.value)
                                    }
                                    className={SELECT_CLASS}
                                >
                                    <option value="">Month</option>
                                    {MONTHS.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={project.startYear}
                                    onChange={(e) =>
                                        onUpdate("startYear", e.target.value)
                                    }
                                    className={SELECT_CLASS}
                                >
                                    <option value="">Year</option>
                                    {YEARS.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs">
                                End Date{" "}
                                <span className="text-muted-foreground">
                                    (empty = ongoing)
                                </span>
                            </Label>
                            <div className="grid grid-cols-2 gap-2 mt-1.5">
                                <select
                                    value={project.endMonth}
                                    onChange={(e) =>
                                        onUpdate("endMonth", e.target.value)
                                    }
                                    className={SELECT_CLASS}
                                >
                                    <option value="">Month</option>
                                    {MONTHS.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={project.endYear}
                                    onChange={(e) =>
                                        onUpdate("endYear", e.target.value)
                                    }
                                    className={SELECT_CLASS}
                                >
                                    <option value="">Year</option>
                                    {YEARS.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Technologies */}
                    <div>
                        <Label className="text-xs">Technologies Used</Label>
                        <div className="flex gap-2 mt-1.5">
                            <Input
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyDown={handleTechKeyDown}
                                placeholder="e.g., Go, PostgreSQL, Redis..."
                                className="text-sm"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addTech}
                                className="shrink-0"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                        {project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {project.technologies.map((tech) => (
                                    <Badge
                                        key={tech}
                                        variant="default"
                                        className="cursor-pointer hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30 transition-colors"
                                        onClick={() => removeTech(tech)}
                                    >
                                        {tech} ×
                                    </Badge>
                                ))}
                            </div>
                        )}
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

    return (
        <Card className="border-border/60 bg-card/50 overflow-hidden animate-slide-up hover:border-primary/20 transition-colors duration-300">
            <div
                className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shrink-0">
                        <Briefcase className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <span className="font-semibold text-foreground text-sm truncate block">
                            {experience.company ||
                                `Experience #${expIndex + 1}`}
                        </span>
                        <p className="text-xs text-muted-foreground">
                            {experience.projects.length} project
                            {experience.projects.length > 1 ? "s" : ""}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(expIndex);
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                    {isCollapsed ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    )}
                </div>
            </div>

            {!isCollapsed && (
                <CardContent className="space-y-5 animate-slide-down">
                    <Separator className="bg-border/50" />

                    <div>
                        <Label htmlFor={`company-${expIndex}`}>
                            Company Name
                        </Label>
                        <Input
                            id={`company-${expIndex}`}
                            value={experience.company}
                            onChange={(e) =>
                                onUpdate(expIndex, "company", e.target.value)
                            }
                            placeholder="e.g., PT Tokopedia, Freelance — Acme Corp"
                            className="mt-1.5 bg-muted/50"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> Start Date
                            </Label>
                            <div className="grid grid-cols-2 gap-2 mt-1.5">
                                <select
                                    value={experience.startMonth}
                                    onChange={(e) =>
                                        onUpdate(
                                            expIndex,
                                            "startMonth",
                                            e.target.value,
                                        )
                                    }
                                    className={SELECT_CLASS}
                                >
                                    <option value="">Month</option>
                                    {MONTHS.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={experience.startYear}
                                    onChange={(e) =>
                                        onUpdate(
                                            expIndex,
                                            "startYear",
                                            e.target.value,
                                        )
                                    }
                                    className={SELECT_CLASS}
                                >
                                    <option value="">Year</option>
                                    {YEARS.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <Label className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> End Date{" "}
                                <span className="text-muted-foreground text-xs">
                                    (empty = present)
                                </span>
                            </Label>
                            <div className="grid grid-cols-2 gap-2 mt-1.5">
                                <select
                                    value={experience.endMonth}
                                    onChange={(e) =>
                                        onUpdate(
                                            expIndex,
                                            "endMonth",
                                            e.target.value,
                                        )
                                    }
                                    className={SELECT_CLASS}
                                >
                                    <option value="">Month</option>
                                    {MONTHS.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={experience.endYear}
                                    onChange={(e) =>
                                        onUpdate(
                                            expIndex,
                                            "endYear",
                                            e.target.value,
                                        )
                                    }
                                    className={SELECT_CLASS}
                                >
                                    <option value="">Year</option>
                                    {YEARS.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor={`desc-${expIndex}`}>
                            Job Description
                        </Label>
                        <Textarea
                            id={`desc-${expIndex}`}
                            value={experience.description}
                            onChange={(e) =>
                                onUpdate(
                                    expIndex,
                                    "description",
                                    e.target.value,
                                )
                            }
                            placeholder="Backend Developer responsible for designing and implementing scalable microservices..."
                            className="mt-1.5"
                            rows={3}
                        />
                    </div>

                    <Separator className="bg-border/50" />

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label className="flex items-center gap-1.5 text-sm">
                                <FolderKanban className="w-4 h-4 text-primary/70" />{" "}
                                Projects Handled
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addProject}
                                className="text-xs h-7"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Add Project
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {experience.projects.map((project, projIndex) => (
                                <ProjectForm
                                    key={project.id}
                                    project={project}
                                    projectIndex={projIndex}
                                    onUpdate={(field, value) =>
                                        updateProject(projIndex, field, value)
                                    }
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

// ========================
// Main CVForm
// ========================
export default function CVForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [saving, setSaving] = useState(false);
    const [sidebarRefresh, setSidebarRefresh] = useState(0);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Form state
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [about, setAbout] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState("");
    const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
        createEmptyExperience(),
    ]);

    // Reset form function
    const resetForm = () => {
        setFullName("");
        setEmail("");
        setPhone("");
        setCity("");
        setAbout("");
        setSkills([]);
        setSkillInput("");
        setWorkExperiences([createEmptyExperience()]);
    };

    // Load CV data function
    const loadCVData = async (targetEmail: string) => {
        const existing = await getCVByEmail(targetEmail.trim().toLowerCase());
        if (existing) {
            setFullName(existing.fullName);
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
    };

    // Auto-load from URL param on mount / URL change
    const emailParam = searchParams.get("email");
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

    // Experience handlers
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

    // Skill handlers
    const addSkill = () => {
        const items = skillInput
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== "");
        if (items.length > 0) {
            setSkills((prev) => {
                const n = [...prev];
                items.forEach((i) => {
                    if (!n.includes(i)) n.push(i);
                });
                return n;
            });
            setSkillInput("");
        }
    };
    const removeSkill = (skill: string) => {
        setSkills((prev) => prev.filter((s) => s !== skill));
    };
    const handleSkillKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addSkill();
        }
    };

    // Save
    const handleSave = async (preview: boolean = false) => {
        if (!fullName.trim() || !email.trim()) {
            alert("Please fill in at least your Full Name and Email.");
            return;
        }
        setSaving(true);
        try {
            const cvData: CVData = {
                email: email.trim().toLowerCase(),
                fullName: fullName.trim(),
                phone: phone.trim(),
                city: city.trim(),
                about: about.trim(),
                workExperiences,
                skills,
                isArchived: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await saveCVData(cvData);
            // Add 500ms delay for UI feedback
            await new Promise((resolve) => setTimeout(resolve, 500));
            setSidebarRefresh((prev) => prev + 1);
            if (preview) {
                navigate(`/cv/${generateSlug(cvData.email)}`);
            }
        } catch (err) {
            console.error("Save failed:", err);
            alert("Failed to save CV. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // Auto-save every 10 seconds
    useEffect(() => {
        const autoSaveInterval = setInterval(async () => {
            if (fullName.trim() && email.trim()) {
                try {
                    const cvData: CVData = {
                        email: email.trim().toLowerCase(),
                        fullName: fullName.trim(),
                        phone: phone.trim(),
                        city: city.trim(),
                        about: about.trim(),
                        workExperiences,
                        skills,
                        isArchived: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                    await saveCVData(cvData);
                } catch (err) {
                    console.error("Auto-save failed:", err);
                }
            }
        }, 10000); // 10 seconds

        return () => clearInterval(autoSaveInterval);
    }, [fullName, email, phone, city, about, workExperiences, skills]);

    return (
        <div className="flex min-h-screen noise-bg">
            <Sidebar
                currentEmail={email}
                onSelectCV={handleSidebarSelect}
                refreshTrigger={sidebarRefresh}
                isCollapsed={sidebarCollapsed}
                onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <div className="flex-1 min-w-0">
                {/* Header */}
                <header className="sticky top-0 z-50 glass border-b border-border/40">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="pl-10 lg:pl-0">
                                <h2 className="text-sm font-semibold">
                                    {email ? "Edit CV" : "New CV"}
                                </h2>
                                {email && (
                                    <p className="text-[10px] text-muted-foreground">
                                        {email}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSave(false)}
                                disabled={saving}
                            >
                                <Save className="w-3.5 h-3.5 mr-1" /> Save
                            </Button>
                            <Button
                                variant="gradient"
                                size="sm"
                                onClick={() => handleSave(true)}
                                disabled={saving}
                            >
                                <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 relative z-10">
                    {/* Personal Info */}
                    <Card className="border-border/60 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent py-4">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="w-4 h-4 text-primary" />{" "}
                                Personal Information
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Basic details for your CV header
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label
                                        htmlFor="fullName"
                                        className="flex items-center gap-1.5 text-xs"
                                    >
                                        <User className="w-3 h-3" /> Full Name
                                    </Label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) =>
                                            setFullName(e.target.value)
                                        }
                                        placeholder="John Doe"
                                        className="mt-1 bg-muted/50"
                                    />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="email"
                                        className="flex items-center gap-1.5 text-xs"
                                    >
                                        <Mail className="w-3 h-3" /> Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="john@example.com"
                                        className="mt-1 bg-muted/50"
                                    />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="phone"
                                        className="flex items-center gap-1.5 text-xs"
                                    >
                                        <Phone className="w-3 h-3" /> Phone
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                        placeholder="+62 812-3456-7890"
                                        className="mt-1 bg-muted/50"
                                    />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="city"
                                        className="flex items-center gap-1.5 text-xs"
                                    >
                                        <MapPin className="w-3 h-3" /> City
                                    </Label>
                                    <Input
                                        id="city"
                                        value={city}
                                        onChange={(e) =>
                                            setCity(e.target.value)
                                        }
                                        placeholder="Jakarta, Indonesia"
                                        className="mt-1 bg-muted/50"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* About */}
                    <Card className="border-border/60 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent py-4">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="w-4 h-4 text-primary" />{" "}
                                About
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Brief summary about yourself (max 500
                                characters)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={about}
                                onChange={(e) => {
                                    if (e.target.value.length <= 500)
                                        setAbout(e.target.value);
                                }}
                                placeholder="Results-driven Backend Developer with 5+ years of experience building scalable microservices, RESTful APIs, and distributed systems. Passionate about clean code, performance optimization, and system design..."
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground mt-1.5 text-right">
                                {about.length}/500
                            </p>
                        </CardContent>
                    </Card>

                    {/* Work Experience */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-primary" />{" "}
                                    Work Experience
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Add your professional experience with
                                    detailed project breakdowns
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addExperience}
                            >
                                <Plus className="w-4 h-4 mr-1" /> Add
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
                    <Card className="border-border/60 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent py-4">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Code2 className="w-4 h-4 text-primary" />{" "}
                                Technical Skills
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Technologies you frequently work with
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input
                                    value={skillInput}
                                    onChange={(e) =>
                                        setSkillInput(e.target.value)
                                    }
                                    onKeyDown={handleSkillKeyDown}
                                    placeholder="e.g., Golang, Node.js, PostgreSQL, Docker..."
                                    className="text-sm"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addSkill}
                                    className="shrink-0"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add
                                </Button>
                            </div>
                            {skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {skills.map((skill) => (
                                        <Badge
                                            key={skill}
                                            variant="default"
                                            className="px-3 py-1 text-sm cursor-pointer hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30 transition-colors"
                                            onClick={() => removeSkill(skill)}
                                        >
                                            <Code2 className="w-3 h-3 mr-1" />
                                            {skill} ×
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pb-10">
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-1"
                            onClick={() => handleSave(false)}
                            disabled={saving}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? "Saving..." : "Save Draft"}
                        </Button>
                        <Button
                            variant="gradient"
                            size="lg"
                            className="flex-1"
                            onClick={() => handleSave(true)}
                            disabled={saving}
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {saving ? "Generating..." : "Generate & Preview CV"}
                        </Button>
                    </div>
                </main>
            </div>
        </div>
    );
}
