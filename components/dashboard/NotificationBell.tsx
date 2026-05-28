'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, Check, ExternalLink } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

interface NotificationItem {
  _id: string
  type: string
  message: string
  read: boolean
  link?: string
  createdAt: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/notifications')
      setNotifications(data.notifications || [])
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => void fetchNotifications())
    // Poll every 30 seconds for live notifications
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  async function markAsRead(id: string) {
    try {
      await axios.put('/api/notifications', { id })
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      )
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  async function markAllAsRead() {
    try {
      await axios.put('/api/notifications')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer
          ${isOpen
            ? 'border-primary bg-primary/5 text-primary shadow-sm'
            : 'border-[#e2e8f0] bg-slate-50 text-[#777587] hover:text-primary hover:border-primary/20 hover:bg-primary/5'
          }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center shadow-md shadow-primary/20 border border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 max-h-[420px] bg-white border border-[#e2e8f0] rounded-2xl shadow-xl flex flex-col overflow-hidden z-50 transition-all duration-200">
          {/* Header */}
          <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-xs font-bold text-[#0b1c30]">Notifications</h3>
              <p className="text-[10px] text-[#777587] font-semibold mt-0.5">
                {unreadCount} unread
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] text-primary hover:text-primary-dark font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto max-h-[280px] divide-y divide-[#e2e8f0]/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[#777587]">
                <p className="text-2xl mb-1.5">🔔</p>
                <p className="text-[11px] font-bold">All caught up!</p>
                <p className="text-[10px] text-[#a0aec0] mt-0.5">You have no new notifications.</p>
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item._id}
                  className={`p-3.5 transition-colors flex gap-2.5 items-start
                    ${item.read ? 'bg-white hover:bg-slate-50/40' : 'bg-primary/[0.03] hover:bg-primary/[0.06]'}`}
                >
                  {/* Status dot */}
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.read ? 'bg-transparent' : 'bg-primary'}`} />

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#0b1c30] font-semibold leading-relaxed break-words">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] text-[#777587] font-bold">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={() => markAsRead(item._id)}
                          className="text-[9px] text-primary font-bold hover:underline flex items-center gap-0.5"
                        >
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
