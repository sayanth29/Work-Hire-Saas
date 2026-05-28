import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { generateResetToken } from '@/utils/generateToken'
import { sendEmail, resetPasswordTemplate } from '@/utils/sendEmail'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email })

    // Always return success (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        message: 'If this email exists, a reset link has been sent.',
      })
    }

    const { token, hashedToken, expires } = generateResetToken()

    user.resetPasswordToken   = hashedToken
    user.resetPasswordExpires = expires
    await user.save()

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    await sendEmail({
      to:      email,
      subject: 'Reset your password - WorkHire',
      html:    resetPasswordTemplate({ name: user.name, resetUrl }),
    })

    return NextResponse.json({ message: 'Reset link sent!' })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}