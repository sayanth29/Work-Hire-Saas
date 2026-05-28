// 📄 LAYOUT: Job Seeker Dashboard
// 🌐 WRAPS: /dashboard/*
// 👤 WHO: Job Seekers only (protected by middleware)

import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import { redirect } from 'next/navigation'
import SeekerSidebar from '@/components/dashboard/SeekerSidebar'
import NotificationBell from '@/components/dashboard/NotificationBell'

export default async function SeekerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')
  if (session.user.role === 'admin') redirect('/admin')
  if (session.user.role === 'recruiter') redirect('/company/dashboard')
  if (session.user.role !== 'jobseeker') redirect('/login')

  return (
    <div className="min-h-screen bg-[#fafbff] flex font-sans selection:bg-primary/20 selection:text-primary">

      {/* Sidebar */}
      <SeekerSidebar user={session.user} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64 relative">

        {/* Sticky Top bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] pl-16 pr-6 md:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-foreground">
              Welcome back, <span className="text-gradient-primary">{session.user.name}</span> 👋
            </h1>
            <p className="text-[11px] font-semibold text-muted tracking-wide mt-0.5">Job Seeker Console</p>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            
            {/* Notification bell */}
            <NotificationBell />

            {/* User Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/10">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

      </div>
    </div>
  )
}