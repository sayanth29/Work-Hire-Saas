// 📄 PAGE: Job Seeker Dashboard Overview
// 🌐 URL: /dashboard
// 👤 WHO: Job Seekers only

import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Application from '@/models/Application'
import Job from '@/models/Job'
import Company from '@/models/Company'
import Link from 'next/link'
import { 
  ClipboardList, 
  Target, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileText, 
  Compass, 
  Briefcase, 
  ChevronRight,
  TrendingUp
} from 'lucide-react'

export default async function SeekerDashboardPage() {
  const session = await getServerSession(authOptions)
  await connectDB()

  // Fetch seeker's applications
  const applications = await Application.find({
    seekerId: session?.user.id
  })
  .populate('jobId', 'title location type salary')
  .populate('companyId', 'name logo')
  .sort({ createdAt: -1 })
  .limit(5)
  .lean()

  // Stats
  const totalApps    = await Application.countDocuments({ seekerId: session?.user.id })
  const interviews   = await Application.countDocuments({ seekerId: session?.user.id, status: 'interview' })
  const hired        = await Application.countDocuments({ seekerId: session?.user.id, status: 'hired' })
  const pending      = await Application.countDocuments({ seekerId: session?.user.id, status: 'applied' })

  const stats = [
    { label: 'Total Applied',  value: totalApps,  icon: ClipboardList, color: 'bg-primary/10 text-primary border-primary/20' },
    { label: 'Interviews',     value: interviews,  icon: Target,        color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
    { label: 'Hired',          value: hired,       icon: CheckCircle2,  color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    { label: 'Pending Review', value: pending,     icon: Clock,         color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  ]

  const statusColors: Record<string, string> = {
    applied:   'bg-blue-50 text-blue-600 border-blue-200/50',
    reviewed:  'bg-indigo-50 text-indigo-600 border-indigo-200/50',
    interview: 'bg-amber-50 text-amber-600 border-amber-200/50',
    hired:     'bg-emerald-50 text-emerald-600 border-emerald-200/50',
    rejected:  'bg-rose-50 text-rose-600 border-rose-200/50',
  }

  // Recent jobs
  const recentJobs = await Job.find({ status: 'active' })
    .populate('companyId', 'name logo')
    .sort({ createdAt: -1 })
    .limit(4)
    .lean()

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Welcome & Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-x-10 translate-y-10" />
        
        <div className="max-w-xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Job search helper is active</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Step up your career today!</h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Verify details on your profile and upload your latest resume. Complete your details to get spotted by recruiters 3x faster.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="premium-card p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className={`w-10 h-10 rounded-xl ${color} border flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold text-foreground tracking-tight">{value}</p>
            </div>
            <p className="text-xs font-bold text-muted mt-2 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Applications Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-foreground text-base">Recent Applications</h3>
                <p className="text-xs text-muted">Monitor your live hiring progress</p>
              </div>
              <Link 
                href="/dashboard/applications" 
                className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
              >
                View all
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                <span className="text-3xl inline-block mb-3">📭</span>
                <p className="text-sm font-semibold text-muted">No applications submitted yet</p>
                <Link
                  href="/jobs"
                  className="btn-premium-primary inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm"
                >
                  <Compass className="w-4 h-4" />
                  Explore Vacancies
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app: any) => (
                  <div 
                    key={app._id.toString()} 
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-primary/10 hover:bg-slate-50/40 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-primary/5 border border-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 group-hover:scale-102 transition-transform">
                        {app.companyId?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {app.jobId?.title || 'Unknown Job'}
                        </p>
                        <p className="text-[10px] text-muted truncate mt-0.5">
                          {app.companyId?.name} · {app.jobId?.location || 'Remote'}
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

        {/* Right Info Column */}
        <div className="space-y-6">

          {/* Profile Strength */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="font-bold text-foreground text-base mb-4">Profile Strength</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted">Completion Rate</span>
                <span className="text-primary bg-primary/15 px-2 py-0.5 rounded-md">60%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent w-[60%] rounded-full transition-all duration-500" />
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Add your resume details and skill tags to receive personalized job matches.
              </p>
            </div>
            <Link
              href="/dashboard/profile"
              className="btn-premium-secondary inline-block w-full text-center py-2.5 rounded-xl text-xs font-bold text-primary border border-primary/20 hover:bg-primary/5 transition-all mt-4"
            >
              Complete Profile
            </Link>
          </div>

          {/* Quick Actions list */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="font-bold text-foreground text-base mb-4">Quick Shortcuts</h3>
            <div className="space-y-1.5">
              {[
                { href: '/jobs',                      icon: Compass,       label: 'Browse Jobs'        },
                { href: '/dashboard/profile',         icon: FileText,      label: 'Upload Resume'      },
                { href: '/dashboard/applications',    icon: ClipboardList, label: 'Track Applications' },
                { href: '/dashboard/messages',        icon: Target,        label: 'Check Messages'     },
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

        </div>
      </div>

      {/* Recommended/Latest Jobs block */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-foreground text-base">Latest Job Openings</h3>
            <p className="text-xs text-muted">Sourced directly from verified companies</p>
          </div>
          <Link 
            href="/jobs" 
            className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
          >
            See all jobs
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        {recentJobs.length === 0 ? (
          <p className="text-xs text-muted text-center py-8">No live jobs available at this moment</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentJobs.map((job: any) => (
              <Link
                key={job._id.toString()}
                href={`/jobs/${job._id}`}
                className="flex items-center gap-4.5 p-4 rounded-2xl border border-slate-100 hover:border-primary/15 hover:bg-slate-50/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.015)] transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-primary/5 border border-primary/10 flex items-center justify-center text-base font-bold text-primary shrink-0 group-hover:scale-102 transition-transform">
                  {(job.companyId as any)?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="overflow-hidden space-y-1">
                  <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{job.title}</p>
                  <p className="text-[10px] text-muted truncate">
                    {(job.companyId as any)?.name} · {job.location || 'Remote'}
                  </p>
                </div>
                <span className="ml-auto shrink-0 text-[9px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/50 uppercase tracking-wider">
                  {job.type}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}