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
    const limit = checkRateLimit(`auth-register:${ip}`, 8, 60_000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
      )
    }

    await connectDB()

    const body = await req.json()
    const {
      name,
      email,
      password,
      role,
      companyName,
      companyLocation,
      industry,
    } = body

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (!['jobseeker', 'recruiter'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Check existing user
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Generate verify token
    const { token, hashedToken, expires } = generateVerifyToken()

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      emailVerifyToken:   hashedToken,
      emailVerifyExpires: expires,
    })

    if (role === 'recruiter') {
      if (!companyName) {
        await User.findByIdAndDelete(user._id)
        return NextResponse.json(
          { error: 'Company name is required for recruiters' },
          { status: 400 }
        )
      }

      const existingCompany = await Company.findOne({ email })
      if (existingCompany) {
        await User.findByIdAndDelete(user._id)
        return NextResponse.json(
          { error: 'Company email already registered' },
          { status: 400 }
        )
      }

      const {
        token:       companyToken,
        hashedToken: companyHashedToken,
        expires:     companyExpires,
      } = generateVerifyToken()

      await Company.create({
        name:        companyName,
        email,
        location:    companyLocation || '',
        industry:    industry || '',
        ownerId:     user._id,
        emailVerifyToken:   companyHashedToken,
        emailVerifyExpires: companyExpires,
      })

      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${companyToken}&type=company`

      await sendEmail({
        to:      email,
        subject: 'Verify your company email - WorkHire',
        html:    companyVerifyEmailTemplate({ name, verifyUrl }),
      })

    } else {
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}&type=user`

      await sendEmail({
        to:      email,
        subject: 'Verify your email - WorkHire',
        html:    verifyEmailTemplate({ name, verifyUrl }),
      })
    }

    return NextResponse.json(
      {
        message:
          role === 'recruiter'
            ? 'Company registered! Check email to verify.'
            : 'Account created! Check email to verify.',
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
