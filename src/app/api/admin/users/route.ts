import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Simple admin auth check — validates the secret key from header
function isAdminRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('x-admin-key')
  const cookieKey = request.cookies.get('admin_key')?.value
  const adminKey = process.env.ADMIN_SECRET_KEY
  return authHeader === adminKey || cookieKey === adminKey
}

// ── GET: List all users ───────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const supabase = await createServiceClient()

    // Get all profiles with auth user data
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get auth users for emails
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()

    // Get organisations
    const { data: orgs } = await supabase
      .from('organisations')
      .select('owner_id, name, plan, max_members, created_at')

    // Get payment stats
    const { data: payments } = await supabase
      .from('payments')
      .select('user_id, amount, status, plan, created_at')
      .eq('status', 'success')

    // Get content post counts
    const { data: contentCounts } = await supabase
      .from('content_posts')
      .select('user_id')

    // Get chat message counts
    const { data: chatCounts } = await supabase
      .from('chat_messages')
      .select('user_id')

    // Merge data
    const enriched = profiles?.map(profile => {
      const authUser = authUsers?.find(u => u.id === profile.id)
      const org = orgs?.find(o => o.owner_id === profile.id)
      const userPayments = payments?.filter(p => p.user_id === profile.id) || []
      const totalRevenue = userPayments.reduce((sum, p) => sum + p.amount, 0)
      const contentCount = contentCounts?.filter(c => c.user_id === profile.id).length || 0
      const chatCount = chatCounts?.filter(c => c.user_id === profile.id).length || 0

      return {
        ...profile,
        email: authUser?.email,
        email_confirmed: authUser?.email_confirmed_at ? true : false,
        last_sign_in: authUser?.last_sign_in_at,
        auth_provider: authUser?.app_metadata?.provider || 'email',
        organisation: org,
        total_revenue_kes: totalRevenue,
        payment_count: userPayments.length,
        content_posts: contentCount,
        ai_conversations: chatCount,
      }
    })

    // Platform stats
    const totalUsers = profiles?.length || 0
    const paidUsers = profiles?.filter(p => p.plan !== 'free').length || 0
    const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
    const totalContent = contentCounts?.length || 0

    return NextResponse.json({
      users: enriched,
      stats: {
        total_users: totalUsers,
        paid_users: paidUsers,
        free_users: totalUsers - paidUsers,
        total_revenue_kes: totalRevenue,
        total_content_posts: totalContent,
        conversion_rate: totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : '0',
      },
    })
  } catch (error: any) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ── PATCH: Update user plan ───────────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const supabase = await createServiceClient()
    const { userId, plan } = await request.json()

    if (!userId || !plan) {
      return NextResponse.json({ error: 'userId and plan are required' }, { status: 400 })
    }

    const validPlans = ['free', 'growth', 'pro', 'agency']
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Update profile plan
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ plan })
      .eq('id', userId)

    if (profileError) throw profileError

    // Update organisation plan
    await supabase
      .from('organisations')
      .update({
        plan,
        max_members: plan === 'free' ? 1 : plan === 'growth' ? 1 : plan === 'pro' ? 3 : 999,
      })
      .eq('owner_id', userId)

    return NextResponse.json({ success: true, message: `User plan updated to ${plan}` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}