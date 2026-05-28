// 📄 PAGE: Admin Manage Companies
// 🌐 URL: /admin/companies
// 👤 WHO: Admin only

import connectDB from '@/lib/db'
import Company from '@/models/Company'
import AdminCompanyActions from '@/components/dashboard/AdminCompanyActions'

export default async function AdminCompaniesPage() {
  await connectDB()

  const companies = await Company.find({ isEmailVerified: true })
    .sort({ createdAt: -1 })
    .lean()

  const planColors: Record<string, string> = {
    free:       'bg-slate-100 text-slate-700 border-slate-200/50',
    pro:        'bg-amber-500/10 text-amber-600 border-amber-500/20',
    enterprise: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Manage Companies</h1>
        <p className="text-xs text-muted">{companies.length} registered companies awaiting verification or management</p>
      </div>

      <div className="space-y-4">
        {companies.map(company => (
          <div 
            key={company._id.toString()} 
            className="premium-card p-5 rounded-2xl group hover:shadow-[0_4px_25px_rgba(0,0,0,0.015)] relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="flex items-start gap-4">
                {/* Initial logo avatar */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0 group-hover:scale-102 transition-transform">
                  {company.name?.charAt(0).toUpperCase() || '?'}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{company.name}</h3>
                  <p className="text-[11px] text-muted">{company.email}</p>
                  
                  <div className="flex gap-2 pt-1">
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-muted uppercase tracking-wider">
                      {company.industry || 'Unknown Industry'}
                    </span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${planColors[company.subscription?.plan] || planColors.free}`}>
                      {company.subscription?.plan || 'free'} plan
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <AdminCompanyActions
                companyId={company._id.toString()}
                isApproved={company.isAdminApproved}
                companyName={company.name}
                companyEmail={company.email}
              />
              
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
