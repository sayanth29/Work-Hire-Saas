// 📄 COMPONENT: AI Cover Letter Generator Card
// 👤 WHO: Job Seekers

'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Sparkles, Copy, Check, Download, FileText, Loader2, AlertCircle } from 'lucide-react'

export default function CoverLetterGenerator() {
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    skills: '',
    experience: '',
  })

  const [coverLetter, setCoverLetter] = useState('')

  // Auto-load profile details on mount
  useEffect(() => {
    async function loadProfile() {
      setProfileLoading(true)
      try {
        const { data } = await axios.get('/api/user/profile')
        if (data?.user) {
          const u = data.user
          // Combine bio and experience descriptions for a summarized experience field
          const expSummary = u.experience
            ?.map((exp: any) => `${exp.title} at ${exp.company} (${exp.description || ''})`)
            .join('; ') || u.bio || ''

          setForm(p => ({
            ...p,
            skills: u.skills?.join(', ') || '',
            experience: expSummary,
          }))
        }
      } catch (err) {
        console.warn('Failed to pre-populate user profile for cover letter generator', err)
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [])

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setCoverLetter('')

    try {
      const response = await axios.post('/api/ai/cover-letter', {
        jobTitle: form.jobTitle,
        companyName: form.companyName,
        jobDescription: form.jobDescription,
        skills: form.skills,
        experience: form.experience,
      })

      setCoverLetter(response.data.coverLetter)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate cover letter. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!coverLetter) return
    navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    if (!coverLetter) return
    const element = document.createElement('a')
    const file = new Blob([coverLetter], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${form.jobTitle.replace(/\s+/g, '_')}_Cover_Letter.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const inputCls = "w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#c7c4d8] rounded-xl text-sm focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-all text-[#0b1c30]"

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
      {/* Left Input Form Column */}
      <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#e2dfff] flex items-center justify-center text-[#3525cd]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#0b1c30] text-base">Cover Letter Builder</h3>
              <p className="text-xs text-[#777587]">Generate tailored cover letters instantly</p>
            </div>
          </div>

          {profileLoading && (
            <div className="text-[10px] text-[#3525cd] bg-[#eff4ff] px-3 py-1.5 rounded-lg mb-4 flex items-center gap-1.5 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Fetching your profile details to personalize...</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#464555] mb-1.5 ml-1">Target Job Title *</label>
              <input
                type="text" required
                value={form.jobTitle}
                onChange={e => update('jobTitle', e.target.value)}
                className={inputCls}
                placeholder="e.g. Full Stack Developer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#464555] mb-1.5 ml-1">Target Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={e => update('companyName', e.target.value)}
                className={inputCls}
                placeholder="e.g. Acme Tech Solutions"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#464555] mb-1.5 ml-1">Job Description / Requirements (Optional)</label>
              <textarea
                rows={3}
                value={form.jobDescription}
                onChange={e => update('jobDescription', e.target.value)}
                className={inputCls + ' resize-none'}
                placeholder="Paste key responsibilities or full job posting..."
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#464555] mb-1.5 ml-1">My Skills Profile</label>
                <input
                  type="text"
                  value={form.skills}
                  onChange={e => update('skills', e.target.value)}
                  className={inputCls}
                  placeholder="e.g. React, Node.js, SQL"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#464555] mb-1.5 ml-1">My Background Summary</label>
                <textarea
                  rows={2}
                  value={form.experience}
                  onChange={e => update('experience', e.target.value)}
                  className={inputCls + ' resize-none'}
                  placeholder="Summarize your experience or projects..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 btn-premium-primary py-3 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 bg-[#3525cd] hover:opacity-90 disabled:opacity-60 transition-all active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Drafting your letter...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate with AI</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Generated Content Column */}
      <div className="w-full md:w-1/2 p-6 bg-slate-50/50 flex flex-col justify-between">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">AI Draft Preview</span>
            {coverLetter && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-[#3525cd] transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm active:scale-95"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-[#3525cd] transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm active:scale-95"
                  title="Download TXT"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-[#ffdad6] text-[#93000a] text-xs flex gap-2 items-start mt-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {coverLetter ? (
            <div className="flex-1 min-h-[300px] bg-white border border-slate-200/80 rounded-2xl p-5 shadow-inner overflow-y-auto">
              <pre className="text-xs text-[#464555] font-sans leading-relaxed whitespace-pre-wrap">
                {coverLetter}
              </pre>
            </div>
          ) : (
            <div className="flex-1 min-h-[300px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center bg-white">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Ready to write</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Fill in the job details on the left and click Generate to see your letter here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
