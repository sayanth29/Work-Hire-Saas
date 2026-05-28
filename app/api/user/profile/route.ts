// 📡 API: Get + Update User Profile
// 🌐 URL: /api/user/profile
// 👤 WHO: Logged in users only

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import User from '@/models/User'

// GET → fetch profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.user.id)
      .select('-password -emailVerifyToken -resetPasswordToken')
      .lean()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// PUT → update profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const {
      name, bio, location, phone,
      skills, experience, education, resume,
    } = body

    const updated = await User.findByIdAndUpdate(
      session.user.id,
      {
        ...(name       && { name }),
        ...(bio        !== undefined && { bio }),
        ...(location   !== undefined && { location }),
        ...(phone      !== undefined && { phone }),
        ...(skills     && { skills }),
        ...(experience && { experience }),
        ...(education  && { education }),
        ...(resume     && { resume }),
      },
      { new: true }
    ).select('-password -emailVerifyToken -resetPasswordToken')

    return NextResponse.json({
      message: 'Profile updated!',
      user: updated,
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}