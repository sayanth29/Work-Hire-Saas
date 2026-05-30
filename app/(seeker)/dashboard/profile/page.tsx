// 📄 PAGE: Seeker Profile
// 🌐 URL: /dashboard/profile
// 👤 WHO: Job Seekers only

'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import type { AxiosError } from 'axios'
import { User, Briefcase, GraduationCap, FileText, Upload, Lightbulb, Loader2 } from 'lucide-react'

interface Experience {
  _id?: string
  title: string
  company: string
  from: string
  to: string
  current: boolean
  description: string
}

interface Education {
  _id?: string
  school: string
  degree: string
  field: string
  from: string
  to: string
}

export default function ProfilePage() {
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')
  const [activeTab, setActiveTab] = useState<'basic' | 'experience' | 'education' | 'resume'>('basic')

  const [form, setForm] = useState({
    name: '', bio: '', location: '', phone: '',
    skills: '' as string,
  })

  const [experience, setExperience] = useState<Experience[]>([])
  const [education, setEducation]   = useState<Education[]>([])
  const [resumeUrl, setResumeUrl]   = useState('')
  const [uploading, setUploading]   = useState(false)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/user/profile')
      const u = data.user
      setForm({
        name:     u.name     || '',
        bio:      u.bio      || '',
        location: u.location || '',
        phone:    u.phone    || '',
        skills:   u.skills?.join(', ') || '',
      })
      setExperience(u.experience || [])
      setEducation(u.education   || [])
      setResumeUrl(u.resume      || '')
    } catch {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => void fetchProfile())
  }, [fetchProfile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await axios.put('/api/user/profile', {
        name:       form.name,
        bio:        form.bio,
        location:   form.location,
        phone:      form.phone,
        skills:     form.skills.split(',').map(s => s.trim()).filter(Boolean),
        experience,
        education,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>
      setError(axiosErr.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setError('Only PDF files allowed'); return }
    if (file.size > 5 * 1024 * 1024) { setError('File must be under 5MB'); return }

    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'resume')
      const { data } = await axios.post('/api/upload', formData)
      setResumeUrl(data.url)
      await axios.put('/api/user/profile', { resume: data.url })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  // Experience helpers
  function addExperience() {
    setExperience([...experience, {
      title: '', company: '', from: '', to: '',
      current: false, description: '',
    }])
  }

  function updateExp<K extends keyof Experience>(i: number, field: K, value: Experience[K]) {
    const updated = [...experience]
    updated[i] = { ...updated[i], [field]: value }
    setExperience(updated)
  }

  function removeExp(i: number) {
    setExperience(experience.filter((_, idx) => idx !== i))
  }

  // Education helpers
  function addEducation() {
    setEducation([...education, {
      school: '', degree: '', field: '', from: '', to: '',
    }])
  }

  function updateEdu(i: number, field: string, value: string) {
    const updated = [...education]
    updated[i] = { ...updated[i], [field]: value }
    setEducation(updated)
  }

  function removeEdu(i: number) {
    setEducation(education.filter((_, idx) => idx !== i))
  }

  const inputCls = "w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#c7c4d8] rounded-xl text-sm focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-all"
  const tabs = ['basic', 'experience', 'education', 'resume'] as const

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#3525cd] animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0b1c30]">My Profile</h1>
        <p className="text-sm text-[#777587]">Keep your profile updated to get better job matches</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-sm">{error}</div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm">✅ Profile saved!</div>
      )}

      {/* Tabs */}
      <div className="flex bg-[#e5eeff] rounded-xl p-1 gap-1">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all
              ${activeTab === t
                ? 'bg-white text-[#3525cd] shadow-sm'
                : 'text-[#464555] hover:text-[#3525cd]'
              }`}
          >
            {t === 'basic' ? (
              <span className="flex items-center justify-center gap-1.5"><User className="w-3.5 h-3.5 shrink-0" /> Basic</span>
            ) : t === 'experience' ? (
              <span className="flex items-center justify-center gap-1.5"><Briefcase className="w-3.5 h-3.5 shrink-0" /> Experience</span>
            ) : t === 'education' ? (
              <span className="flex items-center justify-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 shrink-0" /> Education</span>
            ) : (
              <span className="flex items-center justify-center gap-1.5"><FileText className="w-3.5 h-3.5 shrink-0" /> Resume</span>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>

        {/* ── BASIC INFO ── */}
        {activeTab === 'basic' && (
          <div className="bg-white rounded-xl border border-[#c7c4d8] p-6 space-y-4">
            <h2 className="font-semibold text-[#0b1c30]">Basic Information</h2>

            <div>
              <label className="block text-xs font-medium text-[#464555] mb-1.5 ml-1">Full Name</label>
              <input
                type="text" required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className={inputCls}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#464555] mb-1.5 ml-1">Bio</label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                className={inputCls + ' resize-none'}
                placeholder="Tell recruiters about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#464555] mb-1.5 ml-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. London, UK or Remote"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#464555] mb-1.5 ml-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. +1 555-0199"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#464555] mb-1.5 ml-1">
                Skills <span className="text-[#777587]">(comma separated)</span>
              </label>
              <input
                type="text"
                value={form.skills}
                onChange={e => setForm({ ...form, skills: e.target.value })}
                className={inputCls}
                placeholder="React, Node.js, TypeScript, MongoDB..."
              />
              {/* Skill tags preview */}
              {form.skills && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                    <span key={skill} className="px-2 py-0.5 rounded-full bg-[#e2dfff] text-[#3525cd] text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── EXPERIENCE ── */}
        {activeTab === 'experience' && (
          <div className="bg-white rounded-xl border border-[#c7c4d8] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#0b1c30]">Work Experience</h2>
              <button
                type="button"
                onClick={addExperience}
                className="text-xs px-3 py-1.5 rounded-xl bg-[#e2dfff] text-[#3525cd] font-semibold hover:bg-[#3525cd] hover:text-white transition-all"
              >
                + Add Experience
              </button>
            </div>

            {experience.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center justify-center">
                <Briefcase className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm text-[#777587]">No experience added yet</p>
              </div>
            ) : (
              experience.map((exp, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#f8f9ff] border border-[#c7c4d8]/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#3525cd]">Experience {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExp(i)}
                      className="text-xs text-[#93000a] hover:bg-[#ffdad6] px-2 py-1 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#464555] mb-1">Job Title</label>
                      <input
                        type="text" required
                        value={exp.title}
                        onChange={e => updateExp(i, 'title', e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Software Developer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#464555] mb-1">Company</label>
                      <input
                        type="text" required
                        value={exp.company}
                        onChange={e => updateExp(i, 'company', e.target.value)}
                        className={inputCls}
                        placeholder="e.g. TechCorp"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#464555] mb-1">From</label>
                      <input
                        type="date"
                        value={exp.from}
                        onChange={e => updateExp(i, 'from', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#464555] mb-1">To</label>
                      <input
                        type="date"
                        value={exp.to}
                        disabled={exp.current}
                        onChange={e => updateExp(i, 'to', e.target.value)}
                        className={inputCls + (exp.current ? ' opacity-50' : '')}
                      />
                      <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={e => updateExp(i, 'current', e.target.checked)}
                          className="rounded border-[#c7c4d8] text-[#3525cd]"
                        />
                        <span className="text-xs text-[#464555]">Currently working here</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[#464555] mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={exp.description}
                      onChange={e => updateExp(i, 'description', e.target.value)}
                      className={inputCls + ' resize-none'}
                      placeholder="What did you do here?"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── EDUCATION ── */}
        {activeTab === 'education' && (
          <div className="bg-white rounded-xl border border-[#c7c4d8] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#0b1c30]">Education</h2>
              <button
                type="button"
                onClick={addEducation}
                className="text-xs px-3 py-1.5 rounded-xl bg-[#e2dfff] text-[#3525cd] font-semibold hover:bg-[#3525cd] hover:text-white transition-all"
              >
                + Add Education
              </button>
            </div>

            {education.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center justify-center">
                <GraduationCap className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm text-[#777587]">No education added yet</p>
              </div>
            ) : (
              education.map((edu, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#f8f9ff] border border-[#c7c4d8]/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#3525cd]">Education {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEdu(i)}
                      className="text-xs text-[#93000a] hover:bg-[#ffdad6] px-2 py-1 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#464555] mb-1">School / University</label>
                      <input
                        type="text" required
                        value={edu.school}
                        onChange={e => updateEdu(i, 'school', e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Kerala University"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#464555] mb-1">Degree</label>
                      <input
                        type="text" required
                        value={edu.degree}
                        onChange={e => updateEdu(i, 'degree', e.target.value)}
                        className={inputCls}
                        placeholder="e.g. B.Tech"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#464555] mb-1">Field of Study</label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={e => updateEdu(i, 'field', e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-[#464555] mb-1">From</label>
                        <input
                          type="date"
                          value={edu.from}
                          onChange={e => updateEdu(i, 'from', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#464555] mb-1">To</label>
                        <input
                          type="date"
                          value={edu.to}
                          onChange={e => updateEdu(i, 'to', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── RESUME ── */}
        {activeTab === 'resume' && (
          <div className="bg-white rounded-xl border border-[#c7c4d8] p-6 space-y-4">
            <h2 className="font-semibold text-[#0b1c30]">Resume / CV</h2>

            {resumeUrl ? (
              <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#3525cd]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-[#3525cd] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#0b1c30]">Resume uploaded</p>
                    <p className="text-xs text-[#777587]">PDF document</p>
                  </div>
                </div>
             
             <div className="flex gap-2">
  <a
    href={resumeUrl}
    target="_blank"
    rel="noreferrer"
    className="text-xs px-3 py-1.5 rounded-xl bg-[#3525cd] text-white font-semibold hover:opacity-90"
  >
    View
  </a>

  <label className="text-xs px-3 py-1.5 rounded-xl border border-[#3525cd] text-[#3525cd] font-semibold hover:bg-[#e2dfff] cursor-pointer transition-colors">
    Replace
    <input
      type="file"
      accept=".pdf"
      className="hidden"
      onChange={handleResumeUpload}
    />
  </label>
</div>
                
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-[#c7c4d8] rounded-xl p-10 text-center hover:border-[#3525cd] hover:bg-[#eff4ff] transition-all flex flex-col items-center justify-center">
                  <div className="mb-3">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-[#3525cd] animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#0b1c30] mb-1">
                    {uploading ? 'Uploading...' : 'Upload your Resume'}
                  </p>
                  <p className="text-xs text-[#777587]">PDF only · Max 5MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleResumeUpload}
                  disabled={uploading}
                />
              </label>
            )}

            <div className="bg-[#e5eeff] rounded-xl p-4">
              <p className="text-xs font-semibold text-[#3525cd] mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                Tips for a great resume
              </p>
              <ul className="text-xs text-[#464555] space-y-1 list-disc list-inside">
                <li>Keep it to 1-2 pages max</li>
                <li>Include keywords from job descriptions</li>
                <li>Add measurable achievements</li>
                <li>Use a clean, simple format</li>
              </ul>
            </div>
          </div>
        )}

        {/* Save button (not on resume tab) */}
        {activeTab !== 'resume' && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2.5 rounded-xl bg-[#3525cd] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center gap-2 transition-all shadow-[0px_4px_12px_rgba(79,70,229,0.2)]"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Saving...
                </>
              ) : 'Save Profile'}
            </button>
          </div>
        )}

      </form>
    </div>
  )
}
