// 📄 COMPONENT: AI Resume Analyzer & ATS Matcher
// 👤 WHO: Job Seekers

'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Sparkles, CheckCircle2, AlertTriangle, PlusCircle, Loader2, Award, ClipboardList } from 'lucide-react'

interface AnalysisResult {
  score: number
  strengths: string[]
  improvements: string[]
  missingSkills: string[]
}

export default function ResumeAnalyzer() {
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    resumeText: '',
    jobDescription: '',
  })

  const [result, setResult] = useState<AnalysisResult | null>(null)

  // Auto-populate resume text from seeker profile on mount
  useEffect(() => {
    async function loadProfile() {
      setProfileLoading(true)
      try {
        const { data } = await axios.get('/api/user/profile')
        if (data?.user) {
          const u = data.user
          
          // Re-construct profile data into readable text for AI analysis
          const profileText = [
            `Name: ${u.name || ''}`,
            `Bio: ${u.bio || ''}`,
            `Skills: ${u.skills?.join(', ') || ''}`,
            `Experience:`,
            ...(u.experience || []).map((exp: any) => 
              `- ${exp.title} at ${exp.company} (${exp.from} to ${exp.current ? 'Present' : exp.to}): ${exp.description || ''}`
            ),
            `Education:`,
            ...(u.education || []).map((edu: any) => 
              `- ${edu.degree} in ${edu.field} from ${edu.school}`
            )
          ].join('\n')

          setForm(p => ({
            ...p,
            resumeText: profileText.trim(),
          }))
        }
      } catch (err) {
        console.warn('Failed to pre-populate user profile for resume analyzer', err)
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [])

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setResult(null)

    try {
      const response = await axios.post('/api/ai/resume-analyzer', {
        resumeText: form.resumeText,
        jobDescription: form.jobDescription,
      })

      if (response.data.analysis) {
        setResult(response.data.analysis)
      } else {
        throw new Error('Analysis failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate SVG circular progress properties
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const scoreOffset = result ? circumference - (result.score / 100) * circumference : circumference

  // Get color class based on score value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500'
    if (score >= 50) return 'text-amber-500 stroke-amber-500'
    return 'text-rose-500 stroke-rose-500'
  }

  const inputCls = "w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#c7c4d8] rounded-xl text-sm focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-all text-[#0b1c30]"

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
      {/* Left Input Form Column */}
      <div className="w-full lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#e2dfff] flex items-center justify-center text-[#3525cd]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#0b1c30] text-base">ATS Resume Analyzer</h3>
              <p className="text-xs text-[#777587]">Compare your resume/profile details against target jobs</p>
            </div>
          </div>

          {profileLoading && (
            <div className="text-[10px] text-[#3525cd] bg-[#eff4ff] px-3 py-1.5 rounded-lg mb-4 flex items-center gap-1.5 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Constructing profile data for analyzer...</span>
            </div>
          )}

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#464555] mb-1.5 ml-1">Resume details or Profile details *</label>
              <textarea
                rows={8} required
                value={form.resumeText}
                onChange={e => update('resumeText', e.target.value)}
                className={inputCls + ' resize-none font-mono text-xs'}
                placeholder="Paste your raw resume text or use the auto-loaded profile text..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#464555] mb-1.5 ml-1">Target Job Description (Optional)</label>
              <textarea
                rows={4}
                value={form.jobDescription}
                onChange={e => update('jobDescription', e.target.value)}
                className={inputCls + ' resize-none'}
                placeholder="Paste the job posting description here to see your match score..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 btn-premium-primary py-3 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 bg-[#3525cd] hover:opacity-90 disabled:opacity-60 transition-all active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Resume Compatibility...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Compatibility</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Analysis Output Column */}
      <div className="w-full lg:w-1/2 p-6 bg-slate-50/50 flex flex-col justify-between">
        <div className="flex-1 flex flex-col">
          <span className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-4">Analysis Report</span>

          {error && (
            <div className="p-4 rounded-xl bg-[#ffdad6] text-[#93000a] text-xs flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="space-y-6 flex-1">
              {/* Score Metric Ring */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center gap-5 justify-center md:justify-start">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                      cx="56"
                      cy="56"
                      r={radius}
                      className="stroke-slate-100"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="56"
                      cy="56"
                      r={radius}
                      className={`transition-all duration-1000 ease-out ${getScoreColor(result.score)}`}
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={scoreOffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-extrabold text-[#0b1c30] tracking-tight">{result.score}%</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Match</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-500" />
                    ATS Compatibility Rating
                  </span>
                  <p className="text-[10px] text-[#777587] leading-relaxed">
                    {result.score >= 80 ? 'Excellent match. Your profile contains highly matching keywords and experience.' :
                     result.score >= 50 ? 'Moderate match. Consider adding missing keywords and revising description details.' :
                     'Needs improvement. Customize your resume to include the job skills listed.'}
                  </p>
                </div>
              </div>

              {/* Strengths */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-2">
                <span className="text-[11px] font-extrabold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Key Strengths
                </span>
                <ul className="text-xs text-[#464555] space-y-1.5 list-none pl-1">
                  {result.strengths?.map((str, idx) => (
                    <li key={idx} className="flex gap-2 items-start leading-relaxed">
                      <span className="text-emerald-500 text-[10px] mt-0.5 font-bold">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-2">
                <span className="text-[11px] font-extrabold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Critical Improvements
                </span>
                <ul className="text-xs text-[#464555] space-y-1.5 list-none pl-1">
                  {result.improvements?.map((imp, idx) => (
                    <li key={idx} className="flex gap-2 items-start leading-relaxed">
                      <span className="text-amber-500 text-[10px] mt-0.5 font-bold">⚠</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Skills */}
              {result.missingSkills && result.missingSkills.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-2">
                  <span className="text-[11px] font-extrabold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-[#3525cd]" />
                    Missing Keywords & Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.missingSkills.map((sk, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full bg-[#e2dfff] text-[#3525cd] text-[10px] font-semibold">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-[300px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center bg-white">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <ClipboardList className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No report generated</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Enter your details on the left and compare it to a job posting to see full compatibility metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// In case ClipboardText doesn't exist, we can use a custom SVG or fallback icon
function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
