// 📡 API: Admin approve/reject/revoke company
// 🌐 PUT /api/admin/companies/[id]

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Company from '@/models/Company'
import Job from '@/models/Job'
import { sendEmail, companyApprovedTemplate, companyRejectedTemplate } from '@/utils/sendEmail'
import { createNotification } from '@/utils/notification'

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const body = await req.json()
    const { action, reason, companyName, companyEmail } = body

    const company = await Company.findById(id)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    if (action === 'approve') {
      company.isAdminApproved = true
      company.rejectedReason = ''
      await company.save()

      // Send approval notification email
      if (companyEmail) {
        try {
          await sendEmail({
            to: companyEmail,
            subject: 'Your Company Account Has Been Approved! 🎉',
            html: companyApprovedTemplate({ name: companyName || company.name }),
          })
        } catch (emailErr) {
          console.error('Failed to send approval email:', emailErr)
        }
      }

      // Trigger notification
      await createNotification({
        userId:  company.ownerId,
        type:    'company_approved',
        message: `Your company profile "${companyName || company.name}" has been approved by administrators.`,
        link:    '/company/dashboard',
      })

      return NextResponse.json({ message: 'Company approved successfully' })
    }

    if (action === 'reject') {
      if (!reason) {
        return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
      }
      company.isAdminApproved = false
      company.rejectedReason = reason
      await company.save()

      // Deactivate jobs for rejected company
      await Job.updateMany({ companyId: company._id }, { status: 'draft' })

      // Send rejection notification email
      if (companyEmail) {
        try {
          await sendEmail({
            to: companyEmail,
            subject: 'Update Regarding Your Company Application',
            html: companyRejectedTemplate({ name: companyName || company.name, reason }),
          })
        } catch (emailErr) {
          console.error('Failed to send rejection email:', emailErr)
        }
      }

      // Trigger notification
      await createNotification({
        userId:  company.ownerId,
        type:    'company_rejected',
        message: `Your company profile "${companyName || company.name}" has been rejected. Reason: ${reason}`,
        link:    '/company/dashboard',
      })

      return NextResponse.json({ message: 'Company rejected successfully' })
    }

    if (action === 'revoke') {
      company.isAdminApproved = false
      await company.save()

      // Deactivate jobs for revoked company
      await Job.updateMany({ companyId: company._id }, { status: 'draft' })

      return NextResponse.json({ message: 'Company approval revoked' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Admin company action error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
