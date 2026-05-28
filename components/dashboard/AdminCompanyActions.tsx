// 📦 COMPONENT: Admin approve/reject company
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { CheckCircle2, Check, X } from 'lucide-react'

interface Props {
  companyId:    string
  isApproved:   boolean
  companyName:  string
  companyEmail: string
}

export default function AdminCompanyActions({
  companyId,
  isApproved,
  companyName,
  companyEmail,
}: Props) {
  const router  = useRouter()
  const [loading, setLoading]       = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason]         = useState('')

  async function approve() {
    setLoading(true)
    try {
      await axios.put(`/api/admin/companies/${companyId}`, {
        action: 'approve',
        companyName,
        companyEmail,
      })
      router.refresh()
    } catch {
      console.error('Failed to approve company')
    } finally {
      setLoading(false)
    }
  }

  async function reject() {
    if (!reason.trim()) return
    setLoading(true)
    try {
      await axios.put(`/api/admin/companies/${companyId}`, {
        action: 'reject',
        reason,
        companyName,
        companyEmail,
      })
      setShowReject(false)
      router.refresh()
    } catch {
      console.error('Failed to reject company')
    } finally {
      setLoading(false)
    }
  }

  if (isApproved) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approved
        </span>
        <button
          onClick={async () => {
            setLoading(true)
            await axios.put(`/api/admin/companies/${companyId}`, { action: 'revoke' })
            router.refresh()
            setLoading(false)
          }}
          disabled={loading}
          className="text-xs px-3.5 py-1.5 rounded-xl border border-slate-200 text-[#464555] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all duration-200 font-semibold disabled:opacity-60 cursor-pointer active:scale-[0.98]"
        >
          Revoke
        </button>
      </div>
    )
  }

  return (
    <div className="shrink-0">
      {!showReject ? (
        <div className="flex gap-2">
          <button
            onClick={approve}
            disabled={loading}
            className="text-xs px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 hover:shadow-sm active:scale-[0.98] transition-all disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                Approve
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowReject(true)}
            className="text-xs px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 font-bold hover:bg-rose-100 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Reject
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 max-w-[240px] md:max-w-xs animate-fade-in">
          <textarea
            rows={2.5}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Specify reason for rejection..."
            className="input-premium w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary resize-none placeholder:text-muted/50"
          />
          <div className="flex gap-2">
            <button
              onClick={reject}
              disabled={loading || !reason.trim()}
              className="text-xs px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1 transition-all disabled:opacity-60 cursor-pointer active:scale-[0.98]"
            >
              Confirm Reject
            </button>
            <button
              onClick={() => setShowReject(false)}
              className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 text-[#464555] hover:bg-slate-50 transition-all cursor-pointer font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
