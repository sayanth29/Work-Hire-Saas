import mongoose, { Schema, Document, Model } from 'mongoose'
import { JobType, JobStatus, ExperienceLevel } from '@/types'

export interface IJobDocument extends Document {
  companyId: mongoose.Types.ObjectId
  title: string
  description: string
  requirements: string[]
  skills: string[]
  location?: string
  type: JobType
  experience?: ExperienceLevel
  salary: { min?: number; max?: number; currency: string }
  status: JobStatus
  applicantCount: number
  deadline?: Date
  createdAt: Date
  updatedAt: Date
}

const JobSchema = new Schema<IJobDocument>(
  {
    companyId:    { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    title:        { type: String, required: true, trim: true },
    description:  { type: String, required: true },
    requirements: [String],
    skills:       [String],
    location:     String,
    type:         { type: String, enum: ['full-time','part-time','remote','internship','contract'], default: 'full-time' },
    experience:   { type: String, enum: ['fresher','1-2','2-5','5-10','10+'] },
    salary: {
      min:      Number,
      max:      Number,
      currency: { type: String, default: 'INR' },
    },
    status:         { type: String, enum: ['active','closed','draft'], default: 'active' },
    applicantCount: { type: Number, default: 0 },
    deadline:       Date,
  },
  { timestamps: true }
)

const Job: Model<IJobDocument> =
  mongoose.models.Job || mongoose.model<IJobDocument>('Job', JobSchema)

export default Job