'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function VerifyEmailContent() {
  const params  = useSearchParams()
  const success = params.get('success') === 'true'
  const type    = params.get('type')     // 'user' | 'company'
  const error   = params.get('error')    // 'invalid' | 'expired' | 'server'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafbff] px-5 py-16">
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <span className="text-2xl font-bold text-foreground tracking-tight">WorkHire</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 sm:p-10 text-center">

          {success ? (
            <>
              {/* Success */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Email verified!</h1>
              <p className="text-muted text-sm leading-relaxed mb-8">
                {type === 'company' ? (
                  <>Your company email has been verified. Our team will review your account within <strong>24–48 hours</strong>.</>
                ) : (
                  <>Your account is ready. You can now sign in and start exploring opportunities.</>
                )}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-[0_4px_14px_rgba(79,70,229,0.25)]"
              >
                Go to Login
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </>
          ) : error ? (
            <>
              {/* Error */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" x2="9" y1="9" y2="15" />
                  <line x1="9" x2="15" y1="9" y2="15" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {error === 'expired' ? 'Link expired' : error === 'server' ? 'Server error' : 'Invalid link'}
              </h1>
              <p className="text-muted text-sm leading-relaxed mb-8">
                {error === 'expired'
                  ? 'This verification link has expired. Please request a new one.'
                  : error === 'server'
                    ? 'Something went wrong on our end. Please try again later.'
                    : 'This verification link is invalid or has already been used.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-white border border-border text-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-surface hover:border-border-hover transition-all"
                >
                  Back to Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-[0_4px_14px_rgba(79,70,229,0.25)]"
                >
                  Register Again
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Pending / default state */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-50 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
              <p className="text-muted text-sm leading-relaxed mb-8">
                We&apos;ve sent a verification link to your email address. Click the link to activate your account.
                <br /><br />
                <span className="text-xs text-muted/70">
                  Didn&apos;t receive it? Check your spam folder or wait a minute and try again.
                </span>
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:text-primary-dark transition-colors"
              >
                ← Back to Login
              </Link>
            </>
          )}

        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-muted mt-8">
          © 2026 WorkHire. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafbff]">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
