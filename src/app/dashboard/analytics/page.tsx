'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, ArrowUpRight, RefreshCw, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, BrandStrategy } from '@/lib/supabase/types'

interface AnalyticsData {
  profile: Profile | null
  strategy: BrandStrategy | null
  discoveryComplete: boolean
  contentPostsCount: number
  chatMessagesCount: number
  modulesComplete: number
  businessName: string
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, strategyRes, discoveryRes, postsRes, chatRes, identityRes, marketingRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('brand_strategy').select('*').eq('user_id', user.id).single(),
      supabase.from('brand_discovery').select('completed, business_name').eq('user_id', user.id).single(),
      supabase.from('content_posts').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('chat_messages').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('visual_identity').select('id').eq('user_id', user.id).single(),
      supabase.from('marketing_plan').select('id').eq('user_id', user.id).single(),
    ])

    // Count completed modules
    let modulesComplete = 0
    if (discoveryRes.data?.completed) modulesComplete++
    if (strategyRes.data?.positioning_statement) modulesComplete++
    if (identityRes.data) modulesComplete++
    if (marketingRes.data) modulesComplete++

    setData({
      profile: profileRes.data,
      strategy: strategyRes.data,
      discoveryComplete: discoveryRes.data?.completed || false,
      contentPostsCount: postsRes.count || 0,
      chatMessagesCount: chatRes.count || 0,
      modulesComplete,
      businessName: discoveryRes.data?.business_name || profileRes.data?.business_name || 'Your Business',
    })
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleRefresh = () => { setRefreshing(true); fetchData() }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" />
      </div>
    )
  }

  const { profile, strategy, discoveryComplete, contentPostsCount, chatMessagesCount, modulesComplete, businessName } = data!

  const brandScore = strategy?.brand_score || 0
  const queriesUsed = profile?.ai_queries_used || 0
  const queriesLimit = profile?.plan === 'free' ? 10 : profile?.plan === 'growth' ? 50 : 999
  const queriesPercent = queriesLimit === 999 ? 10 : Math.round((queriesUsed / queriesLimit) * 100)
  const progressPercent = Math.round((modulesComplete / 6) * 100)

  // Build KPI cards from real data
  const kpis = [
    {
      label: 'Brand Score',
      value: brandScore > 0 ? `${brandScore}` : '—',
      unit: brandScore > 0 ? '/100' : '',
      change: brandScore > 0 ? (brandScore >= 70 ? 'Strong foundation' : brandScore >= 50 ? 'Good progress' : 'Getting started') : 'Complete strategy first',
      positive: brandScore >= 50,
      neutral: brandScore === 0,
    },
    {
      label: 'Modules Complete',
      value: `${modulesComplete}`,
      unit: '/6',
      change: modulesComplete === 6 ? 'All modules done!' : `${6 - modulesComplete} remaining`,
      positive: modulesComplete >= 4,
      neutral: modulesComplete < 2,
    },
    {
      label: 'AI Queries Used',
      value: `${queriesUsed}`,
      unit: `/${queriesLimit === 999 ? '∞' : queriesLimit}`,
      change: queriesLimit === 999 ? 'Unlimited plan' : `${queriesLimit - queriesUsed} remaining`,
      positive: queriesUsed < queriesLimit * 0.8,
      neutral: false,
    },
    {
      label: 'Content Posts',
      value: `${contentPostsCount}`,
      unit: '',
      change: contentPostsCount > 0 ? 'Posts generated' : 'Generate your first post',
      positive: contentPostsCount > 5,
      neutral: contentPostsCount === 0,
    },
    {
      label: 'AI Conversations',
      value: `${chatMessagesCount}`,
      unit: '',
      change: chatMessagesCount > 0 ? 'Messages with AI coach' : 'Start a conversation',
      positive: chatMessagesCount > 10,
      neutral: chatMessagesCount === 0,
    },
    {
      label: 'Overall Progress',
      value: `${progressPercent}`,
      unit: '%',
      change: progressPercent === 100 ? 'Brand system complete!' : `${100 - progressPercent}% to go`,
      positive: progressPercent >= 60,
      neutral: progressPercent < 20,
    },
  ]

  // Module completion status for the table
  const moduleStatus = [
    { name: 'Brand Discovery', complete: discoveryComplete, href: '/dashboard/discovery' },
    { name: 'Brand Strategy', complete: !!strategy?.positioning_statement, href: '/dashboard/strategy' },
    { name: 'Visual Identity', complete: modulesComplete >= 3, href: '/dashboard/identity' },
    { name: 'Marketing Plan', complete: modulesComplete >= 4, href: '/dashboard/marketing' },
    { name: 'Content Engine', complete: contentPostsCount > 0, href: '/dashboard/content' },
    { name: 'Analytics', complete: true, href: '/dashboard/analytics' },
  ]

  // AI insights based on real data
  const insights: string[] = []
  if (!discoveryComplete) insights.push('Complete your Brand Discovery to unlock AI-generated brand strategy and all other modules.')
  if (discoveryComplete && !strategy?.positioning_statement) insights.push('Your Brand Discovery is complete. Generate your Brand Strategy now — it takes less than 30 seconds.')
  if (strategy?.positioning_statement && contentPostsCount === 0) insights.push('Your brand strategy is ready. Generate your first social media post in the Content Engine to start building your online presence.')
  if (contentPostsCount > 0 && contentPostsCount < 5) insights.push(`You have ${contentPostsCount} post${contentPostsCount > 1 ? 's' : ''} generated. Aim for at least 30 posts to build a consistent content library.`)
  if (queriesUsed >= queriesLimit * 0.8 && queriesLimit !== 999) insights.push(`You have used ${queriesUsed} of ${queriesLimit} AI queries. Consider upgrading to Growth plan for 50 queries/month.`)
  if (brandScore > 0 && brandScore < 60) insights.push(`Your brand score is ${brandScore}/100. Complete more modules and refine your strategy to improve it.`)
  if (modulesComplete >= 4) insights.push('Great progress! You have completed most of your brand system. Focus on generating consistent content and tracking your marketing results.')
  if (insights.length === 0) insights.push('Your brand system is looking strong. Keep generating content consistently and track your real-world marketing results.')

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A7A6E]/15 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#1A7A6E]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">Analytics Dashboard</h1>
            <p className="text-white/40 text-sm">{businessName} · BrandOS activity metrics</p>
          </div>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A2E3D] border border-white/8 text-white/50 hover:text-white text-xs font-medium transition-all disabled:opacity-40">
          {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-5">
            <div className="text-white/40 text-xs mb-2">{kpi.label}</div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-2xl font-display font-bold text-white">{kpi.value}</span>
              <span className="text-white/40 text-sm mb-0.5">{kpi.unit}</span>
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${kpi.neutral ? 'text-white/30' : kpi.positive ? 'text-[#1A7A6E]' : 'text-[#D9910B]'}`}>
              {!kpi.neutral && (kpi.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
              {kpi.change}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-display font-semibold">Brand Building Progress</h2>
            <p className="text-white/40 text-xs mt-0.5">{modulesComplete} of 6 modules complete</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-display font-bold text-[#F25C05]">{progressPercent}%</div>
            <div className="text-white/40 text-xs">Complete</div>
          </div>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-[#F25C05] to-[#D9910B] rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {moduleStatus.map((mod) => (
            <a key={mod.name} href={mod.href}
              className={`text-center p-2 rounded-xl border text-xs transition-all hover:border-white/20 ${mod.complete ? 'border-[#1A7A6E]/30 bg-[#1A7A6E]/5 text-[#1A7A6E]' : 'border-white/5 bg-white/2 text-white/25'}`}>
              <div className="text-lg mb-1">{mod.complete ? '✅' : '⬜'}</div>
              <div className="leading-tight">{mod.name.split(' ')[0]}</div>
            </a>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* AI Usage */}
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-display font-semibold mb-5">AI Usage</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">AI Coach Queries</span>
                <span className="text-white font-semibold text-sm">{queriesUsed} / {queriesLimit === 999 ? '∞' : queriesLimit}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#F25C05] rounded-full transition-all" style={{ width: `${Math.min(queriesPercent, 100)}%` }} />
              </div>
              <div className="text-white/25 text-xs mt-1">{profile?.plan === 'free' ? 'Free plan · 10 queries/month' : profile?.plan === 'growth' ? 'Growth plan · 50 queries/month' : 'Unlimited queries'}</div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Total AI Conversations</span>
                <span className="text-white font-semibold text-sm">{chatMessagesCount} messages</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#D9910B] rounded-full" style={{ width: `${Math.min((chatMessagesCount / 50) * 100, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Content Posts Generated</span>
                <span className="text-white font-semibold text-sm">{contentPostsCount} posts</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#1A7A6E] rounded-full" style={{ width: `${Math.min((contentPostsCount / 30) * 100, 100)}%` }} />
              </div>
              <div className="text-white/25 text-xs mt-1">Target: 30 posts for a full content library</div>
            </div>
          </div>
        </div>

        {/* Module Status */}
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-display font-semibold mb-5">Module Status</h2>
          <div className="space-y-3">
            {moduleStatus.map((mod) => (
              <a key={mod.name} href={mod.href}
                className="flex items-center gap-3 p-3 bg-[#162330] rounded-xl hover:bg-[#1A2E3D] transition-all group">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${mod.complete ? 'bg-[#1A7A6E]/20' : 'bg-white/5'}`}>
                  {mod.complete
                    ? <span className="text-[#1A7A6E] text-sm">✓</span>
                    : <span className="text-white/20 text-sm">○</span>
                  }
                </div>
                <span className={`text-sm flex-1 ${mod.complete ? 'text-white/80' : 'text-white/40'}`}>{mod.name}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${mod.complete ? 'bg-[#1A7A6E]/20 text-[#1A7A6E]' : 'bg-white/5 text-white/25'}`}>
                  {mod.complete ? 'Complete' : 'Pending'}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-[#F25C05]/10 to-[#D9910B]/5 border border-[#F25C05]/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#F25C05]/20 flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5 text-[#F25C05]" />
          </div>
          <span className="text-[#F25C05] font-semibold text-sm">AI Performance Insights</span>
          <span className="text-white/20 text-xs ml-auto">Based on your real BrandOS data</span>
        </div>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3">
              <ArrowUpRight className="w-4 h-4 text-[#F25C05] mt-0.5 flex-shrink-0" />
              <p className="text-white/70 text-sm leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social media note */}
      <div className="mt-6 bg-[#1A2E3D] border border-white/5 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[#D9910B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[#D9910B] text-xs">ℹ</span>
          </div>
          <div>
            <div className="text-white/60 text-sm font-medium mb-1">Social Media Metrics — Coming in Phase 3</div>
            <div className="text-white/30 text-xs leading-relaxed">
              Real-time Instagram followers, TikTok views, WhatsApp engagement, and Google Analytics data will be connected in Phase 3 via social media API integrations. For now, this dashboard shows your BrandOS activity metrics.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}