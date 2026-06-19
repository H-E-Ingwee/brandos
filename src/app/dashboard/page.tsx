'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Target, Sparkles, Palette, TrendingUp, MessageSquare, BarChart3, ArrowRight, CheckCircle, Lock, Zap, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, BrandDiscovery, BrandStrategy } from '@/lib/supabase/types'

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [discovery, setDiscovery] = useState<BrandDiscovery | null>(null)
  const [strategy, setStrategy] = useState<BrandStrategy | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [p, d, s] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('brand_discovery').select('*').eq('user_id', user.id).single(),
        supabase.from('brand_strategy').select('*').eq('user_id', user.id).single(),
      ])

      setProfile(p.data)
      setDiscovery(d.data)
      setStrategy(s.data)
      setLoading(false)
    }
    fetchData()
  }, [])

  // Calculate progress
  const progress = (() => {
    let score = 0
    if (discovery?.completed) score += 20
    if (strategy?.positioning_statement) score += 20
    return Math.min(score, 100)
  })()

  const modules = [
    {
      href: '/dashboard/discovery',
      icon: Target,
      label: 'Brand Discovery',
      desc: 'Audit your current brand and identify gaps',
      status: discovery?.completed ? 'complete' : discovery ? 'in-progress' : 'available',
      color: '#F25C05',
      progress: discovery?.completed ? 100 : 0,
    },
    {
      href: '/dashboard/strategy',
      icon: Sparkles,
      label: 'Brand Strategy',
      desc: 'Positioning, personas, and messaging framework',
      status: strategy?.positioning_statement ? 'complete' : discovery?.completed ? 'available' : 'locked',
      color: '#D9910B',
      progress: strategy?.positioning_statement ? 100 : 0,
    },
    {
      href: '/dashboard/identity',
      icon: Palette,
      label: 'Visual Identity',
      desc: 'Colours, typography, and brand guidelines',
      status: strategy?.positioning_statement ? 'available' : 'locked',
      color: '#1A7A6E',
      progress: 0,
    },
    {
      href: '/dashboard/marketing',
      icon: TrendingUp,
      label: 'Marketing Plan',
      desc: '90-day digital marketing strategy',
      status: strategy?.positioning_statement ? 'available' : 'locked',
      color: '#F25C05',
      progress: 0,
    },
    {
      href: '/dashboard/content',
      icon: MessageSquare,
      label: 'Content Engine',
      desc: 'Social media content and calendar',
      status: strategy?.positioning_statement ? 'available' : 'locked',
      color: '#D9910B',
      progress: 0,
    },
    {
      href: '/dashboard/analytics',
      icon: BarChart3,
      label: 'Analytics',
      desc: 'Track your brand and marketing performance',
      status: 'available',
      color: '#1A7A6E',
      progress: 0,
    },
  ]

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const businessName = profile?.business_name || discovery?.business_name || ''
  const brandScore = strategy?.brand_score || 0
  const queriesUsed = profile?.ai_queries_used || 0
  const queriesLimit = profile?.plan === 'free' ? 10 : profile?.plan === 'growth' ? 50 : 999

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-1">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName} 👋
        </h1>
        <p className="text-white/50">
          {businessName ? `${businessName} · ` : ''}
          {progress === 0 ? 'Start your brand journey below.' : `Your brand is ${progress}% complete. Let's keep building.`}
        </p>
      </div>

      {/* Overall progress */}
      <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-white font-display font-semibold text-lg">Brand Building Progress</div>
            <div className="text-white/40 text-sm mt-0.5">Complete all 6 modules to unlock your full brand system</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-display font-bold text-[#F25C05]">{progress}%</div>
            <div className="text-white/40 text-xs">Complete</div>
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#F25C05] to-[#D9910B] rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-white/30">
          <span>{modules.filter(m => m.status === 'complete').length} of 6 modules complete</span>
          <span>Estimated time remaining: ~{6 - modules.filter(m => m.status === 'complete').length} hours</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Brand Score', value: brandScore > 0 ? `${brandScore}/100` : '—', sub: brandScore > 0 ? 'Based on your strategy' : 'Complete discovery first', color: brandScore > 0 ? '#F25C05' : undefined },
          { label: 'Modules Complete', value: `${modules.filter(m => m.status === 'complete').length}/6`, sub: `${6 - modules.filter(m => m.status === 'complete').length} remaining` },
          { label: 'AI Queries Used', value: `${queriesUsed}/${queriesLimit === 999 ? '∞' : queriesLimit}`, sub: profile?.plan === 'free' ? 'Free plan' : `${profile?.plan} plan` },
          { label: 'Business', value: businessName || 'Not set', sub: profile?.sector || 'Set in Discovery' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-5">
            <div className="text-white/40 text-xs mb-2">{stat.label}</div>
            <div className="text-xl font-display font-bold text-white mb-1 truncate" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-white/30 text-xs truncate">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Modules */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-display font-semibold text-white">Your Brand Modules</h2>
            <span className="text-white/30 text-sm">{modules.filter(m => m.status === 'complete').length} of 6 complete</span>
          </div>
          <div className="space-y-3">
            {modules.map((mod) => {
              const isLocked = mod.status === 'locked'
              const isComplete = mod.status === 'complete'
              const isInProgress = mod.status === 'in-progress'
              return (
                <Link key={mod.href} href={isLocked ? '#' : mod.href}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${isLocked ? 'bg-[#1A2E3D]/50 border-white/5 opacity-60 cursor-not-allowed' : 'bg-[#1A2E3D] border-white/8 hover:border-[#F25C05]/30 hover:bg-[#162330] cursor-pointer'}`}
                  onClick={isLocked ? (e) => e.preventDefault() : undefined}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${mod.color}15`, border: `1px solid ${mod.color}30` }}>
                    {isLocked ? <Lock className="w-5 h-5 text-white/20" /> : <mod.icon className="w-5 h-5" style={{ color: mod.color }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-medium text-sm">{mod.label}</span>
                      {isComplete && <span className="bg-[#1A7A6E]/20 text-[#1A7A6E] text-[10px] font-bold px-2 py-0.5 rounded-full">Complete</span>}
                      {isInProgress && <span className="bg-[#D9910B]/20 text-[#D9910B] text-[10px] font-bold px-2 py-0.5 rounded-full">In Progress</span>}
                      {isLocked && <span className="bg-white/5 text-white/30 text-[10px] font-bold px-2 py-0.5 rounded-full">Locked</span>}
                    </div>
                    <div className="text-white/40 text-xs">{mod.desc}</div>
                  </div>
                  {!isLocked && <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Next action */}
          <div className="bg-gradient-to-br from-[#F25C05]/10 to-[#D9910B]/5 border border-[#F25C05]/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#F25C05]" />
              <span className="text-[#F25C05] text-sm font-semibold">
                {!discovery?.completed ? 'Start Here' : !strategy?.positioning_statement ? 'Next Step' : 'AI Brand Coach'}
              </span>
            </div>
            <p className="text-white/70 text-sm mb-4 leading-relaxed">
              {!discovery?.completed
                ? 'Complete your Brand Discovery to unlock your AI-generated brand strategy.'
                : !strategy?.positioning_statement
                ? 'Your discovery is complete! Generate your brand strategy with AI now.'
                : 'Ask your AI coach anything about your brand, marketing, or business strategy.'}
            </p>
            <Link
              href={!discovery?.completed ? '/dashboard/discovery' : '/dashboard/strategy'}
              className="block w-full bg-[#F25C05] hover:bg-[#D94E00] text-white text-center py-2.5 rounded-xl text-sm font-semibold transition-all">
              {!discovery?.completed ? 'Start Brand Discovery' : !strategy?.positioning_statement ? 'Generate Brand Strategy' : 'Open AI Coach'}
            </Link>
          </div>

          {/* Upgrade CTA for free users */}
          {profile?.plan === 'free' && (
            <div className="bg-[#1A2E3D] border border-[#D9910B]/20 rounded-2xl p-6">
              <div className="text-[#D9910B] text-xs font-bold uppercase tracking-wider mb-2">Free Plan</div>
              <div className="text-white font-semibold mb-1">Unlock all 6 modules</div>
              <div className="text-white/40 text-xs mb-4">Upgrade to Growth for KES 1,500/month and get your complete brand system.</div>
              <Link href="/dashboard/settings" className="block w-full bg-[#D9910B]/10 hover:bg-[#D9910B]/20 border border-[#D9910B]/30 text-[#D9910B] text-center py-2.5 rounded-xl text-sm font-semibold transition-all">
                Upgrade to Growth
              </Link>
            </div>
          )}

          {/* Brand score card */}
          {brandScore > 0 && (
            <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
              <h3 className="text-white font-display font-semibold mb-4">Brand Score</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-[#F25C05]/30 flex items-center justify-center">
                  <span className="text-[#F25C05] font-display font-bold text-lg">{brandScore}</span>
                </div>
                <div>
                  <div className="text-white text-sm font-medium">
                    {brandScore >= 70 ? 'Strong brand foundation' : brandScore >= 50 ? 'Good progress' : 'Getting started'}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">Complete more modules to improve</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}