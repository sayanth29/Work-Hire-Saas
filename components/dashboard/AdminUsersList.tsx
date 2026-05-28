// 📦 COMPONENT: Admin Users List Console
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { 
  Search, 
  Trash2, 
  ShieldAlert, 
  User, 
  Briefcase, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Clock
} from 'lucide-react'

interface UserItem {
  _id: string
  name: string
  email: string
  role: string
  isEmailVerified: boolean
  createdAt: string | Date
}

interface Props {
  initialUsers: UserItem[]
  currentUserId: string
}

export default function AdminUsersList({ initialUsers, currentUserId }: Props) {
  const router = useRouter()
  const [users, setUsers] = useState<UserItem[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'jobseeker' | 'recruiter' | 'admin'>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) || 
      user.email.toLowerCase().includes(search.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  // Delete handler
  async function handleDelete(userId: string) {
    setDeletingId(userId)
    try {
      await axios.delete(`/api/admin/users/${userId}`)
      setUsers(prev => prev.filter(u => u._id !== userId))
      setConfirmDeleteId(null)
      router.refresh()
    } catch (err) {
      console.error('Failed to delete user:', err)
      alert('Error deleting user')
    } finally {
      setDeletingId(null)
    }
  }

  const roleStyles: Record<string, { bg: string; text: string; border: string; label: string; icon: any }> = {
    admin: { 
      bg: 'bg-rose-500/10', 
      text: 'text-rose-600', 
      border: 'border-rose-500/20', 
      label: 'Admin',
      icon: Shield
    },
    recruiter: { 
      bg: 'bg-primary/10', 
      text: 'text-primary', 
      border: 'border-primary/20', 
      label: 'Recruiter',
      icon: Briefcase
    },
    jobseeker: { 
      bg: 'bg-emerald-500/10', 
      text: 'text-emerald-600', 
      border: 'border-emerald-500/20', 
      label: 'Job Seeker',
      icon: User
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-xs">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-premium w-full pl-10 pr-4 py-2.5 rounded-xl text-xs placeholder:text-muted/50 focus:outline-none"
          />
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['all', 'jobseeker', 'recruiter', 'admin'] as const).map(role => {
            const active = roleFilter === role
            return (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`text-[10px] font-extrabold px-3.5 py-2 rounded-xl border uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0
                  ${active
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-slate-50 border-slate-100 text-[#464555] hover:bg-slate-100'
                  }`}
              >
                {role === 'all' ? 'All Users' : role === 'jobseeker' ? 'Job Seekers' : role === 'recruiter' ? 'Recruiters' : 'Admins'}
              </button>
            )
          })}
        </div>

      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => {
          const isSelf = user._id === currentUserId
          const style = roleStyles[user.role] || roleStyles.jobseeker
          const Icon = style.icon
          const isConfirmed = confirmDeleteId === user._id

          return (
            <div 
              key={user._id} 
              className={`premium-card p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(79,70,229,0.02)]
                ${isConfirmed ? 'border-rose-300 bg-rose-50/10' : ''}`}
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center text-current`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${style.bg} ${style.text} ${style.border}`}>
                        {style.label}
                      </span>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider
                    ${user.isEmailVerified
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                    {user.isEmailVerified ? (
                      <>
                        <CheckCircle className="w-2.5 h-2.5" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock className="w-2.5 h-2.5" />
                        Pending
                      </>
                    )}
                  </span>
                </div>

                {/* Name & Email */}
                <div>
                  <h3 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {user.name}
                  </h3>
                  <p className="text-[10px] text-muted truncate mt-0.5">{user.email}</p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-4 pt-3.5 border-t border-slate-100/50 flex justify-between items-center text-[10px] text-muted font-bold">
                <span>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>

                {isSelf ? (
                  <span className="text-[9px] uppercase tracking-wider text-rose-500 font-extrabold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                    Logged In
                  </span>
                ) : isConfirmed ? (
                  <div className="flex gap-1.5 items-center">
                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={deletingId === user._id}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {deletingId === user._id ? 'Deleting...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[#464555] font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(user._id)}
                    className="p-1.5 rounded-lg text-muted/60 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="premium-card p-12 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-muted/40 mb-3" />
          <p className="text-sm font-bold text-foreground">No users found</p>
          <p className="text-xs text-muted mt-1">Try adjusting your search criteria or role filters</p>
        </div>
      )}
    </div>
  )
}
