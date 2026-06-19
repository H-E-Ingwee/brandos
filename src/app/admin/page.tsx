'use client'

import { useState, useEffect } from 'react'
import {
  Users, DollarSign, TrendingUp, MessageSquare, Shield,
  RefreshCw, Loader2, ChevronDown, Search, LogOut,
  CheckCircle, AlertCircle, Crown, Zap, BarChart3, Eye
} from 'lucide-react'

const planColors: Record<string, string> = {
  free: '#666666', growth: '#F25C05', pro: '#D9910B', agency: '#1A7A6E'
}
const planOrder = ['free', 'growth', 'pro', 'agency']

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null)
  const [updateMsg, setUpdateMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'stats'>('users')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    const response = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: keyInput }),
    })
    if (response.ok) {
      setAuthed(true)
      fetchData()
    } else {
      setAuthError('Invalid admin key. Check your ADMIN_SECRET_KEY environment variable.')
    }
    setAuthLoading(false)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    setAuthed(false)
    setData(null)
  }

  const fetchData = async () => {
    setLoading(true)
    const response = await fetch('/api/admin/users', {
      headers: { 'x-admin-key': keyInput || '' },
    })
    if (response.ok) {
      const json = await response.json()
      setData(json)
    }
    setLoading(false)
  }

  const handlePlanChange = async (userId: string, newPlan: string) => {
    setUpdatingPlan(userId)
    setUpdateMsg('')
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': keyInput || '' },
      body: JSON.stringify({ userId, plan: newPlan }),
    })
    const result = await response.json()
    if (response.ok) {
      setUpdateMsg(`✅ Plan updated to ${newPlan}`)
      fetchData()
    } else {
      setUpdateMsg(`❌ ${result.error}`)
    }
    setUpdatingPlan(null)
    setTimeout(() => setUpdateMsg(''), 3000)
  }

  const filteredUsers = data?.users?.filter((u: any) => {
    const matchSearch = !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.business_name?.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'all' || u.plan === planFilter
    return matchSearch && matchPlan
  }) || []

  // Login screen
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0F1D26] flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10 justify-center">
            <div className="w-9 h-9 rounded-xl bg-[#F25C05] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">BrandOS Admin</span>
          </div>
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-8">
            <h1 className="text-xl font-display font-bold text-white mb-2">Admin Access</h1>
            <p className="text-white/40 text-sm mb-6">Enter your admin secret key to access the platform dashboard.</p>
            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 text-sm mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{authError}
              </div>
            )}
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Admin Secret Key</label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  placeholder="Enter ADMIN_SECRET_KEY"
                  required
                  className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all"
                />
              </div>
              <button type="submit" disabled={authLoading}
                className="w-full bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Shield className="w-4 h-4" /> Access Admin Dashboard</>}
              </button>
            </form>
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-white/25 text-xs text-center">
                Your admin key is set in <code className="bg-white/5 px-1 rounded">ADMIN_SECRET_KEY</code> environment variable
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F1D26]">
      {/* Top bar */}
      <div className="bg-[#0A1520] border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F25C05] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white">BrandOS Admin</span>
          <span className="bg-[#F25C05]/10 text-[#F25C05] text-xs font-bold px-2 py-0.5 rounded-full">Super Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A2E3D] border border-white/8 text-white/50 hover:text-white text-xs transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A2E3D] border border-white/8 text-white/50 hover:text-red-400 text-xs transition-all">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {updateMsg && (
          <div className={`rounded-xl px-4 py-3 flex items-center gap-3 text-sm mb-6 ${updateMsg.startsWith('✅') ? 'bg-[#1A7A6E]/10 border border-[#1A7A6E]/20 text-[#1A7A6E]' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {updateMsg}
          </div>
        )}

        {loading && !data ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: data?.stats?.total_users || 0, icon: Users, color: '#F25C05', sub: `${data?.stats?.free_users || 0} free` },
                { label: 'Paid Users', value: data?.stats?.paid_users || 0, icon: Crown, color: '#D9910B', sub: `${data?.stats?.conversion_rate || 0}% conversion` },
                { label: 'Total Revenue', value: `KES ${(data?.stats?.total_revenue_kes || 0).toLocaleString()}`, icon: DollarSign, color: '#1A7A6E', sub: 'All time' },
                { label: 'Content Posts', value: data?.stats?.total_content_posts || 0, icon: MessageSquare, color: '#F25C05', sub: 'AI generated' },
              ].map(stat => (
                <div key={stat.label} className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/40 text-xs">{stat.label}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                      <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                  </div>
                  <div className="text-2xl font-display font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white/30 text-xs">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Plan distribution */}
            <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6 mb-8">
              <h2 className="text-white font-display font-semibold mb-4">Plan Distribution</h2>
              <div className="grid grid-cols-4 gap-4">
                {planOrder.map(plan => {
                  const count = data?.users?.filter((u: any) => u.plan === plan).length || 0
                  const total = data?.users?.length || 1
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={plan} className="text-center">
                      <div className="text-2xl font-display font-bold mb-1" style={{ color: planColors[plan] }}>{count}</div>
                      <div className="text-white/50 text-sm capitalize mb-2">{plan}</div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: planColors[plan] }} />
                      </div>
                      <div className="text-white/25 text-xs mt-1">{pct}%</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Users table */}
            <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center gap-4 flex-wrap">
                <h2 className="text-white font-display font-semibold">All Users ({filteredUsers.length})</h2>
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by email, name, or business..."
                    className="w-full bg-[#162330] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F25C05]/60 transition-all"
                  />
                </div>
                <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
                  className="bg-[#162330] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F25C05]/60 transition-all">
                  <option value="all">All Plans</option>
                  {planOrder.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['User', 'Business', 'Plan', 'AI Queries', 'Content', 'Revenue', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-left text-white/30 text-xs font-semibold px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((user: any) => (
                      <tr key={user.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#F25C05]/20 flex items-center justify-center text-[#F25C05] font-bold text-sm flex-shrink-0">
                              {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium">{user.full_name || 'No name'}</div>
                              <div className="text-white/30 text-xs">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-white/70 text-sm">{user.business_name || '—'}</div>
                          <div className="text-white/25 text-xs">{user.sector || '—'}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative inline-block">
                            <select
                              value={user.plan}
                              onChange={e => handlePlanChange(user.id, e.target.value)}
                              disabled={updatingPlan === user.id}
                              className="appearance-none bg-transparent border rounded-lg pl-2 pr-6 py-1 text-xs font-bold focus:outline-none cursor-pointer"
                              style={{ color: planColors[user.plan], borderColor: `${planColors[user.plan]}40` }}
                            >
                              {planOrder.map(p => (
                                <option key={p} value={p} className="bg-[#162330] text-white capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                              ))}
                            </select>
                            {updatingPlan === user.id
                              ? <Loader2 className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-white/40" />
                              : <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
                            }
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-white/70 text-sm">{user.ai_queries_used || 0}</div>
                          <div className="text-white/25 text-xs">{user.ai_conversations || 0} msgs</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-white/70 text-sm">{user.content_posts || 0} posts</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-white/70 text-sm">
                            {user.total_revenue_kes > 0 ? `KES ${user.total_revenue_kes.toLocaleString()}` : '—'}
                          </div>
                          <div className="text-white/25 text-xs">{user.payment_count || 0} payments</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-white/50 text-xs">
                            {new Date(user.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {user.email_confirmed
                              ? <span className="text-[#1A7A6E] text-[10px]">✓ Verified</span>
                              : <span className="text-[#D9910B] text-[10px]">⚠ Unverified</span>
                            }
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <a href={`/admin/user/${user.id}`}
                            className="flex items-center gap-1 text-[#F25C05] text-xs hover:underline">
                            <Eye className="w-3 h-3" /> View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-white/30 text-sm">
                    No users found matching your search
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-8 bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-display font-semibold mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: 'Upgrade all free users to Growth (testing)', action: () => {}, color: '#F25C05', icon: Crown, desc: 'Temporarily upgrade all free users for testing' },
                  { label: 'Reset all AI query counts', action: () => {}, color: '#D9910B', icon: Zap, desc: 'Reset monthly AI query counters for all users' },
                  { label: 'View platform analytics', action: () => {}, color: '#1A7A6E', icon: BarChart3, desc: 'Detailed usage and revenue analytics' },
                ].map(action => (
                  <div key={action.label} className="bg-[#162330] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <action.icon className="w-4 h-4" style={{ color: action.color }} />
                      <span className="text-white text-sm font-medium">{action.label}</span>
                    </div>
                    <p className="text-white/30 text-xs mb-3">{action.desc}</p>
                    <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                      style={{ color: action.color, borderColor: `${action.color}30`, backgroundColor: `${action.color}10` }}>
                      Coming soon
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Test mode indicator */}
            {process.env.NEXT_PUBLIC_TEST_MODE === 'true' && (
              <div className="mt-6 bg-[#D9910B]/10 border border-[#D9910B]/20 rounded-xl px-4 py-3 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-[#D9910B] flex-shrink-0" />
                <div>
                  <span className="text-[#D9910B] text-sm font-semibold">Test Mode Active</span>
                  <span className="text-[#D9910B]/70 text-sm"> — Plan restrictions are bypassed. Set NEXT_PUBLIC_TEST_MODE=false before going live.</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}