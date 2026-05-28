// 📡 API: Verify Razorpay payment
// 🌐 POST /api/razorpay/verify

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import crypto from 'crypto'
import connectDB from '@/lib/db'
import Company from '@/models/Company'
import { createNotification } from '@/utils/notification'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers)
    const limit = checkRateLimit(`rzp-verify:${ip}`, 20, 60_000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many verification requests. Please retry shortly.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
      )
    }

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
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      (plan !== 'pro' && plan !== 'enterprise')
    ) {
      return NextResponse.json({ error: 'Invalid payment payload' }, { status: 400 })
    }

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
    const company = await Company.findOne({ ownerId: session.user.id })
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    if (!company.isAdminApproved) {
      return NextResponse.json({ error: 'Company not approved yet' }, { status: 403 })
    }

    // Replay protection: avoid reusing payment/order ids.
    const duplicatePayment = await Company.findOne({
      'subscription.razorpayCustomerId': razorpay_payment_id,
      _id: { $ne: company._id },
    }).select('_id')
    if (duplicatePayment) {
      return NextResponse.json({ error: 'Payment already used' }, { status: 409 })
    }

    const alreadyProcessed =
      company.subscription?.razorpayCustomerId === razorpay_payment_id ||
      company.subscription?.razorpaySubscriptionId === razorpay_order_id
    if (alreadyProcessed) {
      return NextResponse.json({ message: 'Payment already verified' })
    }

    // Update company subscription
    await Company.findByIdAndUpdate(
      company._id,
      {
        'subscription.plan':                  plan,
        'subscription.status':               'active',
        'subscription.razorpayCustomerId':    razorpay_payment_id,
        'subscription.razorpaySubscriptionId': razorpay_order_id,
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
