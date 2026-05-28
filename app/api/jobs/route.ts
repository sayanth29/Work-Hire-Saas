// 📡 API: Get all jobs + Post new job
// 🌐 GET  /api/jobs
// 🌐 POST /api/jobs

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Job from '@/models/Job'
import Company from '@/models/Company'
import { PLAN_LIMITS } from '@/types'

// GET all active jobs (public)
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)

    const approvedCompanies = await Company.find({ isAdminApproved: true }).select('_id').lean()
    const approvedCompanyIds = approvedCompanies.map(c => c._id)

    const filter: Record<string, unknown> = { status: 'active', companyId: { $in: approvedCompanyIds } }
    if (searchParams.get('type'))     filter.type     = searchParams.get('type')
    if (searchParams.get('location')) filter.location = new RegExp(searchParams.get('location')!, 'i')
    if (searchParams.get('search'))   filter.title    = new RegExp(searchParams.get('search')!, 'i')

    const page  = Number(searchParams.get('page')  || 1)
    const limit = Number(searchParams.get('limit') || 10)
    const skip  = (page - 1) * limit

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('companyId', 'name logo location industry')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ])

    return NextResponse.json({
      jobs,
      total,
      pages: Math.ceil(total / limit),
      page,
    })

  } catch (error) {
    console.error('Get jobs error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST create job (recruiter only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'recruiter') {
      return NextResponse.json({ error: 'Recruiters only' }, { status: 403 })
    }

    await connectDB()

    const company = await Company.findOne({ ownerId: session.user.id })
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    if (!company.isAdminApproved) {
      return NextResponse.json({ error: 'Company not approved yet' }, { status: 403 })
    }

    // Check plan limit
    const plan      = company.subscription?.plan || 'free'
    const jobLimit  = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.jobLimit
    const jobCount  = await Job.countDocuments({ companyId: company._id })

    if (jobLimit !== Infinity && jobCount >= jobLimit) {
      return NextResponse.json(
        { error: `Job limit reached for ${plan} plan. Please upgrade.` },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      title, description, location, type,
      experience, salary, skills, requirements,
      deadline, status,
    } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const job = await Job.create({
      companyId: company._id,
      title, description, location, type,
      experience, salary, skills, requirements,
      deadline, status: status || 'active',
    })

    return NextResponse.json({ message: 'Job posted!', job }, { status: 201 })

  } catch (error) {
    console.error('Post job error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
