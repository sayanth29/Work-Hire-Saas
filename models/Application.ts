import mongoose, { Schema, Document, Model } from 'mongoose'
import { ApplicationStatus } from '@/types'

export interface IApplicationDocument extends Document {
  jobId: mongoose.Types.ObjectId
  seekerId: mongoose.Types.ObjectId
  companyId: mongoose.Types.ObjectId
  resume: string
  coverLetter?: string
  status: ApplicationStatus
  note?: string
  createdAt: Date
  updatedAt: Date
}

const ApplicationSchema = new Schema<IApplicationDocument>(
  {
    jobId:       { type: Schema.Types.ObjectId, ref: 'Job',     required: true },
    seekerId:    { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    companyId:   { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    resume:      { type: String, required: true },
    coverLetter: String,
    status:      { type: String, enum: ['applied','reviewed','interview','hired','rejected'], default: 'applied' },
    note:        String,
  },
  { timestamps: true }
)

// Prevent duplicate applications on concurrent clicks/race conditions.
ApplicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true })

const Application: Model<IApplicationDocument> =
  mongoose.models.Application ||
  mongoose.model<IApplicationDocument>('Application', ApplicationSchema)

export default Application
