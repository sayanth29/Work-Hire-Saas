// 📄 PAGE: My Applications
// 🌐 URL: /dashboard/applications
// 👤 WHO: Job Seekers only

import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Application from '@/models/Application'
import Link from 'next/link'
import { Send, Eye, Target, CheckCircle2, XCircle, MapPin, Briefcase, DollarSign, FolderOpen } from 'lucide-react'

type SeekerApplication = {
  _id: { toString: () => string }
  status: string
  createdAt: Date | string
  coverLetter?: string
  jobId?: {
    title?: string
    location?: string
    type?: string
    salary?: { min?: number; max?: number }
  }
  companyId?: { name?: string }
}

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions)
  await connectDB()

  const applications = await Application.find({ seekerId: session?.user.id })
    .populate('jobId', 'title location type salary status')
    .populate('companyId', 'name logo location')
    .sort({ createdAt: -1 })
    .lean()

  const statusColors: Record<string, string> = {
    applied:   'bg-[#e5eeff] text-[#4648d4]',
    reviewed:  'bg-blue-50 text-blue-600',
    interview: 'bg-amber-50 text-amber-700',
    hired:     'bg-green-50 text-green-700',
    rejected:  'bg-[#ffdad6] text-[#93000a]',
  }

  const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    applied:   Send,
    reviewed:  Eye,
    interview: Target,
    hired:     CheckCircle2,
    rejected:  XCircle,
  }
  const typedApplications = applications as unknown as SeekerApplication[]

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0b1c30]">My Applications</h1>
          <p className="text-sm text-[#777587]">Track all your job applications</p>
        </div>
        <Link
          href="/jobs"
          className="px-4 py-2 rounded-xl bg-[#3525cd] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          + Apply to Jobs
        </Link>
      </div>

      {/* Stats bar */}
      {typedApplications.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['applied', 'reviewed', 'interview', 'hired', 'rejected'].map(s => {
            const count = typedApplications.filter(a => a.status === s).length
            return (
              <div key={s} className={`px-4 py-3 rounded-xl text-center ${statusColors[s]}`}>
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs capitalize">{s}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* List */}
      {typedApplications.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#c7c4d8] p-16 flex flex-col items-center justify-center text-center">
          <FolderOpen className="w-12 h-12 text-slate-300 mb-4" />
          <h2 className="text-lg font-semibold text-[#0b1c30] mb-2">No applications yet</h2>
          <p className="text-sm text-[#777587] mb-6">Start applying to jobs and track them here</p>
          <Link
            href="/jobs"
            className="inline-block px-6 py-2.5 rounded-xl bg-[#3525cd] text-white text-sm font-semibold hover:opacity-90"
          >
            Browse Jobs →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {typedApplications.map(app => (
            <div
              key={app._id.toString()}
              className="bg-white rounded-xl border border-[#c7c4d8] p-5 hover:border-[#3525cd]/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">

                {/* Company + Job info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#e2dfff] flex items-center justify-center text-xl font-bold text-[#3525cd] shrink-0">
                    {app.companyId?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0b1c30]">
                      {app.jobId?.title || 'Job Removed'}
                    </h3>
                    <p className="text-sm text-[#464555]">{app.companyId?.name}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#464555] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {app.jobId?.location || 'Remote'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#464555] capitalize flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {app.jobId?.type || 'Full-time'}
                      </span>
                      {app.jobId?.salary?.min && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#464555] flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ₹{app.jobId.salary.min.toLocaleString()} – ₹{app.jobId.salary.max?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {(() => {
                    const StatusIcon = statusIcons[app.status]
                    return (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize flex items-center gap-1.5 ${statusColors[app.status]}`}>
                        {StatusIcon && <StatusIcon className="w-3.5 h-3.5 shrink-0" />}
                        {app.status}
                      </span>
                    )
                  })()}
                  <p className="text-xs text-[#777587]">
                    {new Date(app.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>

              </div>

              {/* Cover letter preview */}
              {app.coverLetter && (
                <div className="mt-3 pt-3 border-t border-[#c7c4d8]/50">
                  <p className="text-xs text-[#777587] line-clamp-2">{app.coverLetter}</p>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  )
}
