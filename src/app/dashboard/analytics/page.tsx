'use client'

import { BarChart3, TrendingUp, TrendingDown, Users, Eye, Heart, MessageCircle, ArrowUpRight, Lock } from 'lucide-react'

const kpis = [
  { label: 'Brand Score', value: '72', unit: '/100', change: '+12', positive: true, desc: 'Based on consistency, reach, and engagement' },
  { label: 'Total Reach', value: '4,820', unit: '', change: '+34%', positive: true, desc: 'Across all channels this month' },
  { label: 'Engagement Rate', value: '4.2', unit: '%', change: '+0.8%', positive: true, desc: 'Above 3% is healthy for Kenya' },
  { label: 'Leads Generated', value: '23', unit: '', change: '+15', positive: true, desc: 'WhatsApp enquiries + DMs' },
  { label: 'WhatsApp Contacts', value: '187', unit: '', change: '+42', positive: true, desc: 'Broadcast list size' },
  { label: 'Google Reviews', value: '8', unit: '', change: '+3', positive: true, desc: 'Average rating: 4.8/5' },
]

const channelPerformance = [
  { channel: 'Instagram', followers: 1240, reach: 3200, engagement: '4.8%', topContent: 'Educational carousels', color: '#E1306C' },
  { channel: 'WhatsApp', followers: 187, reach: 187, engagement: '72%', topContent: 'Weekly skincare tips', color: '#25D366' },
  { channel: 'TikTok', followers: 340, reach: 1200, engagement: '6.2%', topContent: 'Skincare routine videos', color: '#000000' },
  { channel: 'Google', followers: 0, reach: 420, engagement: 'N/A', topContent: 'Business profile views', color: '#4285F4' },
]

const topContent = [
  { title: '5 reasons your skincare isn\'t working in Nairobi', platform: 'Instagram', reach: 1840, engagement: '8.2%', type: 'Carousel' },
  { title: 'POV: You found a moisturiser that works for your skin', platform: 'TikTok', reach: 1200, engagement: '6.2%', type: 'Reel' },
  { title: 'Weekly skincare tip — altitude and dry skin', platform: 'WhatsApp', reach: 187, engagement: '72%', type: 'Broadcast' },
  { title: 'The skincare industry has a Kenya problem', platform: 'LinkedIn', reach: 420, engagement: '3.1%', type: 'Article' },
]

const weeklyData = [
  { day: 'Mon', reach: 320, engagement: 42 },
  { day: 'Tue', reach: 580, engagement: 78 },
  { day: 'Wed', reach: 420, engagement: 55 },
  { day: 'Thu', reach: 890, engagement: 112 },
  { day: 'Fri', reach: 650, engagement: 88 },
  { day: 'Sat', reach: 480, engagement: 62 },
  { day: 'Sun', reach: 380, engagement: 48 },
]

const maxReach = Math.max(...weeklyData.map(d => d.reach))

export default function AnalyticsPage() {
  const isPro = false

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
            <p className="text-white/40 text-sm">Last 30 days · Savanna Skincare</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-[#1A2E3D] border border-white/8 rounded-xl px-3 py-2 text-white/60 text-xs focus:outline-none">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-5">
            <div className="text-white/40 text-xs mb-2">{kpi.label}</div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-display font-bold text-white">{kpi.value}</span>
              <span className="text-white/40 text-sm mb-0.5">{kpi.unit}</span>
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold mb-1 ${kpi.positive ? 'text-[#1A7A6E]' : 'text-red-400'}`}>
              {kpi.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {kpi.change} this month
            </div>
            <div className="text-white/25 text-[10px]">{kpi.desc}</div>
          </div>
        ))}
      </div>

      {/* Weekly Reach Chart */}
      <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-display font-semibold">Weekly Reach</h2>
            <p className="text-white/40 text-xs mt-0.5">Total reach across all channels</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#F25C05]" /><span className="text-white/40">Reach</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#1A7A6E]" /><span className="text-white/40">Engagement</span></div>
          </div>
        </div>
        <div className="flex items-end gap-3 h-40">
          {weeklyData.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-1 h-32">
                <div className="flex-1 bg-[#F25C05]/20 hover:bg-[#F25C05]/30 rounded-t-lg transition-all relative group" style={{ height: `${(d.reach / maxReach) * 100}%` }}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0F1D26] border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{d.reach}</div>
                </div>
                <div className="flex-1 bg-[#1A7A6E]/20 hover:bg-[#1A7A6E]/30 rounded-t-lg transition-all" style={{ height: `${(d.engagement / 112) * 100}%` }} />
              </div>
              <span className="text-white/30 text-[10px]">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Channel Performance */}
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-display font-semibold mb-5">Channel Performance</h2>
          <div className="space-y-4">
            {channelPerformance.map((ch) => (
              <div key={ch.channel} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: `${ch.color}20` }}>
                  {ch.channel === 'Instagram' ? '📸' : ch.channel === 'WhatsApp' ? '💬' : ch.channel === 'TikTok' ? '🎵' : '🔍'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{ch.channel}</span>
                    <span className="text-white/40 text-xs">{ch.engagement} eng.</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(ch.reach / 3200) * 100}%`, backgroundColor: ch.color }} />
                  </div>
                  <div className="text-white/25 text-[10px] mt-1">{ch.reach.toLocaleString()} reach · {ch.topContent}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Content */}
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-display font-semibold mb-5">Top Performing Content</h2>
          <div className="space-y-3">
            {topContent.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-[#162330] rounded-xl">
                <div className="w-6 h-6 rounded-lg bg-[#F25C05]/10 flex items-center justify-center text-[#F25C05] font-bold text-xs flex-shrink-0 mt-0.5">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/80 text-xs leading-snug mb-1 line-clamp-2">{c.title}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-[10px]">{c.platform}</span>
                    <span className="text-white/20 text-[10px]">·</span>
                    <span className="text-white/30 text-[10px]">{c.reach.toLocaleString()} reach</span>
                    <span className="text-white/20 text-[10px]">·</span>
                    <span className="text-[#1A7A6E] text-[10px] font-semibold">{c.engagement}</span>
                  </div>
                </div>
              </div>
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
        </div>
        <div className="space-y-3">
          {[
            { insight: 'Your educational carousel posts are outperforming all other content types by 3x. Double down on this format — aim for 3 carousels per week.', type: 'opportunity' },
            { insight: 'Thursday 7pm is your highest-engagement time slot. Schedule your most important content here every week.', type: 'opportunity' },
            { insight: 'Your WhatsApp engagement rate (72%) is exceptional. Consider increasing broadcast frequency from weekly to twice-weekly.', type: 'opportunity' },
            { insight: 'TikTok is growing fastest (+340 followers in 30 days). Increase posting frequency from 3x to 5x per week to accelerate growth.', type: 'action' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <ArrowUpRight className="w-4 h-4 text-[#F25C05] mt-0.5 flex-shrink-0" />
              <p className="text-white/70 text-sm leading-relaxed">{item.insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}