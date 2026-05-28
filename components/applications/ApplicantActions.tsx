// 📦 COMPONENT: Applicant status update + message button
// Client component (needs interactivity)

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Props {
  applicationId: string
  currentStatus: string
  seekerId?: string
  seekerName?: string
}

const statuses = ['applied', 'reviewed', 'interview', 'hired', 'rejected']

export default function ApplicantActions({
  applicationId,
  currentStatus,
  seekerId,
  seekerName,
}: Props) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)

  async function updateStatus(status: string) {
    setUpdating(true)
    try {
      await axios.put(`/api/applications/${applicationId}`, { status })
      router.refresh()
    } catch {
      console.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Status dropdown */}
      <select
        value={currentStatus}
        onChange={e => updateStatus(e.target.value)}
        disabled={updating}
        className="text-xs px-2 py-1.5 rounded-xl border border-[#c7c4d8] bg-white text-[#464555] focus:outline-none focus:border-[#3525cd] disabled:opacity-60 cursor-pointer"
      >
        {statuses.map(s => (
          <option key={s} value={s} className="capitalize">{s}</option>
        ))}
      </select>

      {/* Message button */}
      {seekerId && (
        <a
          href={`/company/dashboard/messages?userId=${seekerId}&applicationId=${applicationId}`}
          className="text-xs px-3 py-1.5 rounded-xl border border-[#c7c4d8] text-[#464555] font-semibold hover:bg-[#eff4ff] hover:text-[#3525cd] transition-all"
        >
          💬 Message
        </a>
      )}
    </div>
  )
}