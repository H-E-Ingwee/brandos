'use client'

import { useState } from 'react'
import { Shield, Search, RefreshCw, Loader2, LogOut, ChevronDown, Crown, Users, DollarSign, MessageSquare, AlertCircle } from 'lucide-react'

const planColors: Record<string, string> = { free: '#666', growth: '#F25C05', pro: '#D9910B', agency: '#1A7A6E' }
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true); setAuthError('')
    const res = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: keyInput }) })
    if (res.ok) { setAuthed(true); fetchData() }
    else setAuthError('Invalid admin key.')
    setAuthLoading(false)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    setAuthed(false); setData(null)
  }

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users', { headers: { 'x-admin-key': keyInput } })
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  const handlePlanChange = async (userId: string, newPlan: string) => {
    setUpdatingPlan(userId); setUpdateMsg('')
    const res = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-key': keyInput }, body: JSON.stringify({ userId, plan: newPlan }) })
    const result = await res.json()
    setUpdateMsg(res.ok ? `Plan updated to ${newPlan}` : result.error)
    if (res.ok) fetchData()
    setUpdatingPlan(null)
    setTimeout(() => setUpdateMsg(''), 3000)
  }

  const filtered = data?.users?.filter((u: any) => {
    const matchSearch = !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.business_name?.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'all' || u.plan === planFilter
    return matchSearch && matchPlan
  }) || []

  if (!authed) return (
    <div className="min-h-screen bg-[#0F1D26] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl bg-[#F25C05] flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
          <span className="font-display font-bold text-xl text-white">BrandOS Admin</span>
        </div>
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-8">
          <h1 className="text-xl font-display font-bold text-white mb-2">Admin Access</h1>
          <p className="text-white/40 text-sm mb-6">Enter your admin secret key to access the platform dashboard.</p>
          {authError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 text-sm mb-5"><AlertCircle className="w-4 h-4 flex-shrink-0" />{authError}</div>}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Admin Secret Key</label>
              <input type="password" value={keyInput} onChange={e => setKeyInput(e.target.value)} placeholder="Enter ADMIN_SECRET_KEY" required
                className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#F25C05]/60 transition-all" />
            </div>
            <button type="submit" disabled={authLoading} className="w-full bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
              {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Shield className="w-4 h-4" /> Access Admin Dashboard</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0F1D26]">
      <div className="bg-[#0A1520] border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F25C05] flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
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
        {updateMsg && <div className={`rounded-xl px-4 py-3 flex items-center gap-3 text-sm mb-6 ${updateMsg.includes('updated') ? 'bg-[#1A7A6E]/10 border border-[#1A7A6E]/20 text-[#1A7A6E]' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>{updateMsg}</div>}

        {loading && !data ? (
          <div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" /></div>
        ) : data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: data.stats?.total_users || 0, icon: Users, color: '#F25C05', sub: `${data.stats?.free_users || 0} free` },
                { label: 'Paid Users', value: data.stats?.paid_users || 0, icon: Crown, color: '#D9910B', sub: `${data.stats?.conversion_rate || 0}% conversion` },
                { label: 'Total Revenue', value: `KES ${(data.stats?.total_revenue_kes || 0).toLocaleString()}`, icon: DollarSign, color: '#1A7A6E', sub: 'All time' },
                { label: 'Content Posts', value: data.stats?.total_content_posts || 0, icon: MessageSquare, color: '#F25C05', sub: 'AI generated' },
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

            {/* Users table */}
            <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center gap-4 flex-wrap">
                <h2 className="text-white font-display font-semibold">All Users ({filtered.length})</h2>
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email, name, or business..."
                    className="w-full bg-[#162330] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F25C05]/60 transition-all" />
                </div>
                <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
                  className="bg-[#162330] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F25C05]/60 transition-all">
                  <option value="all">All Plans</option>
                  {planOrder.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['User','Business','Plan','AI Queries','Content','Revenue','Joined'].map(h => (
                        <th key={h} className="text-left text-white/30 text-xs font-semibold px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map((user: any) => (
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
                            <select value={user.plan} onChange={e => handlePlanChange(user.id, e.target.value)} disabled={updatingPlan === user.id}
                              className="appearance-none bg-transparent border rounded-lg pl-2 pr-6 py-1 text-xs font-bold focus:outline-none cursor-pointer"
                              style={{ color: planColors[user.plan], borderColor: `${planColors[user.plan]}40` }}>
                              {planOrder.map(p => <option key={p} value={p} className="bg-[#162330] text-white capitalize">{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                            </select>
                            {updatingPlan === user.id ? <Loader2 className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-white/40" /> : <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />}
                          </div>
                        </td>
                        <td className="px-5 py-4"><div className="text-white/70 text-sm">{user.ai_queries_used || 0}</div><div className="text-white/25 text-xs">{user.ai_conversations || 0} msgs</div></td>
                        <td className="px-5 py-4"><div className="text-white/70 text-sm">{user.content_posts || 0} posts</div></td>
                        <td className="px-5 py-4"><div className="text-white/70 text-sm">{user.total_revenue_kes > 0 ? `KES ${user.total_revenue_kes.toLocaleString()}` : '—'}</div></td>
                        <td className="px-5 py-4"><div className="text-white/50 text-xs">{new Date(user.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</div><div className={`text-[10px] mt-0.5 ${user.email_confirmed ? 'text-[#1A7A6E]' : 'text-[#D9910B]'}`}>{user.email_confirmed ? '✓ Verified' : '⚠ Unverified'}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && <div className="text-center py-12 text-white/30 text-sm">No users found</div>}
              </div>
            </div>

            {process.env.NEXT_PUBLIC_TEST_MODE === 'true' && (
              <div className="mt-6 bg-[#D9910B]/10 border border-[#D9910B]/20 rounded-xl px-4 py-3 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-[#D9910B] flex-shrink-0" />
                <span className="text-[#D9910B] text-sm font-semibold">Test Mode Active</span>
                <span className="text-[#D9910B]/70 text-sm">— Plan restrictions are bypassed. Set NEXT_PUBLIC_TEST_MODE=false before going live.</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}