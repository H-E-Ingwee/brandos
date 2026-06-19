'use client'

import { useState } from 'react'
import { Sparkles, Send, Copy, Download, RefreshCw, CheckCircle, ChevronDown, ChevronUp, Zap, User, Bot } from 'lucide-react'

const strategyData = {
  positioning: {
    title: 'Brand Positioning Statement',
    content: 'For health-conscious Kenyan women aged 25–40 who struggle to find natural skincare that works for African skin, Savanna Skincare is the premium natural beauty brand that formulates specifically for Kenyan climate and skin types — using locally sourced ingredients that are proven to work, not just marketed to work.',
  },
  personas: [
    {
      name: 'Nairobi Professional Naomi',
      age: '28–35',
      location: 'Westlands, Nairobi',
      income: 'KES 80,000–150,000/month',
      traits: ['Health-conscious', 'Instagram-active', 'Values authenticity', 'Willing to pay premium for quality'],
      pain: 'Tired of imported products that don\'t work for her skin tone and Nairobi\'s climate',
      channel: 'Instagram, WhatsApp, LinkedIn',
    },
    {
      name: 'Conscious Mama Christine',
      age: '32–42',
      location: 'Karen, Nairobi / Mombasa',
      income: 'KES 120,000–250,000/month',
      traits: ['Family-focused', 'Eco-conscious', 'Trusts word-of-mouth', 'Researches before buying'],
      pain: 'Wants safe, natural products for herself and her children without harsh chemicals',
      channel: 'WhatsApp groups, Facebook, Google Search',
    },
  ],
  messaging: {
    tagline: 'Formulated for African Skin. Made in Kenya.',
    elevator: 'Savanna Skincare makes premium natural skincare products formulated specifically for African skin and the Kenyan climate — using locally sourced ingredients that actually work.',
    toneOfVoice: ['Warm and knowledgeable', 'Proudly Kenyan', 'Science-backed but accessible', 'Empowering, not preachy'],
    keyMessages: [
      'The only skincare brand formulated specifically for Kenyan skin and climate',
      'Locally sourced ingredients — supporting Kenyan farmers and communities',
      'Dermatologist-tested for African skin tones',
      'Premium quality at a fair Kenyan price',
    ],
  },
  differentiation: {
    title: 'Your Competitive Advantage',
    points: [
      { label: 'Local formulation', desc: 'Products designed for Kenyan humidity, UV levels, and skin types — not adapted from Western formulas' },
      { label: 'Ingredient transparency', desc: 'Every ingredient sourced and named — customers know exactly what they\'re putting on their skin' },
      { label: 'Community-first', desc: 'Built with and for Kenyan women — not marketed at them from abroad' },
    ],
  },
}

const initialMessages: Message[] = [
  {
    role: 'assistant',
    content: 'Habari! I\'ve analysed your Brand Discovery answers and built your initial brand strategy above. I\'m your AI brand coach — ask me anything about your positioning, messaging, or how to stand out in the Kenyan market. What would you like to refine first?',
  },
]

type Message = { role: 'user' | 'assistant'; content: string }

const aiResponses: Record<string, string> = {
  default: 'Great question! Based on your brand discovery answers, I recommend focusing on your local formulation advantage — this is your strongest differentiator in the Kenyan market. Most competitors are importing or adapting Western formulas. Your authentic Kenyan origin is a powerful trust signal. Would you like me to help you craft specific messaging around this?',
  instagram: 'For Instagram, I recommend a content mix of: 70% educational content (skincare tips for African skin, ingredient spotlights, before/after results), 20% behind-the-scenes (your sourcing process, team, Kenyan ingredients), and 10% promotional. Post 4–5 times per week, with Reels getting 3x more reach than static posts. Your target audience — Nairobi professionals — is most active on Instagram between 7–9am and 7–10pm EAT.',
  whatsapp: 'WhatsApp is your highest-converting channel for Kenyan customers. I recommend: (1) Set up WhatsApp Business with a complete product catalogue. (2) Create 3 broadcast lists: New Leads, Active Customers, VIP Customers. (3) Send value-first messages — skincare tips, not promotions. (4) Use WhatsApp Status daily for behind-the-scenes content. (5) Respond to all messages within 1 hour — this builds the trust that converts.',
  price: 'Your pricing strategy should position you as premium-but-accessible. Research shows Kenyan health-conscious women aged 25–40 will pay KES 800–2,500 for skincare they trust. I recommend: Entry product at KES 650–850 (face wash/toner), Core products at KES 1,200–1,800 (moisturisers, serums), Premium at KES 2,000–3,500 (treatment products). This creates a clear upgrade path and makes your brand feel premium without being out of reach.',
}

export default function StrategyPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('positioning')
  const [copied, setCopied] = useState<string | null>(null)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', content: userMsg }])
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    const lower = userMsg.toLowerCase()
    let response = aiResponses.default
    if (lower.includes('instagram') || lower.includes('social')) response = aiResponses.instagram
    if (lower.includes('whatsapp')) response = aiResponses.whatsapp
    if (lower.includes('price') || lower.includes('pricing') || lower.includes('cost')) response = aiResponses.price
    setMessages(m => [...m, { role: 'assistant', content: response }])
    setLoading(false)
  }

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggle = (id: string) => setExpandedSection(expandedSection === id ? null : id)

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Strategy content — left */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 border-r border-white/5">
        <div className="max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D9910B]/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#D9910B]" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-white">Brand Strategy</h1>
                <p className="text-white/40 text-sm">AI-generated · Savanna Skincare</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A2E3D] border border-white/8 text-white/50 hover:text-white text-xs font-medium transition-all">
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F25C05]/10 border border-[#F25C05]/20 text-[#F25C05] text-xs font-medium transition-all hover:bg-[#F25C05]/20">
                <Download className="w-3.5 h-3.5" /> Export PDF
              </button>
            </div>
          </div>

          {/* Completion badge */}
          <div className="bg-[#D9910B]/10 border border-[#D9910B]/20 rounded-xl px-4 py-3 flex items-center gap-3 mb-8">
            <Zap className="w-4 h-4 text-[#D9910B]" />
            <span className="text-[#D9910B] text-sm">Your brand strategy is 60% complete. Answer the AI coach's questions to refine it further.</span>
          </div>

          {/* Positioning */}
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl mb-4 overflow-hidden">
            <button onClick={() => toggle('positioning')} className="w-full flex items-center justify-between p-6 text-left">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#1A7A6E]" />
                <span className="text-white font-display font-semibold">Positioning Statement</span>
              </div>
              {expandedSection === 'positioning' ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
            </button>
            {expandedSection === 'positioning' && (
              <div className="px-6 pb-6">
                <div className="bg-[#162330] rounded-xl p-5 relative group">
                  <p className="text-white/80 text-sm leading-relaxed italic">"{strategyData.positioning.content}"</p>
                  <button onClick={() => copyText(strategyData.positioning.content, 'positioning')} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white">
                    {copied === 'positioning' ? <CheckCircle className="w-3.5 h-3.5 text-[#1A7A6E]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Personas */}
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl mb-4 overflow-hidden">
            <button onClick={() => toggle('personas')} className="w-full flex items-center justify-between p-6 text-left">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#1A7A6E]" />
                <span className="text-white font-display font-semibold">Customer Personas (2)</span>
              </div>
              {expandedSection === 'personas' ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
            </button>
            {expandedSection === 'personas' && (
              <div className="px-6 pb-6 space-y-4">
                {strategyData.personas.map((p) => (
                  <div key={p.name} className="bg-[#162330] rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#F25C05]/20 flex items-center justify-center text-[#F25C05] font-bold">{p.name[0]}</div>
                      <div>
                        <div className="text-white font-semibold text-sm">{p.name}</div>
                        <div className="text-white/40 text-xs">{p.age} · {p.location}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><span className="text-white/30">Income: </span><span className="text-white/70">{p.income}</span></div>
                      <div><span className="text-white/30">Channels: </span><span className="text-white/70">{p.channel}</span></div>
                      <div className="col-span-2"><span className="text-white/30">Pain point: </span><span className="text-white/70">{p.pain}</span></div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.traits.map(t => <span key={t} className="bg-[#F25C05]/10 text-[#F25C05] text-[10px] px-2 py-0.5 rounded-full">{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messaging */}
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl mb-4 overflow-hidden">
            <button onClick={() => toggle('messaging')} className="w-full flex items-center justify-between p-6 text-left">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#1A7A6E]" />
                <span className="text-white font-display font-semibold">Messaging Framework</span>
              </div>
              {expandedSection === 'messaging' ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
            </button>
            {expandedSection === 'messaging' && (
              <div className="px-6 pb-6 space-y-4">
                <div className="bg-[#162330] rounded-xl p-5">
                  <div className="text-white/30 text-xs mb-2 uppercase tracking-wider">Brand Tagline</div>
                  <div className="text-white font-display font-bold text-xl">{strategyData.messaging.tagline}</div>
                </div>
                <div className="bg-[#162330] rounded-xl p-5">
                  <div className="text-white/30 text-xs mb-2 uppercase tracking-wider">Elevator Pitch</div>
                  <p className="text-white/80 text-sm leading-relaxed">{strategyData.messaging.elevator}</p>
                </div>
                <div className="bg-[#162330] rounded-xl p-5">
                  <div className="text-white/30 text-xs mb-3 uppercase tracking-wider">Tone of Voice</div>
                  <div className="flex flex-wrap gap-2">
                    {strategyData.messaging.toneOfVoice.map(t => <span key={t} className="bg-[#1A7A6E]/10 text-[#1A7A6E] text-xs px-3 py-1 rounded-full border border-[#1A7A6E]/20">{t}</span>)}
                  </div>
                </div>
                <div className="bg-[#162330] rounded-xl p-5">
                  <div className="text-white/30 text-xs mb-3 uppercase tracking-wider">Key Messages</div>
                  <div className="space-y-2">
                    {strategyData.messaging.keyMessages.map((m, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[#F25C05] font-bold text-xs mt-0.5">{i + 1}.</span>
                        <span className="text-white/70 text-sm">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Differentiation */}
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl overflow-hidden">
            <button onClick={() => toggle('diff')} className="w-full flex items-center justify-between p-6 text-left">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#1A7A6E]" />
                <span className="text-white font-display font-semibold">Competitive Advantage</span>
              </div>
              {expandedSection === 'diff' ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
            </button>
            {expandedSection === 'diff' && (
              <div className="px-6 pb-6 space-y-3">
                {strategyData.differentiation.points.map((p) => (
                  <div key={p.label} className="bg-[#162330] rounded-xl p-4 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F25C05] mt-2 flex-shrink-0" />
                    <div>
                      <div className="text-white font-semibold text-sm mb-1">{p.label}</div>
                      <div className="text-white/50 text-xs leading-relaxed">{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Coach — right */}
      <div className="w-full lg:w-96 flex flex-col border-t lg:border-t-0 border-white/5 bg-[#0A1520]">
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
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

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px] lg:max-h-none">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'assistant' ? 'bg-[#F25C05]/20' : 'bg-[#1A2E3D]'}`}>
                {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5 text-[#F25C05]" /> : <User className="w-3.5 h-3.5 text-white/50" />}
              </div>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-[#1A2E3D] text-white/80 rounded-tl-sm' : 'bg-[#F25C05]/10 border border-[#F25C05]/20 text-white/90 rounded-tr-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#F25C05]/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-[#F25C05]" />
              </div>
              <div className="bg-[#1A2E3D] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}
        </div>

        {/* Suggested questions */}
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['How should I price my products?', 'Which social media first?', 'WhatsApp marketing tips'].map(q => (
              <button key={q} onClick={() => { setInput(q); }} className="flex-shrink-0 bg-[#1A2E3D] border border-white/8 rounded-full px-3 py-1.5 text-white/50 text-xs hover:text-white hover:border-white/20 transition-all">
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask your brand coach..."
              className="flex-1 bg-[#1A2E3D] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F25C05]/50 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-40 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}