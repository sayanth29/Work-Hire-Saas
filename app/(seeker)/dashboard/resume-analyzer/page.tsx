// 📄 PAGE: Seeker Resume Analyzer
// 🌐 URL: /dashboard/resume-analyzer
// 👤 WHO: Job Seekers only

'use client'

import ResumeAnalyzer from '@/components/jobs/ResumeAnalyzer'

export default function SeekerResumeAnalyzerPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0b1c30]">AI Resume Analyzer</h1>
        <p className="text-sm text-[#777587]">
          Analyze your resume compatibility against target job descriptions and optimize for ATS.
        </p>
      </div>

      <ResumeAnalyzer />
    </div>
  )
}
