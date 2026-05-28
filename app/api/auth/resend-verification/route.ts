import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Company from '@/models/Company'
import { generateVerifyToken } from '@/utils/generateToken'
import {
  sendEmail,
  verifyEmailTemplate,
  companyVerifyEmailTemplate,
} from '@/utils/sendEmail'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers)
    const limit = checkRateLimit(`auth-resend:${ip}`, 8, 60_000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many resend requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
      )
    }

    await connectDB()

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    const { token, hashedToken, expires } = generateVerifyToken()

    user.emailVerifyToken   = hashedToken
    user.emailVerifyExpires = expires
    await user.save()

    if (user.role === 'recruiter') {
      const company = await Company.findOne({ ownerId: user._id })

      if (company) {
        const {
          token:       ct,
          hashedToken: cht,
          expires:     ce,
        } = generateVerifyToken()

        company.emailVerifyToken   = cht
        company.emailVerifyExpires = ce
        await company.save()

        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${ct}&type=company`

        await sendEmail({
          to:      email,
          subject: 'Verify your company email - WorkHire',
          html:    companyVerifyEmailTemplate({ name: user.name, verifyUrl }),
        })
      }
    } else {
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}&type=user`

      await sendEmail({
        to:      email,
        subject: 'Verify your email - WorkHire',
        html:    verifyEmailTemplate({ name: user.name, verifyUrl }),
      })
    }

    return NextResponse.json({ message: 'Verification email sent!' })

  } catch (error) {
    console.error('Resend verify error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
