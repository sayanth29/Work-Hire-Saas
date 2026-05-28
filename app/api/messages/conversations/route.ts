// 📡 API: Get all conversations
// 🌐 GET /api/messages/conversations

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Message from '@/models/Message'
import Application from '@/models/Application'
import User from '@/models/User'
import Company from '@/models/Company'
import mongoose from 'mongoose'

type ConversationItem = {
  applicationId: string
  userId: string
  lastMessage: string
  unread: number
  createdAt: Date
}

type PopulatedApplication = {
  jobId?: { title?: string }
  companyId?: { name?: string }
}

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
    const convMap = new Map<string, ConversationItem>()

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
        const conversation = convMap.get(appId)
        if (conversation) conversation.unread += 1
      }
    }

    // Check if query params specify a user & application to start/auto-open a new conversation
    const { searchParams } = new URL(req.url)
    const queryUserId = searchParams.get('userId')
    const queryAppId = searchParams.get('applicationId') || 'direct'

    if (
      queryUserId &&
      mongoose.Types.ObjectId.isValid(queryUserId) &&
      queryUserId !== session.user.id &&
      !convMap.has(queryAppId)
    ) {
      let canCreate = false
      if (queryAppId !== 'direct' && mongoose.Types.ObjectId.isValid(queryAppId)) {
        const app = await Application.findById(queryAppId).select('seekerId companyId').lean()
        if (app) {
          const company = await Company.findById(app.companyId).select('ownerId').lean()
          const seekerId = app.seekerId.toString()
          const recruiterId = company?.ownerId?.toString() || ''
          const me = session.user.id
          canCreate =
            (me === seekerId && queryUserId === recruiterId) ||
            (me === recruiterId && queryUserId === seekerId)
        }
      }

      if (canCreate) {
        convMap.set(queryAppId, {
          applicationId: queryAppId,
          userId:        queryUserId,
          lastMessage:   '',
          unread:        0,
          createdAt:     new Date(),
        })
      }
    }

    // Enrich with user + job info
    const conversations = await Promise.all(
      Array.from(convMap.values()).map(async conv => {
        const otherUser = await User.findById(conv.userId)
          .select('name avatar')
          .lean()

        let jobTitle    = ''
        let companyName = ''

        if (conv.applicationId !== 'direct') {
          const app = await Application.findById(conv.applicationId)
            .populate('jobId', 'title')
            .populate('companyId', 'name')
            .lean() as unknown as PopulatedApplication | null

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
