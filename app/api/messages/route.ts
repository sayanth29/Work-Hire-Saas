// 📡 API: Get + Send messages
// 🌐 GET  /api/messages
// 🌐 POST /api/messages

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Message from '@/models/Message'
import { createNotification } from '@/utils/notification'

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

    if (!otherUserId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
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
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { receiverId, applicationId, content } = await req.json()

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'Receiver and content required' },
        { status: 400 }
      )
    }

    const message = await Message.create({
      senderId: session.user.id,
      receiverId,
      applicationId,
      content,
    })

    // Trigger notification for the receiver
    const link = session.user.role === 'jobseeker'
      ? `/company/dashboard/messages?userId=${session.user.id}&applicationId=${applicationId || ''}`
      : `/dashboard/messages`

    await createNotification({
      userId:  receiverId,
      type:    'message_received',
      message: `New message from ${session.user.name}: "${content.length > 40 ? content.slice(0, 37) + '...' : content}"`,
      link,
    })

    return NextResponse.json({ message }, { status: 201 })

  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}