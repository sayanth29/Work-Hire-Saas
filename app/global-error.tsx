'use client'

import { useEffect } from 'react'
import { AlertOctagon, RotateCcw } from 'lucide-react'
import './globals.css'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('WorkHire Global Critical Error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="font-sans min-h-screen bg-color-background text-color-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full glass rounded-2xl p-8 premium-card text-center space-y-6 animate-slide-up">
          {/* Icon with Critical Ambient Glow */}
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center rounded-2xl bg-error-bg text-color-error">
            <div className="absolute inset-0 rounded-2xl bg-error animate-pulse-glow opacity-10 blur-md" />
            <AlertOctagon className="w-8 h-8 relative z-10" />
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gradient-primary">
              Critical Error
            </h1>
            <p className="text-sm text-color-muted leading-relaxed">
              A critical application crash occurred. The system could not load the core layout.
            </p>
          </div>

          {/* Error Message Panel */}
          <div className="bg-color-surface border border-color-border p-4 rounded-xl text-left space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-color-muted">
              System Message
            </p>
            <p className="text-sm font-medium text-color-foreground break-words line-clamp-3">
              {error.message || 'Fatal hydration or root layout error'}
            </p>
            {error.digest && (
              <div className="pt-2 border-t border-color-border/60">
                <span className="text-[10px] font-mono text-color-muted bg-color-surface-elevated px-2 py-1 rounded border border-color-border">
                  Digest ID: {error.digest}
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={() => unstable_retry()}
              className="w-full btn-premium-primary text-white text-sm font-semibold py-3 px-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
