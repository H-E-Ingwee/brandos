import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer']),
})

// ── PATCH: Update member role ─────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

    // Get org and verify ownership/admin
    const { data: org } = await supabase
      .from('organisations')
      .select('id, owner_id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!org) return NextResponse.json({ error: 'Not authorised to manage this team' }, { status: 403 })

    // Get the member to update
    const { data: member } = await supabase
      .from('team_members')
      .select('id, user_id, role')
      .eq('id', params.memberId)
      .eq('organisation_id', org.id)
      .maybeSingle()

    if (!member) return NextResponse.json({ error: 'Team member not found' }, { status: 404 })

    const oldRole = member.role
    const { data: updated, error: updateError } = await supabase
      .from('team_members')
      .update({ role: parsed.data.role })
      .eq('id', params.memberId)
      .select()
      .maybeSingle()

    if (updateError) return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })

    // Log the action
    await supabase.from('audit_log').insert({
      organisation_id: org.id,
      actor_id: user.id,
      action: 'change_role',
      target_id: member.user_id,
      target_type: 'user',
      metadata: { old_role: oldRole, new_role: parsed.data.role },
    })

    return NextResponse.json({ member: updated, message: 'Role updated successfully' })
  } catch (error) {
    console.error('Role update error:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

// ── DELETE: Remove team member ────────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    // Get org
    const { data: org } = await supabase
      .from('organisations')
      .select('id, owner_id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!org) return NextResponse.json({ error: 'Not authorised' }, { status: 403 })

    // Get member before deleting
    const { data: member } = await supabase
      .from('team_members')
      .select('id, user_id, role')
      .eq('id', params.memberId)
      .eq('organisation_id', org.id)
      .maybeSingle()

    if (!member) return NextResponse.json({ error: 'Team member not found' }, { status: 404 })

    // Prevent removing yourself
    if (member.user_id === user.id) {
      return NextResponse.json({ error: 'You cannot remove yourself from the team' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', params.memberId)

    if (deleteError) return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })

    // Log the action
    await supabase.from('audit_log').insert({
      organisation_id: org.id,
      actor_id: user.id,
      action: 'remove_member',
      target_id: member.user_id,
      target_type: 'user',
      metadata: { removed_role: member.role },
    })

    return NextResponse.json({ message: 'Team member removed successfully' })
  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 })
  }
}