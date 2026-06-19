'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Eye, EyeOff, ArrowRight, Mail, Lock, User, Building2, CheckCircle } from 'lucide-react'

const sectors = ['E-Commerce', 'Healthcare', 'Technology / Startup', 'Professional Services', 'NGO / Social Enterprise', 'Restaurant / Food', 'Retail', 'Education', 'Real Estate', 'Other']

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', businessName: '', sector: '', size: '',
  })

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0F1D26] flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl bg-[#F25C05] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">BrandOS</span>
          <span className="text-white/30 text-sm">by Ingweplex</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-[#F25C05] text-white' : 'bg-[#1A2E3D] text-white/30 border border-white/10'}`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              <div className="flex-1">
                <div className={`text-xs font-medium ${step >= s ? 'text-white' : 'text-white/30'}`}>
                  {s === 1 ? 'Your Account' : 'Your Business'}
                </div>
              </div>
              {s < 2 && <div className={`h-px flex-1 ${step > s ? 'bg-[#F25C05]' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-8">
          {step === 1 ? (
            <>
              <h1 className="text-2xl font-display font-bold text-white mb-1">Create your account</h1>
              <p className="text-white/50 text-sm mb-8">Start building your brand for free — no credit card required</p>
              <form onSubmit={handleStep1} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Full name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your full name" className="w-full bg-[#162330] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@business.com" className="w-full bg-[#162330] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min. 8 characters" className="w-full bg-[#162330] border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all" required minLength={8} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#F25C05]/20">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-white mb-1">Tell us about your business</h1>
              <p className="text-white/50 text-sm mb-8">This helps us personalise your brand-building experience</p>
              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Business name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type="text" value={form.businessName} onChange={e => update('businessName', e.target.value)} placeholder="Your business name" className="w-full bg-[#162330] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Industry / Sector</label>
                  <select value={form.sector} onChange={e => update('sector', e.target.value)} className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all" required>
                    <option value="" className="bg-[#162330]">Select your sector</option>
                    {sectors.map(s => <option key={s} value={s} className="bg-[#162330]">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Business size</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Solo', '2–10', '10+'].map(size => (
                      <button key={size} type="button" onClick={() => update('size', size)} className={`py-3 rounded-xl border text-sm font-medium transition-all ${form.size === size ? 'bg-[#F25C05]/10 border-[#F25C05]/40 text-[#F25C05]' : 'bg-[#162330] border-white/10 text-white/50 hover:border-white/20'}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 bg-[#162330] hover:bg-[#1A2E3D] text-white font-medium py-3.5 rounded-xl border border-white/10 transition-all">
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#F25C05]/20">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Launch BrandOS <Sparkles className="w-4 h-4" /></>}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <span className="text-white/40 text-sm">Already have an account? </span>
          <Link href="/login" className="text-[#F25C05] text-sm font-medium hover:underline">Sign in</Link>
        </div>
        <p className="text-center text-white/20 text-xs mt-4">By signing up, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  )
}