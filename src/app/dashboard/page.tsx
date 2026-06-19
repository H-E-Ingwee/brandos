'use client'

import Link from 'next/link'
import { Target, Sparkles, Palette, TrendingUp, MessageSquare, BarChart3, ArrowRight, CheckCircle, Clock, Lock, Zap, ChevronRight } from 'lucide-react'

const modules = [
  { href: '/dashboard/discovery', icon: Target, label: 'Brand Discovery', desc: 'Audit your current brand and identify gaps', status: 'complete', color: '#F25C05', progress: 100 },
  { href: '/dashboard/strategy', icon: Sparkles, label: 'Brand Strategy', desc: 'Positioning, personas, and messaging framework', status: 'in-progress', color: '#D9910B', progress: 60 },
  { href: '/dashboard/identity', icon: Palette, label: 'Visual Identity', desc: 'Colours, typography, and brand guidelines', status: 'locked', color: '#1A7A6E', progress: 0 },
  { href: '/dashboard/marketing', icon: TrendingUp, label: 'Marketing Plan', desc: '90-day digital marketing strategy', status: 'locked', color: '#F25C05', progress: 0 },
  { href: '/dashboard/content', icon: MessageSquare, label: 'Content Engine', desc: 'Social media content and calendar', status: 'locked', color: '#D9910B', progress: 0 },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics', desc: 'Track your brand and marketing performance', status: 'locked', color: '#1A7A6E', progress: 0 },
]

const recentActivity = [
  { text: 'Brand Discovery completed', time: '2 hours ago', icon: CheckCircle, color: '#1A7A6E' },
  { text: 'Brand Strategy — 60% complete', time: '1 hour ago', icon: Sparkles, color: '#D9910B' },
  { text: 'AI Coach answered 3 questions', time: '45 min ago', icon: Zap, color: '#F25C05' },
]

const quickStats = [
  { label: 'Brand Score', value: '72/100', change: '+12 this week', positive: true },
  { label: 'Modules Complete', value: '1/6', change: '5 remaining', positive: null },
  { label: 'AI Queries Used', value: '7/10', change: '3 remaining (Free)', positive: null },
  { label: 'Documents Generated', value: '2', change: 'Brand Audit + Strategy', positive: true },
]

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Good morning, Jane 👋</h1>
        <p className="text-white/50">Your brand is 17% complete. Let's keep building.</p>
      </div>

      {/* Overall progress */}
      <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-white font-display font-semibold text-lg">Brand Building Progress</div>
            <div className="text-white/40 text-sm mt-0.5">Complete all 6 modules to unlock your full brand system</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-display font-bold text-[#F25C05]">17%</div>
            <div className="text-white/40 text-xs">Complete</div>
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#F25C05] to-[#D9910B] rounded-full transition-all duration-700" style={{ width: '17%' }} />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-white/30">
          <span>1 of 6 modules complete</span>
          <span>Estimated time remaining: ~3 hours</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat) => (
          <div key={stat.label} className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-5">
            <div className="text-white/40 text-xs mb-2">{stat.label}</div>
            <div className="text-2xl font-display font-bold text-white mb-1">{stat.value}</div>
            <div className={`text-xs ${stat.positive === true ? 'text-[#1A7A6E]' : stat.positive === false ? 'text-red-400' : 'text-white/30'}`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Modules */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-display font-semibold text-white">Your Brand Modules</h2>
            <span className="text-white/30 text-sm">1 of 6 complete</span>
          </div>
          <div className="space-y-3">
            {modules.map((mod, i) => {
              const isLocked = mod.status === 'locked'
              const isComplete = mod.status === 'complete'
              const isInProgress = mod.status === 'in-progress'
              return (
                <Link
                  key={mod.href}
                  href={isLocked ? '#' : mod.href}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                    isLocked
                      ? 'bg-[#1A2E3D]/50 border-white/5 opacity-60 cursor-not-allowed'
                      : 'bg-[#1A2E3D] border-white/8 hover:border-[#F25C05]/30 hover:bg-[#162330] cursor-pointer'
                  }`}
                  onClick={isLocked ? (e) => e.preventDefault() : undefined}
                >
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
                    {isInProgress && (
                      <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden w-32">
                        <div className="h-full bg-[#D9910B] rounded-full" style={{ width: `${mod.progress}%` }} />
                      </div>
                    )}
                  </div>
                  {!isLocked && <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* AI Coach CTA */}
          <div className="bg-gradient-to-br from-[#F25C05]/10 to-[#D9910B]/5 border border-[#F25C05]/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#F25C05]" />
              <span className="text-[#F25C05] text-sm font-semibold">AI Brand Coach</span>
            </div>
            <p className="text-white/70 text-sm mb-4 leading-relaxed">Ask me anything about your brand, marketing, or business strategy. I'm trained on the Kenyan market.</p>
            <div className="bg-[#0F1D26]/60 rounded-xl p-3 mb-4 text-white/50 text-xs italic">
              "What social media platform should I focus on first for my Nairobi restaurant?"
            </div>
            <Link href="/dashboard/strategy" className="block w-full bg-[#F25C05] hover:bg-[#D94E00] text-white text-center py-2.5 rounded-xl text-sm font-semibold transition-all">
              Ask AI Coach
            </Link>
          </div>

          {/* Recent activity */}
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
            <h3 className="text-white font-display font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${item.color}15` }}>
                    <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <div className="text-white/70 text-sm">{item.text}</div>
                    <div className="text-white/30 text-xs mt-0.5">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade CTA */}
          <div className="bg-[#1A2E3D] border border-[#D9910B]/20 rounded-2xl p-6">
            <div className="text-[#D9910B] text-xs font-bold uppercase tracking-wider mb-2">Free Plan</div>
            <div className="text-white font-semibold mb-1">Unlock all 6 modules</div>
            <div className="text-white/40 text-xs mb-4">Upgrade to Growth for KES 1,500/month and get your complete brand system.</div>
            <Link href="/dashboard/settings" className="block w-full bg-[#D9910B]/10 hover:bg-[#D9910B]/20 border border-[#D9910B]/30 text-[#D9910B] text-center py-2.5 rounded-xl text-sm font-semibold transition-all">
              Upgrade to Growth
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}