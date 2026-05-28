// 📦 COMPONENT: Contact Form
'use client'

import { useState } from 'react'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setLoading(true)
    
    // Simulate API call for premium UI experience
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess(true)
      setForm({ name: '', email: '', message: '' })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="premium-card p-8 rounded-3xl text-center space-y-4 animate-fade-in border-emerald-200 bg-emerald-50/10">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-foreground text-lg">Message Sent!</h3>
        <p className="text-xs text-muted leading-relaxed max-w-xs mx-auto">
          Thank you for reaching out to WorkHire. Our team will review your message and reply via email within 24 hours.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card p-6 md:p-8 rounded-3xl space-y-5 bg-white hover:shadow-[0_8px_30px_rgba(79,70,229,0.02)] transition-shadow">
      <h3 className="text-base font-extrabold text-foreground tracking-tight">Send Us a Message</h3>
      
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-[#464555] uppercase tracking-wider ml-1">Full Name</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. John Doe"
          className="input-premium w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none placeholder:text-muted/40 font-semibold"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-[#464555] uppercase tracking-wider ml-1">Email Address</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="e.g. john@example.com"
          className="input-premium w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none placeholder:text-muted/40 font-semibold"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-[#464555] uppercase tracking-wider ml-1">Your Message</label>
        <textarea
          rows={4}
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          placeholder="How can we help you? Describe your question or request..."
          className="input-premium w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none placeholder:text-muted/40 resize-none font-semibold"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-premium-primary w-full py-3.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
      >
        {loading ? (
          <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            Send Message
          </>
        )}
      </button>
    </form>
  )
}
