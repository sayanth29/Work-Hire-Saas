// 📄 LAYOUT: Recruiter Dashboard
// 🌐 WRAPS: /company/dashboard/*
// 👤 WHO: Recruiters only (protected by middleware)

import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import { redirect } from 'next/navigation'
import RecruiterSidebar from '@/components/dashboard/RecruiterSidebar'
import connectDB from '@/lib/db'
import Company from '@/models/Company'
import NotificationBell from '@/components/dashboard/NotificationBell'
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')
  if (session.user.role === 'admin') redirect('/admin')
  if (session.user.role === 'jobseeker') redirect('/dashboard')
  if (session.user.role !== 'recruiter') redirect('/login')

  await connectDB()

  // Get company info
  const company = await Company.findOne({ ownerId: session.user.id }).lean() as any

  // Not verified or not approved yet
  if (!company) redirect('/login')

  return (
    <div className="min-h-screen bg-[#fafbff] flex font-sans selection:bg-primary/20 selection:text-primary">

      <RecruiterSidebar user={session.user} company={company} />

      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64 relative">

        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] pl-16 pr-6 md:px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground">
                {company.name}
              </h1>
              <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase
                ${company.isAdminApproved
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                {company.isAdminApproved ? (
                  <>
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Approved
                  </>
                ) : (
                  <>
                    <Clock className="w-2.5 h-2.5" />
                    Pending
                  </>
                )}
              </span>
            </div>
            
            <p className="text-[10px] text-muted font-bold tracking-wide mt-0.5 uppercase">
              Recruiter Hub · Plan:{' '}
              <span className="text-primary font-extrabold">
                {company.subscription?.plan || 'free'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification button */}
            <NotificationBell />

            {/* Recruiter Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/10">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Pending approval banner */}
        {!company.isAdminApproved && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3.5 text-xs text-amber-700 font-semibold flex items-center gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
            <span>Your company is pending admin approval. You can complete setting up your profile but cannot publish new job listings yet.</span>
          </div>
        )}

        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

      </div>
    </div>
  )
}