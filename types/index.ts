import { DefaultSession } from 'next-auth'

// ── Extend NextAuth session ──────────────────────
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'jobseeker' | 'recruiter' | 'admin'
      avatar: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: 'jobseeker' | 'recruiter' | 'admin'
    avatar: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'jobseeker' | 'recruiter' | 'admin'
    avatar: string
  }
}

// ── Enums ────────────────────────────────────────
export type Role = 'jobseeker' | 'recruiter' | 'admin'

export type ApplicationStatus =
  | 'applied'
  | 'reviewed'
  | 'interview'
  | 'hired'
  | 'rejected'

export type JobType =
  | 'full-time'
  | 'part-time'
  | 'remote'
  | 'internship'
  | 'contract'

export type JobStatus = 'active' | 'closed' | 'draft'

export type ExperienceLevel =
  | 'fresher'
  | '1-2'
  | '2-5'
  | '5-10'
  | '10+'

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise'

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'past_due'
  | 'inactive'

export type CompanySize =
  | '1-10'
  | '11-50'
  | '51-200'
  | '201-500'
  | '500+'

export type NotificationType =
  | 'application_received'
  | 'status_changed'
  | 'interview_scheduled'
  | 'message_received'
  | 'company_approved'
  | 'company_rejected'
  | 'payment_success'
  | 'payment_failed'

// ── User ─────────────────────────────────────────
export interface IExperience {
  _id?: string
  title: string
  company: string
  from: Date
  to?: Date
  current: boolean
  description?: string
}

export interface IEducation {
  _id?: string
  school: string
  degree: string
  field: string
  from: Date
  to?: Date
}

export interface IUser {
  _id: string
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
  // Jobseeker
  resume: string
  skills: string[]
  experience: IExperience[]
  education: IEducation[]
  bio?: string
  location?: string
  phone?: string
  // OAuth
  googleId?: string
  createdAt: Date
  updatedAt: Date
}

// ── Company ──────────────────────────────────────
export interface ISubscription {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  currentPeriodEnd?: Date
}

export interface ICompany {
  _id: string
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
  ownerId: string
  isEmailVerified: boolean
  isAdminApproved: boolean
  rejectedReason?: string
  subscription: ISubscription
  createdAt: Date
  updatedAt: Date
}

// ── Job ──────────────────────────────────────────
export interface ISalary {
  min?: number
  max?: number
  currency: string
}

export interface IJob {
  _id: string
  companyId: string | ICompany
  title: string
  description: string
  requirements: string[]
  skills: string[]
  location?: string
  type: JobType
  experience?: ExperienceLevel
  salary: ISalary
  status: JobStatus
  applicantCount: number
  deadline?: Date
  createdAt: Date
  updatedAt: Date
}

// ── Application ──────────────────────────────────
export interface IApplication {
  _id: string
  jobId: string | IJob
  seekerId: string | IUser
  companyId: string | ICompany
  resume: string
  coverLetter?: string
  status: ApplicationStatus
  note?: string
  createdAt: Date
  updatedAt: Date
}

// ── Message ──────────────────────────────────────
export interface IMessage {
  _id: string
  senderId: string | IUser
  receiverId: string | IUser
  applicationId?: string
  content: string
  read: boolean
  createdAt: Date
}

// ── Notification ─────────────────────────────────
export interface INotification {
  _id: string
  userId: string
  type: NotificationType
  message: string
  read: boolean
  link?: string
  createdAt: Date
}

// ── API Response ─────────────────────────────────
export interface ApiResponse<T = unknown> {
  data?: T
  message?: string
  error?: string
}

// ── Plan limits ──────────────────────────────────
export const PLAN_LIMITS: Record<SubscriptionPlan, {
  jobLimit: number
  analytics: boolean
  chat: boolean
}> = {
  free:       { jobLimit: 3,        analytics: false, chat: false },
  pro:        { jobLimit: Infinity, analytics: true,  chat: true  },
  enterprise: { jobLimit: Infinity, analytics: true,  chat: true  },
}

// ── Stripe price/plan IDs ────────────────────────
export const STRIPE_PLAN_IDS: Record<string, SubscriptionPlan> = {
  price_pro_monthly:        'pro',
  price_enterprise_monthly: 'enterprise',
}