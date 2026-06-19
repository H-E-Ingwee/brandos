'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Download, CheckCircle, ChevronDown, ChevronUp, Lock, Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

export default function MarketingPage() {
  const [plan, setPlan] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [expandedMonth, setExpandedMonth] = useState<string | null>('Month 1')
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null)
  const [budget, setBudget] = useState(25000)
  const [discoveryComplete, setDiscoveryComplete] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, planRes, discoveryRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('marketing_plan').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('brand_discovery').select('completed, business_name').eq('user_id', user.id).maybeSingle(),
      ])

      setProfile(profileRes.data)
      setDiscoveryComplete(discoveryRes.data?.completed || false)

      if (planRes.data?.plan_data) {
        setPlan(planRes.data)
        // Auto-expand first channel
        const channels = (planRes.data.plan_data as any)?.channels
        if (channels?.length > 0) setExpandedChannel(channels[0].id)
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  const generatePlan = async () => {
    setGenerating(true)
    setError('')
    try {
      const response = await fetch('/api/generate/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Failed to generate marketing plan')
        return
      }
      setPlan(data.plan)
      const channels = data.plan?.plan_data?.channels
      if (channels?.length > 0) setExpandedChannel(channels[0].id)
      setExpandedMonth('Month 1')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const isPro = profile?.plan === 'pro' || profile?.plan === 'agency'
  const planData = plan?.plan_data as any
  const channels = planData?.channels || []
  const months = planData?.months || []
  const budgetAllocation = planData?.budget_allocation || []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" />
      </div>
    )
  }

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
            <p className="text-white/40 text-sm">
              {plan?.generated_at
                ? `Generated ${new Date(plan.generated_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : 'AI-generated for the Kenyan market'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {plan && (
            <button onClick={generatePlan} disabled={generating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A2E3D] border border-white/8 text-white/50 hover:text-white text-xs font-medium transition-all disabled:opacity-40">
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Regenerate
            </button>
          )}
          <button className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isPro ? 'bg-[#F25C05]/10 border border-[#F25C05]/20 text-[#F25C05] hover:bg-[#F25C05]/20' : 'bg-[#1A2E3D] border border-white/8 text-white/30 cursor-not-allowed'}`}>
            {isPro ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            Export PDF
          </button>
        </div>
      </div>

      {/* Generate CTA — no plan yet */}
      {!plan && (
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-8 text-center mb-6">
          {!discoveryComplete ? (
            <>
              <div className="w-16 h-16 rounded-full bg-[#F25C05]/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-[#F25C05]" />
              </div>
              <h2 className="text-xl font-display font-bold text-white mb-2">Complete Brand Discovery First</h2>
              <p className="text-white/50 mb-6">Your marketing plan is generated from your discovery answers. Complete the discovery questionnaire first.</p>
              <a href="/dashboard/discovery" className="inline-flex items-center gap-2 bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold px-6 py-3 rounded-xl transition-all">
                Go to Brand Discovery
              </a>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-[#F25C05]/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-[#F25C05]" />
              </div>
              <h2 className="text-xl font-display font-bold text-white mb-2">Generate Your 90-Day Marketing Plan</h2>
              <p className="text-white/50 mb-6">Your AI coach will create a complete marketing plan tailored to your business, sector, and the Kenyan market.</p>

              {/* Budget input */}
              <div className="max-w-xs mx-auto mb-6">
                <label className="block text-sm font-medium text-white/60 mb-2">Monthly Marketing Budget (KES)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  min={5000}
                  step={5000}
                  className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white text-center text-lg font-bold focus:outline-none focus:border-[#F25C05]/60 transition-all"
                />
                <p className="text-white/30 text-xs mt-1">Minimum KES 5,000 recommended</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4 flex items-center gap-2 max-w-sm mx-auto">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <button onClick={generatePlan} disabled={generating}
                className="inline-flex items-center gap-2 bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-60 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-[#F25C05]/20">
                {generating
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating your plan...</>
                  : <><Sparkles className="w-5 h-5" /> Generate Marketing Plan</>
                }
              </button>
            </>
          )}
        </div>
      )}

      {/* Plan content */}
      {plan && planData && (
        <>
          {/* Channel Strategy */}
          {channels.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-display font-semibold text-white mb-1">Channel Strategy</h2>
              <p className="text-white/40 text-sm mb-5">AI-prioritised channels for your business and target audience</p>
              <div className="space-y-3">
                {channels.map((ch: any, idx: number) => {
                  const icons: Record<string, string> = { instagram: '📸', whatsapp: '💬', tiktok: '🎵', facebook: '👥', linkedin: '💼', google: '🔍', twitter: '🐦', youtube: '▶️' }
                  const icon = icons[ch.id?.toLowerCase()] || icons[ch.name?.toLowerCase().split(' ')[0]] || '📱'
                  return (
                    <div key={idx} className="bg-[#1A2E3D] border border-white/8 rounded-2xl overflow-hidden">
                      <button onClick={() => setExpandedChannel(expandedChannel === (ch.id || idx.toString()) ? null : (ch.id || idx.toString()))}
                        className="w-full flex items-center gap-4 p-5 text-left">
                        <div className="w-10 h-10 rounded-xl bg-[#162330] flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-white font-semibold text-sm">{ch.name}</span>
                            {ch.priority && <span className="bg-[#F25C05]/10 text-[#F25C05] text-[10px] font-bold px-2 py-0.5 rounded-full">Priority #{ch.priority}</span>}
                            {ch.impact && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ch.impact === 'Very High' ? 'bg-[#1A7A6E]/20 text-[#1A7A6E]' : 'bg-[#D9910B]/20 text-[#D9910B]'}`}>{ch.impact} Impact</span>}
                          </div>
                          <div className="text-white/40 text-xs line-clamp-1">{ch.why}</div>
                        </div>
                        {expandedChannel === (ch.id || idx.toString()) ? <ChevronUp className="w-4 h-4 text-white/30 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />}
                      </button>
                      {expandedChannel === (ch.id || idx.toString()) && (
                        <div className="px-5 pb-5">
                          <p className="text-white/60 text-sm mb-4 leading-relaxed">{ch.why}</p>
                          {ch.tactics?.length > 0 && (
                            <>
                              <div className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">Key Tactics</div>
                              <div className="space-y-2">
                                {ch.tactics.map((t: string, i: number) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <CheckCircle className="w-3.5 h-3.5 text-[#1A7A6E] mt-0.5 flex-shrink-0" />
                                    <span className="text-white/70 text-sm">{t}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* 90-Day Plan */}
          {months.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-display font-semibold text-white mb-1">90-Day Action Plan</h2>
              <p className="text-white/40 text-sm mb-5">Week-by-week tasks to build your brand and generate revenue</p>
              <div className="space-y-4">
                {months.map((m: any, idx: number) => (
                  <div key={idx} className="bg-[#1A2E3D] border border-white/8 rounded-2xl overflow-hidden">
                    <button onClick={() => setExpandedMonth(expandedMonth === m.month ? null : m.month)}
                      className="w-full flex items-center justify-between p-6 text-left">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-white font-display font-semibold">{m.month}</span>
                          {m.theme && <span className="bg-[#F25C05]/10 text-[#F25C05] text-xs font-semibold px-2 py-0.5 rounded-full">{m.theme}</span>}
                        </div>
                        <div className="text-white/40 text-sm">{m.focus}</div>
                      </div>
                      {expandedMonth === m.month ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                    </button>
                    {expandedMonth === m.month && (
                      <div className="px-6 pb-6">
                        <div className="space-y-4 mb-6">
                          {m.weeks?.map((w: any, wi: number) => (
                            <div key={wi} className="bg-[#162330] rounded-xl p-4">
                              <div className="text-[#F25C05] text-xs font-bold uppercase tracking-wider mb-3">{w.week}</div>
                              <div className="space-y-2">
                                {w.tasks?.map((t: string, ti: number) => (
                                  <div key={ti} className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded border border-white/10 flex-shrink-0 mt-0.5" />
                                    <span className="text-white/70 text-sm">{t}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        {m.kpis?.length > 0 && (
                          <div className="bg-[#1A7A6E]/10 border border-[#1A7A6E]/20 rounded-xl p-4">
                            <div className="text-[#1A7A6E] text-xs font-bold uppercase tracking-wider mb-3">Month-End KPIs</div>
                            <div className="grid grid-cols-2 gap-2">
                              {m.kpis.map((kpi: string, ki: number) => (
                                <div key={ki} className="flex items-center gap-2">
                                  <CheckCircle className="w-3.5 h-3.5 text-[#1A7A6E] flex-shrink-0" />
                                  <span className="text-white/70 text-xs">{kpi}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Budget */}
          {budgetAllocation.length > 0 && (
            <section>
              <h2 className="text-lg font-display font-semibold text-white mb-1">Monthly Marketing Budget</h2>
              <p className="text-white/40 text-sm mb-5">Recommended allocation for KES {(plan.monthly_budget || budget).toLocaleString()}/month</p>
              <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
                <div className="space-y-4">
                  {budgetAllocation.map((b: any, i: number) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-white text-sm font-medium">{b.category}</span>
                        <span className="text-[#F25C05] font-bold text-sm">KES {(b.amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-gradient-to-r from-[#F25C05] to-[#D9910B] rounded-full" style={{ width: `${b.percent || 0}%` }} />
                      </div>
                      <div className="text-white/30 text-xs">{b.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-white/50 text-sm">Total Monthly Budget</span>
                  <span className="text-white font-display font-bold text-lg">KES {(plan.monthly_budget || budget).toLocaleString()}</span>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}