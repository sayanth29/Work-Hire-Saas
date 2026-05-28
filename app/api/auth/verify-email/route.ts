import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Company from '@/models/Company'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const type  = searchParams.get('type') // 'user' | 'company'

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL

    if (!token || !type) {
      return NextResponse.redirect(`${APP_URL}/verify-email?error=invalid`)
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    if (type === 'user') {
      const user = await User.findOne({
        emailVerifyToken:   hashedToken,
        emailVerifyExpires: { $gt: Date.now() },
      })

      if (!user) {
        return NextResponse.redirect(`${APP_URL}/verify-email?error=expired`)
      }

      user.isEmailVerified    = true
      user.emailVerifyToken   = undefined
      user.emailVerifyExpires = undefined
      await user.save()

      return NextResponse.redirect(
        `${APP_URL}/verify-email?success=true&type=user`
      )

    } else if (type === 'company') {
      const company = await Company.findOne({
        emailVerifyToken:   hashedToken,
        emailVerifyExpires: { $gt: Date.now() },
      })

      if (!company) {
        return NextResponse.redirect(`${APP_URL}/verify-email?error=expired`)
      }

      company.isEmailVerified    = true
      company.emailVerifyToken   = undefined
      company.emailVerifyExpires = undefined
      await company.save()

      return NextResponse.redirect(
        `${APP_URL}/verify-email?success=true&type=company`
      )
    }

    return NextResponse.redirect(`${APP_URL}/verify-email?error=invalid`)

  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?error=server`
    )
  }
}