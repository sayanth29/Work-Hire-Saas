// 📄 COMPONENT: AI Job Description Generator Modal
// 👤 WHO: Recruiters

'use client'

import { useState } from 'react'
import axios from 'axios'
import type { AxiosError } from 'axios'
import { Sparkles, Wand2, X, AlertCircle } from 'lucide-react'

interface AIJobDescriptionProps {
  onGenerate: (data: { description: string; skills: string; requirements: string }) => void
  currentTitle?: string
  currentSkills?: string
  currentExperience?: string
}

export default function AIJobDescription({
  onGenerate,
  currentTitle = '',
  currentSkills = '',
  currentExperience = 'fresher',
}: AIJobDescriptionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [form, setForm] = useState({
    jobTitle: currentTitle,
    skills: currentSkills,
    experience: currentExperience,
    location: 'Remote',
    type: 'full-time',
    companyName: '',
    industry: '',
  })

  const [generatedDesc, setGeneratedDesc] = useState('')

  const handleOpen = () => {
    setForm(p => ({
      ...p,
      jobTitle: currentTitle || p.jobTitle,
      skills: currentSkills || p.skills,
      experience: currentExperience || p.experience,
    }))
    setIsOpen(true)
    setError('')
  }

  const handleClose = () => {
    setIsOpen(false)
    setGeneratedDesc('')
  }

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleGenerate(e?: React.FormEvent | React.MouseEvent) {
    if (e) e.preventDefault()
    setError('')
    setLoading(true)
    setGeneratedDesc('')

    try {
      const response = await axios.post('/api/ai/job-description', {
        jobTitle: form.jobTitle,
        skills: form.skills,
        experience: form.experience,
        location: form.location,
        type: form.type,
        companyName: form.companyName,
        industry: form.industry,
      })

      const desc = response.data.description
      setGeneratedDesc(desc)
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>
      setError(axiosErr.response?.data?.error || 'Failed to generate job description. Verify your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleApply() {
    if (!generatedDesc) return

    // Attempt to extract skills & requirements sections if they are present in the response
    // Or just apply the description and let recruiter refine it
    let description = generatedDesc
    let extractedSkills = form.skills
    let extractedReqs = ''

    // Helper regex to extract lines from sections if LLM followed the instructions perfectly
    const reqsMatch = generatedDesc.match(/REQUIREMENTS:([\s\S]*?)(?:NICE TO HAVE:|WHAT WE OFFER:|$)/i)
    const skillsMatch = generatedDesc.match(/KEY RESPONSIBILITIES:([\s\S]*?)(?:REQUIREMENTS:|$)/i)

    if (reqsMatch && reqsMatch[1]) {
      extractedReqs = reqsMatch[1]
        .split('\n')
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(Boolean)
        .join('\n')
    }

    onGenerate({
      description,
      skills: extractedSkills,
      requirements: extractedReqs,
    })

    handleClose()
  }

  const inputCls = "w-full px-3 py-2 bg-[#f8f9ff] border border-[#c7c4d8] rounded-xl text-xs focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-all text-[#0b1c30]"

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#3525cd]/30 bg-[#eff4ff] text-[#3525cd] text-xs font-semibold hover:bg-[#3525cd] hover:text-white transition-all shadow-sm active:scale-[0.98]"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Generate Description with AI</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-[#f8f9ff]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#e2dfff] flex items-center justify-center text-[#3525cd]">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0b1c30]">AI Job Description Writer</h3>
                  <p className="text-[10px] text-[#777587]">Powered by Groq AI</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-[#ffdad6] text-[#93000a] text-xs flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {!generatedDesc ? (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#464555] mb-1">Job Title *</label>
                      <input
                        type="text" required
                        value={form.jobTitle}
                        onChange={e => update('jobTitle', e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Senior Frontend Engineer"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[#464555] mb-1">Company Name</label>
                      <input
                        type="text"
                        value={form.companyName}
                        onChange={e => update('companyName', e.target.value)}
                        className={inputCls}
                        placeholder="e.g. WorkHire Corp"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#464555] mb-1">Experience Level</label>
                      <select
                        value={form.experience}
                        onChange={e => update('experience', e.target.value)}
                        className={inputCls}
                      >
                        <option value="fresher">Fresher</option>
                        <option value="1-2">1–2 years</option>
                        <option value="2-5">2–5 years</option>
                        <option value="5-10">5–10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[#464555] mb-1">Job Type</label>
                      <select
                        value={form.type}
                        onChange={e => update('type', e.target.value)}
                        className={inputCls}
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="remote">Remote</option>
                        <option value="internship">Internship</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[#464555] mb-1">Location / Hybrid</label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={e => update('location', e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Remote / Bangalore"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#464555] mb-1">Industry</label>
                      <input
                        type="text"
                        value={form.industry}
                        onChange={e => update('industry', e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Technology, Finance"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[#464555] mb-1">Key Skills (comma-separated)</label>
                      <input
                        type="text"
                        value={form.skills}
                        onChange={e => update('skills', e.target.value)}
                        className={inputCls}
                        placeholder="e.g. React, TypeScript, Next.js"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-[#3525cd] text-white text-xs font-bold hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center gap-1.5 transition-all shadow-md"
                    >
                      {loading ? (
                        <>
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Generating description...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Generate Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-xs font-bold text-[#0b1c30] mb-2 flex items-center gap-1">
                      <span>✨ Generated Job Description Preview</span>
                    </h4>
                    <pre className="text-[11px] text-[#464555] font-mono leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto bg-white p-3 rounded-lg border border-slate-100">
                      {generatedDesc}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setGeneratedDesc('')}
                      className="px-4 py-2 border border-[#c7c4d8] text-[#464555] rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      ← Back to details
                    </button>
                    <button
                      type="button"
                      onClick={handleApply}
                      className="px-6 py-2 bg-[#3525cd] text-white rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] flex items-center gap-1.5 shadow-md"
                    >
                      <span>Apply details to form</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
