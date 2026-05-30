'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import { Briefcase, Building2, Star } from 'lucide-react'

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  )
}

const stats = [
  { value: '50K+', label: 'Active Jobs', icon: Briefcase, color: 'text-indigo-200' },
  { value: '12K+', label: 'Companies', icon: Building2, color: 'text-cyan-200' },
  { value: '98%',  label: 'Satisfaction', icon: Star, color: 'text-amber-200' },
]

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!token) {
      setError('Invalid or missing reset token.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { data } = await axios.post('/api/auth/reset-password', { token, password })
      setMessage(data.message)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[440px] animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-[34px] font-bold text-foreground tracking-tight leading-tight">
          Reset password
        </h1>
        <p className="text-muted text-[15px] mt-2 leading-relaxed">
          Create a secure, new password for your account.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-error-bg border border-error/15 text-error text-sm flex items-center gap-2 animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Success message */}
      {message && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-500/15 text-emerald-700 text-sm flex items-center gap-2 animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {message} Redirecting to login...
        </div>
      )}

      {!token && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-500/15 text-amber-700 text-sm flex items-center gap-2 animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Invalid or expired password reset link. Please request a new link.
        </div>
      )}

      {/* Form */}
      {!message && token && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="new-password" className="text-[13px] font-medium text-foreground">
              New Password
            </label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors duration-200">
                <LockIcon />
              </span>
              <input
                id="new-password"
                type={showPass ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-premium w-full pl-11 pr-12 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-[13px] font-medium text-foreground">
              Confirm Password
            </label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors duration-200">
                <LockIcon />
              </span>
              <input
                id="confirm-password"
                type={showConfirmPass ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="input-premium w-full pl-11 pr-12 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showConfirmPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="reset-submit-btn"
            type="submit"
            disabled={loading}
            className="group w-full bg-primary text-white py-3 rounded-xl font-semibold text-sm
              hover:bg-primary-dark active:scale-[0.98] transition-all duration-200
              shadow-[0_4px_14px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.35)]
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>
      )}

      {/* Back to Login link */}
      <div className="mt-8 pt-6 border-t border-border text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* ── Left: Branding panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 25%, #2563eb 50%, #06b6d4 75%, #4f46e5 100%)',
            backgroundSize: '300% 300%',
          }}
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating orbs */}
        <div className="absolute top-20 left-12 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-8 w-56 h-56 bg-cyan-300/15 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl animate-pulse-glow" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
          {/* Logo */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">WorkHire</span>
            </Link>
          </div>

          {/* Hero text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                AI-Powered Hiring Platform
              </div>
              <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
                Securely reset your<br />
                account password.
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-md">
                We'll email you a secure link to reset your password and get back into your account.
              </p>
            </div>

            {/* Stat cards */}
            <div className="flex gap-4">
              {stats.map((s) => {
                const Icon = s.icon
                return (
                  <div
                    key={s.label}
                    className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-4 flex-1 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02]"
                  >
                    <div className={`${s.color} mb-2`}>
                      <Icon className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5">
            <p className="text-white/85 text-sm leading-relaxed italic">
              &ldquo;WorkHire matched me with my dream role in just 2 weeks. The AI recommendations were spot on.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                P
              </div>
              <div>
                <p className="text-white text-sm font-medium">Priya Sharma</p>
                <p className="text-white/50 text-xs">Software Engineer at Google</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ──────────────────────── */}
      <div className="flex-1 flex flex-col bg-[#fafbff]">
        {/* Mobile header */}
        <nav className="lg:hidden flex justify-between items-center px-5 py-4 border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">WorkHire</span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Sign In
          </Link>
        </nav>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-5 py-10 lg:px-12">
          <Suspense fallback={
            <div className="flex items-center justify-center w-full">
              <svg className="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>

        {/* Footer */}
        <footer className="border-t border-border bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center px-5 lg:px-12 py-4 gap-2">
            <span className="text-xs text-muted">© 2026 WorkHire. All rights reserved.</span>
            <div className="flex gap-5">
              {['Privacy', 'Terms', 'Help'].map(l => (
                <span key={l} className="text-xs text-muted hover:text-primary cursor-pointer transition-colors">{l}</span>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
