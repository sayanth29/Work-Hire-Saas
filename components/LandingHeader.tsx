// 📦 COMPONENT: Landing Page Header
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function LandingHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-4 z-50 max-w-7xl mx-auto w-[92%] glass rounded-2xl border border-white/40 shadow-sm transition-all duration-300">
      <div className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
            <span className="text-white font-bold text-base">W</span>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">WorkHire</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/jobs" className="text-sm font-semibold text-muted hover:text-primary transition-colors">
            Browse Jobs
          </Link>
          <Link href="/register?type=recruiter" className="text-sm font-semibold text-muted hover:text-primary transition-colors">
            For Companies
          </Link>
          <Link href="/login" className="text-sm font-semibold text-muted hover:text-primary transition-colors">
            Login
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link 
            href="/register" 
            className="btn-premium-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          >
            Sign Up Free
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="md:hidden p-2 rounded-xl text-muted hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-6 pb-6 pt-2 border-t border-slate-100/50 flex flex-col gap-4 animate-fade-in bg-white/95 rounded-b-2xl">
          <Link 
            href="/jobs" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-semibold text-muted hover:text-primary transition-colors py-1"
          >
            Browse Jobs
          </Link>
          <Link 
            href="/register?type=recruiter" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-semibold text-muted hover:text-primary transition-colors py-1"
          >
            For Companies
          </Link>
          <Link 
            href="/login" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-semibold text-muted hover:text-primary transition-colors py-1"
          >
            Login
          </Link>
          <div className="h-px bg-slate-100 w-full my-1" />
          <div className="flex flex-col gap-2.5">
            <Link 
              href="/register" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-premium-primary w-full py-2.5 rounded-xl text-center text-sm font-semibold text-white transition-all"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
