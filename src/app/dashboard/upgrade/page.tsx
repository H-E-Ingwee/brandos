'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Smartphone, CreditCard, ArrowRight, AlertCircle, Loader2, Sparkles, Crown, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'
import { PLAN_PRICING } from '@/lib/intasend'

const plans = [
  {
    id: 'growth' as const,
    name: 'Growth',
    kes: 1500,
    period: '/month',
    desc: 'For growing businesses',
    features: ['Full Brand Strategy', '90-Day Marketing Plan', '50 AI queries/month', 'PDF exports', 'Remove BrandOS branding'],
    color: '#F25C05',
    popular: true,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    kes: 3500,
    period: '/month',
    desc: 'For serious brands',
    features: ['Everything in Growth', 'Visual Identity Generator', 'Social Media Scheduler', 'Unlimited AI Coach', '3 team members', 'Priority support'],
    color: '#D9910B',
    popular: false,
  },
  {
    id: 'agency' as const,
    name: 'Agency',
    kes: 8000,
    period: '/month',
    desc: 'For agencies & consultants',
    features: ['Everything in Pro', 'Manage 10 client brands', 'White-label reports', 'Unlimited team members', 'Dedicated account manager'],
    color: '#1A7A6E',
    popular: false,
  },
]

type Step = 'select' | 'pay' | 'processing' | 'success' | 'failed'

export default function UpgradePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<'growth' | 'pro' | 'agency'>('growth')
  const [payMethod, setPayMethod] = useState<'mpesa' | 'card'>('mpesa')
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<Step>('select')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [invoiceId, setInvoiceId] = useState('')
  const [txRef, setTxRef] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const [pollCount, setPollCount] = useState(0)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      setLoading(false)
    }
    fetchProfile()
  }, [router])

  // Poll for M-Pesa payment confirmation
  useEffect(() => {
    if (step !== 'processing' || !invoiceId) return
    if (pollCount >= 24) { // 2 minutes max (24 x 5s)
      setStep('failed')
      setError('Payment timed out. If you completed the M-Pesa prompt, please check your billing history.')
      return
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoice_id: invoiceId, tx_ref: txRef, payment_id: paymentId }),
        })
        const data = await response.json()

        if (data.status === 'success') {
          setStep('success')
          // Refresh profile
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            setProfile(updatedProfile)
          }
        } else if (data.status === 'failed') {
          setStep('failed')
          setError(data.message || 'Payment failed. Please try again.')
        } else {
          setPollCount(c => c + 1)
        }
      } catch {
        setPollCount(c => c + 1)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [step, invoiceId, pollCount, txRef, paymentId])

  const handlePay = async () => {
    setError('')
    setProcessing(true)

    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          method: payMethod,
          phone: payMethod === 'mpesa' ? phone : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Payment failed. Please try again.')
        setProcessing(false)
        return
      }

      if (payMethod === 'mpesa') {
        setInvoiceId(data.invoice_id)
        setTxRef(data.tx_ref)
        setPaymentId(data.payment_id)
        setStep('processing')
        setPollCount(0)
      } else {
        // Card — redirect to IntaSend checkout
        if (data.checkout_url) {
          window.location.href = data.checkout_url
        } else {
          setError('Failed to create checkout link. Please try again.')
        }
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setProcessing(false)
    }
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan)!

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" />
      </div>
    )
  }

  // Success screen
  if (step === 'success') {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-[#1A7A6E]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-[#1A7A6E]" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-3">Payment Successful! 🎉</h1>
          <p className="text-white/60 mb-2">Your account has been upgraded to</p>
          <p className="text-[#F25C05] font-display font-bold text-2xl mb-8">BrandOS {selectedPlanData.name}</p>
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6 mb-8 text-left">
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">What's now unlocked</div>
            <div className="space-y-3">
              {selectedPlanData.features.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#1A7A6E] flex-shrink-0" />
                  <span className="text-white/70 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => router.push('/dashboard')}
            className="w-full bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F25C05]/20">
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-white/30 text-xs mt-4">A receipt has been sent to your email</p>
        </div>
      </div>
    )
  }

  // Processing screen (M-Pesa waiting)
  if (step === 'processing') {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-[#F25C05]/10 flex items-center justify-center mx-auto mb-6 relative">
            <Smartphone className="w-10 h-10 text-[#F25C05]" />
            <div className="absolute inset-0 rounded-full border-2 border-[#F25C05]/30 border-t-[#F25C05] animate-spin" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-3">Check Your Phone</h1>
          <p className="text-white/60 mb-2">An M-Pesa payment prompt has been sent to</p>
          <p className="text-white font-bold text-lg mb-6">{phone}</p>
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6 mb-6 text-left">
            <div className="space-y-3">
              {[
                'Open the M-Pesa prompt on your phone',
                'Enter your M-Pesa PIN to confirm',
                `Confirm payment of KES ${selectedPlanData.kes.toLocaleString()}`,
                'Wait for confirmation — this page updates automatically',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F25C05]/10 flex items-center justify-center text-[#F25C05] font-bold text-xs flex-shrink-0">{i + 1}</div>
                  <span className="text-white/70 text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-white/40 text-sm mb-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Waiting for payment confirmation... ({Math.max(0, 24 - pollCount) * 5}s remaining)</span>
          </div>
          <button onClick={() => { setStep('select'); setError('') }}
            className="text-white/30 hover:text-white text-sm transition-colors">
            Cancel and go back
          </button>
        </div>
      </div>
    )
  }

  // Failed screen
  if (step === 'failed') {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-3">Payment Not Completed</h1>
          <p className="text-white/60 mb-8">{error || 'The payment was not completed. Please try again.'}</p>
          <button onClick={() => { setStep('select'); setError(''); setPollCount(0) }}
            className="w-full bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold py-3.5 rounded-xl transition-all">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#D9910B]/15 flex items-center justify-center">
          <Crown className="w-5 h-5 text-[#D9910B]" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-white">Upgrade Your Plan</h1>
          <p className="text-white/40 text-sm">Pay via M-Pesa or card · Cancel anytime · No hidden fees</p>
        </div>
      </div>

      {/* Current plan banner */}
      <div className="bg-[#1A2E3D] border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3 mb-8">
        <Sparkles className="w-4 h-4 text-white/30" />
        <span className="text-white/50 text-sm">Current plan: <strong className="text-white">{profile?.plan?.charAt(0).toUpperCase()}{profile?.plan?.slice(1)} (Free)</strong></span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Plan selection */}
        <div>
          <h2 className="text-white font-display font-semibold mb-4">1. Choose Your Plan</h2>
          <div className="space-y-3">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id
              const planOrder = ['free', 'growth', 'pro', 'agency']
              const currentIdx = planOrder.indexOf(profile?.plan || 'free')
              const planIdx = planOrder.indexOf(plan.id)
              const isCurrentOrLower = currentIdx >= planIdx

              return (
                <button key={plan.id} onClick={() => !isCurrentOrLower && setSelectedPlan(plan.id)}
                  disabled={isCurrentOrLower}
                  className={`w-full text-left p-5 rounded-2xl border transition-all ${
                    isCurrentOrLower ? 'opacity-40 cursor-not-allowed border-white/5 bg-[#1A2E3D]/50' :
                    isSelected ? 'border-[#F25C05]/50 bg-[#F25C05]/5' :
                    'border-white/8 bg-[#1A2E3D] hover:border-white/20'
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#F25C05] bg-[#F25C05]' : 'border-white/20'}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-white font-display font-semibold">{plan.name}</span>
                      {plan.popular && !isCurrentOrLower && <span className="bg-[#F25C05]/20 text-[#F25C05] text-[10px] font-bold px-2 py-0.5 rounded-full">Popular</span>}
                      {isCurrentOrLower && <span className="bg-white/5 text-white/30 text-[10px] font-bold px-2 py-0.5 rounded-full">Current or lower</span>}
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold">KES {plan.kes.toLocaleString()}</span>
                      <span className="text-white/40 text-xs">/mo</span>
                    </div>
                  </div>
                  <div className="text-white/40 text-xs ml-8">{plan.desc}</div>
                  {isSelected && (
                    <div className="mt-3 ml-8 space-y-1.5">
                      {plan.features.slice(0, 3).map(f => (
                        <div key={f} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-[#1A7A6E] flex-shrink-0" />
                          <span className="text-white/60 text-xs">{f}</span>
                        </div>
                      ))}
                      {plan.features.length > 3 && (
                        <div className="text-white/30 text-xs ml-5">+{plan.features.length - 3} more features</div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Payment method */}
        <div>
          <h2 className="text-white font-display font-semibold mb-4">2. Choose Payment Method</h2>

          {/* Method tabs */}
          <div className="flex gap-3 mb-6">
            {[
              { id: 'mpesa', label: 'M-Pesa', icon: '📱', desc: 'Pay with your phone' },
              { id: 'card', label: 'Card', icon: '💳', desc: 'Visa or Mastercard' },
            ].map(m => (
              <button key={m.id} onClick={() => setPayMethod(m.id as any)}
                className={`flex-1 p-4 rounded-xl border transition-all text-left ${payMethod === m.id ? 'border-[#F25C05]/50 bg-[#F25C05]/5' : 'border-white/8 bg-[#1A2E3D] hover:border-white/20'}`}>
                <div className="text-2xl mb-2">{m.icon}</div>
                <div className="text-white font-semibold text-sm">{m.label}</div>
                <div className="text-white/40 text-xs">{m.desc}</div>
              </button>
            ))}
          </div>

          {/* M-Pesa phone input */}
          {payMethod === 'mpesa' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/60 mb-2">M-Pesa Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0712 345 678 or 254712345678"
                className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all text-lg"
              />
              <p className="text-white/25 text-xs mt-2">You'll receive an M-Pesa prompt on this number</p>
            </div>
          )}

          {payMethod === 'card' && (
            <div className="bg-[#1A2E3D] border border-white/8 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-white/40" />
                <span className="text-white/60 text-sm">Secure card checkout</span>
              </div>
              <p className="text-white/40 text-xs">You'll be redirected to IntaSend's secure payment page. Supports Visa and Mastercard.</p>
            </div>
          )}

          {/* Order summary */}
          <div className="bg-[#1A2E3D] border border-white/8 rounded-xl p-5 mb-6">
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Order Summary</div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/70 text-sm">BrandOS {selectedPlanData.name} Plan</span>
              <span className="text-white font-semibold">KES {selectedPlanData.kes.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/40 text-xs">Billing period</span>
              <span className="text-white/60 text-xs">Monthly</span>
            </div>
            <div className="border-t border-white/5 pt-3 flex items-center justify-between">
              <span className="text-white font-semibold">Total today</span>
              <span className="text-[#F25C05] font-display font-bold text-xl">KES {selectedPlanData.kes.toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 text-sm mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={processing || (payMethod === 'mpesa' && !phone.trim())}
            className="w-full bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F25C05]/20 text-base">
            {processing
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              : payMethod === 'mpesa'
              ? <><Smartphone className="w-5 h-5" /> Pay KES {selectedPlanData.kes.toLocaleString()} via M-Pesa</>
              : <><CreditCard className="w-5 h-5" /> Pay KES {selectedPlanData.kes.toLocaleString()} by Card</>
            }
          </button>

          <p className="text-center text-white/20 text-xs mt-4">
            Cancel anytime · No hidden fees · Secure payment by IntaSend
          </p>
        </div>
      </div>
    </div>
  )
}