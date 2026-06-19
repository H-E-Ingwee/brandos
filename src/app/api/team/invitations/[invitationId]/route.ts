import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ── DELETE: Cancel a pending invitation ───────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: { invitationId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: org } = await supabase
      .from('organisations')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!org) return NextResponse.json({ error: 'Not authorised' }, { status: 403 })

    const { data: invitation } = await supabase
      .from('invitations')
      .select('id, email, role')
      .eq('id', params.invitationId)
      .eq('organisation_id', org.id)
      .maybeSingle()

    if (!invitation) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })

    await supabase.from('invitations')
      .update({ status: 'expired' })
      .eq('id', params.invitationId)

    await supabase.from('audit_log').insert({
      organisation_id: org.id,
      actor_id: user.id,
      action: 'cancel_invitation',
      target_type: 'invitation',
      metadata: { email: invitation.email, role: invitation.role },
    })

    return NextResponse.json({ message: 'Invitation cancelled' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel invitation' }, { status: 500 })
  }
}