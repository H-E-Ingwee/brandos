import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// ── GET: Validate invitation token ────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'Invalid invitation link' }, { status: 400 })

    const supabase = await createServiceClient()

    const { data: invitation } = await supabase
      .from('invitations')
      .select(`
        id, email, role, status, expires_at,
        organisation:organisations(id, name, slug, owner:profiles(full_name, business_name))
      `)
      .eq('token', token)
      .single()

    if (!invitation) return NextResponse.json({ error: 'Invitation not found or already used' }, { status: 404 })
    if (invitation.status !== 'pending') return NextResponse.json({ error: `This invitation has already been ${invitation.status}` }, { status: 400 })
    if (new Date(invitation.expires_at) < new Date()) {
      await supabase.from('invitations').update({ status: 'expired' }).eq('id', invitation.id)
      return NextResponse.json({ error: 'This invitation has expired. Please ask for a new one.' }, { status: 400 })
    }

    return NextResponse.json({ invitation })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to validate invitation' }, { status: 500 })
  }
}

// ── POST: Accept invitation ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Please sign in or create an account to accept this invitation', requires_auth: true }, { status: 401 })

    const body = await request.json()
    const { token } = body
    if (!token) return NextResponse.json({ error: 'Invalid invitation token' }, { status: 400 })

    const serviceSupabase = await createServiceClient()

    // Get invitation
    const { data: invitation } = await serviceSupabase
      .from('invitations')
      .select('*, organisation:organisations(id, owner_id)')
      .eq('token', token)
      .single()

    if (!invitation) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    if (invitation.status !== 'pending') return NextResponse.json({ error: `This invitation has already been ${invitation.status}` }, { status: 400 })
    if (new Date(invitation.expires_at) < new Date()) {
      await serviceSupabase.from('invitations').update({ status: 'expired' }).eq('id', invitation.id)
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 })
    }

    // Verify email matches (security check)
    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json({
        error: `This invitation was sent to ${invitation.email}. Please sign in with that email address to accept it.`,
      }, { status: 403 })
    }

    // Check if already a member
    const { data: existingMember } = await serviceSupabase
      .from('team_members')
      .select('id')
      .eq('organisation_id', invitation.organisation_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      await serviceSupabase.from('invitations').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', invitation.id)
      return NextResponse.json({ message: 'You are already a member of this team', already_member: true })
    }

    // Add as team member
    const { error: memberError } = await serviceSupabase
      .from('team_members')
      .insert({
        organisation_id: invitation.organisation_id,
        user_id: user.id,
        role: invitation.role,
        invited_by: invitation.invited_by,
      })

    if (memberError) {
      console.error('Add member error:', memberError)
      return NextResponse.json({ error: 'Failed to add you to the team' }, { status: 500 })
    }

    // Mark invitation as accepted
    await serviceSupabase.from('invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invitation.id)

    // Log the action
    await serviceSupabase.from('audit_log').insert({
      organisation_id: invitation.organisation_id,
      actor_id: user.id,
      action: 'accept_invitation',
      target_type: 'invitation',
      metadata: { role: invitation.role, email: invitation.email },
    })

    return NextResponse.json({
      message: 'Welcome to the team! You now have access to the brand workspace.',
      role: invitation.role,
      organisation_id: invitation.organisation_id,
    })
  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 })
  }
}