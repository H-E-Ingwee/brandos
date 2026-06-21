'use client'

import { useState, useEffect, useCallback } from 'react'
import { Palette, Download, RefreshCw, CheckCircle, Copy, Lock, Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { BrandStrategy, Profile } from '@/lib/supabase/types'

const palettes = [
  {
    id: 'earthy',
    name: 'Savanna Earth',
    desc: 'Warm, natural, authentically African',
    colors: [
      { name: 'Primary', hex: '#8B4513', label: 'Savanna Brown' },
      { name: 'Secondary', hex: '#D4A853', label: 'Acacia Gold' },
      { name: 'Accent', hex: '#2D6A4F', label: 'Forest Green' },
      { name: 'Light', hex: '#F5ECD7', label: 'Cream Sand' },
      { name: 'Dark', hex: '#1A0F0A', label: 'Deep Earth' },
    ],
    bestFor: ['Healthcare / Wellness', 'Agriculture / Agritech', 'Restaurant / Food & Beverage', 'NGO / Social Enterprise'],
  },
  {
    id: 'modern',
    name: 'Modern Nairobi',
    desc: 'Clean, premium, urban professional',
    colors: [
      { name: 'Primary', hex: '#1A1A2E', label: 'Midnight Navy' },
      { name: 'Secondary', hex: '#E94560', label: 'Coral Rose' },
      { name: 'Accent', hex: '#F5A623', label: 'Warm Gold' },
      { name: 'Light', hex: '#F8F9FA', label: 'Pure White' },
      { name: 'Dark', hex: '#0D0D1A', label: 'Deep Night' },
    ],
    bestFor: ['Technology / Startup', 'Professional Services', 'Finance / Fintech', 'E-Commerce / Retail'],
  },
  {
    id: 'botanical',
    name: 'Botanical Glow',
    desc: 'Fresh, natural, wellness-focused',
    colors: [
      { name: 'Primary', hex: '#2D6A4F', label: 'Deep Green' },
      { name: 'Secondary', hex: '#95D5B2', label: 'Mint Fresh' },
      { name: 'Accent', hex: '#F4A261', label: 'Warm Peach' },
      { name: 'Light', hex: '#F0FFF4', label: 'Soft Mint' },
      { name: 'Dark', hex: '#1B4332', label: 'Forest Dark' },
    ],
    bestFor: ['Healthcare / Wellness', 'Education', 'NGO / Social Enterprise'],
  },
  {
    id: 'bold',
    name: 'Bold Impact',
    desc: 'Energetic, confident, market-leading',
    colors: [
      { name: 'Primary', hex: '#C0392B', label: 'Power Red' },
      { name: 'Secondary', hex: '#F39C12', label: 'Energy Orange' },
      { name: 'Accent', hex: '#2C3E50', label: 'Deep Slate' },
      { name: 'Light', hex: '#FDFEFE', label: 'Clean White' },
      { name: 'Dark', hex: '#1A252F', label: 'Dark Slate' },
    ],
    bestFor: ['E-Commerce / Retail', 'Restaurant / Food & Beverage', 'Technology / Startup'],
  },
]

const fontPairings = [
  { id: 'elegant', heading: 'Playfair Display', body: 'Inter', mood: 'Elegant & Premium', bestFor: ['Healthcare / Wellness', 'Professional Services', 'NGO / Social Enterprise'] },
  { id: 'modern', heading: 'Poppins', body: 'Open Sans', mood: 'Modern & Clean', bestFor: ['Technology / Startup', 'Finance / Fintech', 'E-Commerce / Retail'] },
  { id: 'natural', heading: 'Lora', body: 'Raleway', mood: 'Natural & Calm', bestFor: ['Agriculture / Agritech', 'Restaurant / Food & Beverage', 'Education'] },
  { id: 'bold', heading: 'Montserrat', body: 'Source Sans 3', mood: 'Bold & Confident', bestFor: ['E-Commerce / Retail', 'Technology / Startup'] },
]

const logoStyles = [
  { id: 'wordmark', name: 'Wordmark', desc: 'Clean text-based logo — timeless and versatile' },
  { id: 'icon', name: 'Icon + Wordmark', desc: 'Symbol paired with your brand name — most recognisable' },
  { id: 'monogram', name: 'Monogram', desc: 'Initials-based — elegant and minimal' },
]

export default function IdentityPage() {
  const [selectedPalette, setSelectedPalette] = useState('earthy')
  const [selectedFont, setSelectedFont] = useState('elegant')
  const [selectedLogo, setSelectedLogo] = useState('wordmark')
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [strategy, setStrategy] = useState<BrandStrategy | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [businessName, setBusinessName] = useState('Your Business')

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, strategyRes, identityRes, discoveryRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('brand_strategy').select('*').eq('user_id', user.id).single(),
        supabase.from('visual_identity').select('*').eq('user_id', user.id).single(),
        supabase.from('brand_discovery').select('business_name, sector').eq('user_id', user.id).single(),
      ])

      setProfile(profileRes.data)
      setStrategy(strategyRes.data)
      if (discoveryRes.data?.business_name) setBusinessName(discoveryRes.data.business_name)

      // Load saved identity or auto-recommend based on sector
      if (identityRes.data) {
        setSelectedPalette(identityRes.data.selected_palette || 'earthy')
        setSelectedFont(identityRes.data.selected_font || 'elegant')
        setSelectedLogo(identityRes.data.selected_logo_style || 'wordmark')
      } else if (discoveryRes.data?.sector) {
        // Auto-recommend based on sector
        const sector = discoveryRes.data.sector
        const recommendedPalette = palettes.find(p => p.bestFor.some(b => sector.includes(b.split(' ')[0])))
        const recommendedFont = fontPairings.find(f => f.bestFor.some(b => sector.includes(b.split(' ')[0])))
        if (recommendedPalette) setSelectedPalette(recommendedPalette.id)
        if (recommendedFont) setSelectedFont(recommendedFont.id)
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  const palette = palettes.find(p => p.id === selectedPalette)!
  const font = fontPairings.find(f => f.id === selectedFont)!
  const isPro = profile?.plan === 'pro' || profile?.plan === 'agency'

  const saveIdentity = useCallback(async (paletteId?: string, fontId?: string, logoId?: string) => {
    setSaving(true)
    const currentPalette = palettes.find(p => p.id === (paletteId || selectedPalette))!
    try {
      await fetch('/api/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_palette: paletteId || selectedPalette,
          palette_colors: currentPalette.colors,
          selected_font: fontId || selectedFont,
          heading_font: fontPairings.find(f => f.id === (fontId || selectedFont))?.heading,
          body_font: fontPairings.find(f => f.id === (fontId || selectedFont))?.body,
          selected_logo_style: logoId || selectedLogo,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    finally { setSaving(false) }
  }, [selectedPalette, selectedFont, selectedLogo])

  const handlePaletteSelect = (id: string) => {
    setSelectedPalette(id)
    saveIdentity(id, undefined, undefined)
  }
  const handleFontSelect = (id: string) => {
    setSelectedFont(id)
    saveIdentity(undefined, id, undefined)
  }
  const handleLogoSelect = (id: string) => {
    setSelectedLogo(id)
    saveIdentity(undefined, undefined, id)
  }

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopied(hex)
    setTimeout(() => setCopied(null), 1500)
  }

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
          <div className="w-10 h-10 rounded-xl bg-[#1A7A6E]/15 flex items-center justify-center">
            <Palette className="w-5 h-5 text-[#1A7A6E]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">Visual Identity</h1>
            <p className="text-white/40 text-sm">
              {strategy?.tagline ? `"${strategy.tagline}"` : `AI-recommended for ${businessName}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saving && <div className="flex items-center gap-1.5 text-white/40 text-xs"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</div>}
          {saved && <div className="flex items-center gap-1.5 text-[#1A7A6E] text-xs"><Save className="w-3.5 h-3.5" /> Saved</div>}
          {isPro ? (
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A7A6E]/10 border border-[#1A7A6E]/20 text-[#1A7A6E] text-xs font-medium hover:bg-[#1A7A6E]/20 transition-all">
              <Download className="w-3.5 h-3.5" /> Export Brand Kit
            </button>
          ) : (
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A2E3D] border border-white/8 text-white/30 text-xs font-medium cursor-not-allowed">
              <Lock className="w-3.5 h-3.5" /> Export (Pro)
            </button>
          )}
        </div>
      </div>

      {/* Strategy context banner */}
      {strategy?.tone_of_voice && strategy.tone_of_voice.length > 0 && (
        <div className="bg-[#1A2E3D] border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3 mb-8">
          <div className="text-white/30 text-xs">Brand personality:</div>
          <div className="flex flex-wrap gap-1.5">
            {strategy.tone_of_voice.slice(0, 4).map(t => (
              <span key={t} className="bg-[#1A7A6E]/10 text-[#1A7A6E] text-xs px-2 py-0.5 rounded-full border border-[#1A7A6E]/20">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Colour Palettes */}
      <section className="mb-10">
        <h2 className="text-lg font-display font-semibold text-white mb-1">Colour Palette</h2>
        <p className="text-white/40 text-sm mb-5">AI-recommended based on your brand personality and sector. Click to select — saves automatically.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {palettes.map((p) => {
            const isSelected = selectedPalette === p.id
            return (
              <button key={p.id} onClick={() => handlePaletteSelect(p.id)}
                className={`text-left rounded-2xl border p-4 transition-all ${isSelected ? 'border-[#1A7A6E]/50 bg-[#1A7A6E]/5' : 'border-white/8 bg-[#1A2E3D] hover:border-white/20'}`}>
                <div className="flex gap-1 mb-3">
                  {p.colors.slice(0, 5).map(c => (
                    <div key={c.hex} className="flex-1 h-8 rounded-lg" style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-medium text-sm">{p.name}</span>
                  {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#1A7A6E]" />}
                </div>
                <div className="text-white/40 text-xs">{p.desc}</div>
              </button>
            )
          })}
        </div>

        {/* Selected palette detail */}
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
          <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Selected: {palette.name}</div>
          <div className="grid grid-cols-5 gap-3">
            {palette.colors.map((c) => (
              <div key={c.hex} className="text-center">
                <button onClick={() => copyHex(c.hex)}
                  className="w-full aspect-square rounded-xl mb-2 relative group transition-transform hover:scale-105"
                  style={{ backgroundColor: c.hex }}>
                  <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                    {copied === c.hex ? <CheckCircle className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                  </div>
                </button>
                <div className="text-white text-xs font-mono">{c.hex}</div>
                <div className="text-white/30 text-[10px]">{c.label}</div>
                <div className="text-white/20 text-[10px]">{c.name}</div>
              </div>
            ))}
          </div>
          <p className="text-white/20 text-xs mt-4">Click any colour to copy the hex code</p>
        </div>
      </section>

      {/* Typography */}
      <section className="mb-10">
        <h2 className="text-lg font-display font-semibold text-white mb-1">Typography</h2>
        <p className="text-white/40 text-sm mb-5">Font pairings that match your brand personality. Click to select — saves automatically.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {fontPairings.map((f) => {
            const isSelected = selectedFont === f.id
            return (
              <button key={f.id} onClick={() => handleFontSelect(f.id)}
                className={`text-left rounded-2xl border p-5 transition-all ${isSelected ? 'border-[#1A7A6E]/50 bg-[#1A7A6E]/5' : 'border-white/8 bg-[#1A2E3D] hover:border-white/20'}`}>
                <div className="mb-3">
                  <div className="text-white text-lg font-bold mb-1" style={{ fontFamily: `${f.heading}, serif` }}>{f.heading}</div>
                  <div className="text-white/50 text-sm" style={{ fontFamily: `${f.body}, sans-serif` }}>{f.body}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-xs">{f.mood}</span>
                  {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#1A7A6E]" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Typography preview */}
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
          <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Live Preview — {businessName}</div>
          <div className="bg-[#162330] rounded-xl p-6">
            <div className="text-white text-3xl font-bold mb-2" style={{ fontFamily: `${font.heading}, serif` }}>
              {businessName}
            </div>
            {strategy?.tagline && (
              <div className="text-white/60 text-base mb-4" style={{ fontFamily: `${font.heading}, serif` }}>
                {strategy.tagline}
              </div>
            )}
            {strategy?.elevator_pitch && (
              <div className="text-white/50 text-sm leading-relaxed" style={{ fontFamily: `${font.body}, sans-serif` }}>
                {strategy.elevator_pitch}
              </div>
            )}
            {!strategy?.tagline && (
              <div className="text-white/50 text-sm leading-relaxed" style={{ fontFamily: `${font.body}, sans-serif` }}>
                Complete your Brand Strategy to see your tagline and elevator pitch here.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Logo Direction */}
      <section className="mb-10">
        <h2 className="text-lg font-display font-semibold text-white mb-1">Logo Direction</h2>
        <p className="text-white/40 text-sm mb-5">Recommended logo style for your brand. Click to select — saves automatically.</p>
        <div className="grid md:grid-cols-3 gap-4">
          {logoStyles.map((l) => {
            const isSelected = selectedLogo === l.id
            return (
              <button key={l.id} onClick={() => handleLogoSelect(l.id)}
                className={`text-left rounded-2xl border p-5 transition-all ${isSelected ? 'border-[#1A7A6E]/50 bg-[#1A7A6E]/5' : 'border-white/8 bg-[#1A2E3D] hover:border-white/20'}`}>
                <div className="h-16 bg-[#162330] rounded-xl flex items-center justify-center mb-4">
                  {l.id === 'wordmark' && (
                    <span className="text-white font-bold text-lg" style={{ fontFamily: `${font.heading}, serif` }}>
                      {businessName.split(' ')[0]}
                    </span>
                  )}
                  {l.id === 'icon' && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: palette.colors[0].hex }} />
                      <span className="text-white font-bold">{businessName.split(' ')[0]}</span>
                    </div>
                  )}
                  {l.id === 'monogram' && (
                    <span className="text-white font-bold text-3xl" style={{ fontFamily: `${font.heading}, serif` }}>
                      {businessName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium text-sm">{l.name}</span>
                  {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#1A7A6E]" />}
                </div>
                <div className="text-white/40 text-xs">{l.desc}</div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Brand Guidelines */}
      <section>
        <div className="bg-gradient-to-br from-[#1A7A6E]/10 to-[#1A2E3D] border border-[#1A7A6E]/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-white">Brand Guidelines Document</h2>
            {!isPro && <span className="bg-[#D9910B]/10 text-[#D9910B] text-xs font-bold px-3 py-1 rounded-full border border-[#D9910B]/20">Pro Feature</span>}
          </div>
          <p className="text-white/50 text-sm mb-5">Your complete brand guidelines — ready to share with designers, printers, and your team.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {['Colour usage rules', 'Typography hierarchy', 'Logo usage guide', "Do's and Don'ts", 'Social media templates', 'Business card specs', 'Email signature', 'Brand voice guide'].map(item => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#1A7A6E] flex-shrink-0" />
                <span className="text-white/60 text-xs">{item}</span>
              </div>
            ))}
          </div>
          <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${isPro ? 'bg-[#1A7A6E] hover:bg-[#22A090] text-white' : 'bg-[#1A2E3D] border border-white/10 text-white/30 cursor-not-allowed'}`}>
            <Download className="w-4 h-4" />
            {isPro ? 'Download Brand Guidelines PDF' : 'Upgrade to Pro to Download'}
          </button>
        </div>
      </section>
    </div>
  )
}