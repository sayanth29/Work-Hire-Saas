import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import Stripe from 'stripe'
import connectDB from '@/lib/db'
import Company from '@/models/Company'
import { createNotification } from '@/utils/notification'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers)
    const limit = checkRateLimit(`stripe-verify:${ip}`, 20, 60_000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, plan } = await req.json()
    if (!sessionId || (plan !== 'pro' && plan !== 'enterprise')) {
      return NextResponse.json({ error: 'Invalid verification payload' }, { status: 400 })
    }

    await connectDB()
    const company = await Company.findOne({ ownerId: session.user.id })
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    if (!company.isAdminApproved) {
      return NextResponse.json({ error: 'Company profile pending approval' }, { status: 403 })
    }

    let customerId = `cus_mock_${Date.now()}`
    let subscriptionId = sessionId
    let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default

    const isMock = sessionId.startsWith('cs_mock_')

    if (!isMock) {
      const secretKey = process.env.STRIPE_SECRET_KEY
      if (!secretKey) {
        return NextResponse.json({ error: 'Stripe gateway configuration missing' }, { status: 500 })
      }

      const stripe = new Stripe(secretKey)
      const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)

      if (stripeSession.payment_status !== 'paid') {
        return NextResponse.json({ error: 'Payment has not been completed' }, { status: 400 })
      }

      // Verify session metadata matches current context
      const metaCompanyId = stripeSession.metadata?.companyId
      const metaPlan = stripeSession.metadata?.plan

      if (metaCompanyId !== company._id.toString() || metaPlan !== plan) {
        return NextResponse.json({ error: 'Payment details mismatch' }, { status: 400 })
      }

      customerId = typeof stripeSession.customer === 'string' ? stripeSession.customer : customerId
      subscriptionId = typeof stripeSession.subscription === 'string' ? stripeSession.subscription : subscriptionId

      // Retrieve subscription details to get accurate period end
      if (typeof stripeSession.subscription === 'string') {
        try {
          const sub = await stripe.subscriptions.retrieve(stripeSession.subscription) as any
          periodEnd = new Date(sub.current_period_end * 1000)
        } catch (subErr) {
          console.warn('Could not fetch exact current period end from Stripe subscription:', subErr)
        }
      }
    } else {
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Mock payments are disabled in production' }, { status: 400 })
      }
      console.log(`Sandbox Mode: Verifying mock checkout session "${sessionId}" for "${plan.toUpperCase()}" plan.`)
    }

    // Replay Protection: Check if payment has already been verified
    const duplicatePayment = await Company.findOne({
      'subscription.stripeSubscriptionId': subscriptionId,
      _id: { $ne: company._id },
    }).select('_id')
    
    if (duplicatePayment) {
      return NextResponse.json({ error: 'This transaction has already been claimed' }, { status: 409 })
    }

    const alreadyProcessed =
      company.subscription?.stripeSubscriptionId === subscriptionId &&
      company.subscription?.plan === plan &&
      company.subscription?.status === 'active'

    if (alreadyProcessed) {
      return NextResponse.json({ message: 'Plan already active' })
    }

    // Update Company subscription
    await Company.findByIdAndUpdate(company._id, {
      'subscription.plan': plan,
      'subscription.status': 'active',
      'subscription.stripeCustomerId': customerId,
      'subscription.stripeSubscriptionId': subscriptionId,
      'subscription.currentPeriodEnd': periodEnd,
    })

    // Trigger Notification
    await createNotification({
      userId: session.user.id,
      type: 'payment_success',
      message: `Your Stripe subscription upgrade to plan "${plan.toUpperCase()}" was successful!`,
      link: '/company/dashboard/billing',
    })

    return NextResponse.json({
      message: 'Payment verified! Plan activated.',
      isMock,
    })

  } catch (error) {
    console.error('Verify checkout session error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
