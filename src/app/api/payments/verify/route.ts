import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTransaction } from '@/lib/paystack'
import { sendPaymentReceiptEmail, sendPlanUpgradeEmail } from '@/lib/resend'
import { z } from 'zod'

const schema = z.object({
  reference: z.string().optional(),
  tx_ref: z.string().optional(),
  payment_id: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const { reference, tx_ref, payment_id } = parsed.data
    const ref = reference || tx_ref

    // Find payment record
    let query = supabase.from('payments').select('*').eq('user_id', user.id)
    if (payment_id) query = query.eq('id', payment_id)
    else if (ref) query = query.eq('flutterwave_tx_ref', ref)

    const { data: payment } = await query.maybeSingle()

    if (!payment) return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    if (payment.status === 'success') {
      return NextResponse.json({ status: 'success', plan: payment.plan, already_confirmed: true })
    }

    // Verify with Paystack
    const payRef = ref || payment.flutterwave_tx_ref
    if (!payRef) return NextResponse.json({ status: 'pending', message: 'Payment is being processed' })

    let verification: any
    try {
      verification = await verifyTransaction(payRef)
    } catch (e) {
      return NextResponse.json({ status: 'pending', message: 'Payment is being processed. Please wait.' })
    }

    const isSuccess = verification.status === 'success'
    const isFailed = verification.status === 'failed' || verification.status === 'abandoned'

    if (isSuccess) {
      // Update payment
      await supabase.from('payments').update({ status: 'success' }).eq('id', payment.id)

      // Upgrade user plan
      await supabase.from('profiles').update({ plan: payment.plan }).eq('id', user.id)

      // Update organisation plan
      await supabase.from('organisations').update({
        plan: payment.plan,
        max_members: payment.plan === 'pro' ? 3 : payment.plan === 'agency' ? 999 : 1,
      }).eq('owner_id', user.id)

      // Send emails
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
      try {
        await sendPaymentReceiptEmail(
          user.email!, profile?.full_name || 'there',
          payment.plan, payment.amount, payment.currency,
          payRef, 'card'
        )
        await sendPlanUpgradeEmail(user.email!, profile?.full_name || 'there', payment.plan)
      } catch (emailErr) {
        console.error('Email error:', emailErr)
      }

      return NextResponse.json({ status: 'success', plan: payment.plan, message: `Your account has been upgraded to the ${payment.plan} plan!` })
    }

    if (isFailed) {
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id)
      return NextResponse.json({ status: 'failed', message: 'Payment was not completed. Please try again.' })
    }

    return NextResponse.json({ status: 'pending', message: 'Payment is still being processed.' })

  } catch (error: any) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}