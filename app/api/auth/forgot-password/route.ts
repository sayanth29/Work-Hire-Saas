import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { generateResetToken } from '@/utils/generateToken'
import { sendEmail, resetPasswordTemplate } from '@/utils/sendEmail'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers)
    const limit = checkRateLimit(`auth-forgot:${ip}`, 5, 60_000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
      )
    }

    await connectDB()
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Return success even if user not found to avoid email enumeration vulnerability
      return NextResponse.json({ message: 'If this email is registered, a reset link has been sent.' })
    }

    if (user.googleId && !user.password) {
      return NextResponse.json({ error: 'This account is linked with Google. Please login using Google.' }, { status: 400 })
    }

    const { token, hashedToken, expires } = generateResetToken()

    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = expires
    await user.save()

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    await sendEmail({
      to: user.email,
      subject: 'Reset your password - WorkHire',
      html: resetPasswordTemplate({ name: user.name, resetUrl }),
    })

    return NextResponse.json({ message: 'Password reset link sent! Check your email.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
