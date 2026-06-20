'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, CreditCard, ArrowRight, AlertCircle, Loader2, Sparkles, Crown, Globe } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

const CURRENCIES = [
  { code: 'KES', symbol: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', flag: '🇬🇭' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🌍' },
]

const PLAN_PRICING: Record<string, Record<string, number>> = {
  growth: { KES: 1500, NGN: 5000, GHS: 20, ZAR: 30, USD: 12 },
  pro: { KES: 3500, NGN: 12000, GHS: 45, ZAR: 70, USD: 27 },
  agency: { KES: 8000, NGN: 28000, GHS: 100, ZAR: 160, USD: 62 },
}

const plans = [
  { id: 'growth', name: 'Growth', desc: 'For growing organisations', features: ['Full Brand Strategy', '90-Day Marketing Plan', '50 AI queries/month', 'PDF exports', 'Remove BrandOS branding'], popular: true },
  { id: 'pro', name: 'Pro', desc: 'For serious brands', features: ['Everything in Growth', 'Visual Identity Generator', 'Logo upload & storage', 'Unlimited AI Coach', '3 team members'], popular: false },
  { id: 'agency', name: 'Agency', desc: 'For agencies & consultants', features: ['Everything in Pro', 'Manage 10 client brands', 'White-label reports', 'Unlimited team members', 'Dedicated account manager'], popular: false },
]

export default function UpgradePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<'growth' | 'pro' | 'agency'>('growth')
  const [selectedCurrency, setSelectedCurrency] = useState('KES')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      setProfile(data)
      // Auto-detect currency from profile country
      if (data?.country) {
        const countryToCurrency: Record<string, string> = {
          'Nigeria': 'NGN', 'Ghana': 'GHS', 'South Africa': 'ZAR',
          'Kenya': 'KES', 'Uganda': 'KES', 'Tanzania': 'KES', 'Rwanda': 'KES',
        }
        const detected = countryToCurrency[data.country]
        if (detected) setSelectedCurrency(detected)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [router])

  const handlePay = async () => {
    setError('')
    setProcessing(true)
    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, currency: selectedCurrency }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Payment failed. Please try again.')
        setProcessing(false)
        return
      }
      // Redirect to Paystack checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        setError('No checkout URL returned. Please try again.')
        setProcessing(false)
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
      setProcessing(false)
    }
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan)!
  const amount = PLAN_PRICING[selectedPlan]?.[selectedCurrency] || 12
  const currency = CURRENCIES.find(c => c.code === selectedCurrency)!
  const planOrder = ['free', 'growth', 'pro', 'agency']

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#D9910B]/15 flex items-center justify-center">
          <Crown className="w-5 h-5 text-[#D9910B]" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-white">Upgrade Your Plan</h1>
          <p className="text-white/40 text-sm">Pay securely via card or mobile money · Cancel anytime · No hidden fees</p>
        </div>
      </div>

      {/* Current plan */}
      <div className="bg-[#1A2E3D] border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3 mb-8">
        <Sparkles className="w-4 h-4 text-white/30" />
        <span className="text-white/50 text-sm">Current plan: <strong className="text-white">{profile?.plan?.charAt(0).toUpperCase()}{profile?.plan?.slice(1) || 'Free'}</strong></span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Plan selection */}
        <div>
          <h2 className="text-white font-display font-semibold mb-4">1. Choose Your Plan</h2>
          <div className="space-y-3 mb-6">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id
              const currentIdx = planOrder.indexOf(profile?.plan || 'free')
              const planIdx = planOrder.indexOf(plan.id)
              const isCurrentOrLower = currentIdx >= planIdx
              const planAmount = PLAN_PRICING[plan.id]?.[selectedCurrency] || 0

              return (
                <button key={plan.id} onClick={() => !isCurrentOrLower && setSelectedPlan(plan.id as any)}
                  disabled={isCurrentOrLower}
                  className={`w-full text-left p-5 rounded-2xl border transition-all ${isCurrentOrLower ? 'opacity-40 cursor-not-allowed border-white/5 bg-[#1A2E3D]/50' : isSelected ? 'border-[#F25C05]/50 bg-[#F25C05]/5' : 'border-white/8 bg-[#1A2E3D] hover:border-white/20'}`}>
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
                      <span className="text-white font-bold">{currency.symbol} {planAmount.toLocaleString()}</span>
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
                      {plan.features.length > 3 && <div className="text-white/30 text-xs ml-5">+{plan.features.length - 3} more features</div>}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Currency selector */}
          <div>
            <h2 className="text-white font-display font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#1A7A6E]" /> 2. Choose Your Currency
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {CURRENCIES.map(c => (
                <button key={c.code} onClick={() => setSelectedCurrency(c.code)}
                  className={`p-3 rounded-xl border text-left transition-all ${selectedCurrency === c.code ? 'border-[#1A7A6E]/50 bg-[#1A7A6E]/5' : 'border-white/8 bg-[#1A2E3D] hover:border-white/20'}`}>
                  <div className="text-lg mb-1">{c.flag}</div>
                  <div className="text-white font-semibold text-xs">{c.code}</div>
                  <div className="text-white/30 text-[10px]">{c.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment summary */}
        <div>
          <h2 className="text-white font-display font-semibold mb-4">3. Complete Payment</h2>

          {/* Order summary */}
          <div className="bg-[#1A2E3D] border border-white/8 rounded-xl p-5 mb-5">
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Order Summary</div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/70 text-sm">BrandOS {selectedPlanData.name} Plan</span>
              <span className="text-white font-semibold">{currency.symbol} {amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/40 text-xs">Billing period</span>
              <span className="text-white/60 text-xs">Monthly</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/40 text-xs">Currency</span>
              <span className="text-white/60 text-xs">{currency.flag} {currency.name}</span>
            </div>
            <div className="border-t border-white/5 pt-3 flex items-center justify-between">
              <span className="text-white font-semibold">Total today</span>
              <span className="text-[#F25C05] font-display font-bold text-xl">{currency.symbol} {amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment methods info */}
          <div className="bg-[#1A2E3D] border border-white/8 rounded-xl p-4 mb-5">
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Accepted Payment Methods</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '💳', label: 'Visa / Mastercard' },
                { icon: '📱', label: 'M-Pesa (Kenya)' },
                { icon: '🏦', label: 'Bank Transfer' },
                { icon: '📲', label: 'Mobile Money' },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-2 bg-[#162330] rounded-lg px-3 py-2">
                  <span className="text-sm">{m.icon}</span>
                  <span className="text-white/60 text-xs">{m.label}</span>
                </div>
              ))}
            </div>
            <p className="text-white/25 text-xs mt-3">You'll be redirected to Paystack's secure checkout. All payment methods are available there.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 text-sm mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <button onClick={handlePay} disabled={processing}
            className="w-full bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F25C05]/20 text-base mb-3">
            {processing
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Redirecting to checkout...</>
              : <><CreditCard className="w-5 h-5" /> Pay {currency.symbol} {amount.toLocaleString()} — Secure Checkout</>
            }
          </button>

          <div className="flex items-center justify-center gap-4 text-white/20 text-xs">
            <span>🔒 Secured by Paystack</span>
            <span>·</span>
            <span>Cancel anytime</span>
            <span>·</span>
            <span>No hidden fees</span>
          </div>

          <div className="mt-4 text-center">
            <Link href="/dashboard/billing" className="text-white/30 text-xs hover:text-white transition-colors">
              View payment history
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}