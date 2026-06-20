'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, X, Send, Bot, User, MessageCircle, Phone, Loader2, Minimize2, Maximize2 } from 'lucide-react'
import { usePathname } from 'next/navigation'

type Message = { role: 'user' | 'assistant'; content: string }

const WHATSAPP_NUMBER = '254798936316'
const WHATSAPP_MSG = encodeURIComponent('Hi! I need help with BrandOS. Can you assist me?')

const quickQuestions = [
  'How do I complete Brand Discovery?',
  'How does M-Pesa payment work?',
  'What does each plan include?',
  'How do I invite team members?',
  'How do I generate my brand strategy?',
]

export default function FloatingAI() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Habari! 👋 I\'m your BrandOS AI assistant. I can help you navigate the platform, answer questions, or connect you with our team. What do you need?',
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const pathname = usePathname()
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Don't show on landing page or auth pages
  const hiddenPaths = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/admin']
  if (hiddenPaths.some(p => pathname === p) || pathname.startsWith('/invite')) return null

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!open) setUnread(0)
  }, [open])

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          module: 'floating-assistant',
          history: messages.slice(-6),
        }),
      })
      const data = await response.json()
      const reply = data.response || data.error || 'I\'m having trouble responding right now. Please try again or contact us on WhatsApp.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (!open) setUnread(u => u + 1)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please check your connection or contact us on WhatsApp.' }])
    } finally {
      setLoading(false)
    }
  }

  const formatMessage = (content: string) => {
    // Format bold text, bullet points, and line breaks
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return <div key={i} className="flex items-start gap-1.5 mt-1"><span className="text-[#F25C05] mt-0.5 flex-shrink-0">•</span><span>{line.slice(2)}</span></div>
        }
        if (line.match(/^\d+\./)) {
          return <div key={i} className="flex items-start gap-1.5 mt-1"><span className="text-[#F25C05] font-bold flex-shrink-0">{line.split('.')[0]}.</span><span>{line.slice(line.indexOf('.') + 1).trim()}</span></div>
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <div key={i} className="font-semibold text-white mt-2">{line.slice(2, -2)}</div>
        }
        if (!line.trim()) return <div key={i} className="h-1" />
        return <div key={i}>{line}</div>
      })
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className={`fixed bottom-24 right-6 z-50 w-80 bg-[#0F1D26] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 flex flex-col transition-all duration-300 ${minimized ? 'h-14' : 'h-[480px]'}`}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[#F25C05]/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-[#F25C05]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm">BrandOS Assistant</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1A7A6E] animate-pulse" />
                <span className="text-white/30 text-xs">AI + Human support</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(!minimized)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
                {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${msg.role === 'assistant' ? 'bg-[#F25C05]/20' : 'bg-[#1A2E3D]'}`}>
                      {msg.role === 'assistant' ? <Bot className="w-3 h-3 text-[#F25C05]" /> : <User className="w-3 h-3 text-white/50" />}
                    </div>
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${msg.role === 'assistant' ? 'bg-[#1A2E3D] text-white/80 rounded-tl-sm' : 'bg-[#F25C05]/15 border border-[#F25C05]/20 text-white/90 rounded-tr-sm'}`}>
                      {msg.role === 'assistant' ? formatMessage(msg.content) : msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#F25C05]/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-[#F25C05]" />
                    </div>
                    <div className="bg-[#1A2E3D] rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
                      {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick questions */}
              {messages.length <= 1 && (
                <div className="px-3 pb-2">
                  <div className="text-white/25 text-[10px] mb-2 uppercase tracking-wider">Quick questions</div>
                  <div className="flex flex-wrap gap-1.5">
                    {quickQuestions.slice(0, 3).map(q => (
                      <button key={q} onClick={() => sendMessage(q)}
                        className="bg-[#1A2E3D] border border-white/8 rounded-full px-2.5 py-1 text-white/50 text-[10px] hover:text-white hover:border-[#F25C05]/30 transition-all">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* WhatsApp CTA */}
              <div className="px-3 pb-2">
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl px-3 py-2 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/20 transition-all">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Talk to a real person on WhatsApp</span>
                </a>
              </div>

              {/* Input */}
              <div className="p-3 border-t border-white/5 flex-shrink-0">
                <div className="flex gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Ask anything..."
                    className="flex-1 bg-[#1A2E3D] border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#F25C05]/50 transition-all" />
                  <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                    className="w-8 h-8 bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-40 rounded-xl flex items-center justify-center transition-all flex-shrink-0">
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#F25C05] hover:bg-[#D94E00] rounded-full shadow-2xl shadow-[#F25C05]/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        title="BrandOS AI Assistant">
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
        {unread > 0 && !open && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            {unread}
          </div>
        )}
      </button>
    </>
  )
}