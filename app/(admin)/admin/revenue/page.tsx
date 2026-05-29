// 📄 PAGE: Admin Revenue Analytics
// 🌐 URL: /admin/revenue
// 👤 WHO: Admin only

import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/db'
import Company from '@/models/Company'
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  Building
} from 'lucide-react'

const PLAN_PRICES = {
  free: 0,
  pro: 999,
  enterprise: 2999,
}

export default async function AdminRevenuePage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    redirect('/login')
  }

  await connectDB()

  // Find all companies with paid plans
  const paidCompanies = await Company.find({
    'subscription.plan': { $in: ['pro', 'enterprise'] }
  })
  .sort({ createdAt: -1 })
  .lean()

  // Calculate stats
  let totalMRR = 0
  let proCount = 0
  let enterpriseCount = 0
  let activeSubCount = 0

  paidCompanies.forEach(company => {
    const plan = company.subscription?.plan as 'pro' | 'enterprise'
    const status = company.subscription?.status

    // Only count active subscriptions towards MRR
    if (status === 'active') {
      activeSubCount++
      const price = PLAN_PRICES[plan] || 0
      totalMRR += price
      if (plan === 'pro') proCount++
      if (plan === 'enterprise') enterpriseCount++
    }
  })

  const stats = [
    {
      label: 'Estimated MRR',
      value: `₹${totalMRR.toLocaleString()}`,
      sub: 'Based on active subs',
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    },
    {
      label: 'Active Paid Subscriptions',
      value: activeSubCount,
      sub: `${paidCompanies.length} total upgrades`,
      icon: Users,
      color: 'bg-primary/10 text-primary border-primary/20'
    },
    {
      label: 'Pro Plan Active',
      value: proCount,
      sub: '₹999/mo standard plan',
      icon: TrendingUp,
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    },
    {
      label: 'Enterprise Plan Active',
      value: enterpriseCount,
      sub: '₹2,999/mo plan',
      icon: Building,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
    }
  ]

  const statusStyles: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
    past_due: 'bg-amber-50 text-amber-600 border-amber-100',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200'
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Revenue & Subscriptions</h1>
        <p className="text-xs text-muted">Platform financial performance metrics and active subscriptions</p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="premium-card p-5 rounded-2xl flex flex-col justify-between hover:border-primary/10 transition-all duration-200">
            <div>
              <div className="flex justify-between items-start">
                <div className={`w-9 h-9 rounded-xl ${color} border flex items-center justify-center`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-foreground tracking-tight mt-4">{value}</p>
            </div>
            
            <div className="mt-3.5 pt-3.5 border-t border-slate-100/50 flex flex-col gap-0.5">
              <p className="text-[9px] font-extrabold text-muted uppercase tracking-wider">{label}</p>
              <p className="text-[10px] text-muted/80">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Breakdown Table */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-foreground text-base">Premium Companies</h3>
            <p className="text-xs text-muted">Manage upgrades and track billing cycles</p>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Verified Payments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold text-muted uppercase tracking-wider">
                <th className="pb-3 font-semibold">Company</th>
                <th className="pb-3 font-semibold">Subscription Plan</th>
                <th className="pb-3 font-semibold">Stripe Subscription</th>
                <th className="pb-3 font-semibold">Billing End Date</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paidCompanies.map(company => {
                const plan = company.subscription?.plan || 'free'
                const status = company.subscription?.status || 'inactive'
                const currentPeriodEnd = company.subscription?.currentPeriodEnd

                return (
                  <tr key={company._id.toString()} className="text-xs group hover:bg-slate-50/20">
                    {/* Company info */}
                    <td className="py-4 pr-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-50 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {company.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{company.name}</p>
                        <p className="text-[10px] text-muted truncate">{company.email}</p>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="py-4 pr-3">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider
                        ${plan === 'enterprise' 
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {plan}
                      </span>
                    </td>

                    {/* Stripe Subscription ID */}
                    <td className="py-4 pr-3 font-mono text-[10px] text-muted">
                      {company.subscription?.stripeSubscriptionId || 'N/A'}
                    </td>

                    {/* Billing End */}
                    <td className="py-4 pr-3 text-muted">
                      {currentPeriodEnd ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-muted/60" />
                          {new Date(currentPeriodEnd).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      ) : (
                        'Lifetime'
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${statusStyles[status] || statusStyles.inactive}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                )
              })}

              {paidCompanies.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted">
                    <div className="flex flex-col items-center justify-center">
                      <DollarSign className="w-10 h-10 text-muted/30 mb-2" />
                      <p className="text-sm font-bold text-foreground">No premium subscriptions found</p>
                      <p className="text-xs text-muted/80 mt-0.5">Companies will appear here once they upgrade their billing plans</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
