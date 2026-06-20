import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initiateMpesaPayment, createCheckoutLink, generateTxRef, PLAN_PRICING, type PlanId } from '@/lib/intasend'
import { z } from 'zod'

const schema = z.object({
  plan: z.enum(['growth', 'pro', 'agency']),
  method: z.enum(['mpesa', 'card']),
  phone: z.string().optional(), // required for mpesa
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })

    const { plan, method, phone } = parsed.data

    if (method === 'mpesa' && !phone) {
      return NextResponse.json({ error: 'Phone number is required for M-Pesa payment' }, { status: 400 })
    }

    // Get user profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Check if already on this plan or higher
    const planOrder = ['free', 'growth', 'pro', 'agency']
    const currentPlanIndex = planOrder.indexOf(profile.plan)
    const newPlanIndex = planOrder.indexOf(plan)
    if (currentPlanIndex >= newPlanIndex) {
      return NextResponse.json({ error: `You are already on the ${profile.plan} plan or higher` }, { status: 400 })
    }

    const pricing = PLAN_PRICING[plan as PlanId]
    const txRef = generateTxRef(user.id, plan)
    const nameParts = (profile.full_name || 'BrandOS User').split(' ')
    const firstName = nameParts[0] || 'BrandOS'
    const lastName = nameParts.slice(1).join(' ') || 'User'
    const narrative = `BrandOS ${pricing.label} - Monthly Subscription`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create pending payment record in Supabase
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount: pricing.kes,
        currency: 'KES',
        plan,
        status: 'pending',
        payment_method: method,
        flutterwave_tx_ref: txRef, // reusing this column for IntaSend tx_ref
        phone_number: phone || null,
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment record error:', paymentError)
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 })
    }

    if (method === 'mpesa') {
      // Initiate M-Pesa STK Push
      const mpesaResponse = await initiateMpesaPayment({
        phone: phone!,
        amount: pricing.kes,
        currency: 'KES',
        email: user.email!,
        firstName,
        lastName,
        narrative,
        apiRef: txRef,
      })

      // Save IntaSend invoice ID for status checking
      await supabase.from('payments')
        .update({ flutterwave_tx_id: mpesaResponse.invoice?.invoice_id || mpesaResponse.id })
        .eq('id', payment.id)

      return NextResponse.json({
        success: true,
        method: 'mpesa',
        message: 'M-Pesa payment initiated. Check your phone for the STK push prompt.',
        invoice_id: mpesaResponse.invoice?.invoice_id || mpesaResponse.id,
        tx_ref: txRef,
        payment_id: payment.id,
      })

    } else {
      // Create card checkout link
      const checkoutResponse = await createCheckoutLink({
        amount: pricing.kes,
        currency: 'KES',
        email: user.email!,
        firstName,
        lastName,
        narrative,
        apiRef: txRef,
        redirectUrl: `${appUrl}/dashboard/billing?status=success&ref=${txRef}`,
      })

      return NextResponse.json({
        success: true,
        method: 'card',
        checkout_url: checkoutResponse.url || checkoutResponse.checkout_url,
        tx_ref: txRef,
        payment_id: payment.id,
      })
    }

  } catch (error: any) {
    console.error('Payment initiation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initiate payment. Please try again.' },
      { status: 500 }
    )
  }
}