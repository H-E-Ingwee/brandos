'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, Eye, EyeOff, ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Incorrect email or password. Please try again.' : error.message)
      setLoading(false)
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="lg:hidden flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-[#F25C05] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-lg text-white">BrandOS</span>
      </div>
      <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome back</h1>
      <p className="text-white/50 mb-8">Sign in to continue building your brand</p>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 text-sm mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Email address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@business.com" required autoComplete="email"
              className="w-full bg-[#162330] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white/70">Password</label>
            <Link href="/forgot-password" className="text-[#F25C05] text-xs hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password"
              className="w-full bg-[#162330] border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F25C05]/20">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
      <div className="mt-6 text-center">
        <span className="text-white/40 text-sm">Don't have an account? </span>
        <Link href="/signup" className="text-[#F25C05] text-sm font-medium hover:underline">Create one free</Link>
      </div>
      <div className="mt-8 pt-8 border-t border-white/5 text-center">
        <p className="text-white/30 text-xs">Pay via M-Pesa · No credit card required · Cancel anytime</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0F1D26] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1A2E3D] border-r border-white/5 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F25C05]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#D9910B]/5 rounded-full blur-3xl" />
        <div className="relative">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#F25C05] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">BrandOS</span>
          </Link>
        </div>
        <div className="relative">
          <blockquote className="text-2xl font-display font-semibold text-white leading-relaxed mb-6">
            "BrandOS gave me a complete brand strategy in 20 minutes. What would have cost KES 80,000 with a consultant, I got for KES 1,500/month."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F25C05]/20 flex items-center justify-center text-[#F25C05] font-bold">A</div>
            <div>
              <div className="text-white font-semibold text-sm">Amina Wanjiku</div>
              <div className="text-white/40 text-xs">Founder, Savanna Skincare · Nairobi</div>
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-3 gap-4">
          {[['7.4M+', 'SMEs in Kenya'], ['60%', 'Revenue lost to poor branding'], ['20 min', 'To your first brand strategy']].map(([v, l]) => (
            <div key={l} className="bg-[#0F1D26]/60 rounded-xl p-4">
              <div className="text-[#F25C05] font-display font-bold text-xl">{v}</div>
              <div className="text-white/40 text-xs mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Suspense fallback={<div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}