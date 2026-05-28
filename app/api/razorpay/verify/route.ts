// 📡 API: Verify Razorpay payment
// 🌐 POST /api/razorpay/verify

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import crypto from 'crypto'
import connectDB from '@/lib/db'
import Company from '@/models/Company'
import { createNotification } from '@/utils/notification'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = await req.json()

    // Verify signature
    const body      = `${razorpay_order_id}|${razorpay_payment_id}`
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expected !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    await connectDB()

    // Update company subscription
    await Company.findOneAndUpdate(
      { ownerId: session.user.id },
      {
        'subscription.plan':                  plan,
        'subscription.status':               'active',
        'subscription.razorpayCustomerId':    razorpay_payment_id,
        'subscription.currentPeriodEnd':      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    )

    // Trigger notification
    await createNotification({
      userId:  session.user.id,
      type:    'payment_success',
      message: `Your subscription upgrade to plan "${plan}" was successful!`,
      link:    '/company/dashboard/billing',
    })

    return NextResponse.json({ message: 'Payment verified! Plan activated.' })

  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}