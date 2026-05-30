// 📄 PAGE: Recruiter Dashboard Overview
// 🌐 URL: /company/dashboard
// 👤 WHO: Recruiters only

import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Company from '@/models/Company'
import Job from '@/models/Job'
import Application from '@/models/Application'
import Link from 'next/link'
import { PLAN_LIMITS } from '@/types'
import { 
  Briefcase, 
  Users, 
  Target, 
  CheckCircle2, 
  ChevronRight, 
  PlusCircle, 
  CreditCard,
  MessageSquare,
  AlertCircle,
  FolderOpen
} from 'lucide-react'

type RecentApp = {
  _id: { toString: () => string }
  status: string
  createdAt: Date | string
  seekerId?: { name?: string }
  jobId?: { title?: string }
}

type RecentJob = {
  _id: { toString: () => string }
  title: string
  status: string
  applicantCount?: number
}

export default async function RecruiterDashboardPage() {
  const session = await getServerSession(authOptions)
  await connectDB()

  const company = await Company.findOne({ ownerId: session?.user.id }).lean()
  if (!company) return null

  const plan      = company.subscription?.plan || 'free'
  const jobLimit  = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.jobLimit

  // Stats
  const totalJobs   = await Job.countDocuments({ companyId: company._id })
  const activeJobs  = await Job.countDocuments({ companyId: company._id, status: 'active' })
  const totalApps   = await Application.countDocuments({ companyId: company._id })
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const newApps     = await Application.countDocuments({
    companyId: company._id,
    status: 'applied',
    createdAt: { $gte: sevenDaysAgo }
  })
  const interviews  = await Application.countDocuments({ companyId: company._id, status: 'interview' })
  const hired       = await Application.countDocuments({ companyId: company._id, status: 'hired' })

  // Recent applications
  const recentApps = await Application.find({ companyId: company._id })
    .populate('seekerId', 'name email avatar skills')
    .populate('jobId', 'title')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  // Recent jobs
  const recentJobs = await Job.find({ companyId: company._id })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean()
  const typedRecentApps = recentApps as unknown as RecentApp[]
  const typedRecentJobs = recentJobs as unknown as RecentJob[]

  const stats = [
    { label: 'Active Jobs',      value: activeJobs, icon: Briefcase,    color: 'bg-primary/10 text-primary border-primary/20', sub: `${totalJobs} total` },
    { label: 'Total Applicants', value: totalApps,  icon: Users,        color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20', sub: `+${newApps} new` },
    { label: 'Interviews',       value: interviews, icon: Target,       color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',   sub: 'scheduled'          },
    { label: 'Hired',            value: hired,      icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',   sub: 'completed'          },
  ]

  const statusColors: Record<string, string> = {
    applied:   'bg-blue-50 text-blue-600 border-blue-200/50',
    reviewed:  'bg-indigo-50 text-indigo-600 border-indigo-200/50',
    interview: 'bg-amber-50 text-amber-600 border-amber-200/50',
    hired:     'bg-emerald-50 text-emerald-600 border-emerald-200/50',
    rejected:  'bg-rose-50 text-rose-600 border-rose-200/50',
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-x-10 translate-y-10" />
        
        <div className="max-w-xl space-y-3 relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Recruiting Pipeline Overview</h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Manage your company listings, review incoming seeker profiles, and invite candidates for direct interviews.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="premium-card p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className={`w-10 h-10 rounded-xl ${color} border flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold text-foreground tracking-tight">{value}</p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs font-bold text-muted uppercase tracking-wide">{label}</p>
              <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Plan usage */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-foreground text-base">Hiring Plan Usage</h3>
            <p className="text-xs text-muted capitalize">Current subscription tier: {plan}</p>
          </div>
          <Link
            href="/company/dashboard/billing"
            className="btn-premium-primary text-xs px-4 py-2.5 rounded-xl font-bold text-white shadow-sm flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            Upgrade Plan
          </Link>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-muted">Job Postings Remaining</span>
            <span className="text-foreground">
              {totalJobs} / {jobLimit === Infinity ? 'Unlimited' : jobLimit}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                jobLimit !== Infinity && totalJobs >= jobLimit
                  ? 'bg-rose-500'
                  : 'bg-primary'
              }`}
              style={{
                width: jobLimit === Infinity
                  ? '30%'
                  : `${Math.min((totalJobs / jobLimit) * 100, 100)}%`
              }}
            />
          </div>
          {jobLimit !== Infinity && totalJobs >= jobLimit && (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-xl text-xs font-semibold">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>Job postings limit reached. Upgrade your subscription plan to list more roles.</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Applications list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-foreground text-base">Recent Applicants</h3>
                <p className="text-xs text-muted">Awaiting review and callback</p>
              </div>
              <Link 
                href="/company/dashboard/applicants" 
                className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
              >
                View all applicants
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {typedRecentApps.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center">
                <FolderOpen className="w-8 h-8 text-muted/60 mb-3" />
                <p className="text-sm font-semibold text-muted">No applications received yet</p>
                {company.isAdminApproved && (
                  <Link
                    href="/company/dashboard/jobs/new"
                    className="btn-premium-primary inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Post New Job
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {typedRecentApps.map(app => (
                  <div 
                    key={app._id.toString()} 
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-primary/10 hover:bg-slate-50/40 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 group-hover:scale-102 transition-transform">
                        {app.seekerId?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {app.seekerId?.name || 'Unknown Candidate'}
                        </p>
                        <p className="text-[10px] text-muted mt-0.5">
                          Applied for: <span className="font-semibold text-slate-700">{app.jobId?.title}</span> ·{' '}
                          {new Date(app.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider ${statusColors[app.status] || statusColors.applied}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div className="space-y-6">

          {/* Shortcuts list */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="font-bold text-foreground text-base mb-4">Quick Shortcuts</h3>
            <div className="space-y-1.5">
              {[
                { href: '/company/dashboard/jobs/new',   icon: PlusCircle,    label: 'Post New Job'       },
                { href: '/company/dashboard/applicants', icon: Users,         label: 'Review Applicants'  },
                { href: '/company/dashboard/messages',   icon: MessageSquare, label: 'Check Messages'     },
                { href: '/company/dashboard/billing',    icon: CreditCard,    label: 'Manage Billing'     },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-muted hover:bg-slate-50 hover:text-primary transition-all group"
                >
                  <Icon className="w-4 h-4 text-muted group-hover:text-primary transition-colors" /> 
                  <span>{label}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all text-primary" />
                </Link>
              ))}
            </div>
          </div>

          {/* Active jobs */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground text-base">Active Postings</h3>
              <Link 
                href="/company/dashboard/jobs" 
                className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
              >
                Manage
              </Link>
            </div>
            
            {typedRecentJobs.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-100 rounded-xl">
                <p className="text-xs text-muted">No jobs published yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {typedRecentJobs.map(job => (
                  <Link
                    key={job._id.toString()}
                    href={`/company/dashboard/jobs/${job._id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all duration-200 group"
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{job.title}</p>
                      <p className="text-[10px] text-muted">{job.applicantCount || 0} applicants</p>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                      job.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {job.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  )
}
