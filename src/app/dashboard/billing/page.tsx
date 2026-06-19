'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { CreditCard, CheckCircle, Crown, ArrowRight, RefreshCw, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Payment } from '@/lib/supabase/types'

function BillingContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get('status')
  const ref = searchParams.get('ref')

  const [profile, setProfile] = useState<Profile | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [verifyMessage, setVerifyMessage] = useState('')

  useEffect(() => {
    fetchData()
    // If redirected from card payment, verify it
    if (status === 'success' && ref) {
      verifyCardPayment(ref)
    }
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, paymentsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    ])

    setProfile(profileRes.data)
    setPayments(paymentsRes.data || [])
    setLoading(false)
  }

  const verifyCardPayment = async (txRef: string) => {
    setVerifying(true)
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_ref: txRef }),
      })
      const data = await response.json()
      if (data.status === 'success') {
        setVerifyMessage(`✅ Payment confirmed! Your account has been upgraded to ${data.plan}.`)
        await fetchData()
      } else {
        setVerifyMessage('Payment is being processed. Please refresh in a moment.')
      }
    } catch {
      setVerifyMessage('Could not verify payment. Please contact support if your plan was not upgraded.')
    } finally {
      setVerifying(false)
    }
  }

  const planOrder = ['free', 'growth', 'pro', 'agency']
  const planColors: Record<string, string> = { free: '#666', growth: '#F25C05', pro: '#D9910B', agency: '#1A7A6E' }
  const planLabel = (p: string) => p.charAt(0).toUpperCase() + p.slice(1)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#D9910B]/15 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-[#D9910B]" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-white">Billing & Subscription</h1>
          <p className="text-white/40 text-sm">Manage your plan and payment history</p>
        </div>
      </div>

      {/* Card payment redirect message */}
      {verifyMessage && (
        <div className={`rounded-xl px-4 py-3 flex items-center gap-3 text-sm mb-6 ${verifyMessage.startsWith('✅') ? 'bg-[#1A7A6E]/10 border border-[#1A7A6E]/20 text-[#1A7A6E]' : 'bg-[#D9910B]/10 border border-[#D9910B]/20 text-[#D9910B]'}`}>
          {verifying && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
          {verifyMessage}
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-display font-semibold">Current Plan</h2>
          <button onClick={fetchData} className="text-white/30 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${planColors[profile?.plan || 'free']}20` }}>
            <Crown className="w-7 h-7" style={{ color: planColors[profile?.plan || 'free'] }} />
          </div>
          <div className="flex-1">
            <div className="text-white font-display font-bold text-2xl">{planLabel(profile?.plan || 'free')}</div>
            <div className="text-white/40 text-sm">
              {profile?.plan === 'free' ? 'Free forever · Limited features' : 'Monthly subscription · Cancel anytime'}
            </div>
          </div>
          {profile?.plan !== 'agency' && (
            <Link href="/dashboard/upgrade"
              className="flex items-center gap-2 bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
              Upgrade <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Plan features summary */}
        <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-3 gap-4">
          {[
            ['AI Queries', profile?.plan === 'free' ? '10/month' : profile?.plan === 'growth' ? '50/month' : 'Unlimited'],
            ['Modules', profile?.plan === 'free' ? '2 of 6' : profile?.plan === 'growth' ? '4 of 6' : 'All 6'],
            ['PDF Export', profile?.plan === 'free' ? '❌' : '✅'],
          ].map(([label, value]) => (
            <div key={label} className="text-center">
              <div className="text-white font-semibold text-sm">{value}</div>
              <div className="text-white/30 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Queries Usage */}
      <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-display font-semibold mb-4">AI Coach Usage This Month</h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">Queries used</span>
          <span className="text-white font-semibold text-sm">
            {profile?.ai_queries_used || 0} / {profile?.plan === 'free' ? 10 : profile?.plan === 'growth' ? 50 : '∞'}
          </span>
        </div>
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: profile?.plan === 'pro' || profile?.plan === 'agency' ? '15%' :
                `${Math.min(((profile?.ai_queries_used || 0) / (profile?.plan === 'free' ? 10 : 50)) * 100, 100)}%`,
              backgroundColor: (profile?.ai_queries_used || 0) >= (profile?.plan === 'free' ? 9 : 45) ? '#C0392B' : '#F25C05',
            }}
          />
        </div>
        <p className="text-white/25 text-xs mt-2">Resets on the 1st of each month</p>
      </div>

      {/* Payment History */}
      <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
        <h2 className="text-white font-display font-semibold mb-5">Payment History</h2>
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No payments yet</p>
            <p className="text-white/20 text-xs mt-1">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center gap-4 p-4 bg-[#162330] rounded-xl">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${payment.status === 'success' ? 'bg-[#1A7A6E]/20' : payment.status === 'pending' ? 'bg-[#D9910B]/20' : 'bg-red-500/20'}`}>
                  {payment.status === 'success' ? <CheckCircle className="w-4 h-4 text-[#1A7A6E]" /> :
                   payment.status === 'pending' ? <Loader2 className="w-4 h-4 text-[#D9910B] animate-spin" /> :
                   <span className="text-red-400 text-sm">✕</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">BrandOS {planLabel(payment.plan)} Plan</div>
                  <div className="text-white/30 text-xs mt-0.5">
                    {payment.payment_method === 'mpesa' ? '📱 M-Pesa' : '💳 Card'} ·{' '}
                    {new Date(payment.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white font-semibold text-sm">KES {payment.amount.toLocaleString()}</div>
                  <div className={`text-xs font-semibold mt-0.5 ${payment.status === 'success' ? 'text-[#1A7A6E]' : payment.status === 'pending' ? 'text-[#D9910B]' : 'text-red-400'}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support */}
      <div className="mt-6 text-center">
        <p className="text-white/30 text-sm">
          Questions about billing?{' '}
          <a href="https://wa.me/254798936316" className="text-[#F25C05] hover:underline">WhatsApp us</a>
          {' '}or{' '}
          <a href="mailto:Ingweplex@gmail.com" className="text-[#F25C05] hover:underline">email us</a>
        </p>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" /></div>}>
      <BillingContent />
    </Suspense>
  )
}