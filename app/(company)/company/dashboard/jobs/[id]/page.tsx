// 📄 PAGE: Edit Job Posting
// 🌐 URL: /company/dashboard/jobs/[id]
// 👤 WHO: Recruiters only

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import type { AxiosError } from 'axios'
import AIJobDescription from '@/components/jobs/AIJobDescription'

interface EditJobPageProps {
  params: Promise<{ id: string }>
}

export default function EditJobPage({ params }: EditJobPageProps) {
  const { id } = use(params)
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title:       '',
    description: '',
    location:    '',
    type:        'full-time',
    experience:  'fresher',
    salaryMin:   '',
    salaryMax:   '',
    skills:      '',
    requirements:'',
    deadline:    '',
    status:      'active',
  })

  useEffect(() => {
    async function loadJob() {
      try {
        const { data } = await axios.get(`/api/jobs/${id}`)
        if (data?.job) {
          const j = data.job
          
          let formattedDeadline = ''
          if (j.deadline) {
            formattedDeadline = new Date(j.deadline).toISOString().split('T')[0]
          }

          setForm({
            title:       j.title       || '',
            description: j.description || '',
            location:    j.location    || '',
            type:        j.type        || 'full-time',
            experience:  j.experience  || 'fresher',
            salaryMin:   j.salary?.min !== undefined ? String(j.salary.min) : '',
            salaryMax:   j.salary?.max !== undefined ? String(j.salary.max) : '',
            skills:      j.skills?.join(', ') || '',
            requirements:j.requirements?.join('\n') || '',
            deadline:    formattedDeadline,
            status:      j.status      || 'active',
          })
        }
      } catch (err) {
        setError('Failed to load job details')
      } finally {
        setPageLoading(false)
      }
    }
    loadJob()
  }, [id])

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await axios.put(`/api/jobs/${id}`, {
        title:        form.title,
        description:  form.description,
        location:     form.location,
        type:         form.type,
        experience:   form.experience,
        salary: {
          min:      form.salaryMin ? Number(form.salaryMin) : undefined,
          max:      form.salaryMax ? Number(form.salaryMax) : undefined,
          currency: 'INR',
        },
        skills:        form.skills.split(',').map(s => s.trim()).filter(Boolean),
        requirements:  form.requirements.split('\n').filter(Boolean),
        deadline:      form.deadline || undefined,
        status:        form.status,
      })
      router.push('/company/dashboard/jobs')
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>
      setError(axiosErr.response?.data?.error || 'Failed to update job')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) return
    
    setError('')
    setDeleting(true)

    try {
      await axios.delete(`/api/jobs/${id}`)
      router.push('/company/dashboard/jobs')
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>
      setError(axiosErr.response?.data?.error || 'Failed to delete job')
      setDeleting(false)
    }
  }

  const inputCls = "w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#c7c4d8] rounded-xl text-sm focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-all"

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-4xl animate-pulse">⏳</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0b1c30]">Edit Job Posting</h1>
          <p className="text-sm text-[#777587]">Update the details for your job posting</p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-semibold transition-all active:scale-[0.98]"
        >
          {deleting ? 'Deleting...' : '🗑 Delete Job'}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="bg-white rounded-xl border border-[#c7c4d8] p-6 space-y-4">
          <h2 className="font-semibold text-[#0b1c30]">Job Details</h2>

          <div>
            <label className="block text-xs font-medium text-[#464555] mb-1.5 ml-1">Job Title *</label>
            <input
              type="text" required
              value={form.title}
              onChange={e => update('title', e.target.value)}
              className={inputCls}
              placeholder="e.g. Senior React Developer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1">
              <label className="block text-xs font-medium text-[#464555]">Job Description *</label>
              <AIJobDescription
                onGenerate={({ description, skills, requirements }) => {
                  setForm(p => ({
                    ...p,
                    description,
                    skills: skills || p.skills,
                    requirements: requirements || p.requirements,
                  }))
                }}
                currentTitle={form.title}
                currentSkills={form.skills}
                currentExperience={form.experience}
              />
            </div>
            <textarea
              rows={5} required
              value={form.description}
              onChange={e => update('description', e.target.value)}
              className={inputCls + ' resize-none'}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#464555] mb-1.5 ml-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={e => update('location', e.target.value)}
                className={inputCls}
                placeholder="e.g. Bangalore / Remote"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#464555] mb-1.5 ml-1">Job Type</label>
              <select
                value={form.type}
                onChange={e => update('type', e.target.value)}
                className={inputCls}
              >
                {['full-time', 'part-time', 'remote', 'internship', 'contract'].map(t => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#464555] mb-1.5 ml-1">Experience Level</label>
              <select
                value={form.experience}
                onChange={e => update('experience', e.target.value)}
                className={inputCls}
              >
                {[
                  ['fresher', 'Fresher'],
                  ['1-2', '1–2 years'],
                  ['2-5', '2–5 years'],
                  ['5-10', '5–10 years'],
                  ['10+', '10+ years'],
                ].map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#464555] mb-1.5 ml-1">Application Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => update('deadline', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="bg-white rounded-xl border border-[#c7c4d8] p-6 space-y-4">
          <h2 className="font-semibold text-[#0b1c30]">Salary Range (INR)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#464555] mb-1.5 ml-1">Minimum (₹)</label>
              <input
                type="number"
                value={form.salaryMin}
                onChange={e => update('salaryMin', e.target.value)}
                className={inputCls}
                placeholder="e.g. 500000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#464555] mb-1.5 ml-1">Maximum (₹)</label>
              <input
                type="number"
                value={form.salaryMax}
                onChange={e => update('salaryMax', e.target.value)}
                className={inputCls}
                placeholder="e.g. 1000000"
              />
            </div>
          </div>
        </div>

        {/* Skills + Requirements */}
        <div className="bg-white rounded-xl border border-[#c7c4d8] p-6 space-y-4">
          <h2 className="font-semibold text-[#0b1c30]">Skills & Requirements</h2>

          <div>
            <label className="block text-xs font-medium text-[#464555] mb-1.5 ml-1">
              Required Skills <span className="text-[#777587]">(comma separated)</span>
            </label>
            <input
              type="text"
              value={form.skills}
              onChange={e => update('skills', e.target.value)}
              className={inputCls}
              placeholder="React, Node.js, TypeScript, MongoDB..."
            />
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

          <div>
            <label className="block text-xs font-medium text-[#464555] mb-1.5 ml-1">
              Requirements <span className="text-[#777587]">(one per line)</span>
            </label>
            <textarea
              rows={4}
              value={form.requirements}
              onChange={e => update('requirements', e.target.value)}
              className={inputCls + ' resize-none'}
              placeholder="3+ years of React experience&#10;Strong knowledge of TypeScript&#10;Experience with RESTful APIs"
            />
          </div>
        </div>

        {/* Publish options */}
        <div className="bg-white rounded-xl border border-[#c7c4d8] p-6">
          <h2 className="font-semibold text-[#0b1c30] mb-3">Publish Options</h2>
          <div className="flex gap-3">
            {[
              { value: 'active', label: '🚀 Publish Now',  desc: 'Visible to job seekers immediately' },
              { value: 'draft',  label: '📝 Save as Draft', desc: 'Save and edit later' },
            ].map(({ value, label, desc }) => (
              <label
                key={value}
                className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all ${
                  form.status === value
                    ? 'border-[#3525cd] bg-[#eff4ff]'
                    : 'border-[#c7c4d8] hover:border-[#3525cd]/40'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={value}
                  checked={form.status === value}
                  onChange={e => update('status', e.target.value)}
                  className="sr-only"
                />
                <p className="text-sm font-semibold text-[#0b1c30]">{label}</p>
                <p className="text-xs text-[#777587] mt-0.5">{desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-xl border border-[#c7c4d8] text-sm font-semibold text-[#464555] hover:bg-[#eff4ff] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 rounded-xl bg-[#3525cd] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center gap-2 transition-all shadow-[0px_4px_12px_rgba(79,70,229,0.2)]"
          >
            {loading ? 'Saving Changes...' : '💾 Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
