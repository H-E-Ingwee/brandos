'use client'

import { useState } from 'react'
import { Settings, User, Bell, Shield, CreditCard, CheckCircle, Crown, Zap, Building2 } from 'lucide-react'

const plans = [
  { id: 'free', name: 'Free', price: 'KES 0', period: 'forever', features: ['Brand Discovery', '1 Brand Report', '10 AI queries/month'], current: true },
  { id: 'growth', name: 'Growth', price: 'KES 1,500', period: '/month', features: ['Full Brand Strategy', '90-Day Marketing Plan', '50 AI queries/month', 'PDF exports'], current: false, popular: true },
  { id: 'pro', name: 'Pro', price: 'KES 3,500', period: '/month', features: ['Visual Identity Generator', 'Social Media Scheduler', 'Unlimited AI Coach', '3 team members'], current: false },
  { id: 'agency', name: 'Agency', price: 'KES 8,000', period: '/month', features: ['10 client brands', 'White-label reports', 'Unlimited team members', 'Account manager'], current: false },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({ name: 'Jane Wanjiku', email: 'jane@savannaskincare.co.ke', phone: '+254 712 345 678', businessName: 'Savanna Skincare', sector: 'Healthcare / Wellness', location: 'Nairobi, Kenya' })

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 800))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ]

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
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#F25C05]/10 text-[#F25C05] border border-[#F25C05]/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
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
              <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
                <h2 className="text-white font-display font-semibold mb-5">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text' },
                    { label: 'Email Address', key: 'email', type: 'email' },
                    { label: 'Phone / WhatsApp', key: 'phone', type: 'tel' },
                    { label: 'Location', key: 'location', type: 'text' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-white/60 mb-2">{field.label}</label>
                      <input
                        type={field.type}
                        value={profile[field.key as keyof typeof profile]}
                        onChange={e => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
                <h2 className="text-white font-display font-semibold mb-5">Business Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: 'Business Name', key: 'businessName', type: 'text' },
                    { label: 'Sector', key: 'sector', type: 'text' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-white/60 mb-2">{field.label}</label>
                      <input
                        type={field.type}
                        value={profile[field.key as keyof typeof profile]}
                        onChange={e => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} className="bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2">
                {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Changes'}
              </button>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="bg-[#D9910B]/10 border border-[#D9910B]/20 rounded-2xl p-5 flex items-center gap-4">
                <Crown className="w-8 h-8 text-[#D9910B]" />
                <div>
                  <div className="text-white font-semibold">You're on the Free Plan</div>
                  <div className="text-white/50 text-sm">Upgrade to unlock all 6 modules and unlimited AI coaching</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {plans.map((plan) => (
                  <div key={plan.id} className={`rounded-2xl border p-5 ${plan.current ? 'border-[#1A7A6E]/40 bg-[#1A7A6E]/5' : plan.popular ? 'border-[#F25C05]/30 bg-[#F25C05]/5' : 'border-white/8 bg-[#1A2E3D]'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-display font-semibold">{plan.name}</span>
                      {plan.current && <span className="bg-[#1A7A6E]/20 text-[#1A7A6E] text-[10px] font-bold px-2 py-0.5 rounded-full">Current</span>}
                      {plan.popular && !plan.current && <span className="bg-[#F25C05]/20 text-[#F25C05] text-[10px] font-bold px-2 py-0.5 rounded-full">Popular</span>}
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
                    {!plan.current && (
                      <button className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all bg-[#F25C05]/10 text-[#F25C05] border border-[#F25C05]/20 hover:bg-[#F25C05]/20">
                        Upgrade — Pay via M-Pesa
                      </button>
                    )}
                  </div>
                ))}
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
                <h2 className="text-white font-display font-semibold mb-5">Change Password</h2>
                <div className="space-y-4">
                  {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
                    <div key={label}>
                      <label className="block text-sm font-medium text-white/60 mb-2">{label}</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all" />
                    </div>
                  ))}
                  <button className="bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm">Update Password</button>
                </div>
              </div>
              <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
                <h2 className="text-white font-display font-semibold mb-2">Data & Privacy</h2>
                <p className="text-white/40 text-sm mb-4">Your data is stored securely and never shared with third parties. We comply with Kenya's Data Protection Act 2019.</p>
                <button className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">Delete Account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}