'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

type Role = 'jobseeker' | 'recruiter'

/* ── SVG icon components ─────────────────────────── */
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  )
}

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

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" /><path d="M16 6h.01" />
      <path d="M8 10h.01" /><path d="M16 10h.01" />
      <path d="M8 14h.01" /><path d="M16 14h.01" />
    </svg>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
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

/* ── Benefits list ───────────────────────────────── */
const benefits = [
  { title: 'AI-Powered Matching', desc: 'Smart algorithms find the perfect fit for every role.' },
  { title: 'Instant Applications', desc: 'One-click apply with your saved profile and resume.' },
  { title: 'Real-time Messaging', desc: 'Chat directly with recruiters and candidates.' },
  { title: 'Analytics Dashboard', desc: 'Track performance with detailed insights and metrics.' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('jobseeker')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [companyLocation, setCompanyLocation] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const payload: Record<string, string> = { name, email, password, role }
      if (role === 'recruiter') {
        payload.companyName = companyName
        payload.companyLocation = companyLocation
        payload.industry = industry
      }

      const { data } = await axios.post('/api/auth/register', payload)
      setSuccess(data.message)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left: Branding panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden">
        {/* Animated gradient */}
        <div
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 25%, #06b6d4 50%, #2563eb 75%, #7c3aed 100%)',
            backgroundSize: '300% 300%',
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23fff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating orbs */}
        <div className="absolute top-16 right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-24 left-12 w-52 h-52 bg-purple-300/15 rounded-full blur-3xl animate-float" />

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
              <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
                Build your future<br />
                with WorkHire.
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-md">
                Whether you&apos;re hiring or looking — get started in under 2 minutes.
              </p>
            </div>

            {/* Benefits list */}
            <div className="space-y-4">
              {benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{b.title}</p>
                    <p className="text-white/55 text-xs mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              {['#f59e0b', '#3b82f6', '#10b981', '#ef4444'].map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: c }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-white/70 text-sm">
              <span className="font-semibold text-white">2,500+</span> joined this month
            </p>
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
        <div className="flex-1 flex items-center justify-center px-5 py-8 lg:px-12">
          <div className="w-full max-w-[440px] animate-slide-up">

            {/* Header */}
            <div className="mb-7">
              <h1 className="text-3xl lg:text-[34px] font-bold text-foreground tracking-tight leading-tight">
                Create your account
              </h1>
              <p className="text-muted text-[15px] mt-2 leading-relaxed">
                {role === 'jobseeker'
                  ? 'Start your job search journey today.'
                  : 'Set up your company and start hiring.'}
              </p>
            </div>

            {/* Role switcher */}
            <div className="flex bg-[#f1f0fb] rounded-2xl p-1.5 mb-7">
              {(['jobseeker', 'recruiter'] as Role[]).map((r) => (
                <button
                  key={r}
                  id={`role-${r}`}
                  onClick={() => { setRole(r); setError(''); setSuccess('') }}
                  className={`flex-1 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-300
                    ${role === r
                      ? 'bg-white text-primary shadow-[0_2px_8px_rgba(79,70,229,0.12)]'
                      : 'text-muted hover:text-foreground'
                    }`}
                >
                  {r === 'jobseeker' ? 'Job Seeker' : 'Recruiter'}
                </button>
              ))}
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-error-bg border border-error/15 text-error text-sm flex items-center gap-2 animate-fade-in">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                {error}
              </div>
            )}
            {success && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-success-bg border border-success/15 text-success text-sm flex items-center gap-2 animate-fade-in">
                <CheckIcon className="w-4 h-4" />
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="reg-name" className="text-[13px] font-medium text-foreground">Full Name</label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors duration-200">
                    <UserIcon />
                  </span>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input-premium w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="text-[13px] font-medium text-foreground">Email</label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors duration-200">
                    <MailIcon />
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-premium w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="text-[13px] font-medium text-foreground">Password</label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors duration-200">
                    <LockIcon />
                  </span>
                  <input
                    id="reg-password"
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-premium w-full pl-11 pr-12 py-3 bg-white border border-border rounded-xl text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                  >
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="flex gap-1.5 mt-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          password.length >= i * 3
                            ? password.length >= 12 ? 'bg-emerald-500' : password.length >= 8 ? 'bg-amber-500' : 'bg-red-400'
                            : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Recruiter-only fields */}
              {role === 'recruiter' && (
                <div className="space-y-4 pt-2 border-t border-border animate-fade-in">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider pt-2">Company details</p>

                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-company" className="text-[13px] font-medium text-foreground">Company Name</label>
                    <div className="relative group">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors duration-200">
                        <BuildingIcon />
                      </span>
                      <input
                        id="reg-company"
                        type="text"
                        required
                        placeholder="Acme Inc."
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        className="input-premium w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </div>

                  {/* Location + Industry row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="reg-location" className="text-[13px] font-medium text-foreground">Location</label>
                      <div className="relative group">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors duration-200">
                          <MapPinIcon className="w-4 h-4" />
                        </span>
                        <input
                          id="reg-location"
                          type="text"
                          placeholder="Mumbai"
                          value={companyLocation}
                          onChange={e => setCompanyLocation(e.target.value)}
                          className="input-premium w-full pl-10 pr-3 py-3 bg-white border border-border rounded-xl text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="reg-industry" className="text-[13px] font-medium text-foreground">Industry</label>
                      <select
                        id="reg-industry"
                        value={industry}
                        onChange={e => setIndustry(e.target.value)}
                        className="input-premium w-full px-3 py-3 bg-white border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer"
                      >
                        <option value="">Select…</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="E-Commerce">E-Commerce</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms */}
              <p className="text-[11px] text-muted leading-relaxed pt-1">
                By creating an account, you agree to our{' '}
                <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and{' '}
                <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>

              {/* Submit */}
              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading || !!success}
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
                    {role === 'recruiter' ? 'Register Company' : 'Create Account'}
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider + Google */}
            <div className="flex items-center gap-4 my-6">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted font-medium uppercase tracking-wider">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              id="google-register-btn"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-border rounded-xl text-sm font-medium text-foreground hover:bg-surface hover:border-border-hover hover:shadow-sm transition-all duration-200 active:scale-[0.99]"
            >
              <GoogleIcon />
              Sign up with Google
            </button>

            {/* Login link */}
            <div className="mt-7 pt-5 border-t border-border text-center">
              <p className="text-sm text-muted">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-primary hover:text-primary-dark transition-colors">
                  Sign in
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
