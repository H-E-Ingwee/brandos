'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Mail } from 'lucide-react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your email'

  return (
    <>
      <p className="text-white/60 mb-2">We sent a verification link to:</p>
      <p className="text-[#F25C05] font-semibold mb-8">{email}</p>
      <p className="text-white/40 text-sm mb-4">
        Didn't receive the email? Check your spam folder or{' '}
        <Link href="/signup" className="text-[#F25C05] hover:underline">try again</Link>
      </p>
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#0F1D26] flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl bg-[#F25C05] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">BrandOS</span>
        </div>
        <div className="w-20 h-20 rounded-full bg-[#1A7A6E]/20 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-[#1A7A6E]" />
        </div>
        <h1 className="text-3xl font-display font-bold text-white mb-3">Check your email</h1>
        <Suspense fallback={<p className="text-white/60 mb-8">Loading...</p>}>
          <VerifyEmailContent />
        </Suspense>
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6 mb-8 text-left">
          <div className="space-y-3">
            {['Open your email inbox', 'Click the verification link we sent you', "You'll be redirected to your BrandOS dashboard", 'Start building your brand!'].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F25C05]/10 flex items-center justify-center text-[#F25C05] font-bold text-xs flex-shrink-0">{i + 1}</div>
                <span className="text-white/70 text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
        <Link href="/login" className="text-white/30 text-sm hover:text-white transition-colors">Back to sign in</Link>
      </div>
    </div>
  )
}