import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Company from '@/models/Company'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const company = await Company.findOne({ ownerId: session.user.id })
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: company._id,
      name: company.name,
      email: company.email,
      plan: company.subscription?.plan || 'free',
      status: company.subscription?.status || 'inactive',
    })
  } catch (error) {
    console.error('Get my company error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
