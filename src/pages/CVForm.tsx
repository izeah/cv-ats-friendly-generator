import React, { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Phone, MapPin, Briefcase, Code2, Plus, Trash2,
  ChevronDown, ChevronUp, FolderKanban, Calendar, Sparkles, Save, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { saveCVData, getCVByEmail, type CVData, type WorkExperience, type Project } from '@/lib/db'
import { generateSlug } from '@/lib/utils'

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 30 }, (_, i) => (CURRENT_YEAR - i).toString())

function createEmptyProject(): Project {
  return {
    id: uuidv4(),
    description: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    technologies: [],
  }
}

function createEmptyExperience(): WorkExperience {
  return {
    id: uuidv4(),
    company: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    description: '',
    projects: [createEmptyProject()],
  }
}

interface ProjectFormProps {
  project: Project
  projectIndex: number
  expIndex: number
  onUpdate: (field: keyof Project, value: string | string[]) => void
  onRemove: () => void
  canRemove: boolean
}

function ProjectForm({ project, projectIndex, onUpdate, onRemove, canRemove }: ProjectFormProps) {
  const [techInput, setTechInput] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const addTech = () => {
    const items = techInput.split(',').map(s => s.trim()).filter(s => s !== '')
    if (items.length > 0) {
      const newTechs = [...project.technologies]
      items.forEach(item => {
        if (!newTechs.includes(item)) newTechs.push(item)
      })
      onUpdate('technologies', newTechs)
      setTechInput('')
    }
  }

  const removeTech = (tech: string) => {
    onUpdate('technologies', project.technologies.filter(t => t !== tech))
  }

  const handleTechKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTech()
    }
  }

  return (
    <div className="relative border border-border/50 rounded-lg bg-muted/30 overflow-hidden animate-scale-in">
      {/* Project Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-primary/70" />
          <span className="text-sm font-medium text-foreground/80">
            Project #{projectIndex + 1}
            {project.description && (
              <span className="text-muted-foreground ml-2">— {project.description.slice(0, 50)}...</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => { e.stopPropagation(); onRemove() }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
          {isCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Project Body */}
      {!isCollapsed && (
        <div className="p-4 pt-0 space-y-4 animate-slide-down">
          <div>
            <Label className="text-xs">Project Description</Label>
            <Textarea
              value={project.description}
              onChange={e => onUpdate('description', e.target.value)}
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
                  onChange={e => onUpdate('startMonth', e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-input px-2 py-2 text-sm text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  <option value="">Month</option>
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select
                  value={project.startYear}
                  onChange={e => onUpdate('startYear', e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-input px-2 py-2 text-sm text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  <option value="">Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-xs">End Date <span className="text-muted-foreground">(empty = ongoing)</span></Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <select
                  value={project.endMonth}
                  onChange={e => onUpdate('endMonth', e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-input px-2 py-2 text-sm text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  <option value="">Month</option>
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select
                  value={project.endYear}
                  onChange={e => onUpdate('endYear', e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-input px-2 py-2 text-sm text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  <option value="">Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
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
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown}
                placeholder="e.g., Go, PostgreSQL, Redis..."
                className="text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTech} className="shrink-0">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
            {project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {project.technologies.map(tech => (
                  <Badge key={tech} variant="default" className="cursor-pointer hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30 transition-colors" onClick={() => removeTech(tech)}>
                    {tech} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface ExperienceFormProps {
  experience: WorkExperience
  expIndex: number
  onUpdate: (expIndex: number, field: keyof WorkExperience, value: unknown) => void
  onRemove: (expIndex: number) => void
  canRemove: boolean
}

function ExperienceForm({ experience, expIndex, onUpdate, onRemove, canRemove }: ExperienceFormProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const updateProject = (projIndex: number, field: keyof Project, value: string | string[]) => {
    const newProjects = [...experience.projects]
    newProjects[projIndex] = { ...newProjects[projIndex], [field]: value }
    onUpdate(expIndex, 'projects', newProjects)
  }

  const addProject = () => {
    onUpdate(expIndex, 'projects', [...experience.projects, createEmptyProject()])
  }

  const removeProject = (projIndex: number) => {
    if (experience.projects.length > 1) {
      onUpdate(expIndex, 'projects', experience.projects.filter((_, i) => i !== projIndex))
    }
  }

  return (
    <Card className="border-border/60 bg-card/50 overflow-hidden animate-slide-up hover:border-primary/20 transition-colors duration-300">
      {/* Experience Header */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="font-semibold text-foreground">
              {experience.company || `Experience #${expIndex + 1}`}
            </span>
            {experience.projects.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {experience.projects.length} project{experience.projects.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => { e.stopPropagation(); onRemove(expIndex) }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          {isCollapsed ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronUp className="w-5 h-5 text-muted-foreground" />}
        </div>
      </div>

      {/* Experience Body */}
      {!isCollapsed && (
        <CardContent className="space-y-5 animate-slide-down">
          <Separator className="bg-border/50" />

          {/* Company Name */}
          <div>
            <Label htmlFor={`company-${expIndex}`}>Company Name</Label>
            <Input
              id={`company-${expIndex}`}
              value={experience.company}
              onChange={e => onUpdate(expIndex, 'company', e.target.value)}
              placeholder="e.g., PT Tokopedia, Freelance — Acme Corp"
              className="mt-1.5"
            />
          </div>

          {/* Date Ranges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Start Date
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <select
                  value={experience.startMonth}
                  onChange={e => onUpdate(expIndex, 'startMonth', e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-input px-2 py-2 text-sm text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  <option value="">Month</option>
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select
                  value={experience.startYear}
                  onChange={e => onUpdate(expIndex, 'startYear', e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-input px-2 py-2 text-sm text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  <option value="">Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> End Date <span className="text-muted-foreground text-xs">(empty = present)</span>
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <select
                  value={experience.endMonth}
                  onChange={e => onUpdate(expIndex, 'endMonth', e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-input px-2 py-2 text-sm text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  <option value="">Month</option>
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select
                  value={experience.endYear}
                  onChange={e => onUpdate(expIndex, 'endYear', e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-input px-2 py-2 text-sm text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  <option value="">Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <Label htmlFor={`desc-${expIndex}`}>Job Description</Label>
            <Textarea
              id={`desc-${expIndex}`}
              value={experience.description}
              onChange={e => onUpdate(expIndex, 'description', e.target.value)}
              placeholder="Backend Developer responsible for designing and implementing scalable microservices..."
              className="mt-1.5"
              rows={3}
            />
          </div>

          <Separator className="bg-border/50" />

          {/* Projects Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="flex items-center gap-1.5 text-sm">
                <FolderKanban className="w-4 h-4 text-primary/70" />
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
                  expIndex={expIndex}
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
  )
}

export default function CVForm() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [loadEmail, setLoadEmail] = useState('')
  const [loadingExisting, setLoadingExisting] = useState(false)

  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([createEmptyExperience()])

  // Load existing data
  const loadExistingData = useCallback(async () => {
    if (!loadEmail.trim()) return
    setLoadingExisting(true)
    try {
      const existing = await getCVByEmail(loadEmail.trim().toLowerCase())
      if (existing) {
        setFullName(existing.fullName)
        setEmail(existing.email)
        setPhone(existing.phone)
        setCity(existing.city)
        setSkills(existing.skills)
        setWorkExperiences(existing.workExperiences.length > 0 ? existing.workExperiences : [createEmptyExperience()])
      } else {
        alert('No CV found with that email address.')
      }
    } finally {
      setLoadingExisting(false)
    }
  }, [loadEmail])

  // Experience handlers
  const updateExperience = (expIndex: number, field: keyof WorkExperience, value: unknown) => {
    setWorkExperiences(prev => {
      const updated = [...prev]
      updated[expIndex] = { ...updated[expIndex], [field]: value }
      return updated
    })
  }

  const addExperience = () => {
    setWorkExperiences(prev => [...prev, createEmptyExperience()])
  }

  const removeExperience = (expIndex: number) => {
    if (workExperiences.length > 1) {
      setWorkExperiences(prev => prev.filter((_, i) => i !== expIndex))
    }
  }

  // Skill handlers
  const addSkill = () => {
    const items = skillInput.split(',').map(s => s.trim()).filter(s => s !== '')
    if (items.length > 0) {
      setSkills(prev => {
        const newSkills = [...prev]
        items.forEach(item => {
          if (!newSkills.includes(item)) newSkills.push(item)
        })
        return newSkills
      })
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill))
  }

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill()
    }
  }

  // Save & generate
  const handleSave = async (preview: boolean = false) => {
    if (!fullName.trim() || !email.trim()) {
      alert('Please fill in at least your Full Name and Email.')
      return
    }

    setSaving(true)
    try {
      const cvData: CVData = {
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        workExperiences,
        skills,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await saveCVData(cvData)

      if (preview) {
        const slug = generateSlug(cvData.email)
        navigate(`/cv/${slug}`)
      } else {
        alert('CV saved successfully!')
      }
    } catch (err) {
      console.error('Save failed:', err)
      alert('Failed to save CV. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen noise-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">CV Forge</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">ATS-Friendly Generator</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={saving}>
              <Save className="w-3.5 h-3.5 mr-1" /> Save
            </Button>
            <Button variant="gradient" size="sm" onClick={() => handleSave(true)} disabled={saving}>
              <Eye className="w-3.5 h-3.5 mr-1" /> Preview CV
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">
        {/* Load Existing */}
        <Card className="border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 w-full">
                <Label className="text-xs text-muted-foreground mb-1.5 block">Load existing CV by email</Label>
                <Input
                  value={loadEmail}
                  onChange={e => setLoadEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="text-sm"
                  onKeyDown={e => { if (e.key === 'Enter') loadExistingData() }}
                />
              </div>
              <Button variant="secondary" size="default" onClick={loadExistingData} disabled={loadingExisting} className="shrink-0 w-full sm:w-auto">
                {loadingExisting ? 'Loading...' : 'Load CV'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="border-border/60 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>Basic details for your CV header</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+62 812-3456-7890"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="city" className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> City
                </Label>
                <Input
                  id="city"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Jakarta, Indonesia"
                  className="mt-1.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Experience */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Work Experience
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">Add your professional experience with detailed project breakdowns</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addExperience}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Company
            </Button>
          </div>
          <div className="space-y-4">
            {workExperiences.map((exp, expIndex) => (
              <ExperienceForm
                key={exp.id}
                experience={exp}
                expIndex={expIndex}
                onUpdate={updateExperience}
                onRemove={removeExperience}
                canRemove={workExperiences.length > 1}
              />
            ))}
          </div>
        </div>

        {/* Skills */}
        <Card className="border-border/60 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code2 className="w-5 h-5 text-primary" />
              Technical Skills
            </CardTitle>
            <CardDescription>Technologies you frequently work with</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="e.g., Golang, Node.js, PostgreSQL, Docker, Kubernetes..."
                className="text-sm"
              />
              <Button type="button" variant="outline" onClick={addSkill} className="shrink-0">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {skills.map(skill => (
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
        <div className="flex flex-col sm:flex-row gap-3 pb-12">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            variant="gradient"
            size="lg"
            className="flex-1"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {saving ? 'Generating...' : 'Generate & Preview CV'}
          </Button>
        </div>
      </main>
    </div>
  )
}
