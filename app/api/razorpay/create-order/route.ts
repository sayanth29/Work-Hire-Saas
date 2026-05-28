// 📡 API: Create Razorpay order
// 🌐 POST /api/razorpay/create-order

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import Razorpay from 'razorpay'

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
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await req.json()

    if (!PLAN_PRICES[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
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