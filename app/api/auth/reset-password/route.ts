import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Reset link is invalid or has expired' },
        { status: 400 }
      )
    }

    // pre-save hook hashes the password
    user.password             = password
    user.resetPasswordToken   = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return NextResponse.json({ message: 'Password reset successfully!' })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}