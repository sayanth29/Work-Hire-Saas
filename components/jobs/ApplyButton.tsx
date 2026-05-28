// 📦 COMPONENT: Apply button with cover letter modal
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import type { AxiosError } from 'axios'
import Link from 'next/link'

interface Props {
  jobId:          string
  isLoggedIn:     boolean
  isJobSeeker:    boolean
  alreadyApplied: boolean
}

export default function ApplyButton({
  jobId,
  isLoggedIn,
  isJobSeeker,
  alreadyApplied,
}: Props) {
  const router = useRouter()
  const [open, setOpen]               = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState(false)

  async function handleApply() {
    setError('')
    setLoading(true)
    try {
      await axios.post('/api/applications', { jobId, coverLetter })
      setSuccess(true)
      setOpen(false)
      router.refresh()
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>
      setError(axiosErr.response?.data?.error || 'Failed to apply')
    } finally {
      setLoading(false)
    }
  }

  if (success || alreadyApplied) {
    return (
      <div className="w-full py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold text-center">
        ✅ Already Applied
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="block w-full py-3 rounded-xl bg-[#3525cd] text-white text-sm font-semibold text-center hover:opacity-90 transition-opacity"
      >
        Login to Apply
      </Link>
    )
  }

  if (!isJobSeeker) {
    return (
      <div className="w-full py-3 rounded-xl bg-[#eff4ff] text-[#464555] text-sm text-center">
        Only job seekers can apply
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-xl bg-[#3525cd] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-[0px_4px_12px_rgba(53,37,205,0.2)]"
      >
        Apply Now →
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#c7c4d8] p-6 max-w-md w-full shadow-xl">
            <h3 className="font-bold text-lg text-[#0b1c30] mb-1">Apply for this job</h3>
            <p className="text-sm text-[#777587] mb-4">
              Your saved resume will be sent. Add a cover letter to stand out.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-medium text-[#464555] mb-1.5">
                Cover Letter <span className="text-[#777587]">(optional)</span>
              </label>
              <textarea
                rows={5}
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder="Tell the recruiter why you're a great fit for this role..."
                className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c7c4d8] rounded-xl text-sm focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] resize-none transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#c7c4d8] text-sm font-semibold text-[#464555] hover:bg-[#eff4ff] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#3525cd] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
