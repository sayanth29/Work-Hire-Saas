import mongoose, { Schema, Document, Model } from 'mongoose'
import { SubscriptionPlan, SubscriptionStatus, CompanySize } from '@/types'

export interface ICompanyDocument extends Document {
  name: string
  slug: string
  email: string
  logo: string
  description?: string
  website?: string
  location?: string
  industry?: string
  size?: CompanySize
  phone?: string
  ownerId: mongoose.Types.ObjectId
  isEmailVerified: boolean
  emailVerifyToken?: string
  emailVerifyExpires?: Date
  isAdminApproved: boolean
  rejectedReason?: string
  subscription: {
    plan: SubscriptionPlan
    status: SubscriptionStatus
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    currentPeriodEnd?: Date
  }
  createdAt: Date
  updatedAt: Date
}

const CompanySchema = new Schema<ICompanyDocument>(
  {
    name:        { type: String, required: [true, 'Company name required'], trim: true },
    slug:        { type: String, unique: true, lowercase: true },
    email:       { type: String, required: true, unique: true, lowercase: true },
    logo:        { type: String, default: '' },
    description: String,
    website:     String,
    location:    String,
    industry:    String,
    size:        { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] },
    phone:       String,

    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    isEmailVerified:    { type: Boolean, default: false },
    emailVerifyToken:   String,
    emailVerifyExpires: Date,

    isAdminApproved: { type: Boolean, default: false },
    rejectedReason:  String,

    subscription: {
      plan:   { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
      status: { type: String, enum: ['active', 'cancelled', 'past_due', 'inactive'], default: 'inactive' },
      stripeCustomerId:     String,
      stripeSubscriptionId: String,
      currentPeriodEnd:       Date,
    },
  },
  { timestamps: true }
)

// Auto slug from name
CompanySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
})

const Company: Model<ICompanyDocument> =
  mongoose.models.Company ||
  mongoose.model<ICompanyDocument>('Company', CompanySchema)

export default Company