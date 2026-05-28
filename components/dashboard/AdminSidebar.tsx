// 📦 COMPONENT: Admin Sidebar
// 👤 WHO: Admin dashboard

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  DollarSign, 
  LogOut,
  Menu,
  X
} from 'lucide-react'

interface Props {
  user: { name?: string | null; email?: string | null }
}

const navItems = [
  { href: '/admin',           icon: LayoutDashboard, label: 'Overview'   },
  { href: '/admin/companies', icon: Building,        label: 'Companies'  },
  { href: '/admin/users',     icon: Users,           label: 'Users'      },
  { href: '/admin/revenue',   icon: DollarSign,      label: 'Revenue'    },
]

interface SidebarContentProps extends Props {
  pathname: string
  closeSidebar: () => void
}

function SidebarContent({ user, pathname, closeSidebar }: SidebarContentProps) {
  return (
    <>
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/10 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">WorkHire</span>
        </div>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">Platform Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href ||
            (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={closeSidebar}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
                ${active
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Icon className={`w-4.5 h-4.5 transition-colors duration-200
                ${active ? 'text-white' : 'text-white/40 group-hover:text-white'}`}
              />
              <span>{label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-5 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-white/40 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/50 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-200 group active:scale-[0.98] cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5 text-white/40 group-hover:text-rose-500 transition-colors" />
          Sign Out
        </button>
      </div>
    </>
  )
}

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      {/* Hamburger Toggle for Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4.5 left-4 z-50 md:hidden p-2 rounded-xl bg-slate-900 border border-white/10 shadow-sm text-white/50 hover:text-white transition-all duration-200 cursor-pointer"
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
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-[#0a1523] flex-col z-45 shadow-[4px_0_24px_rgba(0,0,0,0.015)]">
        <SidebarContent user={user} pathname={pathname} closeSidebar={closeSidebar} />
      </aside>

      {/* Mobile Drawer Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0a1523] flex flex-col z-50 shadow-2xl transition-transform duration-300 md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent user={user} pathname={pathname} closeSidebar={closeSidebar} />
      </aside>
    </>
  )
}
