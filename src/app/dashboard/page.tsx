'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Target, Sparkles, Palette, TrendingUp, MessageSquare, BarChart3, ArrowRight, CheckCircle, Lock, Zap, ChevronRight, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, BrandDiscovery, BrandStrategy } from '@/lib/supabase/types'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Good night'
}

// Sector-aware labels
const sectorLabels: Record<string, { org: string; modules: string }> = {
  'NGO': { org: 'organisation', modules: 'programme modules' },
  'Education': { org: 'institution', modules: 'learning modules' },
  'Healthcare': { org: 'practice', modules: 'service modules' },
  'default': { org: 'business', modules: 'brand modules' },
}

function getSectorLabel(sector: string | null | undefined, key: keyof typeof sectorLabels['default']) {
  const match = Object.keys(sectorLabels).find(k => sector?.includes(k))
  return sectorLabels[match || 'default'][key]
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [discovery, setDiscovery] = useState<BrandDiscovery | null>(null)
  const [strategy, setStrategy] = useState<BrandStrategy | null>(null)
  const [identityDone, setIdentityDone] = useState(false)
  const [marketingDone, setMarketingDone] = useState(false)
  const [contentCount, setContentCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [greeting] = useState(getGreeting())

  useEffect(() => {
    const supabase = createClient()
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [p, d, s, id, mk, ct] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('brand_discovery').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('brand_strategy').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('visual_identity').select('id, selected_palette').eq('user_id', user.id).maybeSingle(),
        supabase.from('marketing_plan').select('id, plan_data').eq('user_id', user.id).maybeSingle(),
        supabase.from('content_posts').select('id', { count: 'exact' }).eq('user_id', user.id),
      ])

      setProfile(p.data)
      setDiscovery(d.data)
      setStrategy(s.data)
      setIdentityDone(!!(id.data?.selected_palette))
      setMarketingDone(!!(mk.data?.plan_data))
      setContentCount(ct.count || 0)
      setLoading(false)
    }
    fetchData()
  }, [])

  // Accurate progress calculation
  const completedModules = [
    discovery?.completed,
    !!(strategy?.positioning_statement),
    identityDone,
    marketingDone,
    contentCount > 0,
    false, // analytics always last
  ].filter(Boolean).length

  const progress = Math.round((completedModules / 6) * 100)

  const modules = [
    { href: '/dashboard/discovery', icon: Target, label: 'Brand Discovery', desc: 'Understand your brand, audience, and market', status: discovery?.completed ? 'complete' : discovery ? 'in-progress' : 'available', color: '#F25C05', progress: discovery?.completed ? 100 : 0 },
    { href: '/dashboard/strategy', icon: Sparkles, label: 'Brand Strategy', desc: 'Positioning, personas, and messaging framework', status: strategy?.positioning_statement ? 'complete' : discovery?.completed ? 'available' : 'locked', color: '#D9910B', progress: strategy?.positioning_statement ? 100 : 0 },
    { href: '/dashboard/identity', icon: Palette, label: 'Visual Identity', desc: 'Logo, colours, typography, and brand guidelines', status: identityDone ? 'complete' : strategy?.positioning_statement ? 'available' : 'locked', color: '#1A7A6E', progress: identityDone ? 100 : 0 },
    { href: '/dashboard/marketing', icon: TrendingUp, label: 'Marketing Plan', desc: '90-day digital marketing strategy', status: marketingDone ? 'complete' : strategy?.positioning_statement ? 'available' : 'locked', color: '#F25C05', progress: marketingDone ? 100 : 0 },
    { href: '/dashboard/content', icon: MessageSquare, label: 'Content Engine', desc: 'AI-generated social media content', status: contentCount > 0 ? 'complete' : strategy?.positioning_statement ? 'available' : 'locked', color: '#D9910B', progress: contentCount > 0 ? 100 : 0 },
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics', desc: 'Track your brand-building progress', status: 'available', color: '#1A7A6E', progress: 0 },
  ]

  // Get display name — handle Google OAuth long IDs
  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name
    const supabase = createClient()
    return 'there'
  }

  const firstName = (() => {
    const name = profile?.full_name || ''
    // If name looks like a UUID or is very long with no spaces, use generic greeting
    if (!name || name.length > 50 || (name.length > 20 && !name.includes(' '))) return 'there'
    return name.split(' ')[0]
  })()

  const businessName = discovery?.business_name || profile?.business_name || ''
  const sector = discovery?.sector || profile?.sector || ''
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
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-1">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-white/50">
          {businessName ? <><span className="text-[#F25C05] font-medium">{businessName}</span> · </> : ''}
          {progress === 0 ? 'Start your brand journey below.' : `Your brand is ${progress}% complete. Let's keep building.`}
        </p>
      </div>

      {/* Overall progress */}
      <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-white font-display font-semibold text-lg">Brand Building Progress</div>
            <div className="text-white/40 text-sm mt-0.5">
              Complete all 6 {getSectorLabel(sector, 'modules')} to unlock your full brand system
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-display font-bold text-[#F25C05]">{progress}%</div>
            <div className="text-white/40 text-xs">Complete</div>
          </div>
        </div>
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-[#F25C05] to-[#D9910B] rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-white/30">
          <span>{completedModules} of 6 modules complete</span>
          <span>~{Math.max(1, 6 - completedModules)} hour{6 - completedModules !== 1 ? 's' : ''} remaining</span>
        </div>
        {/* Module progress dots */}
        <div className="flex gap-2 mt-4">
          {modules.map((mod, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/5">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${mod.progress}%`, backgroundColor: mod.color }} />
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Brand Score', value: brandScore > 0 ? `${brandScore}/100` : '—', sub: brandScore > 0 ? (brandScore >= 70 ? 'Strong' : 'Building') : 'Complete strategy first', color: brandScore > 0 ? '#F25C05' : undefined },
          { label: 'Modules Done', value: `${completedModules}/6`, sub: `${6 - completedModules} remaining` },
          { label: 'AI Queries', value: `${queriesUsed}/${queriesLimit === 999 ? '∞' : queriesLimit}`, sub: profile?.plan === 'free' ? 'Free plan' : `${profile?.plan} plan` },
          { label: 'Content Posts', value: `${contentCount}`, sub: contentCount > 0 ? 'Generated' : 'None yet' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-5">
            <div className="text-white/40 text-xs mb-2">{stat.label}</div>
            <div className="text-xl font-display font-bold text-white mb-1" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-white/30 text-xs">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Modules */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-display font-semibold text-white">Your Brand Modules</h2>
            <span className="text-white/30 text-sm">{completedModules} of 6 complete</span>
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
        <div className="space-y-5">
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
                ? `Complete your Brand Discovery to unlock your AI-generated brand strategy for ${businessName || 'your organisation'}.`
                : !strategy?.positioning_statement
                ? 'Your discovery is complete! Generate your brand strategy with AI now.'
                : 'Ask your AI coach anything about your brand, marketing, or strategy.'}
            </p>
            <Link href={!discovery?.completed ? '/dashboard/discovery' : '/dashboard/strategy'}
              className="block w-full bg-[#F25C05] hover:bg-[#D94E00] text-white text-center py-2.5 rounded-xl text-sm font-semibold transition-all">
              {!discovery?.completed ? 'Start Brand Discovery' : !strategy?.positioning_statement ? 'Generate Brand Strategy' : 'Open AI Coach'}
            </Link>
          </div>

          {/* Onboarding checklist */}
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-[#D9910B]" />
              <span className="text-white font-semibold text-sm">Getting Started</span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Complete Brand Discovery', done: !!discovery?.completed, href: '/dashboard/discovery' },
                { label: 'Generate Brand Strategy', done: !!strategy?.positioning_statement, href: '/dashboard/strategy' },
                { label: 'Set up Visual Identity', done: identityDone, href: '/dashboard/identity' },
                { label: 'Create Marketing Plan', done: marketingDone, href: '/dashboard/marketing' },
                { label: 'Generate first content post', done: contentCount > 0, href: '/dashboard/content' },
              ].map((item) => (
                <Link key={item.label} href={item.done ? '#' : item.href}
                  className={`flex items-center gap-3 text-sm transition-colors ${item.done ? 'cursor-default' : 'hover:text-white'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-[#1A7A6E]/20' : 'bg-white/5 border border-white/15'}`}>
                    {item.done && <CheckCircle className="w-3.5 h-3.5 text-[#1A7A6E]" />}
                  </div>
                  <span className={item.done ? 'text-white/30 line-through' : 'text-white/60'}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Upgrade CTA for free users */}
          {profile?.plan === 'free' && (
            <div className="bg-[#1A2E3D] border border-[#D9910B]/20 rounded-2xl p-5">
              <div className="text-[#D9910B] text-xs font-bold uppercase tracking-wider mb-2">Free Plan</div>
              <div className="text-white font-semibold mb-1">Unlock all 6 modules</div>
              <div className="text-white/40 text-xs mb-4">Upgrade to Growth for KES 1,500/month and get your complete brand system.</div>
              <Link href="/dashboard/upgrade" className="block w-full bg-[#D9910B]/10 hover:bg-[#D9910B]/20 border border-[#D9910B]/30 text-[#D9910B] text-center py-2.5 rounded-xl text-sm font-semibold transition-all">
                Upgrade — Pay via M-Pesa
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}