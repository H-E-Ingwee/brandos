import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendPaymentReceiptEmail, sendPlanUpgradeEmail } from '@/lib/resend'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    // Verify webhook signature
    const secret = process.env.PAYSTACK_SECRET_KEY!
    const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')

    if (hash !== signature) {
      console.error('Paystack webhook: invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    console.log('Paystack webhook event:', event.event)

    if (event.event === 'charge.success') {
      const data = event.data
      const reference = data.reference
      const status = data.status

      if (status !== 'success') {
        return NextResponse.json({ received: true, processed: false })
      }

      const supabase = await createServiceClient()

      // Find payment by reference
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('flutterwave_tx_ref', reference)
        .maybeSingle()

      if (!payment) {
        console.error('Webhook: payment not found for reference:', reference)
        return NextResponse.json({ received: true, processed: false, reason: 'Payment not found' })
      }

      if (payment.status === 'success') {
        return NextResponse.json({ received: true, processed: false, reason: 'Already processed' })
      }

      // Update payment
      await supabase.from('payments').update({ status: 'success' }).eq('id', payment.id)

      // Upgrade user plan
      await supabase.from('profiles').update({ plan: payment.plan }).eq('id', payment.user_id)

      // Update organisation
      await supabase.from('organisations').update({
        plan: payment.plan,
        max_members: payment.plan === 'pro' ? 3 : payment.plan === 'agency' ? 999 : 1,
      }).eq('owner_id', payment.user_id)

      // Get user email
      const { data: { user } } = await supabase.auth.admin.getUserById(payment.user_id)
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', payment.user_id).maybeSingle()

      if (user?.email) {
        try {
          await sendPaymentReceiptEmail(
            user.email, profile?.full_name || 'there',
            payment.plan, payment.amount, payment.currency,
            reference, 'card'
          )
          await sendPlanUpgradeEmail(user.email, profile?.full_name || 'there', payment.plan)
        } catch (emailErr) {
          console.error('Webhook email error:', emailErr)
        }
      }

      console.log(`Webhook: upgraded user ${payment.user_id} to ${payment.plan}`)
      return NextResponse.json({ received: true, processed: true })
    }

    return NextResponse.json({ received: true, processed: false, event: event.event })

  } catch (error: any) {
    console.error('Paystack webhook error:', error)
    return NextResponse.json({ received: true, error: error.message }, { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'BrandOS Paystack webhook active' })
}