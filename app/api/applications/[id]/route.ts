// 📡 API: Update application status
// 🌐 PUT /api/applications/[id]

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Application from '@/models/Application'
import User from '@/models/User'
import Job from '@/models/Job'
import Company from '@/models/Company'
import { sendEmail, statusChangedTemplate } from '@/utils/sendEmail'
import { createNotification } from '@/utils/notification'
import mongoose from 'mongoose'

interface Params { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { status, note } = await req.json()
    const allowedStatuses = ['reviewed', 'interview', 'hired', 'rejected'] as const
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    if (note && typeof note !== 'string') {
      return NextResponse.json({ error: 'Invalid note format' }, { status: 400 })
    }
    if (typeof note === 'string' && note.length > 2000) {
      return NextResponse.json({ error: 'Note too long' }, { status: 400 })
    }
    const applicationId = (await params).id
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return NextResponse.json({ error: 'Invalid application id' }, { status: 400 })
    }

    const company     = await Company.findOne({ ownerId: session.user.id })
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    if (!company.isAdminApproved) {
      return NextResponse.json({ error: 'Company not approved yet' }, { status: 403 })
    }

    const application = await Application.findOne({
      _id:       applicationId,
      companyId: company._id,
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    application.status = status
    if (note) application.note = note
    await application.save()

    // Email seeker about status change
    const seeker = await User.findById(application.seekerId)
    const job    = await Job.findById(application.jobId)

    if (seeker?.email && job) {
      await sendEmail({
        to:      seeker.email,
        subject: `Application update for ${job.title} - WorkHire`,
        html:    statusChangedTemplate({
          seekerName: seeker.name,
          jobTitle:   job.title,
          status,
        }),
      })
    }

    // Trigger notification
    await createNotification({
      userId:  application.seekerId,
      type:    status === 'interview' ? 'interview_scheduled' : 'status_changed',
      message: `Your application for "${job?.title || 'Job'}" has been updated to "${status}"`,
      link:    '/dashboard/applications',
    })

    return NextResponse.json({ message: 'Status updated!', application })

  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
