// 📄 PAGE: Recruiter Messages
// 🌐 URL: /company/dashboard/messages
// 👤 WHO: Recruiters only

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Loader2, MessageSquare } from 'lucide-react'

interface Message {
  _id: string
  senderId: string
  content: string
  createdAt: string
}

interface Conversation {
  userId: string
  name: string
  applicationId: string
  jobTitle: string
  lastMessage: string
  unread: number
}

export default function RecruiterMessagesPage() {
  const searchParams         = useSearchParams()
  const defaultUserId        = searchParams.get('userId')
  const defaultApplicationId = searchParams.get('applicationId')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected]           = useState<Conversation | null>(null)
  const [messages, setMessages]           = useState<Message[]>([])
  const [newMessage, setNewMessage]       = useState('')
  const [loading, setLoading]             = useState(true)
  const [sending, setSending]             = useState(false)
  const [currentUserId, setCurrentUserId] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const openConversation = useCallback(async (conv: Conversation) => {
    setSelected(conv)
    try {
      const { data } = await axios.get(
        `/api/messages?userId=${conv.userId}&applicationId=${conv.applicationId}`
      )
      setMessages(data.messages || [])
    } catch {
      console.error('Failed to load messages')
    }
  }, [])

  const fetchConversations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (defaultUserId) params.set('userId', defaultUserId)
      if (defaultApplicationId) params.set('applicationId', defaultApplicationId)

      const url = `/api/messages/conversations${params.toString() ? `?${params.toString()}` : ''}`
      const { data } = await axios.get(url)
      setConversations(data.conversations || [])
      setCurrentUserId(data.currentUserId)

      // Auto open if userId param
      if (defaultUserId && data.conversations?.length) {
        const conv = data.conversations.find(
          (c: Conversation) =>
            c.userId === defaultUserId &&
            (!defaultApplicationId || c.applicationId === defaultApplicationId)
        )
        if (conv) openConversation(conv)
      }
    } catch {
      console.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [defaultApplicationId, defaultUserId, openConversation])

  useEffect(() => {
    queueMicrotask(() => void fetchConversations())
  }, [fetchConversations])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !selected) return
    setSending(true)
    try {
      const { data } = await axios.post('/api/messages', {
        receiverId:    selected.userId,
        applicationId: selected.applicationId,
        content:       newMessage.trim(),
      })
      setMessages(prev => [...prev, data.message])
      
      // Update last message in conversation list
      setConversations(prev =>
        prev.map(c =>
          c.applicationId === selected.applicationId
            ? { ...c, lastMessage: newMessage.trim() }
            : c
        )
      )
      setNewMessage('')
    } catch {
      console.error('Failed to send')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#3525cd] animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-140px)] flex gap-4">

      {/* Conversation list */}
      <div className="w-72 shrink-0 bg-white rounded-xl border border-[#c7c4d8] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#c7c4d8]">
          <h2 className="font-semibold text-[#0b1c30]">Candidate Messages</h2>
          <p className="text-xs text-[#777587]">{conversations.length} conversations</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-10 px-4">
              <MessageSquare className="w-8 h-8 text-[#c7c4d8] mb-2 mx-auto" />
              <p className="text-xs text-[#777587]">No messages yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.applicationId}
                onClick={() => openConversation(conv)}
                className={`w-full text-left p-4 border-b border-[#c7c4d8]/50 hover:bg-[#eff4ff] transition-colors
                  ${selected?.applicationId === conv.applicationId ? 'bg-[#e2dfff]' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#3525cd] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {conv.name?.charAt(0)}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#0b1c30] truncate">{conv.name}</p>
                      {conv.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#3525cd] text-white text-[10px] flex items-center justify-center shrink-0">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#777587] truncate">{conv.jobTitle}</p>
                    <p className="text-xs text-[#464555] truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-white rounded-xl border border-[#c7c4d8] flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-[#c7c4d8] mb-4 mx-auto" />
              <p className="text-sm font-semibold text-[#0b1c30]">Select a conversation</p>
              <p className="text-xs text-[#777587] mt-1">Click a candidate from the left</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-[#c7c4d8] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#3525cd] flex items-center justify-center text-white text-sm font-bold">
                {selected.name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-[#0b1c30] text-sm">{selected.name}</p>
                <p className="text-xs text-[#777587]">{selected.jobTitle}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isMe = msg.senderId === currentUserId
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm
                      ${isMe
                        ? 'bg-[#3525cd] text-white rounded-br-sm'
                        : 'bg-[#f8f9ff] text-[#0b1c30] border border-[#c7c4d8] rounded-bl-sm'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-[#777587]'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-[#c7c4d8] flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-[#f8f9ff] border border-[#c7c4d8] rounded-xl text-sm focus:outline-none focus:border-[#3525cd] transition-all"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-5 py-2.5 bg-[#3525cd] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {sending ? '...' : '→'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
