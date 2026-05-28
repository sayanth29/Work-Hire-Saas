// 📦 COMPONENT: Recruiter Sidebar
// 👤 WHO: Recruiters dashboard

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  MessageSquare, 
  CreditCard, 
  LogOut,
  Menu,
  X
} from 'lucide-react'

interface Props {
  user: {
    name?: string | null
    email?: string | null
  }
  company: {
    name: string
    subscription: { plan: string }
  }
}

const planColors: Record<string, string> = {
  free:       'bg-slate-100 text-slate-700 border-slate-200/50',
  pro:        'bg-amber-505/10 text-amber-600 border-amber-500/20',
  enterprise: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
}

const uniqueNavItems = [
  { href: '/company/dashboard',             icon: LayoutDashboard, label: 'Overview'    },
  { href: '/company/dashboard/jobs',        icon: Briefcase,       label: 'Jobs'        },
  { href: '/company/dashboard/applicants',  icon: Users,           label: 'Applicants'  },
  { href: '/company/dashboard/messages',    icon: MessageSquare,   label: 'Messages'    },
  { href: '/company/dashboard/billing',     icon: CreditCard,      label: 'Billing'     },
]

interface SidebarContentProps extends Props {
  pathname: string
  closeSidebar: () => void
}

function SidebarContent({ user, company, pathname, closeSidebar }: SidebarContentProps) {
  return (
    <>
      {/* Brand */}
      <div className="px-6 py-6 border-b border-[#e2e8f0] flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">WorkHire</span>
        </div>
        <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mt-1">Recruiter Portal</p>
      </div>

      {/* Company card */}
      <div className="px-4 py-4 border-b border-[#e2e8f0] bg-slate-50/50">
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
            {company.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-foreground truncate">{company.name}</p>
            <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider mt-0.5 ${planColors[company.subscription?.plan] || planColors.free}`}>
              {company.subscription?.plan || 'free'} plan
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {uniqueNavItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href ||
            (href !== '/company/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={closeSidebar}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
                ${active
                  ? 'bg-primary/5 text-primary shadow-[inset_0_0_0_1px_rgba(79,70,229,0.05)]'
                  : 'text-[#464555] hover:bg-slate-50 hover:text-foreground'
                }`}
            >
              <Icon className={`w-4.5 h-4.5 transition-colors duration-200
                ${active ? 'text-primary' : 'text-muted group-hover:text-foreground'}`}
              />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-5 border-t border-[#e2e8f0] space-y-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/10 shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
            <p className="text-[11px] text-muted truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#64748b] hover:bg-[#fef2f2] hover:text-[#ef4444] transition-all duration-200 group active:scale-[0.98]"
        >
          <LogOut className="w-4.5 h-4.5 text-[#64748b] group-hover:text-[#ef4444] transition-colors" />
          Sign Out
        </button>
      </div>
    </>
  )
}

export default function RecruiterSidebar({ user, company }: Props) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      {/* Hamburger Toggle for Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4.5 left-4 z-50 md:hidden p-2 rounded-xl bg-white border border-border shadow-sm text-muted hover:text-primary hover:border-primary/20 transition-all duration-200 cursor-pointer"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-[#e2e8f0] flex-col z-45 shadow-[4px_0_24px_rgba(0,0,0,0.015)]">
        <SidebarContent user={user} company={company} pathname={pathname} closeSidebar={closeSidebar} />
      </aside>

      {/* Mobile Drawer Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-[#e2e8f0] flex flex-col z-50 shadow-2xl transition-transform duration-300 md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent user={user} company={company} pathname={pathname} closeSidebar={closeSidebar} />
      </aside>
    </>
  )
}
