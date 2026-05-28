// 📄 LAYOUT: Admin Dashboard
// 🌐 WRAPS: /admin/*
// 👤 WHO: Admin only

import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/dashboard/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')
  if (session.user.role === 'jobseeker') redirect('/dashboard')
  if (session.user.role === 'recruiter') redirect('/company/dashboard')
  if (session.user.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-[#fafbff] flex font-sans selection:bg-primary/20 selection:text-primary">
      <AdminSidebar user={session.user} />

      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64 relative">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] pl-16 pr-6 md:px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground">
                Admin Panel
              </h1>
              <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Restricted
              </span>
            </div>
            <p className="text-[10px] text-muted font-bold tracking-wide mt-0.5 uppercase">Platform Management Console</p>
          </div>
          
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-rose-500/10">
            {session.user.name?.charAt(0).toUpperCase()}
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