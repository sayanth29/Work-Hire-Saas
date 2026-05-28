// 📄 PAGE: Admin Overview
// 🌐 URL: /admin
// 👤 WHO: Admin only

import connectDB from '@/lib/db'
import User from '@/models/User'
import Company from '@/models/Company'
import Job from '@/models/Job'
import Application from '@/models/Application'
import Link from 'next/link'
import { 
  Users, 
  Building, 
  Clock, 
  Briefcase, 
  ClipboardList, 
  DollarSign, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react'

export default async function AdminOverviewPage() {
  await connectDB()

  const [
    totalUsers,
    totalCompanies,
    pendingCompanies,
    totalJobs,
    totalApps,
    proCompanies,
  ] = await Promise.all([
    User.countDocuments({ role: 'jobseeker' }),
    Company.countDocuments(),
    Company.countDocuments({ isAdminApproved: false, isEmailVerified: true }),
    Job.countDocuments({ status: 'active' }),
    Application.countDocuments(),
    Company.countDocuments({ 'subscription.plan': { $ne: 'free' } }),
  ])

  const recentCompanies = await Company.find({ isEmailVerified: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  const stats = [
    { label: 'Job Seekers',         value: totalUsers,       icon: Users,         color: 'bg-primary/10 text-primary border-primary/20', sub: 'registered seekers' },
    { label: 'Companies',           value: totalCompanies,   icon: Building,      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20', sub: 'registered companies' },
    { label: 'Pending Approval',    value: pendingCompanies, icon: Clock,         color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', alert: true, sub: 'needs manual check' },
    { label: 'Active Jobs',         value: totalJobs,        icon: Briefcase,     color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', sub: 'live postings' },
    { label: 'Total Applications',  value: totalApps,        icon: ClipboardList, color: 'bg-slate-500/10 text-slate-600 border-slate-300/50', sub: 'submitted apps' },
    { label: 'Paid Companies',      value: proCompanies,     icon: DollarSign,    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', sub: 'pro / enterprise' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">

      <div>
        <h1 className="text-xl font-bold text-foreground">Platform Overview</h1>
        <p className="text-xs text-muted">Platform-wide statistics and system metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, alert, sub }) => {
          const showAlert = alert && value > 0
          return (
            <div
              key={label}
              className={`premium-card p-5 rounded-2xl flex flex-col justify-between transition-all duration-200
                ${showAlert 
                  ? 'border-amber-300 bg-amber-50/10 shadow-[0_4px_16px_rgba(217,119,6,0.04)]' 
                  : 'hover:border-primary/10'
                }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className={`w-10 h-10 rounded-xl ${color} border flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {showAlert && (
                    <span className="animate-pulse text-[9px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200/50">
                      Action Required
                    </span>
                  )}
                </div>
                <p className="text-3xl font-extrabold text-foreground tracking-tight mt-4">{value}</p>
              </div>
              
              <div className="mt-3.5 pt-3 border-t border-slate-100/50 flex flex-col gap-0.5">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wide">{label}</p>
                <p className="text-[10px] text-muted/80">{sub}</p>
                {showAlert && (
                  <Link 
                    href="/admin/companies" 
                    className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 mt-2 transition-colors"
                  >
                    Review Submissions
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Companies List block */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-foreground text-base">Recent Company Signups</h3>
            <p className="text-xs text-muted">Awaiting email verification or admin approval</p>
          </div>
          <Link 
            href="/admin/companies" 
            className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-0.5 transition-colors"
          >
            Manage All
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentCompanies.map(company => (
            <div 
              key={company._id.toString()} 
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200/80 transition-all duration-200 group bg-slate-50/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 group-hover:scale-102 transition-transform">
                  {company.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{company.name}</p>
                  <p className="text-[10px] text-muted truncate mt-0.5">{company.email}</p>
                </div>
              </div>
              
              <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider
                ${company.isAdminApproved
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                {company.isAdminApproved ? (
                  <>
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Approved
                  </>
                ) : (
                  <>
                    <Clock className="w-2.5 h-2.5 animate-spin-slow" />
                    Pending
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
