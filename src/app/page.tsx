'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, Target, Palette, TrendingUp, MessageSquare, BarChart3, CheckCircle, Star, Zap, Globe, Shield } from 'lucide-react'

const features = [
  { icon: Target, title: 'Brand Discovery & Audit', desc: 'AI analyses your business and identifies exactly what your brand needs to stand out in the Kenyan market.', color: '#F25C05' },
  { icon: Sparkles, title: 'Brand Strategy Builder', desc: 'Get a complete brand strategy — positioning, personas, messaging framework, and tone of voice — in minutes.', color: '#D9910B' },
  { icon: Palette, title: 'Visual Identity Generator', desc: 'AI recommends your colour palette, typography, and brand guidelines based on your strategy.', color: '#1A7A6E' },
  { icon: TrendingUp, title: 'Digital Marketing Strategy', desc: 'A 90-day marketing plan tailored for WhatsApp, Instagram, LinkedIn, TikTok, and Facebook.', color: '#F25C05' },
  { icon: MessageSquare, title: 'Social Media Content Engine', desc: 'Ready-to-use captions, hashtags, and a monthly content calendar in your brand\'s voice.', color: '#D9910B' },
  { icon: BarChart3, title: 'Performance Dashboard', desc: 'Track your brand and marketing metrics. Ask your AI coach anything, anytime.', color: '#1A7A6E' },
]

const pricing = [
  { name: 'Free', price: 'KES 0', period: 'forever', desc: 'Start your brand journey', features: ['Brand Discovery Audit', '1 Brand Report', '10 AI Coach queries/month', 'Basic brand guidelines'], cta: 'Start Free', highlight: false },
  { name: 'Growth', price: 'KES 1,500', period: '/month', desc: 'For growing businesses', features: ['Everything in Free', 'Full Brand Strategy', '90-Day Marketing Plan', '50 AI Coach queries/month', 'Remove BrandOS branding', 'PDF exports'], cta: 'Start Growth', highlight: true },
  { name: 'Pro', price: 'KES 3,500', period: '/month', desc: 'For serious brands', features: ['Everything in Growth', 'Visual Identity Generator', 'Social Media Scheduler', 'Unlimited AI Coach', '3 team members', 'Priority support'], cta: 'Start Pro', highlight: false },
  { name: 'Agency', price: 'KES 8,000', period: '/month', desc: 'For agencies & consultants', features: ['Everything in Pro', 'Manage 10 client brands', 'White-label reports', 'Unlimited team members', 'Dedicated account manager', 'Custom onboarding'], cta: 'Contact Us', highlight: false },
]

const testimonials = [
  { name: 'Amina Wanjiku', role: 'Founder, Savanna Skincare', text: 'BrandOS gave me a complete brand strategy in 20 minutes. What would have cost me KES 80,000 with a consultant, I got for KES 1,500/month.', rating: 5 },
  { name: 'David Ochieng', role: 'CEO, TechBridge Kenya', text: 'The AI coach actually understands the Kenyan market. It recommended WhatsApp-first marketing before I even mentioned it. Impressive.', rating: 5 },
  { name: 'Grace Muthoni', role: 'Marketing Manager, Nairobi Eats', text: 'We went from zero brand strategy to a complete 90-day marketing plan in one afternoon. Our Instagram engagement tripled in 30 days.', rating: 5 },
]

const stats = [
  { value: '7.4M+', label: 'SMEs in Kenya need this' },
  { value: '60%', label: 'Revenue lost to poor branding' },
  { value: '20 min', label: 'To your first brand strategy' },
  { value: 'KES 1,500', label: 'vs KES 45,000 consultant fee' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F1D26]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F1D26]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F25C05] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">BrandOS</span>
            <span className="text-white/30 text-sm ml-1">by Ingweplex</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-white/60 hover:text-white text-sm transition-colors">Features</a>
            <a href="#pricing" className="text-white/60 hover:text-white text-sm transition-colors">Pricing</a>
            <a href="#testimonials" className="text-white/60 hover:text-white text-sm transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-white/70 hover:text-white text-sm font-medium transition-colors">Sign in</Link>
            <Link href="/signup" className="bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all duration-200">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#F25C05]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#F25C05]/10 border border-[#F25C05]/20 rounded-full px-4 py-2 mb-8">
            <Zap className="w-3.5 h-3.5 text-[#F25C05]" />
            <span className="text-[#F25C05] text-sm font-medium">Africa's first AI brand builder</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.05] mb-6">
            Build a brand that{' '}
            <span style={{ background: 'linear-gradient(135deg, #F25C05, #D9910B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              wins in Kenya
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            BrandOS guides you through brand strategy, visual identity, and digital marketing — powered by AI, built for the African market. From zero to a complete brand in 20 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup" className="bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 flex items-center gap-2 shadow-lg shadow-[#F25C05]/20">
              Start Building Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/dashboard" className="bg-[#1A2E3D] hover:bg-[#162330] text-white font-medium px-8 py-4 rounded-xl border border-white/10 hover:border-[#F25C05]/40 text-base transition-all duration-200">
              View Demo
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[#1A2E3D]/60 border border-white/5 rounded-2xl p-5">
                <div className="text-2xl font-display font-bold text-[#F25C05] mb-1">{stat.value}</div>
                <div className="text-white/50 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-white mb-4">Everything your brand needs</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">Six powerful modules that take you from brand confusion to brand clarity — guided by AI every step of the way.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6 hover:border-[#F25C05]/30 hover:bg-[#162330] transition-all duration-200 cursor-pointer group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="text-lg font-display font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY AFRICA FIRST */}
      <section className="py-20 px-6 bg-[#1A2E3D]/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#1A7A6E]/10 border border-[#1A7A6E]/20 rounded-full px-4 py-2 mb-6">
                <Globe className="w-3.5 h-3.5 text-[#1A7A6E]" />
                <span className="text-[#1A7A6E] text-sm font-medium">Built for Africa, not adapted for it</span>
              </div>
              <h2 className="text-4xl font-display font-bold text-white mb-6">Why BrandOS is different from every other tool</h2>
              <p className="text-white/60 mb-8 leading-relaxed">Canva, Looka, and HubSpot were built for Western markets. They don't understand M-Pesa, WhatsApp-first marketing, or the specific challenges of building a brand in Nairobi. BrandOS does.</p>
              <div className="space-y-4">
                {[
                  { icon: '🇰🇪', text: 'Swahili language support — AI coach responds in Swahili' },
                  { icon: '📱', text: 'M-Pesa payments — no credit card required' },
                  { icon: '💬', text: 'WhatsApp-first marketing tools built in' },
                  { icon: '🏪', text: 'Kenyan market intelligence — local consumer insights' },
                  { icon: '💰', text: 'Pricing in KES — no currency conversion anxiety' },
                  { icon: '🏥', text: 'Sector-specific modules for healthcare, NGOs, tech, e-commerce' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-white/70 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#1A2E3D] border border-white/8 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#F25C05]/15 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[#F25C05]" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">AI Brand Coach</div>
                  <div className="text-white/40 text-xs">Online now</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-[#0F1D26] rounded-2xl rounded-tl-sm p-4 text-sm text-white/70 leading-relaxed">Habari! I'm your AI brand coach. Tell me about your business and I'll help you build a brand that resonates with your Kenyan customers. 🇰🇪</div>
                <div className="bg-[#F25C05]/10 border border-[#F25C05]/20 rounded-2xl rounded-tr-sm p-4 text-sm text-white/80 leading-relaxed ml-8">I run a small restaurant in Westlands. I want to attract more young professionals.</div>
                <div className="bg-[#0F1D26] rounded-2xl rounded-tl-sm p-4 text-sm text-white/70 leading-relaxed">Perfect! Young Nairobi professionals are highly active on Instagram and TikTok. They value authenticity, quality, and social proof. Let me build you a brand strategy that speaks directly to them...</div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 bg-[#0F1D26] rounded-xl px-4 py-2.5 text-white/30 text-sm">Ask your brand coach anything...</div>
                <button className="w-9 h-9 bg-[#F25C05] rounded-xl flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-white mb-4">Kenyan businesses love BrandOS</h2>
            <p className="text-white/50">Real results from real businesses across East Africa</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 text-[#D9910B] fill-[#D9910B]" />)}</div>
                <p className="text-white/70 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-white/40 text-xs mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-6 bg-[#1A2E3D]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-white mb-4">Simple, honest pricing in KES</h2>
            <p className="text-white/50">Pay via M-Pesa. Cancel anytime. No hidden fees.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricing.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-6 border transition-all duration-200 ${plan.highlight ? 'bg-[#F25C05] border-[#F25C05] shadow-2xl shadow-[#F25C05]/20 scale-[1.02]' : 'bg-[#1A2E3D] border-white/8 hover:border-white/20'}`}>
                {plan.highlight && <div className="text-white/80 text-xs font-bold uppercase tracking-wider mb-3">Most Popular</div>}
                <div className={`text-sm font-medium mb-1 ${plan.highlight ? 'text-white/80' : 'text-white/50'}`}>{plan.name}</div>
                <div className="text-3xl font-display font-bold mb-1 text-white">{plan.price}</div>
                <div className={`text-sm mb-1 ${plan.highlight ? 'text-white/70' : 'text-white/40'}`}>{plan.period}</div>
                <div className={`text-xs mb-6 ${plan.highlight ? 'text-white/70' : 'text-white/40'}`}>{plan.desc}</div>
                <div className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-white' : 'text-[#1A7A6E]'}`} />
                      <span className={`text-sm ${plan.highlight ? 'text-white/90' : 'text-white/60'}`}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${plan.highlight ? 'bg-white text-[#F25C05] hover:bg-white/90' : 'bg-[#F25C05]/10 text-[#F25C05] border border-[#F25C05]/20 hover:bg-[#F25C05]/20'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#F25C05]/10 border border-[#F25C05]/20 rounded-full px-4 py-2 mb-8">
            <Shield className="w-3.5 h-3.5 text-[#F25C05]" />
            <span className="text-[#F25C05] text-sm font-medium">No credit card required · Pay via M-Pesa</span>
          </div>
          <h2 className="text-5xl font-display font-bold text-white mb-6">Your brand deserves to be seen</h2>
          <p className="text-white/60 text-lg mb-10">Join thousands of Kenyan businesses building powerful brands with BrandOS. Start free today.</p>
          <Link href="/signup" className="bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-[#F25C05]/20">
            Start Building Your Brand <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F25C05] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-white">BrandOS</span>
            <span className="text-white/30 text-sm">by Ingweplex</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="mailto:Ingweplex@gmail.com" className="hover:text-white transition-colors">Contact</a>
            <a href="https://wa.me/254798936316" className="hover:text-white transition-colors">WhatsApp</a>
          </div>
          <div className="text-white/30 text-sm">© 2026 Ingweplex. Nairobi, Kenya.</div>
        </div>
      </footer>
    </div>
  )
}