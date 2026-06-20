// Paystack Payment Integration
// Docs: https://paystack.com/docs/api

const PAYSTACK_API_URL = 'https://api.paystack.co'
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!

// African currencies supported by Paystack
export const CURRENCIES: Record<string, { code: string; symbol: string; name: string; flag: string }> = {
  KES: { code: 'KES', symbol: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', flag: '🇬🇭' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🌍' },
}

// Plan pricing in multiple currencies
export const PLAN_PRICING = {
  growth: { label: 'Growth Plan', KES: 1500, NGN: 5000, GHS: 20, ZAR: 30, USD: 12 },
  pro: { label: 'Pro Plan', KES: 3500, NGN: 12000, GHS: 45, ZAR: 70, USD: 27 },
  agency: { label: 'Agency Plan', KES: 8000, NGN: 28000, GHS: 100, ZAR: 160, USD: 62 },
} as const

export type PlanId = keyof typeof PLAN_PRICING
export type CurrencyCode = keyof typeof CURRENCIES

// ── INITIALIZE TRANSACTION ────────────────────────────────────────────────────
export async function initializeTransaction({
  email, amount, currency = 'KES', reference, callbackUrl, metadata,
}: {
  email: string
  amount: number
  currency?: string
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
}) {
  const amountInKobo = Math.round(amount * 100)

  const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amountInKobo,
      currency,
      reference,
      callback_url: callbackUrl,
      metadata: { ...metadata, cancel_action: callbackUrl },
    }),
  })

  const data = await response.json()
  if (!response.ok || !data.status) {
    console.error('Paystack initialize error:', data)
    throw new Error(data.message || 'Failed to initialize payment')
  }

  return {
    authorization_url: data.data.authorization_url,
    access_code: data.data.access_code,
    reference: data.data.reference,
  }
}

// ── VERIFY TRANSACTION ────────────────────────────────────────────────────────
export async function verifyTransaction(reference: string) {
  const response = await fetch(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
    headers: { 'Authorization': `Bearer ${SECRET_KEY}`, 'Content-Type': 'application/json' },
  })

  const data = await response.json()
  if (!response.ok || !data.status) throw new Error(data.message || 'Failed to verify transaction')

  return {
    status: data.data.status,
    amount: data.data.amount / 100,
    currency: data.data.currency,
    reference: data.data.reference,
    paid_at: data.data.paid_at,
    customer: data.data.customer,
    metadata: data.data.metadata,
  }
}

// ── GENERATE UNIQUE REFERENCE ─────────────────────────────────────────────────
export function generateReference(userId: string, plan: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `BRANDOS-${plan.toUpperCase()}-${userId.slice(0, 8).toUpperCase()}-${timestamp}-${random}`
}

// ── GET AMOUNT FOR CURRENCY ───────────────────────────────────────────────────
export function getPlanAmount(plan: PlanId, currency: string): number {
  const pricing = PLAN_PRICING[plan] as unknown as Record<string, number>
  return pricing[currency] || pricing['USD'] || 12
}