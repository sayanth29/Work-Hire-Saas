import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import Stripe from 'stripe'
import connectDB from '@/lib/db'
import Company from '@/models/Company'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

const PLAN_PRICES: Record<string, number> = {
  pro:        99900,   // ₹999 in paise (Stripe expects unit amount in subunits)
  enterprise: 299900,  // ₹2999 in paise
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers)
    const limit = checkRateLimit(`stripe-session:${ip}`, 15, 60_000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await req.json()
    if (plan !== 'pro' && plan !== 'enterprise') {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    await connectDB()
    const company = await Company.findOne({ ownerId: session.user.id })
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    if (!company.isAdminApproved) {
      return NextResponse.json({ error: 'Company profile pending admin approval' }, { status: 403 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const secretKey = process.env.STRIPE_SECRET_KEY

    // Check if Stripe key is missing or dummy
    const isDummy = !secretKey || secretKey.startsWith('sk_test_dummy') || secretKey === 'sk_test_...'

    let checkoutUrl: string | null = null
    let checkoutSessionId: string | null = null

    if (!isDummy) {
      try {
        const stripe = new Stripe(secretKey!)
        const stripeSession = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'inr',
                product_data: {
                  name: `WorkHire ${plan.toUpperCase()} Plan Subscription`,
                  description: `Access to all ${plan} recruiter tools on WorkHire`,
                },
                unit_amount: PLAN_PRICES[plan],
                recurring: {
                  interval: 'month',
                },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription',
          metadata: {
            companyId: company._id.toString(),
            userId: session.user.id,
            plan,
          },
          success_url: `${appUrl}/company/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
          cancel_url: `${appUrl}/company/dashboard/billing`,
        })

        checkoutUrl = stripeSession.url
        checkoutSessionId = stripeSession.id
      } catch (stripeError) {
        console.error('Stripe SDK session creation failed:', stripeError)
      }
    }

    // Fallback to Development Mock Checkout Sandbox
    if (!checkoutUrl) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Falling back to local checkout simulation sandbox.')
        checkoutSessionId = `cs_mock_${Date.now()}`
        checkoutUrl = `${appUrl}/company/dashboard/billing?session_id=${checkoutSessionId}&plan=${plan}`
      } else {
        return NextResponse.json(
          { error: 'Payment gateway configuration is invalid. Contact support.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      url: checkoutUrl,
      sessionId: checkoutSessionId,
    })

  } catch (error) {
    console.error('Create checkout session error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
