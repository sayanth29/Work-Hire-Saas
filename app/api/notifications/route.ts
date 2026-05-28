import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Notification from '@/models/Notification'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { id } = await req.json().catch(() => ({ id: null }))

    if (id) {
      // Mark specific notification as read
      await Notification.findOneAndUpdate(
        { _id: id, userId: session.user.id },
        { read: true }
      )
    } else {
      // Mark all as read
      await Notification.updateMany(
        { userId: session.user.id, read: false },
        { read: true }
      )
    }

    return NextResponse.json({ message: 'Notifications updated' })
  } catch (error) {
    console.error('Update notifications error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
