import mongoose, { Schema, Document, Model } from 'mongoose'
import { NotificationType } from '@/types'

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId
  type: NotificationType
  message: string
  read: boolean
  link?: string
  createdAt: Date
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type:    { type: String, enum: ['application_received','status_changed','interview_scheduled','message_received','company_approved','company_rejected','payment_success','payment_failed'] },
    message: { type: String, required: true },
    read:    { type: Boolean, default: false },
    link:    String,
  },
  { timestamps: true }
)

const Notification: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>('Notification', NotificationSchema)

export default Notification