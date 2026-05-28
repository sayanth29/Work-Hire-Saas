// 📡 API: Get + Send messages
// 🌐 GET  /api/messages
// 🌐 POST /api/messages

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Message from '@/models/Message'
import Application from '@/models/Application'
import Company from '@/models/Company'
import { createNotification } from '@/utils/notification'
import mongoose from 'mongoose'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const otherUserId   = searchParams.get('userId')
    const applicationId = searchParams.get('applicationId')

    if (!otherUserId || !mongoose.Types.ObjectId.isValid(otherUserId)) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }
    if (applicationId && !mongoose.Types.ObjectId.isValid(applicationId)) {
      return NextResponse.json({ error: 'Invalid applicationId' }, { status: 400 })
    }

    const messages = await Message.find({
      $or: [
        { senderId: session.user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: session.user.id },
      ],
      ...(applicationId && { applicationId }),
    })
    .sort({ createdAt: 1 })
    .lean()

    // Mark as read
    await Message.updateMany(
      { senderId: otherUserId, receiverId: session.user.id, read: false },
      { read: true }
    )

    return NextResponse.json({ messages })

  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers)
    const limit = checkRateLimit(`msg-send:${ip}`, 60, 60_000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many messages sent. Please slow down.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { receiverId, applicationId, content } = await req.json()

    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId) || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Receiver and content required' },
        { status: 400 }
      )
    }
    const trimmedContent = content.trim()
    if (!trimmedContent) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 })
    }
    if (trimmedContent.length > 2000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }
    if (applicationId && !mongoose.Types.ObjectId.isValid(applicationId)) {
      return NextResponse.json({ error: 'Invalid applicationId' }, { status: 400 })
    }

    // If conversation is tied to an application, enforce participant authorization.
    if (applicationId) {
      const app = await Application.findById(applicationId).select('seekerId companyId')
      if (!app) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 })
      }
      const company = await Company.findById(app.companyId).select('ownerId')
      if (!company?.ownerId) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 })
      }
      const me = session.user.id
      const receiver = receiverId
      const seekerId = app.seekerId.toString()
      const recruiterId = company.ownerId.toString()
      const senderAllowed = me === seekerId || me === recruiterId
      const receiverAllowed = receiver === seekerId || receiver === recruiterId
      if (!senderAllowed || !receiverAllowed || me === receiver) {
        return NextResponse.json({ error: 'Unauthorized conversation' }, { status: 403 })
      }
    }

    const message = await Message.create({
      senderId: session.user.id,
      receiverId,
      applicationId,
      content: trimmedContent,
    })

    // Trigger notification for the receiver
    const link = session.user.role === 'jobseeker'
      ? `/company/dashboard/messages?userId=${session.user.id}&applicationId=${applicationId || ''}`
      : `/dashboard/messages`

    await createNotification({
      userId:  receiverId,
      type:    'message_received',
      message: `New message from ${session.user.name}: "${trimmedContent.length > 40 ? trimmedContent.slice(0, 37) + '...' : trimmedContent}"`,
      link,
    })

    return NextResponse.json({ message }, { status: 201 })

  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
