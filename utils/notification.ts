import connectDB from '@/lib/db'
import Notification from '@/models/Notification'
import { NotificationType } from '@/types'

export async function createNotification({
  userId,
  type,
  message,
  link,
}: {
  userId: string | any
  type: NotificationType
  message: string
  link?: string
}) {
  try {
    await connectDB()
    await Notification.create({
      userId,
      type,
      message,
      link,
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}
