import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializeTransaction, generateReference, getPlanAmount, PLAN_PRICING, type PlanId } from '@/lib/paystack'
import { z } from 'zod'

const schema = z.object({
  plan: z.enum(['growth', 'pro', 'agency']),
  currency: z.string().default('KES'),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const { plan, currency } = parsed.data

    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('*').eq('id', user.id).maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found. Please complete your account setup.' }, { status: 404 })
    }

    const planOrder = ['free', 'growth', 'pro', 'agency']
    const currentPlanIndex = planOrder.indexOf(profile.plan || 'free')
    const newPlanIndex = planOrder.indexOf(plan)
    if (currentPlanIndex >= newPlanIndex) {
      return NextResponse.json({ error: `You are already on the ${profile.plan} plan or higher` }, { status: 400 })
    }

    const amount = getPlanAmount(plan as PlanId, currency)
    const reference = generateReference(user.id, plan)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://brandosapp.vercel.app'
    const callbackUrl = `${appUrl}/dashboard/billing?status=success&ref=${reference}`

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount,
        currency,
        plan,
        status: 'pending',
        payment_method: 'card',
        flutterwave_tx_ref: reference,
        phone_number: null,
      })
      .select()
      .maybeSingle()

    if (paymentError) {
      console.error('Payment record error:', paymentError)
      return NextResponse.json({ error: 'Failed to create payment record.', details: paymentError.message }, { status: 500 })
    }

    let paystackResponse: any
    try {
      paystackResponse = await initializeTransaction({
        email: user.email!,
        amount,
        currency,
        reference,
        callbackUrl,
        metadata: { plan, user_id: user.id, payment_id: payment?.id, business_name: profile.business_name || '' },
      })
    } catch (paystackError: any) {
      console.error('Paystack error:', paystackError)
      if (payment?.id) await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id)
      return NextResponse.json({ error: paystackError.message || 'Payment initialization failed.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      checkout_url: paystackResponse.authorization_url,
      reference,
      payment_id: payment?.id,
    })

  } catch (error: any) {
    console.error('Payment initiation error:', error)
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 })
  }
}