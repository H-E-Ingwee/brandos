'use client'

import { useState, useEffect } from 'react'
import { Settings, User, Bell, Shield, CreditCard, CheckCircle, Crown, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

const plans = [
  { id: 'free', name: 'Free', price: 'KES 0', period: 'forever', features: ['Brand Discovery', '1 Brand Report', '10 AI queries/month'], popular: false },
  { id: 'growth', name: 'Growth', price: 'KES 1,500', period: '/month', features: ['Full Brand Strategy', '90-Day Marketing Plan', '50 AI queries/month', 'PDF exports'], popular: true },
  { id: 'pro', name: 'Pro', price: 'KES 3,500', period: '/month', features: ['Visual Identity Generator', 'Social Media Scheduler', 'Unlimited AI Coach', '3 team members'], popular: false },
  { id: 'agency', name: 'Agency', price: 'KES 8,000', period: '/month', features: ['10 client brands', 'White-label reports', 'Unlimited team members', 'Account manager'], popular: false },
]

const sectors = ['E-Commerce / Retail', 'Healthcare / Wellness', 'Technology / Startup', 'Professional Services', 'NGO / Social Enterprise', 'Restaurant / Food & Beverage', 'Education', 'Real Estate', 'Agriculture / Agritech', 'Finance / Fintech', 'Other']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ full_name: '', business_name: '', sector: '', location: '', phone: '' })

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email || '')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (data) {
        setProfile(data)
        setForm({
          full_name: data.full_name || '',
          business_name: data.business_name || '',
          sector: data.sector || '',
          location: data.location || '',
          phone: data.phone || '',
        })
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) { setError(data.error || 'Failed to save'); return }
      setProfile(data.profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <Settings className="w-5 h-5 text-white/60" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-white">Settings</h1>
          <p className="text-white/40 text-sm">Manage your account and preferences</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Tabs */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#F25C05]/10 text-[#F25C05] border border-[#F25C05]/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}
              <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
                <h2 className="text-white font-display font-semibold mb-5">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Full Name</label>
                    <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Email Address</label>
                    <input type="email" value={email} disabled
                      className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white/40 text-sm cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Phone / WhatsApp</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+254 7XX XXX XXX"
                      className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Location</label>
                    <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                      placeholder="Nairobi, Kenya"
                      className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all" />
                  </div>
                </div>
              </div>

              <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
                <h2 className="text-white font-display font-semibold mb-5">Business Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Business Name</label>
                    <input type="text" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                      className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Sector</label>
                    <select value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                      className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all">
                      <option value="" className="bg-[#162330]">Select sector</option>
                      {sectors.map(s => <option key={s} value={s} className="bg-[#162330]">{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving}
                  className="bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : null}
                  {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
                </button>
                {saved && <span className="text-[#1A7A6E] text-sm">Profile updated successfully</span>}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className={`rounded-2xl p-5 flex items-center gap-4 ${profile?.plan === 'free' ? 'bg-[#D9910B]/10 border border-[#D9910B]/20' : 'bg-[#1A7A6E]/10 border border-[#1A7A6E]/20'}`}>
                <Crown className={`w-8 h-8 ${profile?.plan === 'free' ? 'text-[#D9910B]' : 'text-[#1A7A6E]'}`} />
                <div>
                  <div className="text-white font-semibold">
                    {profile?.plan === 'free' ? 'You\'re on the Free Plan' : `You're on the ${profile?.plan?.charAt(0).toUpperCase()}${profile?.plan?.slice(1)} Plan`}
                  </div>
                  <div className="text-white/50 text-sm">
                    {profile?.plan === 'free' ? 'Upgrade to unlock all 6 modules and unlimited AI coaching' : 'Thank you for being a BrandOS subscriber!'}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {plans.map((plan) => {
                  const isCurrent = profile?.plan === plan.id
                  return (
                    <div key={plan.id} className={`rounded-2xl border p-5 ${isCurrent ? 'border-[#1A7A6E]/40 bg-[#1A7A6E]/5' : plan.popular ? 'border-[#F25C05]/30 bg-[#F25C05]/5' : 'border-white/8 bg-[#1A2E3D]'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-display font-semibold">{plan.name}</span>
                        {isCurrent && <span className="bg-[#1A7A6E]/20 text-[#1A7A6E] text-[10px] font-bold px-2 py-0.5 rounded-full">Current</span>}
                        {plan.popular && !isCurrent && <span className="bg-[#F25C05]/20 text-[#F25C05] text-[10px] font-bold px-2 py-0.5 rounded-full">Popular</span>}
                      </div>
                      <div className="text-2xl font-display font-bold text-white mb-0.5">{plan.price}</div>
                      <div className="text-white/40 text-xs mb-4">{plan.period}</div>
                      <div className="space-y-2 mb-4">
                        {plan.features.map(f => (
                          <div key={f} className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-[#1A7A6E] flex-shrink-0" />
                            <span className="text-white/60 text-xs">{f}</span>
                          </div>
                        ))}
                      </div>
                      
                    </div>
                  )
                })}
              </div>

              <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-3">Payment Methods</h3>
                <div className="flex items-center gap-3 p-3 bg-[#162330] rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-[#1A7A6E]/20 flex items-center justify-center text-sm">📱</div>
                  <div>
                    <div className="text-white text-sm font-medium">M-Pesa</div>
                    <div className="text-white/40 text-xs">Pay via Lipa Na M-Pesa · No credit card required</div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-[#1A7A6E] ml-auto" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-display font-semibold mb-5">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'AI Coach insights', desc: 'Weekly performance insights from your AI brand coach', enabled: true },
                  { label: 'Content reminders', desc: 'Reminders to post content based on your calendar', enabled: true },
                  { label: 'Brand score updates', desc: 'When your brand score changes significantly', enabled: true },
                  { label: 'Product updates', desc: 'New features and improvements to BrandOS', enabled: false },
                  { label: 'Marketing tips', desc: 'Weekly marketing tips for the Kenyan market', enabled: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <div className="text-white text-sm font-medium">{item.label}</div>
                      <div className="text-white/40 text-xs mt-0.5">{item.desc}</div>
                    </div>
                    <div className={`w-11 h-6 rounded-full transition-all cursor-pointer ${item.enabled ? 'bg-[#F25C05]' : 'bg-white/10'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-all ${item.enabled ? 'ml-6' : 'ml-1'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
                <h2 className="text-white font-display font-semibold mb-2">Account Security</h2>
                <p className="text-white/40 text-sm mb-5">To change your password, use the "Forgot password?" link on the login page. We'll send a reset link to {email}.</p>
                <a href="/forgot-password" className="inline-flex items-center gap-2 bg-[#1A2E3D] border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all">
                  Send Password Reset Email
                </a>
              </div>
              <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
                <h2 className="text-white font-display font-semibold mb-2">Data & Privacy</h2>
                <p className="text-white/40 text-sm mb-4">Your data is stored securely and never shared with third parties. We comply with Kenya's Data Protection Act 2019.</p>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1A7A6E]" />
                  <span className="text-white/50 text-sm">All data encrypted at rest and in transit</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-2 h-2 rounded-full bg-[#1A7A6E]" />
                  <span className="text-white/50 text-sm">Hosted on Supabase (SOC 2 compliant)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}