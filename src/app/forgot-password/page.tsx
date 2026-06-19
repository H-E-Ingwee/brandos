'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
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

        {sent ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#1A7A6E]/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#1A7A6E]" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-3">Check your email</h1>
            <p className="text-white/60 mb-2">We sent a password reset link to:</p>
            <p className="text-[#F25C05] font-semibold mb-8">{email}</p>
            <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6 mb-8 text-left">
              <div className="space-y-3">
                {[
                  'Open your email inbox',
                  'Click the "Reset Password" link',
                  'Create a new password',
                  'Sign in with your new password',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#F25C05]/10 flex items-center justify-center text-[#F25C05] font-bold text-xs flex-shrink-0">{i + 1}</div>
                    <span className="text-white/70 text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-white/40 text-sm mb-4">
              Didn't receive it? Check your spam folder or{' '}
              <button onClick={() => setSent(false)} className="text-[#F25C05] hover:underline">try again</button>
            </p>
            <Link href="/login" className="text-white/30 text-sm hover:text-white transition-colors">
              Back to sign in
            </Link>
          </div>
        ) : (
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-[#F25C05]/15 flex items-center justify-center mb-6">
              <Mail className="w-6 h-6 text-[#F25C05]" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-2">Forgot your password?</h1>
            <p className="text-white/50 text-sm mb-8">
              No problem. Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 text-sm mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    autoFocus
                    className="w-full bg-[#162330] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F25C05]/20"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Send Reset Link</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-white/40 text-sm hover:text-white transition-colors">
                ← Back to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}