'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Target, ChevronRight, ChevronLeft, CheckCircle, Sparkles, AlertCircle, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const questions = [
  { id: 'business_name', section: 'Your Business', question: 'What is your business name?', hint: 'Enter the official name you use for your business.', type: 'text', placeholder: 'e.g. Savanna Skincare' },
  { id: 'what_you_do', section: 'Your Business', question: 'What does your business do? Describe it in 1–2 sentences.', hint: 'Be specific. What do you sell or offer, and to whom?', type: 'textarea', placeholder: 'e.g. We make and sell natural skincare products for Kenyan women with sensitive skin...' },
  { id: 'sector', section: 'Your Business', question: 'What sector or industry are you in?', hint: 'Select the option that best describes your business.', type: 'select', options: ['E-Commerce / Retail', 'Healthcare / Wellness', 'Technology / Startup', 'Professional Services', 'NGO / Social Enterprise', 'Restaurant / Food & Beverage', 'Education', 'Real Estate', 'Agriculture / Agritech', 'Finance / Fintech', 'Other'] },
  { id: 'stage', section: 'Your Business', question: 'What stage is your business at?', hint: 'This helps us calibrate the right brand strategy for where you are now.', type: 'radio', options: ['Just launched (under 1 year)', 'Early stage (1–3 years)', 'Growing (3–7 years)', 'Established (7+ years)', 'Scaling / expanding into new markets'] },
  { id: 'ideal_customer', section: 'Your Audience', question: 'Who is your ideal customer? Describe them in detail.', hint: 'Include age, gender, location, income level, occupation, and what they care about most.', type: 'textarea', placeholder: 'e.g. Women aged 25–40, based in Nairobi, earning KES 50,000+/month, health-conscious, active on Instagram...' },
  { id: 'customer_problem', section: 'Your Audience', question: 'What is the biggest problem your ideal customer has that your business solves?', hint: 'Be specific. What frustration, challenge, or need does your product/service address?', type: 'textarea', placeholder: 'e.g. They struggle to find natural skincare products that work for African skin without harsh chemicals...' },
  { id: 'competitors', section: 'Your Market', question: 'Who are your top 3 competitors? (Name them)', hint: 'Include both direct competitors and alternative solutions your customers might use.', type: 'textarea', placeholder: 'e.g. 1. Skin Gourmet Kenya  2. Natures Gentle Touch  3. Imported brands like Shea Moisture...' },
  { id: 'differentiator', section: 'Your Market', question: 'What makes your business genuinely different from your competitors?', hint: 'Be honest. What do you do better, differently, or uniquely?', type: 'textarea', placeholder: 'e.g. We are the only brand that formulates specifically for Kenyan climate and skin types...' },
  { id: 'brand_words_current', section: 'Your Brand', question: 'How would you describe your CURRENT brand in 3 words?', hint: 'Be honest — this is your current reality, not your aspiration.', type: 'text', placeholder: 'e.g. Inconsistent, local, affordable' },
  { id: 'brand_words_desired', section: 'Your Brand', question: 'How do you WANT your brand to be perceived? What 3 words describe your ideal brand?', hint: 'This is your brand aspiration — what you want customers to feel and think.', type: 'text', placeholder: 'e.g. Premium, trustworthy, authentically African' },
  { id: 'brand_personality', section: 'Your Brand', question: "What is your brand's personality? Select all that apply.", hint: 'Choose the traits that best describe how your brand should feel to customers.', type: 'multiselect', options: ['Professional & authoritative', 'Warm & approachable', 'Bold & energetic', 'Innovative & forward-thinking', 'Trustworthy & reliable', 'Creative & expressive', 'Minimal & clean', 'Premium & exclusive', 'Playful & fun', 'Earthy & natural'] },
  { id: 'goal_12months', section: 'Your Goals', question: 'What is your single most important business goal for the next 12 months?', hint: 'Be specific. e.g. "Grow revenue from KES 500K to KES 2M" not just "grow the business".', type: 'textarea', placeholder: 'e.g. Grow monthly revenue from KES 150,000 to KES 500,000 by expanding to Mombasa...' },
  { id: 'digital_channels', section: 'Your Digital Presence', question: 'Which digital channels are you currently using?', hint: 'Select all that apply.', type: 'multiselect', options: ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Twitter / X', 'YouTube', 'WhatsApp Business', 'Website', 'Google Business Profile', 'None yet'] },
  { id: 'biggest_challenge', section: 'Your Digital Presence', question: 'What is your biggest brand or marketing challenge right now?', hint: 'Be honest. This is the most important question — your answer shapes everything we build for you.', type: 'textarea', placeholder: "e.g. People don't know we exist. We have a great product but no one is finding us online..." },
]

const sections = ['Your Business', 'Your Audience', 'Your Market', 'Your Brand', 'Your Goals', 'Your Digital Presence']

export default function DiscoveryPage() {
  const router = useRouter()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [autoSaved, setAutoSaved] = useState(false)

  // Load existing answers on mount
  useEffect(() => {
    const loadExisting = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: discovery } = await supabase
        .from('brand_discovery')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (discovery) {
        if (discovery.completed) { setCompleted(true); return }
        // Restore saved answers
        const restored: Record<string, string | string[]> = {}
        questions.forEach(q => {
          const val = discovery[q.id as keyof typeof discovery]
          if (val !== null && val !== undefined) {
            restored[q.id] = val as string | string[]
          }
        })
        setAnswers(restored)
        // Jump to first unanswered question
        const firstUnanswered = questions.findIndex(q => !restored[q.id])
        if (firstUnanswered > 0) setCurrentQ(firstUnanswered)
      }
    }
    loadExisting()
  }, [])

  const q = questions[currentQ]
  const progress = (currentQ / questions.length) * 100
  const currentSection = q?.section
  const sectionIndex = sections.indexOf(currentSection)

  const updateAnswer = (val: string | string[]) => {
    setAnswers(prev => ({ ...prev, [q.id]: val }))
  }

  const toggleMultiselect = (option: string) => {
    const current = (answers[q.id] as string[]) || []
    updateAnswer(current.includes(option) ? current.filter(o => o !== option) : [...current, option])
  }

  const canProceed = () => {
    const ans = answers[q.id]
    if (!ans) return false
    if (Array.isArray(ans)) return ans.length > 0
    return ans.trim().length > 0
  }

  // Auto-save current answer to Supabase
  const saveProgress = async (extraData?: Record<string, unknown>) => {
    setSaving(true)
    try {
      const response = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answers, ...extraData }),
      })
      if (response.ok) {
        setAutoSaved(true)
        setTimeout(() => setAutoSaved(false), 2000)
      }
    } catch (e) {
      console.error('Auto-save failed:', e)
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async () => {
    // Save progress every 3 questions
    if (currentQ % 3 === 2) await saveProgress()

    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    setCompleting(true)
    await saveProgress({ completed: true })
    await new Promise(r => setTimeout(r, 1500))
    setCompleted(true)
  }

  if (completed) {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-[#1A7A6E]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#1A7A6E]" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-3">Brand Discovery Complete!</h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Excellent work. Your AI brand coach has analysed your answers and is ready to build your Brand Strategy.
          </p>
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6 mb-8 text-left">
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">What we learned about your brand</div>
            <div className="space-y-3">
              {[
                { label: 'Business', value: answers.business_name as string },
                { label: 'Sector', value: answers.sector as string },
                { label: 'Stage', value: answers.stage as string },
                { label: 'Brand aspiration', value: answers.brand_words_desired as string },
              ].filter(i => i.value).map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-[#1A7A6E] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white/40 text-xs">{item.label}: </span>
                    <span className="text-white text-sm">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => router.push('/dashboard/strategy')}
            className="w-full bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F25C05]/20">
            Generate My Brand Strategy <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  if (completing) {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#F25C05]/10 flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Saving your answers...</h2>
          <p className="text-white/50">Your AI coach is getting ready</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F25C05]/15 flex items-center justify-center">
              <Target className="w-5 h-5 text-[#F25C05]" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white">Brand Discovery</h1>
              <p className="text-white/40 text-sm">Question {currentQ + 1} of {questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {autoSaved && (
              <div className="flex items-center gap-1.5 text-[#1A7A6E] text-xs">
                <Save className="w-3.5 h-3.5" /> Saved
              </div>
            )}
            {saving && <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />}
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {sections.map((sec, i) => (
            <div key={sec} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${i === sectionIndex ? 'bg-[#F25C05]/10 text-[#F25C05] border border-[#F25C05]/20' : i < sectionIndex ? 'bg-[#1A7A6E]/10 text-[#1A7A6E]' : 'bg-white/5 text-white/30'}`}>
              {i < sectionIndex ? '✓ ' : ''}{sec}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-8">
          <div className="h-full bg-gradient-to-r from-[#F25C05] to-[#D9910B] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Question card */}
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-8 mb-6">
          <div className="text-[#F25C05] text-xs font-semibold uppercase tracking-wider mb-3">{q.section}</div>
          <h2 className="text-xl font-display font-semibold text-white mb-2 leading-snug">{q.question}</h2>
          {q.hint && (
            <div className="flex items-start gap-2 mb-6">
              <AlertCircle className="w-3.5 h-3.5 text-white/30 mt-0.5 flex-shrink-0" />
              <p className="text-white/40 text-sm">{q.hint}</p>
            </div>
          )}

          {q.type === 'text' && (
            <input type="text" value={(answers[q.id] as string) || ''} onChange={e => updateAnswer(e.target.value)}
              placeholder={q.placeholder} autoFocus
              className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all" />
          )}

          {q.type === 'textarea' && (
            <textarea value={(answers[q.id] as string) || ''} onChange={e => updateAnswer(e.target.value)}
              placeholder={q.placeholder} rows={4} autoFocus
              className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all resize-none" />
          )}

          {q.type === 'select' && (
            <select value={(answers[q.id] as string) || ''} onChange={e => updateAnswer(e.target.value)}
              className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F25C05]/60 focus:ring-2 focus:ring-[#F25C05]/20 transition-all">
              <option value="" className="bg-[#162330]">Select an option...</option>
              {q.options?.map(opt => <option key={opt} value={opt} className="bg-[#162330]">{opt}</option>)}
            </select>
          )}

          {q.type === 'radio' && (
            <div className="space-y-3">
              {q.options?.map(opt => (
                <button key={opt} onClick={() => updateAnswer(opt)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all ${answers[q.id] === opt ? 'bg-[#F25C05]/10 border-[#F25C05]/40 text-white' : 'bg-[#162330] border-white/10 text-white/60 hover:border-white/20 hover:text-white'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${answers[q.id] === opt ? 'border-[#F25C05] bg-[#F25C05]' : 'border-white/20'}`} />
                    {opt}
                  </div>
                </button>
              ))}
            </div>
          )}

          {q.type === 'multiselect' && (
            <div className="grid grid-cols-2 gap-2">
              {q.options?.map(opt => {
                const selected = ((answers[q.id] as string[]) || []).includes(opt)
                return (
                  <button key={opt} onClick={() => toggleMultiselect(opt)}
                    className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-center gap-2 ${selected ? 'bg-[#F25C05]/10 border-[#F25C05]/40 text-white' : 'bg-[#162330] border-white/10 text-white/60 hover:border-white/20 hover:text-white'}`}>
                    <div className={`w-4 h-4 rounded flex-shrink-0 border ${selected ? 'bg-[#F25C05] border-[#F25C05]' : 'border-white/20'} flex items-center justify-center`}>
                      {selected && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs">{opt}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentQ(c => Math.max(0, c - 1))} disabled={currentQ === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1A2E3D] border border-white/8 text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={handleNext} disabled={!canProceed()}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all shadow-lg shadow-[#F25C05]/20">
            {currentQ === questions.length - 1
              ? <><Sparkles className="w-4 h-4" /> Complete Discovery</>
              : <>Next <ChevronRight className="w-4 h-4" /></>
            }
          </button>
        </div>

        <p className="text-center text-white/20 text-xs mt-4">Your answers are saved automatically every few questions</p>
      </div>
    </div>
  )
}