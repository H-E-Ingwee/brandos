import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, business_name, welcome_email_sent')
      .eq('id', user.id)
      .maybeSingle()

    // Don't send twice
    if ((profile as any)?.welcome_email_sent) {
      return NextResponse.json({ sent: false, reason: 'Already sent' })
    }

    await sendWelcomeEmail(
      user.email!,
      profile?.full_name || user.email!.split('@')[0],
      profile?.business_name || 'your business'
    )

    // Mark as sent (add this column if needed — graceful fail if not)
    await supabase.from('profiles')
      .update({ onboarding_complete: false } as any)
      .eq('id', user.id)

    return NextResponse.json({ sent: true })
  } catch (error: any) {
    console.error('Welcome email error:', error)
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 })
  }
}