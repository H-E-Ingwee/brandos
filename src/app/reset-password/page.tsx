'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Supabase handles the token from the URL hash automatically
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })
    // Also check if already in a session (token already processed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 3000)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0F1D26] flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-[#1A7A6E]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#1A7A6E]" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-3">Password Updated!</h1>
          <p className="text-white/60 mb-2">Your password has been successfully reset.</p>
          <p className="text-white/40 text-sm">Redirecting you to the dashboard...</p>
          <div className="mt-6">
            <div className="w-6 h-6 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F1D26] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl bg-[#F25C05] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">BrandOS</span>
        </div>

        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-8">
          <div className="w-12 h-12 rounded-xl bg-[#F25C05]/15 flex items-center justify-center mb-6">
            <Lock className="w-6 h-6 text-[#F25C05]" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">Create new password</h1>
          <p className="text-white/50 text-sm mb-8">
            Choose a strong password for your BrandOS account.
          </p>

          {!sessionReady && (
            <div className="bg-[#D9910B]/10 border border-[#D9910B]/20 rounded-xl px-4 py-3 flex items-center gap-3 text-[#D9910B] text-sm mb-5">
              <div className="w-4 h-4 border-2 border-[#D9910B]/30 border-t-[#D9910B] rounded-full animate-spin flex-shrink-0" />
              Verifying your reset link...
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 text-sm mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">New password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
                        password.length >= i * 3
                          ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-[#D9910B]' : i <= 3 ? 'bg-[#F25C05]' : 'bg-[#1A7A6E]'
                          : 'bg-white/10'
                      }`} />
                    ))}
                  </div>
                  <p className="text-white/30 text-xs">
                    {password.length < 8 ? 'Too short' : password.length < 12 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Confirm new password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  autoComplete="new-password"
                  className={`w-full bg-[#162330] border rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20'
                      : confirmPassword && confirmPassword === password
                      ? 'border-[#1A7A6E]/40 focus:border-[#1A7A6E]/60 focus:ring-[#1A7A6E]/20'
                      : 'border-white/10 focus:border-[#F25C05]/60 focus:ring-[#F25C05]/20'
                  }`}
                />
                {confirmPassword && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {confirmPassword === password
                      ? <CheckCircle className="w-4 h-4 text-[#1A7A6E]" />
                      : <AlertCircle className="w-4 h-4 text-red-400" />
                    }
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !sessionReady || password !== confirmPassword || password.length < 8}
              className="w-full bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F25C05]/20"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Update Password'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}