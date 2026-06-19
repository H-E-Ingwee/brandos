// IntaSend Payment Integration
// Docs: https://developers.intasend.com

const INTASEND_API_URL = 'https://payment.intasend.com/api/v1'
const SECRET_KEY = process.env.INTASEND_SECRET_KEY!
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_INTASEND_PUBLISHABLE_KEY!

// Plan pricing in KES and USD
export const PLAN_PRICING = {
  growth: { kes: 1500, usd: 12, label: 'Growth Plan' },
  pro: { kes: 3500, usd: 27, label: 'Pro Plan' },
  agency: { kes: 8000, usd: 62, label: 'Agency Plan' },
} as const

export type PlanId = keyof typeof PLAN_PRICING

// ── INITIATE M-PESA STK PUSH ──────────────────────────────────────────────────
export async function initiateMpesaPayment({
  phone,
  amount,
  currency = 'KES',
  email,
  firstName,
  lastName,
  narrative,
  apiRef,
}: {
  phone: string
  amount: number
  currency?: string
  email: string
  firstName: string
  lastName: string
  narrative: string
  apiRef: string
}) {
  // Normalize phone number to 254XXXXXXXXX format
  let normalizedPhone = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '')
  if (normalizedPhone.startsWith('0')) normalizedPhone = '254' + normalizedPhone.slice(1)
  if (normalizedPhone.startsWith('+')) normalizedPhone = normalizedPhone.slice(1)
  if (!normalizedPhone.startsWith('254')) normalizedPhone = '254' + normalizedPhone

  const response = await fetch(`${INTASEND_API_URL}/payment/mpesa-stk-push/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SECRET_KEY}`,
    },
    body: JSON.stringify({
      phone_number: normalizedPhone,
      amount,
      currency,
      email,
      first_name: firstName,
      last_name: lastName,
      narrative,
      api_ref: apiRef,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('IntaSend M-Pesa error:', data)
    throw new Error(data?.message || data?.detail || 'Failed to initiate M-Pesa payment')
  }

  return data
}

// ── CHECK PAYMENT STATUS ──────────────────────────────────────────────────────
export async function checkPaymentStatus(invoiceId: string) {
  const response = await fetch(`${INTASEND_API_URL}/payment/status/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SECRET_KEY}`,
    },
    body: JSON.stringify({ invoice_id: invoiceId }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to check payment status')
  }

  return data
}

// ── CREATE CHECKOUT LINK (for card payments) ──────────────────────────────────
export async function createCheckoutLink({
  amount,
  currency = 'KES',
  email,
  firstName,
  lastName,
  narrative,
  apiRef,
  redirectUrl,
}: {
  amount: number
  currency?: string
  email: string
  firstName: string
  lastName: string
  narrative: string
  apiRef: string
  redirectUrl: string
}) {
  const response = await fetch(`${INTASEND_API_URL}/checkout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SECRET_KEY}`,
    },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email,
      amount,
      currency,
      narrative,
      api_ref: apiRef,
      redirect_url: redirectUrl,
      comment: narrative,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('IntaSend checkout error:', data)
    throw new Error(data?.message || data?.detail || 'Failed to create checkout link')
  }

  return data
}

// ── VERIFY WEBHOOK SIGNATURE ──────────────────────────────────────────────────
export function verifyWebhookChallenge(challenge: string): string {
  // IntaSend sends a challenge that must be echoed back
  return challenge
}

// ── GENERATE UNIQUE TRANSACTION REFERENCE ─────────────────────────────────────
export function generateTxRef(userId: string, plan: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `BRANDOS-${plan.toUpperCase()}-${userId.slice(0, 8).toUpperCase()}-${timestamp}-${random}`
}