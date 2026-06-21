import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

function isAdmin(request: NextRequest): boolean {
  const header = request.headers.get('x-admin-key')
  const cookie = request.cookies.get('admin_key')?.value
  return header === process.env.ADMIN_SECRET_KEY || cookie === process.env.ADMIN_SECRET_KEY
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  try {
    const supabase = await createServiceClient()
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()
    const { data: payments } = await supabase.from('payments').select('user_id, amount, status, plan, created_at').eq('status', 'success')
    const { data: contentCounts } = await supabase.from('content_posts').select('user_id')
    const { data: chatCounts } = await supabase.from('chat_messages').select('user_id')

    const enriched = profiles?.map(profile => {
      const authUser = authUsers?.find(u => u.id === profile.id)
      const userPayments = payments?.filter(p => p.user_id === profile.id) || []
      const totalRevenue = userPayments.reduce((sum, p) => sum + p.amount, 0)
      return {
        ...profile,
        email: authUser?.email,
        email_confirmed: !!authUser?.email_confirmed_at,
        last_sign_in: authUser?.last_sign_in_at,
        auth_provider: authUser?.app_metadata?.provider || 'email',
        total_revenue_kes: totalRevenue,
        payment_count: userPayments.length,
        content_posts: contentCounts?.filter(c => c.user_id === profile.id).length || 0,
        ai_conversations: chatCounts?.filter(c => c.user_id === profile.id).length || 0,
      }
    })

    const totalUsers = profiles?.length || 0
    const paidUsers = profiles?.filter(p => p.plan !== 'free').length || 0
    const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0

    return NextResponse.json({
      users: enriched,
      stats: {
        total_users: totalUsers,
        paid_users: paidUsers,
        free_users: totalUsers - paidUsers,
        total_revenue_kes: totalRevenue,
        total_content_posts: contentCounts?.length || 0,
        conversion_rate: totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : '0',
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  try {
    const supabase = await createServiceClient()
    const { userId, plan } = await request.json()
    if (!userId || !plan) return NextResponse.json({ error: 'userId and plan required' }, { status: 400 })
    if (!['free','growth','pro','agency'].includes(plan)) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    await supabase.from('profiles').update({ plan }).eq('id', userId)
    await supabase.from('organisations').update({
      plan,
      max_members: plan === 'free' ? 1 : plan === 'growth' ? 1 : plan === 'pro' ? 3 : 999,
    }).eq('owner_id', userId)

    return NextResponse.json({ success: true, message: `Plan updated to ${plan}` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}