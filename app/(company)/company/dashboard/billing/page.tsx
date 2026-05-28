// 📄 PAGE: Billing & Subscription
// 🌐 URL: /company/dashboard/billing
// 👤 WHO: Recruiters only

'use client'

import { useState } from 'react'
import axios from 'axios'
import type { AxiosError } from 'axios'

type RazorpayResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

type RazorpayOptions = {
  key: string | undefined
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => Promise<void>
  prefill: { name: string; email: string }
  theme: { color: string }
}

const plans = [
  {
    key:   'free',
    name:  'Free',
    price: '₹0',
    period: '/month',
    features: [
      '3 job posts',
      'Basic applicant tracking',
      'Email notifications',
    ],
    color:  'border-[#c7c4d8]',
    badge:  '',
  },
  {
    key:   'pro',
    name:  'Pro',
    price: '₹999',
    period: '/month',
    features: [
      'Unlimited job posts',
      'Advanced analytics',
      'Real-time chat',
      'Priority listing',
      'AI candidate ranking',
    ],
    color: 'border-[#3525cd]',
    badge: '⭐ Most Popular',
  },
  {
    key:   'enterprise',
    name:  'Enterprise',
    price: '₹2,999',
    period: '/month',
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom integrations',
      'Team access',
      'API access',
    ],
    color: 'border-[#4648d4]',
    badge: '🏢 For Teams',
  },
]

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState('free')
  const [error, setError] = useState('')

  async function handleUpgrade(plan: string) {
    if (plan === 'free') return
    setError('')
    setLoading(plan)
    try {
      const { data } = await axios.post('/api/razorpay/create-order', { plan })

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount:      data.amount,
          currency:    'INR',
          name:        'WorkHire',
          description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
          order_id:    data.orderId,
          handler:     async (response: RazorpayResponse) => {
            try {
              await axios.post('/api/razorpay/verify', {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                plan,
              })
              setCurrentPlan(plan)
              window.location.reload()
            } catch {
              setError('Payment verification failed. Contact support.')
            }
          },
          prefill:  { name: '', email: '' },
          theme:    { color: '#3525cd' },
        }

        const razorpayWindow = window as unknown as Window & { Razorpay: new (opts: RazorpayOptions) => { open: () => void } }
        const rzp = new razorpayWindow.Razorpay(options)
        rzp.open()
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>
      setError(axiosErr.response?.data?.error || 'Failed to initiate payment')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0b1c30]">Billing & Plans</h1>
        <p className="text-sm text-[#777587]">Choose a plan that works for your hiring needs</p>
      </div>

      {/* Current plan */}
      <div className="bg-[#eff4ff] border border-[#3525cd]/20 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#0b1c30]">
            Current Plan: <span className="text-[#3525cd] capitalize">{currentPlan}</span>
          </p>
          <p className="text-xs text-[#777587] mt-0.5">
            {currentPlan === 'free'
              ? 'Upgrade to unlock unlimited jobs and more features'
              : 'Your subscription is active'}
          </p>
        </div>
        {currentPlan !== 'free' && (
          <button className="text-xs px-3 py-1.5 rounded-xl border border-[#c7c4d8] text-[#464555] hover:bg-white transition-colors">
            Manage Subscription
          </button>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-sm">{error}</div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(plan => {
          const isCurrent = currentPlan === plan.key
          return (
            <div
              key={plan.key}
              className={`bg-white rounded-xl border-2 p-6 flex flex-col relative ${plan.color} ${
                plan.key === 'pro' ? 'shadow-[0px_4px_20px_rgba(53,37,205,0.12)]' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3525cd] text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-bold text-lg text-[#0b1c30]">{plan.name}</h3>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-3xl font-bold text-[#3525cd]">{plan.price}</span>
                  <span className="text-sm text-[#777587] mb-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#464555]">
                    <span className="text-[#3525cd] mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.key)}
                disabled={isCurrent || loading === plan.key || plan.key === 'free'}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${isCurrent
                    ? 'bg-green-50 text-green-600 cursor-default'
                    : plan.key === 'free'
                    ? 'bg-[#f8f9ff] text-[#777587] cursor-default'
                    : 'bg-[#3525cd] text-white hover:opacity-90 active:scale-[0.98] shadow-[0px_4px_12px_rgba(79,70,229,0.2)]'
                  } disabled:opacity-60 flex items-center justify-center gap-2`}
              >
                {loading === plan.key ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : isCurrent ? '✅ Current Plan' :
                   plan.key === 'free' ? 'Free Forever' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          )
        })}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl border border-[#c7c4d8] p-6 space-y-4">
        <h2 className="font-semibold text-[#0b1c30]">Frequently Asked Questions</h2>
        {[
          ['Can I cancel anytime?', 'Yes, you can cancel your subscription anytime. You will retain access until the end of your billing period.'],
          ['What payment methods are accepted?', 'We accept credit/debit cards, UPI, net banking, and popular international and local payment methods via Razorpay.'],
          ['Is there a free trial?', 'The Free plan is available forever with limited features. No credit card required.'],
        ].map(([q, a]) => (
          <div key={q} className="border-b border-[#c7c4d8] pb-4 last:border-0 last:pb-0">
            <p className="text-sm font-semibold text-[#0b1c30] mb-1">{q}</p>
            <p className="text-xs text-[#777587]">{a}</p>
          </div>
        ))}
      </div>

    </div>
  )
}
