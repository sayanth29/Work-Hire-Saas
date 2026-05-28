// 📄 PAGE: Manage Jobs
// 🌐 URL: /company/dashboard/jobs
// 👤 WHO: Recruiters only

import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Company from '@/models/Company'
import Job from '@/models/Job'
import Link from 'next/link'

export default async function ManageJobsPage() {
  const session = await getServerSession(authOptions)
  await connectDB()

  const company = await Company.findOne({ ownerId: session?.user.id }).lean()
  if (!company) return null
  const jobs    = await Job.find({ companyId: company._id })
    .sort({ createdAt: -1 })
    .lean()

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0b1c30]">Manage Jobs</h1>
          <p className="text-sm text-[#777587]">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
        </div>
        <Link
          href="/company/dashboard/jobs/new"
          className="px-4 py-2 rounded-xl bg-[#3525cd] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          + Post New Job
        </Link>
      </div>

      {/* Jobs list */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#c7c4d8] p-16 text-center">
          <p className="text-5xl mb-4">💼</p>
          <h2 className="text-lg font-semibold text-[#0b1c30] mb-2">No jobs posted yet</h2>
          <p className="text-sm text-[#777587] mb-6">Post your first job and start receiving applications</p>
          <Link
            href="/company/dashboard/jobs/new"
            className="inline-block px-6 py-2.5 rounded-xl bg-[#3525cd] text-white text-sm font-semibold hover:opacity-90"
          >
            Post First Job →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job._id.toString()} className="bg-white rounded-xl border border-[#c7c4d8] p-5 hover:border-[#3525cd]/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#0b1c30]">{job.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                      job.status === 'active'
                        ? 'bg-green-50 text-green-600'
                        : job.status === 'draft'
                        ? 'bg-[#e5eeff] text-[#4648d4]'
                        : 'bg-[#ffdad6] text-[#93000a]'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#464555]">
                      📍 {job.location || 'Remote'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#464555] capitalize">
                      💼 {job.type}
                    </span>
                    {job.salary?.min && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#464555]">
                        💰 ₹{job.salary.min.toLocaleString()} – ₹{job.salary.max?.toLocaleString()}
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#464555]">
                      👥 {job.applicantCount} applicants
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/company/dashboard/jobs/${job._id}`}
                    className="text-xs px-3 py-1.5 rounded-xl bg-[#e2dfff] text-[#3525cd] font-semibold hover:bg-[#3525cd] hover:text-white transition-all"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/company/dashboard/applicants?jobId=${job._id}`}
                    className="text-xs px-3 py-1.5 rounded-xl border border-[#c7c4d8] text-[#464555] font-semibold hover:bg-[#eff4ff] transition-all"
                  >
                    Applicants
                  </Link>
                </div>
              </div>

              <p className="text-xs text-[#777587] mt-3">
                Posted {new Date(job.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
                {job.deadline && ` · Deadline: ${new Date(job.deadline).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short'
                })}`}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
