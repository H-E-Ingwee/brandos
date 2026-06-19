import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// ── GET: List team members and pending invitations ────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    // Get the user's organisation
    const { data: org } = await supabase
      .from('organisations')
      .select('*')
      .eq('owner_id', user.id)
      .single()

    if (!org) return NextResponse.json({ error: 'Organisation not found' }, { status: 404 })

    // Get team members with their profiles
    const { data: members } = await supabase
      .from('team_members')
      .select(`
        id, role, joined_at,
        user:profiles(id, full_name, business_name, avatar_url),
        invited_by_profile:profiles!team_members_invited_by_fkey(full_name)
      `)
      .eq('organisation_id', org.id)
      .order('joined_at', { ascending: true })

    // Get pending invitations
    const { data: invitations } = await supabase
      .from('invitations')
      .select('*')
      .eq('organisation_id', org.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    // Get audit log (last 20 actions)
    const { data: auditLog } = await supabase
      .from('audit_log')
      .select(`
        id, action, target_type, metadata, created_at,
        actor:profiles(full_name)
      `)
      .eq('organisation_id', org.id)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({
      organisation: org,
      members: members || [],
      invitations: invitations || [],
      audit_log: auditLog || [],
    })
  } catch (error) {
    console.error('Team GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 })
  }
}

// ── POST: Invite a new team member ────────────────────────────────────────────
const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const parsed = inviteSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })

    const { email, role } = parsed.data

    // Get organisation
    const { data: org } = await supabase
      .from('organisations')
      .select('*, owner:profiles(full_name, business_name)')
      .eq('owner_id', user.id)
      .single()

    if (!org) return NextResponse.json({ error: 'Organisation not found' }, { status: 404 })

    // Check plan allows team members
    if (org.plan === 'free' || org.plan === 'growth') {
      return NextResponse.json({
        error: 'Team members are only available on Pro and Agency plans. Upgrade to invite team members.',
        upgrade_required: true,
      }, { status: 403 })
    }

    // Check member limit
    const { count: memberCount } = await supabase
      .from('team_members')
      .select('id', { count: 'exact' })
      .eq('organisation_id', org.id)

    if (org.plan === 'pro' && (memberCount || 0) >= 3) {
      return NextResponse.json({
        error: 'Pro plan allows up to 3 team members. Upgrade to Agency for unlimited members.',
        upgrade_required: true,
      }, { status: 403 })
    }

    // Check if already a member or invited
    const { data: existingInvite } = await supabase
      .from('invitations')
      .select('id, status')
      .eq('organisation_id', org.id)
      .eq('email', email)
      .single()

    if (existingInvite?.status === 'pending') {
      return NextResponse.json({ error: 'An invitation has already been sent to this email address.' }, { status: 400 })
    }

    // Get inviter profile
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Create invitation (upsert in case of previous declined/expired)
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .upsert({
        organisation_id: org.id,
        invited_by: user.id,
        email,
        role,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'organisation_id,email' })
      .select()
      .single()

    if (inviteError) {
      console.error('Invitation error:', inviteError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // Send invitation email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteUrl = `${appUrl}/invite/accept?token=${invitation.token}`
    const orgName = (org as any).owner?.business_name || 'BrandOS'
    const inviterName = inviterProfile?.full_name || 'Your colleague'
    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)

    try {
      if (resend) {
        await resend.emails.send({
          from: 'BrandOS <onboarding@resend.dev>',
          replyTo: 'Ingweplex@gmail.com',
          to: email,
          subject: `${inviterName} invited you to join ${orgName} on BrandOS`,
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0F1D26;font-family:'Inter',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;background:#F25C05;border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:18px;">⚡</span>
        </div>
        <span style="color:white;font-size:20px;font-weight:700;">BrandOS</span>
      </div>
    </div>
    <div style="background:#1A2E3D;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.08);">
      <h1 style="color:white;font-size:24px;font-weight:700;margin:0 0 12px 0;">You've been invited! 🎉</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;margin:0 0 24px 0;">
        <strong style="color:white;">${inviterName}</strong> has invited you to join 
        <strong style="color:#F25C05;">${orgName}</strong> on BrandOS as a 
        <strong style="color:white;">${roleLabel}</strong>.
      </p>
      <div style="background:#0F1D26;border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="color:rgba(255,255,255,0.4);font-size:12px;margin-bottom:8px;">YOUR ROLE</div>
        <div style="color:white;font-weight:700;font-size:18px;">${roleLabel}</div>
        <div style="color:rgba(255,255,255,0.4);font-size:13px;margin-top:4px;">
          ${role === 'admin' ? 'Full access — can manage team, edit all brand data, and invite members' :
            role === 'editor' ? 'Can view and edit all brand data, generate content and strategies' :
            'Can view all brand data and reports (read-only)'}
        </div>
      </div>
      <a href="${inviteUrl}" style="display:inline-block;background:#F25C05;color:white;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;">
        Accept Invitation →
      </a>
      <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:16px;">
        This invitation expires in 7 days. If you didn't expect this, you can ignore this email.
      </p>
    </div>
    <div style="text-align:center;padding-top:24px;">
      <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;">
        © 2026 Ingweplex · Nairobi, Kenya
      </p>
    </div>
  </div>
</body>
</html>`,
        })
      }
    } catch (emailError) {
      console.error('Invitation email error:', emailError)
      // Don't fail — invitation was created, email just didn't send
    }

    // Log the action
    await supabase.from('audit_log').insert({
      organisation_id: org.id,
      actor_id: user.id,
      action: 'invite_member',
      target_type: 'invitation',
      metadata: { email, role, invitation_id: invitation.id },
    })

    return NextResponse.json({ invitation, message: `Invitation sent to ${email}` })
  } catch (error) {
    console.error('Team invite error:', error)
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 })
  }
}