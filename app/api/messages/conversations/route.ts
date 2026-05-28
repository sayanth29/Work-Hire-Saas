// 📡 API: Get all conversations
// 🌐 GET /api/messages/conversations

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Message from '@/models/Message'
import Application from '@/models/Application'
import User from '@/models/User'
import Job from '@/models/Job'
import Company from '@/models/Company'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Get all messages involving this user
    const messages = await Message.find({
      $or: [
        { senderId:   session.user.id },
        { receiverId: session.user.id },
      ],
    })
    .sort({ createdAt: -1 })
    .lean()

    // Group by applicationId
    const convMap = new Map<string, any>()

    for (const msg of messages) {
      const appId    = msg.applicationId?.toString() || 'direct'
      const otherUserId = msg.senderId.toString() === session.user.id
        ? msg.receiverId.toString()
        : msg.senderId.toString()

      if (!convMap.has(appId)) {
        convMap.set(appId, {
          applicationId: appId,
          userId:        otherUserId,
          lastMessage:   msg.content,
          unread:        0,
          createdAt:     msg.createdAt,
        })
      }

      // Count unread
      if (
        msg.receiverId.toString() === session.user.id &&
        !msg.read
      ) {
        convMap.get(appId).unread++
      }
    }

    // Check if query params specify a user & application to start/auto-open a new conversation
    const { searchParams } = new URL(req.url)
    const queryUserId = searchParams.get('userId')
    const queryAppId = searchParams.get('applicationId') || 'direct'

    if (queryUserId && queryUserId !== session.user.id && !convMap.has(queryAppId)) {
      convMap.set(queryAppId, {
        applicationId: queryAppId,
        userId:        queryUserId,
        lastMessage:   '',
        unread:        0,
        createdAt:     new Date(),
      })
    }

    // Enrich with user + job info
    const conversations = await Promise.all(
      Array.from(convMap.values()).map(async conv => {
        const otherUser = await User.findById(conv.userId)
          .select('name avatar')
          .lean() as any

        let jobTitle    = ''
        let companyName = ''

        if (conv.applicationId !== 'direct') {
          const app = await Application.findById(conv.applicationId)
            .populate('jobId', 'title')
            .populate('companyId', 'name')
            .lean() as any

          jobTitle    = app?.jobId?.title    || ''
          companyName = app?.companyId?.name || ''
        }

        return {
          ...conv,
          name:        otherUser?.name || 'Unknown',
          avatar:      otherUser?.avatar || '',
          jobTitle,
          companyName,
        }
      })
    )

    return NextResponse.json({
      conversations,
      currentUserId: session.user.id,
    })

  } catch (error) {
    console.error('Conversations error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}