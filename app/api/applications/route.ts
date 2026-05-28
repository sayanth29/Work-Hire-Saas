// 📡 API: Apply to job
// 🌐 POST /api/applications

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Application from '@/models/Application'
import Job from '@/models/Job'
import User from '@/models/User'
import Company from '@/models/Company'
import {
  sendEmail,
  applicationReceivedTemplate,
} from '@/utils/sendEmail'
import { createNotification } from '@/utils/notification'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'jobseeker') {
      return NextResponse.json({ error: 'Job seekers only' }, { status: 403 })
    }

    await connectDB()

    const { jobId, coverLetter } = await req.json()

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    // Check job exists
    const job = await Job.findById(jobId)
    if (!job || job.status !== 'active') {
      return NextResponse.json({ error: 'Job not found or closed' }, { status: 404 })
    }

    // Check company is approved
    const company = await Company.findById(job.companyId)
    if (!company || !company.isAdminApproved) {
      return NextResponse.json({ error: 'Company is not approved or active' }, { status: 403 })
    }

    // Check already applied
    const existing = await Application.findOne({
      jobId,
      seekerId: session.user.id,
    })
    if (existing) {
      return NextResponse.json({ error: 'Already applied to this job' }, { status: 400 })
    }

    // Check seeker has resume
    const seeker = await User.findById(session.user.id)
    if (!seeker?.resume) {
      return NextResponse.json(
        { error: 'Please upload your resume before applying' },
        { status: 400 }
      )
    }

    // Create application
    const application = await Application.create({
      jobId,
      seekerId:  session.user.id,
      companyId: job.companyId,
      resume:    seeker.resume,
      coverLetter,
    })

    // Increment job applicant count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicantCount: 1 }
    })

    // Notify recruiter via email
    const recruiter = await User.findById(company?.ownerId)

    if (recruiter?.email) {
      await sendEmail({
        to:      recruiter.email,
        subject: `New application for ${job.title} - WorkHire`,
        html:    applicationReceivedTemplate({
          recruiterName: recruiter.name,
          jobTitle:      job.title,
          seekerName:    seeker.name,
        }),
      })
    }

    // Trigger notification
    if (company?.ownerId) {
      await createNotification({
        userId:  company.ownerId,
        type:    'application_received',
        message: `New application received for "${job.title}" from ${seeker.name}`,
        link:    `/company/dashboard/applicants?jobId=${jobId}`,
      })
    }

    return NextResponse.json(
      { message: 'Application submitted!', application },
      { status: 201 }
    )

  } catch (error) {
    console.error('Apply error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}