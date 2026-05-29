'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Tab = 'jobseeker' | 'recruiter' | 'admin'

/* ── SVG icon components ─────────────────────────── */
function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

/* ── Branding panel stat cards ───────────────────── */
const stats = [
  { value: '50K+', label: 'Active Jobs', icon: '💼' },
  { value: '12K+', label: 'Companies', icon: '🏢' },
  { value: '98%',  label: 'Satisfaction', icon: '⭐' },
]

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('jobseeker')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError(result.error)
      return
    }

    if (tab === 'admin') router.push('/admin')
    else if (tab === 'recruiter') router.push('/company/dashboard')
    else router.push('/dashboard')
  }

  async function handleGoogle() {
    await signIn('google', {
      callbackUrl: tab === 'recruiter' ? '/company/dashboard' : '/dashboard',
    })
  }

  const tabConfig = {
    jobseeker: {
      title: 'Welcome back',
      subtitle: 'Sign in to discover opportunities matched to you.',
    },
    recruiter: {
      title: 'Recruiter access',
      subtitle: 'Manage your hiring pipeline and find top talent.',
    },
    admin: {
      title: 'Admin portal',
      subtitle: 'Restricted access — administrators only.',
    },
  }

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
                Your next career<br />
                move starts here.
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-md">
                Join thousands of professionals finding their dream roles with intelligent matching and seamless hiring.
              </p>
            </div>

            {/* Stat cards */}
            <div className="flex gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-4 flex-1"
                >
                  <div className="text-sm mb-1">{s.icon}</div>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
                </div>
              ))}
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
            href="/register"
            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Sign Up
          </Link>
        </nav>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-5 py-10 lg:px-12">
          <div className="w-full max-w-[440px] animate-slide-up">

            {/* Header */}
            <div className="mb-8">
              <h1
                className="text-3xl lg:text-[34px] font-bold text-foreground tracking-tight leading-tight"
              >
                {tabConfig[tab].title}
              </h1>
              <p className="text-muted text-[15px] mt-2 leading-relaxed">
                {tabConfig[tab].subtitle}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-[#f1f0fb] rounded-2xl p-1.5 mb-7">
              {(['jobseeker', 'recruiter', 'admin'] as Tab[]).map((t) => (
                <button
                  key={t}
                  id={`tab-${t}`}
                  onClick={() => { setTab(t); setError('') }}
                  className={`flex-1 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-300
                    ${tab === t
                      ? 'bg-white text-primary shadow-[0_2px_8px_rgba(79,70,229,0.12)]'
                      : 'text-muted hover:text-foreground'
                    }`}
                >
                  {t === 'jobseeker' ? 'Job Seeker' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
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

            {/* Google (show first for non-admin) */}
            {tab !== 'admin' && (
              <>
                <button
                  id="google-login-btn"
                  onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-border rounded-xl text-sm font-medium text-foreground hover:bg-surface hover:border-border-hover hover:shadow-sm transition-all duration-200 active:scale-[0.99]"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                <div className="flex items-center gap-4 my-6">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted font-medium uppercase tracking-wider">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              </>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-[13px] font-medium text-foreground">
                  Email address
                </label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors duration-200">
                    <MailIcon />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-premium w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="login-password" className="text-[13px] font-medium text-foreground">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[12px] font-medium text-primary hover:text-primary-dark transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors duration-200">
                    <LockIcon />
                  </span>
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-premium w-full pl-11 pr-12 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    suppressHydrationWarning
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

              {/* Submit */}
              <button
                id="login-submit-btn"
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
                  <>
                    Sign in
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Role switch hint */}
            {tab !== 'admin' && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted">
                  {tab === 'jobseeker' ? (
                    <>Hiring for your team?{' '}
                      <button
                        onClick={() => setTab('recruiter')}
                        className="font-semibold text-primary hover:text-primary-dark transition-colors"
                      >
                        Recruiter Login →
                      </button>
                    </>
                  ) : (
                    <>Looking for a job?{' '}
                      <button
                        onClick={() => setTab('jobseeker')}
                        className="font-semibold text-primary hover:text-primary-dark transition-colors"
                      >
                        Job Seeker Login →
                      </button>
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Sign up CTA */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-bold text-primary hover:text-primary-dark transition-colors">
                  Create free account
                </Link>
              </p>
            </div>

          </div>
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
