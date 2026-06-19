'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Eye, EyeOff, ArrowRight, Mail, Lock, User, Building2, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const sectors = [
  'E-Commerce / Retail', 'Healthcare / Wellness', 'Technology / Startup',
  'Professional Services', 'NGO / Social Enterprise', 'Restaurant / Food & Beverage',
  'Education', 'Real Estate', 'Agriculture / Agritech', 'Finance / Fintech', 'Other'
]

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    businessName: '', sector: '', size: '',
  })

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setError('')
    setStep(2)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          business_name: form.businessName,
          sector: form.sector,
          business_size: form.size,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
      },
    })

    if (signupError) {
      setError(
        signupError.message.includes('already registered')
          ? 'An account with this email already exists. Try signing in instead.'
          : signupError.message
      )
      setLoading(false)
      return
    }

    // Update profile with business details
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: form.name,
        business_name: form.businessName,
        sector: form.sector,
        business_size: form.size,
      })

      // Send welcome email (fire and forget)
      fetch('/api/auth/welcome', { method: 'POST' }).catch(() => {})
    }

    // Check if email confirmation is required
    if (data.session === null) {
      router.push('/signup/verify-email?email=' + encodeURIComponent(form.email))
    } else {
      router.push('/dashboard')
      router.refresh()
    }
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
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 text-sm mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          {step === 1 ? (
            <>
              <h1 className="text-2xl font-display font-bold text-white mb-1">Create your account</h1>
              <p className="text-white/50 text-sm mb-6">Start building your brand for free — no credit card required</p>

              {/* Google OAuth */}
              <button
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-800 font-semibold py-3.5 rounded-xl transition-all mb-4 shadow-sm"
              >
                {googleLoading
                  ? <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  : <GoogleIcon />
                }
                Continue with Google
              </button>

              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/30 text-xs">or sign up with email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleStep1} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Full name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      placeholder="Your full name"
                      required
                      autoComplete="name"
                      className="w-full bg-[#162330] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
                      placeholder="you@business.com"
                      required
                      autoComplete="email"
                      className="w-full bg-[#162330] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full bg-[#162330] border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F25C05]/20">
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
                    <input
                      type="text"
                      value={form.businessName}
                      onChange={e => update('businessName', e.target.value)}
                      placeholder="Your business name"
                      required
                      className="w-full bg-[#162330] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Industry / Sector</label>
                  <select
                    value={form.sector}
                    onChange={e => update('sector', e.target.value)}
                    required
                    className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all"
                  >
                    <option value="" className="bg-[#162330]">Select your sector</option>
                    {sectors.map(s => <option key={s} value={s} className="bg-[#162330]">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Business size</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Solo', '2–10', '10+'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => update('size', size)}
                        className={`py-3 rounded-xl border text-sm font-medium transition-all ${form.size === size ? 'bg-[#F25C05]/10 border-[#F25C05]/40 text-[#F25C05]' : 'bg-[#162330] border-white/10 text-white/50 hover:border-white/20'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-[#162330] hover:bg-[#1A2E3D] text-white font-medium py-3.5 rounded-xl border border-white/10 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !form.size}
                    className="flex-1 bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F25C05]/20"
                  >
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><span>Launch BrandOS</span><Sparkles className="w-4 h-4" /></>
                    }
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
        <p className="text-center text-white/20 text-xs mt-4">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}