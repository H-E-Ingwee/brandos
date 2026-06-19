'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, CheckCircle, AlertCircle, Users, Loader2, Shield, Eye, Edit3 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const roleDetails = {
  admin: {
    icon: Shield,
    color: '#F25C05',
    label: 'Admin',
    desc: 'Full access — can manage team, edit all brand data, and invite members',
    permissions: ['View all brand data', 'Edit brand strategy & content', 'Generate AI content', 'Invite & manage team members', 'Access billing information'],
  },
  editor: {
    icon: Edit3,
    color: '#D9910B',
    label: 'Editor',
    desc: 'Can view and edit all brand data, generate content and strategies',
    permissions: ['View all brand data', 'Edit brand strategy & content', 'Generate AI content', 'Cannot manage team members', 'Cannot access billing'],
  },
  viewer: {
    icon: Eye,
    color: '#1A7A6E',
    label: 'Viewer',
    desc: 'Read-only access to all brand data and reports',
    permissions: ['View all brand data', 'View brand strategy & content', 'Cannot edit anything', 'Cannot generate AI content', 'Cannot manage team members'],
  },
}

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [invitation, setInvitation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    if (!token) { setError('Invalid invitation link — no token found.'); setLoading(false); return }
    validateToken()
  }, [token])

  const validateToken = async () => {
    try {
      // Check current auth state
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Validate the invitation
      const response = await fetch(`/api/invite/accept?token=${token}`)
      const data = await response.json()
      if (!response.ok) { setError(data.error); setLoading(false); return }
      setInvitation(data.invitation)
    } catch {
      setError('Failed to load invitation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!currentUser) {
      // Redirect to signup with return URL
      router.push(`/signup?redirectTo=/invite/accept?token=${token}`)
      return
    }
    setAccepting(true)
    setError('')
    try {
      const response = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await response.json()
      if (!response.ok) {
        if (data.requires_auth) {
          router.push(`/login?redirectTo=/invite/accept?token=${token}`)
          return
        }
        setError(data.error)
        return
      }
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 3000)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-[#F25C05]/10 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-[#F25C05] animate-spin" />
        </div>
        <p className="text-white/50">Validating your invitation...</p>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-display font-bold text-white mb-3">Invalid Invitation</h2>
        <p className="text-white/60 mb-6">{error}</p>
        <Link href="/" className="text-[#F25C05] hover:underline text-sm">Go to BrandOS homepage</Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-[#1A7A6E]/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#1A7A6E]" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-3">Welcome to the team! 🎉</h2>
        <p className="text-white/60 mb-2">You now have access to the brand workspace.</p>
        <p className="text-white/40 text-sm">Redirecting to dashboard...</p>
        <div className="mt-4">
          <div className="w-6 h-6 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  const role = invitation?.role as keyof typeof roleDetails
  const roleInfo = roleDetails[role] || roleDetails.viewer
  const org = invitation?.organisation
  const orgName = org?.owner?.business_name || org?.name || 'this team'

  return (
    <>
      {/* Org info */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[#F25C05]/20 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-[#F25C05]" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">You're invited!</h2>
        <p className="text-white/60">
          You've been invited to join <strong className="text-white">{orgName}</strong> on BrandOS
        </p>
      </div>

      {/* Role card */}
      <div className="bg-[#162330] border rounded-2xl p-5 mb-6" style={{ borderColor: `${roleInfo.color}30` }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleInfo.color}20` }}>
            <roleInfo.icon className="w-5 h-5" style={{ color: roleInfo.color }} />
          </div>
          <div>
            <div className="text-white font-semibold">Your Role: {roleInfo.label}</div>
            <div className="text-white/40 text-xs">{roleInfo.desc}</div>
          </div>
        </div>
        <div className="space-y-2">
          {roleInfo.permissions.map((perm, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${perm.startsWith('Cannot') ? 'bg-red-500/10' : 'bg-[#1A7A6E]/20'}`}>
                <span className={`text-[10px] ${perm.startsWith('Cannot') ? 'text-red-400' : 'text-[#1A7A6E]'}`}>
                  {perm.startsWith('Cannot') ? '✕' : '✓'}
                </span>
              </div>
              <span className={`text-xs ${perm.startsWith('Cannot') ? 'text-white/30' : 'text-white/60'}`}>{perm}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current user info */}
      {currentUser && (
        <div className="bg-[#1A2E3D] border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-[#F25C05]/20 flex items-center justify-center text-[#F25C05] font-bold text-sm flex-shrink-0">
            {currentUser.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white/60 text-xs">Accepting as</div>
            <div className="text-white text-sm font-medium truncate">{currentUser.email}</div>
          </div>
          <Link href={`/login?redirectTo=/invite/accept?token=${token}`} className="text-[#F25C05] text-xs hover:underline flex-shrink-0">
            Switch account
          </Link>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 text-sm mb-5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleAccept}
        disabled={accepting}
        className="w-full bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-60 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F25C05]/20 mb-4"
      >
        {accepting
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Accepting...</>
          : currentUser
          ? <><CheckCircle className="w-5 h-5" /> Accept Invitation</>
          : <><Users className="w-5 h-5" /> Sign in to Accept</>
        }
      </button>

      {!currentUser && (
        <p className="text-center text-white/40 text-sm">
          Don't have an account?{' '}
          <Link href={`/signup?redirectTo=/invite/accept?token=${token}`} className="text-[#F25C05] hover:underline">
            Create one free
          </Link>
        </p>
      )}

      <p className="text-center text-white/20 text-xs mt-4">
        This invitation expires on {new Date(invitation?.expires_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </>
  )
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen bg-[#0F1D26] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl bg-[#F25C05] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">BrandOS</span>
          <span className="text-white/30 text-sm">by Ingweplex</span>
        </div>
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-8">
          <Suspense fallback={<div className="flex items-center justify-center py-8"><Loader2 className="w-8 h-8 text-[#F25C05] animate-spin" /></div>}>
            <AcceptInviteContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}