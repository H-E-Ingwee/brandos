'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, Eye, EyeOff, ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : error.message === 'Email not confirmed'
          ? 'Please verify your email first. Check your inbox for the confirmation link.'
          : error.message
      )
      setLoading(false)
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
    // If no error, browser redirects to Google — no need to setLoading(false)
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

      {/* Google OAuth */}
      <button
        onClick={handleGoogleLogin}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-800 font-semibold py-3.5 rounded-xl transition-all duration-200 mb-4 shadow-sm"
      >
        {googleLoading
          ? <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          : <GoogleIcon />
        }
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-xs">or sign in with email</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Email/Password form */}
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Email address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@business.com"
              required
              autoComplete="email"
              className="w-full bg-[#162330] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white/70">Password</label>
            <Link href="/forgot-password" className="text-[#F25C05] text-xs hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full bg-[#162330] border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F25C05]/20"
        >
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
          }
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