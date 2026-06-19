import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendPaymentReceiptEmail, sendPlanUpgradeEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('IntaSend webhook received:', JSON.stringify(body, null, 2))

    // IntaSend webhook payload structure
    const {
      invoice_id,
      state,
      api_ref,
      value,
      currency,
      payment_method,
      customer,
    } = body

    // Only process completed payments
    const isComplete = state === 'COMPLETE' || state === 'complete'
    if (!isComplete) {
      return NextResponse.json({ received: true, processed: false, reason: `State: ${state}` })
    }

    // Use service client (bypasses RLS for webhook processing)
    const supabase = await createServiceClient()

    // Find payment by tx_ref (api_ref) or invoice_id
    let payment: any = null

    if (api_ref) {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('flutterwave_tx_ref', api_ref)
        .single()
      payment = data
    }

    if (!payment && invoice_id) {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('flutterwave_tx_id', invoice_id)
        .single()
      payment = data
    }

    if (!payment) {
      console.error('Webhook: Payment not found for api_ref:', api_ref, 'invoice_id:', invoice_id)
      return NextResponse.json({ received: true, processed: false, reason: 'Payment not found' })
    }

    // Skip if already processed
    if (payment.status === 'success') {
      return NextResponse.json({ received: true, processed: false, reason: 'Already processed' })
    }

    // Update payment to success
    await supabase.from('payments')
      .update({
        status: 'success',
        flutterwave_tx_id: invoice_id || payment.flutterwave_tx_id,
      })
      .eq('id', payment.id)

    // Upgrade user plan
    await supabase.from('profiles')
      .update({ plan: payment.plan })
      .eq('id', payment.user_id)

    // Get user details for email
    const { data: { user } } = await supabase.auth.admin.getUserById(payment.user_id)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', payment.user_id)
      .single()

    const userEmail = user?.email || customer?.email
    const userName = profile?.full_name || customer?.first_name || 'there'

    if (userEmail) {
      try {
        await sendPaymentReceiptEmail(
          userEmail,
          userName,
          payment.plan,
          payment.amount,
          payment.currency || 'KES',
          api_ref || invoice_id,
          payment_method || payment.payment_method
        )
        await sendPlanUpgradeEmail(userEmail, userName, payment.plan)
      } catch (emailError) {
        console.error('Webhook email error:', emailError)
      }
    }

    console.log(`Webhook: Successfully upgraded user ${payment.user_id} to ${payment.plan} plan`)
    return NextResponse.json({ received: true, processed: true, plan: payment.plan })

  } catch (error: any) {
    console.error('Webhook processing error:', error)
    // Always return 200 to IntaSend so they don't retry
    return NextResponse.json({ received: true, error: error.message }, { status: 200 })
  }
}

// IntaSend may send GET requests to verify the webhook endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('challenge')
  if (challenge) return NextResponse.json({ challenge })
  return NextResponse.json({ status: 'BrandOS IntaSend webhook active' })
}