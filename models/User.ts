import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'
import { Role } from '@/types'

export interface IUserDocument extends Document {
  name: string
  email: string
  password?: string
  role: Role
  avatar: string
  isEmailVerified: boolean
  emailVerifyToken?: string
  emailVerifyExpires?: Date
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  resume: string
  skills: string[]
  experience: {
    title: string
    company: string
    from: Date
    to?: Date
    current: boolean
    description?: string
  }[]
  education: {
    school: string
    degree: string
    field: string
    from: Date
    to?: Date
  }[]
  bio?: string
  location?: string
  phone?: string
  googleId?: string
  createdAt: Date
  updatedAt: Date
  comparePassword(enteredPassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUserDocument>(
  {
    name:     { type: String, required: [true, 'Name is required'], trim: true },
    email:    { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6 },
    role:     { type: String, enum: ['jobseeker', 'recruiter', 'admin'], default: 'jobseeker' },
    avatar:   { type: String, default: '' },

    isEmailVerified:    { type: Boolean, default: false },
    emailVerifyToken:   String,
    emailVerifyExpires: Date,

    resetPasswordToken:   String,
    resetPasswordExpires: Date,

    resume:   { type: String, default: '' },
    skills:   [String],
    experience: [{
      title: String, company: String,
      from: Date, to: Date,
      current: Boolean, description: String,
    }],
    education: [{
      school: String, degree: String,
      field: String, from: Date, to: Date,
    }],
    bio:      String,
    location: String,
    phone:    String,
    googleId: String,
  },
  { timestamps: true }
)

// Hash password before save
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return
  this.password = await bcrypt.hash(this.password, 12)
})

// Compare password method
UserSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password!)
}

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema)

export default User