// 📡 API: Create Razorpay order
// 🌐 POST /api/razorpay/create-order

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import Razorpay from 'razorpay'
import connectDB from '@/lib/db'
import Company from '@/models/Company'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const PLAN_PRICES: Record<string, number> = {
  pro:        99900,   // ₹999 in paise
  enterprise: 299900,  // ₹2999 in paise
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers)
    const limit = checkRateLimit(`rzp-order:${ip}`, 15, 60_000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many payment attempts. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await req.json()
    if (plan !== 'pro' && plan !== 'enterprise') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    await connectDB()
    const company = await Company.findOne({ ownerId: session.user.id }).select('isAdminApproved')
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    if (!company.isAdminApproved) {
      return NextResponse.json({ error: 'Company not approved yet' }, { status: 403 })
    }

    const order = await razorpay.orders.create({
      amount:   PLAN_PRICES[plan],
      currency: 'INR',
      receipt:  `order_${session.user.id}_${Date.now()}`,
      notes:    {
        userId: session.user.id,
        plan,
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount:  order.amount,
      currency: order.currency,
    })

  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
