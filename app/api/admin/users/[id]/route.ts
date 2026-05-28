// 📡 API: Admin delete user
// 🌐 DELETE /api/admin/users/[id]

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Company from '@/models/Company'

interface Params {
  params: Promise<{ id: string }>
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Clean up related data if recruiter
    if (user.role === 'recruiter') {
      await Company.deleteOne({ ownerId: user._id })
    }

    await User.findByIdAndDelete(id)

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
