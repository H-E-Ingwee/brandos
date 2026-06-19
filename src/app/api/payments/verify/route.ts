import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkPaymentStatus } from '@/lib/intasend'
import { sendPaymentReceiptEmail, sendPlanUpgradeEmail } from '@/lib/resend'
import { z } from 'zod'

const schema = z.object({
  invoice_id: z.string().optional(),
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

    const { invoice_id, tx_ref, payment_id } = parsed.data

    // Find the payment record
    let query = supabase.from('payments').select('*').eq('user_id', user.id)
    if (payment_id) query = query.eq('id', payment_id)
    else if (tx_ref) query = query.eq('flutterwave_tx_ref', tx_ref)

    const { data: payment, error: paymentError } = await query.maybeSingle()

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    // If already confirmed, return success
    if (payment.status === 'success') {
      return NextResponse.json({ status: 'success', plan: payment.plan, already_confirmed: true })
    }

    // Check status with IntaSend
    const invoiceToCheck = invoice_id || payment.flutterwave_tx_id
    if (!invoiceToCheck) {
      return NextResponse.json({ status: 'pending', message: 'Payment is being processed' })
    }

    let statusData: any
    try {
      statusData = await checkPaymentStatus(invoiceToCheck)
    } catch (e) {
      return NextResponse.json({ status: 'pending', message: 'Payment is being processed' })
    }

    const invoiceStatus = statusData?.invoice?.state || statusData?.state || ''
    const isSuccess = invoiceStatus === 'COMPLETE' || invoiceStatus === 'complete' || statusData?.status === 'success'
    const isFailed = invoiceStatus === 'FAILED' || invoiceStatus === 'failed' || invoiceStatus === 'CANCELLED'

    if (isSuccess) {
      // Update payment status
      await supabase.from('payments')
        .update({ status: 'success', flutterwave_tx_id: invoiceToCheck })
        .eq('id', payment.id)

      // Upgrade user plan
      await supabase.from('profiles')
        .update({ plan: payment.plan })
        .eq('id', user.id)

      // Get profile for email
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()

      // Send receipt email
      if (profile) {
        try {
          await sendPaymentReceiptEmail(
            user.email!,
            profile.full_name || 'there',
            payment.plan,
            payment.amount,
            payment.currency,
            payment.flutterwave_tx_ref || invoiceToCheck,
            payment.payment_method
          )
          await sendPlanUpgradeEmail(user.email!, profile.full_name || 'there', payment.plan)
        } catch (emailError) {
          console.error('Email send error:', emailError)
          // Don't fail the payment if email fails
        }
      }

      return NextResponse.json({
        status: 'success',
        plan: payment.plan,
        message: `Your account has been upgraded to the ${payment.plan} plan!`,
      })

    } else if (isFailed) {
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id)
      return NextResponse.json({ status: 'failed', message: 'Payment was not completed. Please try again.' })
    }

    return NextResponse.json({ status: 'pending', message: 'Payment is still being processed. Please wait a moment.' })

  } catch (error: any) {
    console.error('Payment verify error:', error)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}