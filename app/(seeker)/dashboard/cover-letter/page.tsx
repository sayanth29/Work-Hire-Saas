// 📄 PAGE: Seeker Cover Letter Builder
// 🌐 URL: /dashboard/cover-letter
// 👤 WHO: Job Seekers only

'use client'

import CoverLetterGenerator from '@/components/jobs/CoverLetterGenerator'

export default function SeekerCoverLetterPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0b1c30]">AI Cover Letter Builder</h1>
        <p className="text-sm text-[#777587]">
          Generate customized, job-specific cover letters using your profile details.
        </p>
      </div>

      <CoverLetterGenerator />
    </div>
  )
}
