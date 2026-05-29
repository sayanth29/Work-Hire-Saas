'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    // Log the error to console or error reporting services
    console.error('WorkHire Application Error:', error)
  }, [error])

  return (
    <main className="min-h-[75vh] w-full flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full glass rounded-2xl p-8 premium-card text-center space-y-6">
        {/* Icon with Ambient Glow */}
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center rounded-2xl bg-error-bg text-color-error">
          <div className="absolute inset-0 rounded-2xl bg-error animate-pulse-glow opacity-10 blur-md" />
          <AlertTriangle className="w-8 h-8 relative z-10" />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-gradient-primary">
            Something went wrong
          </h1>
          <p className="text-sm text-color-muted leading-relaxed">
            An unexpected error occurred during rendering. If this persists, please contact support.
          </p>
        </div>

        {/* Error Message Panel */}
        <div className="bg-color-surface border border-color-border p-4 rounded-xl text-left space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-color-muted">
            Error Details
          </p>
          <p className="text-sm font-medium text-color-foreground break-words line-clamp-3">
            {error.message || 'Unknown runtime error'}
          </p>
          {error.digest && (
            <div className="pt-2 border-t border-color-border/60">
              <span className="text-[10px] font-mono text-color-muted bg-color-surface-elevated px-2 py-1 rounded border border-color-border">
                Digest: {error.digest}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => unstable_retry()}
            className="btn-premium-primary text-white text-sm font-semibold py-3 px-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
          
          <a
            href="/"
            className="btn-premium-secondary text-color-foreground text-sm font-semibold py-3 px-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-color-muted" />
            Go Home
          </a>
        </div>
      </div>
    </main>
  )
}
