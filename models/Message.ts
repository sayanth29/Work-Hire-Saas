import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMessageDocument extends Document {
  senderId: mongoose.Types.ObjectId
  receiverId: mongoose.Types.ObjectId
  applicationId?: mongoose.Types.ObjectId
  content: string
  read: boolean
  createdAt: Date
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    senderId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application' },
    content:       { type: String, required: true },
    read:          { type: Boolean, default: false },
  },
  { timestamps: true }
)

const Message: Model<IMessageDocument> =
  mongoose.models.Message ||
  mongoose.model<IMessageDocument>('Message', MessageSchema)

export default Message