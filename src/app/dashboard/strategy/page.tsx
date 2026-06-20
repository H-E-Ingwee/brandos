'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Send, Copy, Download, RefreshCw, CheckCircle, ChevronDown, ChevronUp, Zap, User, Bot, AlertCircle, Loader2, FileText, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { BrandStrategy, BrandDiscovery } from '@/lib/supabase/types'

type Message = { role: 'user' | 'assistant'; content: string }

const suggestedQuestions = [
  'How should I price my services?',
  'Which social media platform first?',
  'WhatsApp marketing tips for Kenya',
  'How to get my first clients?',
  'How to stand out from competitors?',
]

function formatAIMessage(content: string) {
  const lines = content.split('\n')
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-1.5" />
    if (line.startsWith('**') && line.endsWith('**')) return <div key={i} className="font-semibold text-white mt-2 mb-1">{line.slice(2, -2)}</div>
    if (line.match(/^\*\*(.+)\*\*/)) {
      const parts = line.split(/\*\*(.+?)\*\*/g)
      return <div key={i} className="leading-relaxed">{parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{p}</strong> : p)}</div>
    }
    if (line.startsWith('• ') || line.startsWith('- ')) return <div key={i} className="flex items-start gap-2 mt-1"><span className="text-[#F25C05] flex-shrink-0 mt-0.5">•</span><span>{line.slice(2)}</span></div>
    if (line.match(/^\d+\./)) {
      const num = line.split('.')[0]
      const rest = line.slice(line.indexOf('.') + 1).trim()
      return <div key={i} className="flex items-start gap-2 mt-1"><span className="text-[#F25C05] font-bold flex-shrink-0 w-4">{num}.</span><span>{rest}</span></div>
    }
    return <div key={i} className="leading-relaxed">{line}</div>
  })
}

export default function StrategyPage() {
  const [strategy, setStrategy] = useState<BrandStrategy | null>(null)
  const [discovery, setDiscovery] = useState<BrandDiscovery | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>('positioning')
  const [copied, setCopied] = useState<string | null>(null)
  const [queriesLeft, setQueriesLeft] = useState<number | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [d, s, p] = await Promise.all([
        supabase.from('brand_discovery').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('brand_strategy').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('profiles').select('ai_queries_used, plan').eq('id', user.id).maybeSingle(),
      ])

      setDiscovery(d.data)
      setStrategy(s.data)

      if (p.data) {
        const limit = p.data.plan === 'free' ? 10 : p.data.plan === 'growth' ? 50 : 999
        setQueriesLeft(limit - p.data.ai_queries_used)
      }

      // Load chat history
      const { data: chatHistory } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('user_id', user.id)
        .eq('module', 'strategy')
        .order('created_at', { ascending: true })
        .limit(20)

      if (chatHistory && chatHistory.length > 0) {
        setMessages(chatHistory as Message[])
      } else if (s.data?.positioning_statement) {
        setMessages([{ role: 'assistant', content: `Habari! Your brand strategy is ready above. I'm your AI brand coach — ask me anything about your positioning, messaging, or how to stand out in the market. What would you like to refine?` }])
      } else if (d.data?.completed) {
        setMessages([{ role: 'assistant', content: `Habari! Your Brand Discovery is complete. Click "Generate Brand Strategy" to create your AI-powered brand strategy. I'll then help you refine it!` }])
      } else {
        setMessages([{ role: 'assistant', content: `Habari! Complete your Brand Discovery first, then I'll generate your complete brand strategy. Go to Brand Discovery to get started!` }])
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateStrategy = async () => {
    setGenerating(true)
    setGenerateError('')
    try {
      const response = await fetch('/api/generate/strategy', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) { setGenerateError(data.error || 'Failed to generate strategy'); return }
      setStrategy(data.strategy)
      setExpandedSection('positioning')
      setMessages(prev => [...prev, { role: 'assistant', content: `Your brand strategy has been generated! I've created your positioning statement, customer personas, messaging framework, and competitive advantage. What would you like to explore or refine first?` }])
    } catch { setGenerateError('Network error. Please try again.') }
    finally { setGenerating(false) }
  }

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || chatLoading) return
    setInput('')
    setChatError('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setChatLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, module: 'strategy', history: messages.slice(-8) }),
      })
      const data = await response.json()
      if (!response.ok) { setChatError(data.message || data.error || 'Failed to get response'); if (data.queries_limit) setQueriesLeft(0); return }
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      if (data.queries_limit !== -1) setQueriesLeft(data.queries_limit - data.queries_used)
    } catch { setChatError('Network error. Please try again.') }
    finally { setChatLoading(false) }
  }

  const handleExportPDF = () => {
    setExportingPdf(true)
    window.open('/api/export/strategy', '_blank')
    setTimeout(() => setExportingPdf(false), 2000)
  }

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggle = (id: string) => setExpandedSection(expandedSection === id ? null : id)

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" /></div>

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Strategy content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 border-r border-white/5 min-w-0">
        <div className="max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D9910B]/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#D9910B]" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-white">Brand Strategy</h1>
                <p className="text-white/40 text-sm">
                  {strategy?.generated_at ? `Generated ${new Date(strategy.generated_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'AI-powered · Ready to generate'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {strategy && (
                <>
                  <button onClick={generateStrategy} disabled={generating}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A2E3D] border border-white/8 text-white/50 hover:text-white text-xs font-medium transition-all disabled:opacity-40">
                    {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Regenerate
                  </button>
                  <button onClick={handleExportPDF} disabled={exportingPdf}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F25C05]/10 border border-[#F25C05]/20 text-[#F25C05] text-xs font-medium hover:bg-[#F25C05]/20 transition-all disabled:opacity-40">
                    {exportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                    Export PDF
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Generate CTA */}
          {!strategy && (
            <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-8 text-center mb-6">
              {!discovery?.completed ? (
                <>
                  <AlertCircle className="w-10 h-10 text-[#F25C05] mx-auto mb-4" />
                  <h2 className="text-xl font-display font-bold text-white mb-2">Complete Brand Discovery First</h2>
                  <p className="text-white/50 mb-5">Your brand strategy is generated from your discovery answers.</p>
                  <a href="/dashboard/discovery" className="inline-flex items-center gap-2 bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold px-6 py-3 rounded-xl transition-all">Go to Brand Discovery</a>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-[#D9910B]/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-[#D9910B]" />
                  </div>
                  <h2 className="text-xl font-display font-bold text-white mb-2">Ready to Generate Your Brand Strategy</h2>
                  <p className="text-white/50 mb-5">Your AI brand coach will analyse your discovery answers and create a complete brand strategy.</p>
                  {generateError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4 flex items-center gap-2 max-w-sm mx-auto"><AlertCircle className="w-4 h-4 flex-shrink-0" />{generateError}</div>}
                  <button onClick={generateStrategy} disabled={generating}
                    className="inline-flex items-center gap-2 bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-60 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-[#F25C05]/20">
                    {generating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5" /> Generate Brand Strategy</>}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Strategy sections */}
          {strategy && (
            <div className="space-y-3">
              {/* Brand score */}
              {strategy.brand_score > 0 && (
                <div className="bg-[#D9910B]/10 border border-[#D9910B]/20 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
                  <Zap className="w-4 h-4 text-[#D9910B]" />
                  <span className="text-[#D9910B] text-sm">Brand Score: <strong>{strategy.brand_score}/100</strong> — {strategy.brand_score >= 70 ? 'Strong foundation' : 'Good start, keep building'}</span>
                </div>
              )}

              {/* Positioning */}
              {strategy.positioning_statement && (
                <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl overflow-hidden">
                  <button onClick={() => toggle('positioning')} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/2 transition-colors">
                    <div className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-[#1A7A6E]" /><span className="text-white font-semibold text-sm">Positioning Statement</span></div>
                    {expandedSection === 'positioning' ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                  </button>
                  {expandedSection === 'positioning' && (
                    <div className="px-5 pb-5">
                      <div className="bg-[#162330] rounded-xl p-5 relative group">
                        <p className="text-white/80 text-sm leading-relaxed italic">"{strategy.positioning_statement}"</p>
                        <button onClick={() => copyText(strategy.positioning_statement!, 'positioning')} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white">
                          {copied === 'positioning' ? <CheckCircle className="w-3.5 h-3.5 text-[#1A7A6E]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {strategy.tagline && (
                        <div className="mt-3 bg-[#162330] rounded-xl p-4">
                          <div className="text-white/30 text-xs mb-1 uppercase tracking-wider">Tagline</div>
                          <div className="text-white font-display font-bold text-lg">{strategy.tagline}</div>
                        </div>
                      )}
                      {strategy.elevator_pitch && (
                        <div className="mt-3 bg-[#162330] rounded-xl p-4">
                          <div className="text-white/30 text-xs mb-1 uppercase tracking-wider">Elevator Pitch</div>
                          <p className="text-white/70 text-sm leading-relaxed">{strategy.elevator_pitch}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Messaging */}
              {(strategy.tone_of_voice?.length || strategy.key_messages?.length) && (
                <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl overflow-hidden">
                  <button onClick={() => toggle('messaging')} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/2 transition-colors">
                    <div className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-[#1A7A6E]" /><span className="text-white font-semibold text-sm">Messaging Framework</span></div>
                    {expandedSection === 'messaging' ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                  </button>
                  {expandedSection === 'messaging' && (
                    <div className="px-5 pb-5 space-y-3">
                      {strategy.tone_of_voice && strategy.tone_of_voice.length > 0 && (
                        <div className="bg-[#162330] rounded-xl p-4">
                          <div className="text-white/30 text-xs mb-3 uppercase tracking-wider">Tone of Voice</div>
                          <div className="flex flex-wrap gap-2">{strategy.tone_of_voice.map(t => <span key={t} className="bg-[#1A7A6E]/10 text-[#1A7A6E] text-xs px-3 py-1 rounded-full border border-[#1A7A6E]/20">{t}</span>)}</div>
                        </div>
                      )}
                      {strategy.key_messages && strategy.key_messages.length > 0 && (
                        <div className="bg-[#162330] rounded-xl p-4">
                          <div className="text-white/30 text-xs mb-3 uppercase tracking-wider">Key Messages</div>
                          <div className="space-y-2">{strategy.key_messages.map((m, i) => (
                            <div key={i} className="flex items-start gap-2"><span className="text-[#F25C05] font-bold text-xs mt-0.5 flex-shrink-0">{i + 1}.</span><span className="text-white/70 text-sm">{m}</span></div>
                          ))}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Personas */}
              {strategy.personas && Array.isArray(strategy.personas) && strategy.personas.length > 0 && (
                <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl overflow-hidden">
                  <button onClick={() => toggle('personas')} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/2 transition-colors">
                    <div className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-[#1A7A6E]" /><span className="text-white font-semibold text-sm">Customer Personas ({strategy.personas.length})</span></div>
                    {expandedSection === 'personas' ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                  </button>
                  {expandedSection === 'personas' && (
                    <div className="px-5 pb-5 space-y-3">
                      {(strategy.personas as any[]).map((p: any, i: number) => (
                        <div key={i} className="bg-[#162330] rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full bg-[#F25C05]/20 flex items-center justify-center text-[#F25C05] font-bold text-sm">{p.name?.[0] || 'P'}</div>
                            <div><div className="text-white font-semibold text-sm">{p.name}</div><div className="text-white/40 text-xs">{p.age} · {p.location}</div></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                            {p.income && <div><span className="text-white/30">Income: </span><span className="text-white/60">{p.income}</span></div>}
                            {p.channel && <div><span className="text-white/30">Channels: </span><span className="text-white/60">{p.channel}</span></div>}
                            {p.pain && <div className="col-span-2"><span className="text-white/30">Pain: </span><span className="text-white/60">{p.pain}</span></div>}
                          </div>
                          {p.traits && <div className="flex flex-wrap gap-1.5">{p.traits.map((t: string) => <span key={t} className="bg-[#F25C05]/10 text-[#F25C05] text-[10px] px-2 py-0.5 rounded-full">{t}</span>)}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Competitive Advantage */}
              {strategy.competitive_advantage && (
                <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl overflow-hidden">
                  <button onClick={() => toggle('diff')} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/2 transition-colors">
                    <div className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-[#1A7A6E]" /><span className="text-white font-semibold text-sm">Competitive Advantage</span></div>
                    {expandedSection === 'diff' ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                  </button>
                  {expandedSection === 'diff' && (
                    <div className="px-5 pb-5 space-y-3">
                      <div className="bg-[#162330] rounded-xl p-4"><p className="text-white/70 text-sm leading-relaxed">{strategy.competitive_advantage}</p></div>
                      {strategy.differentiation_points && Array.isArray(strategy.differentiation_points) && (strategy.differentiation_points as any[]).map((p: any, i: number) => (
                        <div key={i} className="bg-[#162330] rounded-xl p-4 flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#F25C05] mt-2 flex-shrink-0" />
                          <div><div className="text-white font-semibold text-sm mb-1">{p.label}</div><div className="text-white/50 text-xs leading-relaxed">{p.desc}</div></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Coach — compact sidebar */}
      <div className="w-full lg:w-80 flex flex-col bg-[#0A1520] border-t lg:border-t-0 border-white/5" style={{ maxHeight: '100vh' }}>
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F25C05]/15 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#F25C05]" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">AI Brand Coach</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1A7A6E] animate-pulse" />
                <span className="text-white/30 text-xs">Online · Kenyan market expert</span>
              </div>
            </div>
          </div>
          {queriesLeft !== null && (
            <div className="text-white/25 text-xs">{queriesLeft === 999 ? '∞' : queriesLeft} left</div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '200px', maxHeight: '400px' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${msg.role === 'assistant' ? 'bg-[#F25C05]/20' : 'bg-[#1A2E3D]'}`}>
                {msg.role === 'assistant' ? <Bot className="w-3 h-3 text-[#F25C05]" /> : <User className="w-3 h-3 text-white/50" />}
              </div>
              <div className={`max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed ${msg.role === 'assistant' ? 'bg-[#1A2E3D] text-white/75 rounded-tl-sm' : 'bg-[#F25C05]/10 border border-[#F25C05]/20 text-white/90 rounded-tr-sm'}`}>
                {msg.role === 'assistant' ? formatAIMessage(msg.content) : msg.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-[#F25C05]/20 flex items-center justify-center flex-shrink-0"><Bot className="w-3 h-3 text-[#F25C05]" /></div>
              <div className="bg-[#1A2E3D] rounded-xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1">
                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
              </div>
            </div>
          )}
          {chatError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{chatError}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested questions */}
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {suggestedQuestions.slice(0, 3).map(q => (
              <button key={q} onClick={() => sendMessage(q)}
                className="flex-shrink-0 bg-[#1A2E3D] border border-white/8 rounded-full px-2.5 py-1 text-white/40 text-[10px] hover:text-white hover:border-white/20 transition-all">
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 flex-shrink-0">
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask your brand coach..."
              className="flex-1 bg-[#1A2E3D] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#F25C05]/50 transition-all" />
            <button onClick={() => sendMessage()} disabled={!input.trim() || chatLoading}
              className="w-9 h-9 bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-40 rounded-xl flex items-center justify-center transition-all flex-shrink-0">
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}