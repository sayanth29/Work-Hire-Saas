// 📡 API: Get, Update, Delete single job
// 🌐 GET/PUT/DELETE /api/jobs/[id]

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Job from '@/models/Job'
import Company from '@/models/Company'

interface Params { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  try {
    await connectDB()
    const job = await Job.findById((await params).id)
      .populate('companyId', 'name logo location industry website description')
      .lean()

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    return NextResponse.json({ job })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
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
    if (!company.isAdminApproved) {
      return NextResponse.json({ error: 'Company not approved yet' }, { status: 403 })
    }

    const job     = await Job.findOne({ _id: (await params).id, companyId: company._id })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const body = await req.json()
    const updated = await Job.findByIdAndUpdate((await params).id, body, { new: true })

    return NextResponse.json({ message: 'Job updated!', job: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const company = await Company.findOne({ ownerId: session.user.id })
    const job     = await Job.findOne({ _id: (await params).id, companyId: company?._id })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    await Job.findByIdAndDelete((await params).id)
    return NextResponse.json({ message: 'Job deleted!' })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}