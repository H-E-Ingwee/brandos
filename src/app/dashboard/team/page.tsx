'use client'

import { useState, useEffect } from 'react'
import {
  Users, UserPlus, Shield, Edit3, Eye, Trash2, Mail,
  Crown, AlertCircle, CheckCircle, Loader2, RefreshCw,
  Clock, ChevronDown, Activity, X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

const roleConfig = {
  admin: { icon: Shield, color: '#F25C05', label: 'Admin', desc: 'Full access including team management' },
  editor: { icon: Edit3, color: '#D9910B', label: 'Editor', desc: 'Can edit brand data and generate content' },
  viewer: { icon: Eye, color: '#1A7A6E', label: 'Viewer', desc: 'Read-only access to all brand data' },
}

const actionLabels: Record<string, string> = {
  invite_member: 'Invited a team member',
  accept_invitation: 'Accepted invitation',
  remove_member: 'Removed a team member',
  change_role: 'Changed member role',
  cancel_invitation: 'Cancelled invitation',
  generate_strategy: 'Generated brand strategy',
  generate_content: 'Generated content post',
}

export default function TeamPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [teamData, setTeamData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'audit'>('members')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, teamRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      fetch('/api/team').then(r => r.json()),
    ])

    setProfile(profileRes.data)
    if (!teamRes.error) setTeamData(teamRes)
    setLoading(false)
    setRefreshing(false)
  }

  const handleRefresh = () => { setRefreshing(true); fetchData() }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setInviteError('')
    setInviteSuccess('')

    const response = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    })
    const data = await response.json()

    if (!response.ok) {
      setInviteError(data.error)
      setInviting(false)
      return
    }

    setInviteSuccess(`Invitation sent to ${inviteEmail}`)
    setInviteEmail('')
    setInviting(false)
    setShowInviteForm(false)
    fetchData()
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return
    setRemovingId(memberId)
    const response = await fetch(`/api/team/${memberId}`, { method: 'DELETE' })
    if (response.ok) fetchData()
    setRemovingId(null)
  }

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    setUpdatingRoleId(memberId)
    const response = await fetch(`/api/team/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    if (response.ok) fetchData()
    setUpdatingRoleId(null)
  }

  const handleCancelInvitation = async (invitationId: string) => {
    setCancellingId(invitationId)
    const response = await fetch(`/api/team/invitations/${invitationId}`, { method: 'DELETE' })
    if (response.ok) fetchData()
    setCancellingId(null)
  }

  const isPro = profile?.plan === 'pro' || profile?.plan === 'agency'
  const isAgency = profile?.plan === 'agency'
  const maxMembers = profile?.plan === 'pro' ? 3 : profile?.plan === 'agency' ? 999 : 0
  const currentMembers = teamData?.members?.length || 0
  const org = teamData?.organisation

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F25C05]/15 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#F25C05]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">Team Management</h1>
            <p className="text-white/40 text-sm">
              {org?.name || 'Your organisation'} ·{' '}
              {isPro ? `${currentMembers} of ${maxMembers === 999 ? 'unlimited' : maxMembers} members` : 'Upgrade to add team members'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={refreshing} className="p-2 rounded-xl bg-[#1A2E3D] border border-white/8 text-white/40 hover:text-white transition-all">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {isPro && (maxMembers === 999 || currentMembers < maxMembers) && (
            <button onClick={() => setShowInviteForm(true)}
              className="flex items-center gap-2 bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#F25C05]/20">
              <UserPlus className="w-4 h-4" /> Invite Member
            </button>
          )}
        </div>
      </div>

      {/* Upgrade prompt for non-pro */}
      {!isPro && (
        <div className="bg-[#D9910B]/10 border border-[#D9910B]/20 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Crown className="w-8 h-8 text-[#D9910B] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-white font-display font-semibold mb-1">Team members require Pro or Agency plan</h2>
              <p className="text-white/50 text-sm mb-4">
                Pro plan: up to 3 team members · Agency plan: unlimited team members with white-label reports
              </p>
              <a href="/dashboard/upgrade" className="inline-flex items-center gap-2 bg-[#D9910B] hover:bg-[#C07D09] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
                Upgrade to Pro — KES 3,500/month
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Invite form modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-display font-semibold text-lg">Invite Team Member</h2>
              <button onClick={() => { setShowInviteForm(false); setInviteError('') }} className="text-white/30 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {inviteError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 text-sm mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{inviteError}
              </div>
            )}
            <form onSubmit={handleInvite} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    placeholder="colleague@business.com" required
                    className="w-full bg-[#162330] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Role</label>
                <div className="space-y-2">
                  {(Object.entries(roleConfig) as [keyof typeof roleConfig, typeof roleConfig[keyof typeof roleConfig]][]).map(([key, cfg]) => (
                    <button key={key} type="button" onClick={() => setInviteRole(key)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${inviteRole === key ? 'border-[#F25C05]/40 bg-[#F25C05]/5' : 'border-white/8 bg-[#162330] hover:border-white/20'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${inviteRole === key ? 'border-[#F25C05] bg-[#F25C05]' : 'border-white/20'}`} />
                        <div>
                          <div className="text-white font-medium text-sm">{cfg.label}</div>
                          <div className="text-white/40 text-xs">{cfg.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowInviteForm(false)}
                  className="flex-1 bg-[#162330] border border-white/10 text-white/60 hover:text-white font-medium py-3 rounded-xl transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={inviting}
                  className="flex-1 bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  {inviting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Mail className="w-4 h-4" /> Send Invite</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success message */}
      {inviteSuccess && (
        <div className="bg-[#1A7A6E]/10 border border-[#1A7A6E]/20 rounded-xl px-4 py-3 flex items-center gap-3 text-[#1A7A6E] text-sm mb-6">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />{inviteSuccess}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1A2E3D] border border-white/8 rounded-xl p-1 mb-6 w-fit">
        {[
          { id: 'members', label: `Members (${currentMembers})`, icon: Users },
          { id: 'invitations', label: `Pending (${teamData?.invitations?.length || 0})`, icon: Clock },
          { id: 'audit', label: 'Activity Log', icon: Activity },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#F25C05]/10 text-[#F25C05] border border-[#F25C05]/20' : 'text-white/40 hover:text-white'}`}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Members tab */}
      {activeTab === 'members' && (
        <div className="space-y-3">
          {/* Owner (always first) */}
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#F25C05]/20 flex items-center justify-center text-[#F25C05] font-bold flex-shrink-0">
              {profile?.full_name?.[0] || 'O'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">{profile?.full_name || 'You'}</span>
                <span className="bg-[#F25C05]/10 text-[#F25C05] text-[10px] font-bold px-2 py-0.5 rounded-full">Owner</span>
              </div>
              <div className="text-white/40 text-xs mt-0.5">{profile?.business_name || 'Account owner'}</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F25C05]/10 border border-[#F25C05]/20 rounded-lg">
              <Crown className="w-3.5 h-3.5 text-[#F25C05]" />
              <span className="text-[#F25C05] text-xs font-semibold">Full Access</span>
            </div>
          </div>

          {/* Team members */}
          {teamData?.members?.length === 0 ? (
            <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-8 text-center">
              <Users className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No team members yet</p>
              {isPro && (
                <button onClick={() => setShowInviteForm(true)}
                  className="mt-4 inline-flex items-center gap-2 text-[#F25C05] text-sm hover:underline">
                  <UserPlus className="w-4 h-4" /> Invite your first team member
                </button>
              )}
            </div>
          ) : (
            teamData?.members?.map((member: any) => {
              const role = member.role as keyof typeof roleConfig
              const cfg = roleConfig[role]
              return (
                <div key={member.id} className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1A2E3D] border border-white/10 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {member.user?.full_name?.[0] || member.user?.id?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm">{member.user?.full_name || 'Team Member'}</div>
                    <div className="text-white/40 text-xs mt-0.5">
                      Joined {new Date(member.joined_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  {/* Role selector */}
                  <div className="relative">
                    <select
                      value={member.role}
                      onChange={e => handleUpdateRole(member.id, e.target.value)}
                      disabled={updatingRoleId === member.id}
                      className="appearance-none bg-[#162330] border border-white/10 rounded-xl pl-3 pr-8 py-2 text-white text-xs font-medium focus:outline-none focus:border-[#F25C05]/60 transition-all cursor-pointer"
                      style={{ color: cfg.color }}
                    >
                      <option value="admin" className="bg-[#162330] text-white">Admin</option>
                      <option value="editor" className="bg-[#162330] text-white">Editor</option>
                      <option value="viewer" className="bg-[#162330] text-white">Viewer</option>
                    </select>
                    {updatingRoleId === member.id
                      ? <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-white/40" />
                      : <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
                    }
                  </div>
                  <button onClick={() => handleRemoveMember(member.id)} disabled={removingId === member.id}
                    className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-40">
                    {removingId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              )
            })
          )}

          {/* Member limit indicator */}
          {isPro && maxMembers !== 999 && (
            <div className="bg-[#1A2E3D] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-white/30 text-xs">Team member slots</span>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {Array.from({ length: maxMembers }).map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full ${i < currentMembers ? 'bg-[#F25C05]' : 'bg-white/10'}`} />
                  ))}
                </div>
                <span className="text-white/40 text-xs">{currentMembers}/{maxMembers}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invitations tab */}
      {activeTab === 'invitations' && (
        <div className="space-y-3">
          {teamData?.invitations?.length === 0 ? (
            <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-8 text-center">
              <Mail className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No pending invitations</p>
            </div>
          ) : (
            teamData?.invitations?.map((inv: any) => {
              const role = inv.role as keyof typeof roleConfig
              const cfg = roleConfig[role]
              const daysLeft = Math.ceil((new Date(inv.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <div key={inv.id} className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#D9910B]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#D9910B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm">{inv.email}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-white/30 text-xs">Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#D9910B]/10 text-[#D9910B] text-xs font-semibold px-2 py-1 rounded-full">Pending</span>
                    <button onClick={() => handleCancelInvitation(inv.id)} disabled={cancellingId === inv.id}
                      className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-40">
                      {cancellingId === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Audit log tab */}
      {activeTab === 'audit' && (
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl overflow-hidden">
          {teamData?.audit_log?.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No activity yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {teamData?.audit_log?.map((log: any) => (
                <div key={log.id} className="flex items-start gap-4 p-4">
                  <div className="w-8 h-8 rounded-lg bg-[#F25C05]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="w-4 h-4 text-[#F25C05]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/80 text-sm">
                      <strong className="text-white">{log.actor?.full_name || 'Someone'}</strong>{' '}
                      {actionLabels[log.action] || log.action}
                      {log.metadata?.email && <span className="text-[#F25C05]"> {log.metadata.email}</span>}
                      {log.metadata?.new_role && <span className="text-white/50"> → {log.metadata.new_role}</span>}
                    </div>
                    <div className="text-white/25 text-xs mt-0.5">
                      {new Date(log.created_at).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Role permissions reference */}
      <div className="mt-8 bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
        <h3 className="text-white font-display font-semibold mb-4">Role Permissions Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-white/40 font-medium pb-3 pr-4">Permission</th>
                {Object.entries(roleConfig).map(([key, cfg]) => (
                  <th key={key} className="text-center pb-3 px-4" style={{ color: cfg.color }}>{cfg.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                ['View brand data', true, true, true],
                ['Edit brand strategy', true, true, false],
                ['Generate AI content', true, true, false],
                ['Manage team members', true, false, false],
                ['Invite new members', true, false, false],
                ['Access billing', true, false, false],
                ['Delete brand data', true, false, false],
              ].map(([perm, admin, editor, viewer]) => (
                <tr key={perm as string}>
                  <td className="text-white/60 py-3 pr-4">{perm as string}</td>
                  {[admin, editor, viewer].map((allowed, i) => (
                    <td key={i} className="text-center py-3 px-4">
                      {allowed
                        ? <span className="text-[#1A7A6E] text-base">✓</span>
                        : <span className="text-white/15 text-base">✕</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}