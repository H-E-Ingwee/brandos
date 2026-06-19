'use client'

import { useState } from 'react'
import { TrendingUp, Download, CheckCircle, ChevronDown, ChevronUp, Instagram, MessageSquare, Linkedin, Youtube, Lock } from 'lucide-react'

const channels = [
  { id: 'instagram', name: 'Instagram', icon: '📸', priority: 1, effort: 'Medium', impact: 'High', why: 'Your target audience (Nairobi women 25–40) spends 45+ min/day on Instagram. Highest organic reach for beauty brands in Kenya.', tactics: ['Post 4–5x/week (Reels + carousels)', 'Use #KenyaSkincare #NaturalBeautyKenya', 'Partner with 3–5 Nairobi micro-influencers (5K–50K followers)', 'Instagram Shopping for direct product sales'] },
  { id: 'whatsapp', name: 'WhatsApp Business', icon: '💬', priority: 2, effort: 'Low', impact: 'Very High', why: '95%+ penetration in Kenya. Highest conversion rate of any channel. Your customers already use it to communicate and buy.', tactics: ['Set up product catalogue with prices', 'Create 3 broadcast lists: Leads, Customers, VIPs', 'Send weekly skincare tips (not promotions)', 'Respond to all messages within 1 hour'] },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', priority: 3, effort: 'Medium', impact: 'High', why: 'Fastest growing platform in Kenya. Organic reach is 10x Instagram for new accounts. Gen Z and young millennials — your next customer generation.', tactics: ['Post 3–4x/week (15–60 second videos)', 'Skincare routines, ingredient spotlights, before/after', 'Use trending Kenyan sounds and hashtags', 'Duet with popular Kenyan beauty creators'] },
  { id: 'google', name: 'Google Business Profile', icon: '🔍', priority: 4, effort: 'Low', impact: 'High', why: 'Free. Customers searching "natural skincare Nairobi" will find you. Reviews build trust. Essential for local discovery.', tactics: ['Complete your profile 100%', 'Add all products with photos and prices', 'Ask every customer for a Google review', 'Post weekly updates and offers'] },
]

const months = [
  {
    month: 'Month 1',
    theme: 'Foundation & Awareness',
    focus: 'Set up all channels. Build your first 500 followers. Establish brand voice.',
    weeks: [
      { week: 'Week 1', tasks: ['Set up Instagram, WhatsApp Business, TikTok, Google Business Profile', 'Create 30 days of content in advance', 'Define your content pillars and posting schedule'] },
      { week: 'Week 2', tasks: ['Launch Instagram with 9 posts (3x3 grid)', 'Send first WhatsApp broadcast to existing contacts', 'Post first 3 TikTok videos'] },
      { week: 'Week 3', tasks: ['Run first Instagram giveaway (partner with 1 micro-influencer)', 'Start Google review collection campaign', 'Post 5x on Instagram, 3x on TikTok'] },
      { week: 'Week 4', tasks: ['Analyse Week 1–3 performance', 'Double down on best-performing content type', 'Reach out to 5 micro-influencers for partnerships'] },
    ],
    kpis: ['500 Instagram followers', '100 WhatsApp contacts', '1,000 TikTok views', '5 Google reviews'],
  },
  {
    month: 'Month 2',
    theme: 'Engagement & Community',
    focus: 'Build genuine community. Start generating leads. First influencer partnerships.',
    weeks: [
      { week: 'Week 5–6', tasks: ['Launch first influencer collaboration (gifting + content)', 'Start weekly Instagram Lives (skincare Q&A)', 'WhatsApp: send educational content 2x/week'] },
      { week: 'Week 7–8', tasks: ['Run first paid Instagram campaign (KES 5,000 budget)', 'Launch referral programme: "Refer a friend, get 10% off"', 'Collect and post 10 customer testimonials'] },
    ],
    kpis: ['1,500 Instagram followers', '300 WhatsApp contacts', '50 website visitors/day', '20 leads generated'],
  },
  {
    month: 'Month 3',
    theme: 'Conversion & Revenue',
    focus: 'Turn followers into buyers. Optimise what\'s working. Scale paid advertising.',
    weeks: [
      { week: 'Week 9–10', tasks: ['Launch Instagram Shopping (tag products in all posts)', 'Run WhatsApp flash sale to broadcast list', 'Scale best-performing paid ad (increase budget 2x)'] },
      { week: 'Week 11–12', tasks: ['Review 90-day results against KPIs', 'Identify top 3 performing content types', 'Plan Month 4–6 strategy based on data'] },
    ],
    kpis: ['3,000 Instagram followers', '500 WhatsApp contacts', 'KES 50,000 in online revenue', '30% repeat purchase rate'],
  },
]

const budget = [
  { category: 'Content Creation', amount: 'KES 8,000', percent: 32, desc: 'Photography, video editing, graphic design' },
  { category: 'Paid Advertising', amount: 'KES 10,000', percent: 40, desc: 'Instagram/Facebook ads, boosted posts' },
  { category: 'Influencer Partnerships', amount: 'KES 5,000', percent: 20, desc: 'Gifting + micro-influencer fees' },
  { category: 'Tools & Software', amount: 'KES 2,000', percent: 8, desc: 'Scheduling tools, analytics' },
]

export default function MarketingPage() {
  const [expandedMonth, setExpandedMonth] = useState<string | null>('Month 1')
  const [expandedChannel, setExpandedChannel] = useState<string | null>('instagram')
  const [isPro] = useState(false)

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F25C05]/15 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#F25C05]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">90-Day Marketing Plan</h1>
            <p className="text-white/40 text-sm">AI-generated for Savanna Skincare · Kenyan market</p>
          </div>
        </div>
        <button className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isPro ? 'bg-[#F25C05]/10 border border-[#F25C05]/20 text-[#F25C05] hover:bg-[#F25C05]/20' : 'bg-[#1A2E3D] border border-white/8 text-white/30 cursor-not-allowed'}`}>
          {isPro ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          Export PDF
        </button>
      </div>

      {/* Channel Strategy */}
      <section className="mb-10">
        <h2 className="text-lg font-display font-semibold text-white mb-1">Channel Strategy</h2>
        <p className="text-white/40 text-sm mb-5">AI-prioritised channels for your business and target audience</p>
        <div className="space-y-3">
          {channels.map((ch) => (
            <div key={ch.id} className="bg-[#1A2E3D] border border-white/8 rounded-2xl overflow-hidden">
              <button onClick={() => setExpandedChannel(expandedChannel === ch.id ? null : ch.id)} className="w-full flex items-center gap-4 p-5 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#162330] flex items-center justify-center text-xl flex-shrink-0">{ch.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-semibold text-sm">{ch.name}</span>
                    <span className="bg-[#F25C05]/10 text-[#F25C05] text-[10px] font-bold px-2 py-0.5 rounded-full">Priority #{ch.priority}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ch.impact === 'Very High' ? 'bg-[#1A7A6E]/20 text-[#1A7A6E]' : 'bg-[#D9910B]/20 text-[#D9910B]'}`}>{ch.impact} Impact</span>
                  </div>
                  <div className="text-white/40 text-xs">{ch.why.substring(0, 80)}...</div>
                </div>
                {expandedChannel === ch.id ? <ChevronUp className="w-4 h-4 text-white/30 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />}
              </button>
              {expandedChannel === ch.id && (
                <div className="px-5 pb-5">
                  <p className="text-white/60 text-sm mb-4 leading-relaxed">{ch.why}</p>
                  <div className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">Key Tactics</div>
                  <div className="space-y-2">
                    {ch.tactics.map((t, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[#1A7A6E] mt-0.5 flex-shrink-0" />
                        <span className="text-white/70 text-sm">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 90-Day Plan */}
      <section className="mb-10">
        <h2 className="text-lg font-display font-semibold text-white mb-1">90-Day Action Plan</h2>
        <p className="text-white/40 text-sm mb-5">Week-by-week tasks to build your brand and generate revenue</p>
        <div className="space-y-4">
          {months.map((m) => (
            <div key={m.month} className="bg-[#1A2E3D] border border-white/8 rounded-2xl overflow-hidden">
              <button onClick={() => setExpandedMonth(expandedMonth === m.month ? null : m.month)} className="w-full flex items-center justify-between p-6 text-left">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-display font-semibold">{m.month}</span>
                    <span className="bg-[#F25C05]/10 text-[#F25C05] text-xs font-semibold px-2 py-0.5 rounded-full">{m.theme}</span>
                  </div>
                  <div className="text-white/40 text-sm">{m.focus}</div>
                </div>
                {expandedMonth === m.month ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
              </button>
              {expandedMonth === m.month && (
                <div className="px-6 pb-6">
                  <div className="space-y-4 mb-6">
                    {m.weeks.map((w) => (
                      <div key={w.week} className="bg-[#162330] rounded-xl p-4">
                        <div className="text-[#F25C05] text-xs font-bold uppercase tracking-wider mb-3">{w.week}</div>
                        <div className="space-y-2">
                          {w.tasks.map((t, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded border border-white/10 flex-shrink-0 mt-0.5" />
                              <span className="text-white/70 text-sm">{t}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#1A7A6E]/10 border border-[#1A7A6E]/20 rounded-xl p-4">
                    <div className="text-[#1A7A6E] text-xs font-bold uppercase tracking-wider mb-3">Month-End KPIs</div>
                    <div className="grid grid-cols-2 gap-2">
                      {m.kpis.map((kpi, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-[#1A7A6E] flex-shrink-0" />
                          <span className="text-white/70 text-xs">{kpi}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Budget */}
      <section>
        <h2 className="text-lg font-display font-semibold text-white mb-1">Monthly Marketing Budget</h2>
        <p className="text-white/40 text-sm mb-5">Recommended allocation for KES 25,000/month marketing budget</p>
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
          <div className="space-y-4">
            {budget.map((b) => (
              <div key={b.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white text-sm font-medium">{b.category}</span>
                  <span className="text-[#F25C05] font-bold text-sm">{b.amount}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-gradient-to-r from-[#F25C05] to-[#D9910B] rounded-full" style={{ width: `${b.percent}%` }} />
                </div>
                <div className="text-white/30 text-xs">{b.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-white/50 text-sm">Total Monthly Budget</span>
            <span className="text-white font-display font-bold text-lg">KES 25,000</span>
          </div>
        </div>
      </section>
    </div>
  )
}