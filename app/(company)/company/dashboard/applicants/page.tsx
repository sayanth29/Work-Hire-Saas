// 📄 PAGE: Manage Applicants
// 🌐 URL: /company/dashboard/applicants
// 👤 WHO: Recruiters only

import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Company from '@/models/Company'
import Application from '@/models/Application'
import ApplicantActions from '@/components/applications/ApplicantActions'
import { Users, FileText } from 'lucide-react'

interface Props {
  searchParams: { jobId?: string; status?: string }
}

type ApplicantRow = {
  _id: { toString: () => string }
  status: string
  createdAt: Date | string
  coverLetter?: string
  seekerId?: {
    _id?: { toString: () => string }
    name?: string
    email?: string
    skills?: string[]
    resume?: string
  }
  jobId?: {
    title?: string
  }
}

export default async function ApplicantsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  await connectDB()

  const company = await Company.findOne({ ownerId: session?.user.id }).lean()
  if (!company) return null

  const filter: Record<string, unknown> = { companyId: company._id }
  if (searchParams.jobId)  filter.jobId  = searchParams.jobId
  if (searchParams.status) filter.status = searchParams.status

  const applications = await Application.find(filter)
    .populate('seekerId', 'name email avatar skills resume bio location')
    .populate('jobId',    'title location type')
    .sort({ createdAt: -1 })
    .lean()

  const statusColors: Record<string, string> = {
    applied:   'bg-[#e5eeff] text-[#4648d4]',
    reviewed:  'bg-blue-50 text-blue-600',
    interview: 'bg-amber-50 text-amber-700',
    hired:     'bg-green-50 text-green-700',
    rejected:  'bg-[#ffdad6] text-[#93000a]',
  }

  const typedApplications = applications as unknown as ApplicantRow[]

  const counts = {
    all:       typedApplications.length,
    applied:   typedApplications.filter(a => a.status === 'applied').length,
    reviewed:  typedApplications.filter(a => a.status === 'reviewed').length,
    interview: typedApplications.filter(a => a.status === 'interview').length,
    hired:     typedApplications.filter(a => a.status === 'hired').length,
    rejected:  typedApplications.filter(a => a.status === 'rejected').length,
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0b1c30]">Applicants</h1>
        <p className="text-sm text-[#777587]">{applications.length} total applications</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(counts).map(([status, count]) => (
          <a
            key={status}
            href={status === 'all'
              ? '/company/dashboard/applicants'
              : `/company/dashboard/applicants?status=${status}`
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize
              ${(!searchParams.status && status === 'all') || searchParams.status === status
                ? 'bg-[#3525cd] text-white'
                : 'bg-white border border-[#c7c4d8] text-[#464555] hover:border-[#3525cd]/40 hover:text-[#3525cd]'
              }`}
          >
            {status} ({count})
          </a>
        ))}
      </div>

      {/* List */}
      {typedApplications.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#c7c4d8] p-16 text-center">
          <Users className="w-12 h-12 text-[#c7c4d8] mb-4 mx-auto" />
          <h2 className="text-lg font-semibold text-[#0b1c30] mb-2">No applicants yet</h2>
          <p className="text-sm text-[#777587]">Applications will appear here once candidates apply</p>
        </div>
      ) : (
        <div className="space-y-3">
          {typedApplications.map(app => (
            <div key={app._id.toString()} className="bg-white rounded-xl border border-[#c7c4d8] p-5 hover:border-[#3525cd]/30 transition-colors">
              <div className="flex items-start gap-4">

                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-[#e2dfff] flex items-center justify-center text-[#3525cd] font-bold text-lg shrink-0">
                  {app.seekerId?.name?.charAt(0) || '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[#0b1c30]">
                        {app.seekerId?.name || 'Unknown'}
                      </h3>
                      <p className="text-xs text-[#777587]">
                        {app.seekerId?.email} ·{' '}
                        {app.jobId?.title}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize shrink-0 ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Skills */}
                  {(app.seekerId?.skills?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(app.seekerId?.skills ?? []).slice(0, 5).map((skill: string) => (
                        <span key={skill} className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#464555] text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Cover letter */}
                  {app.coverLetter && (
                    <p className="text-xs text-[#464555] mt-2 line-clamp-2 bg-[#f8f9ff] rounded-lg p-2">
                      &quot;{app.coverLetter}&quot;
                    </p>
                  )}

                  {/* Actions row */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {/* View resume */}
                    {app.seekerId?.resume && (
                      <a
                        href={app.seekerId.resume}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs px-3 py-1.5 rounded-xl bg-[#e2dfff] text-[#3525cd] font-semibold hover:bg-[#3525cd] hover:text-white transition-all inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Resume</span>
                      </a>
                    )}

                    {/* Applied date */}
                    <span className="text-xs text-[#777587]">
                      Applied {new Date(app.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>

                    {/* Status update + message — client component */}
                    <ApplicantActions
                      applicationId={app._id.toString()}
                      currentStatus={app.status}
                      seekerId={app.seekerId?._id?.toString()}
                      seekerName={app.seekerId?.name}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
