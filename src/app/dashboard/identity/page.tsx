'use client'

import { useState } from 'react'
import { Palette, Download, RefreshCw, CheckCircle, Copy, Lock } from 'lucide-react'

const palettes = [
  {
    id: 'earthy',
    name: 'Savanna Earth',
    desc: 'Warm, natural, authentically African',
    recommended: true,
    colors: [
      { name: 'Primary', hex: '#8B4513', label: 'Savanna Brown' },
      { name: 'Secondary', hex: '#D4A853', label: 'Acacia Gold' },
      { name: 'Accent', hex: '#2D6A4F', label: 'Forest Green' },
      { name: 'Light', hex: '#F5ECD7', label: 'Cream Sand' },
      { name: 'Dark', hex: '#1A0F0A', label: 'Deep Earth' },
    ],
  },
  {
    id: 'modern',
    name: 'Modern Nairobi',
    desc: 'Clean, premium, urban professional',
    recommended: false,
    colors: [
      { name: 'Primary', hex: '#1A1A2E', label: 'Midnight Navy' },
      { name: 'Secondary', hex: '#E94560', label: 'Coral Rose' },
      { name: 'Accent', hex: '#F5A623', label: 'Warm Gold' },
      { name: 'Light', hex: '#F8F9FA', label: 'Pure White' },
      { name: 'Dark', hex: '#0D0D1A', label: 'Deep Night' },
    ],
  },
  {
    id: 'botanical',
    name: 'Botanical Glow',
    desc: 'Fresh, natural, wellness-focused',
    recommended: false,
    colors: [
      { name: 'Primary', hex: '#2D6A4F', label: 'Deep Green' },
      { name: 'Secondary', hex: '#95D5B2', label: 'Mint Fresh' },
      { name: 'Accent', hex: '#F4A261', label: 'Warm Peach' },
      { name: 'Light', hex: '#F0FFF4', label: 'Soft Mint' },
      { name: 'Dark', hex: '#1B4332', label: 'Forest Dark' },
    ],
  },
]

const fontPairings = [
  { id: 'elegant', heading: 'Playfair Display', body: 'Inter', mood: 'Elegant & Premium', recommended: true },
  { id: 'modern', heading: 'Poppins', body: 'Open Sans', mood: 'Modern & Clean', recommended: false },
  { id: 'natural', heading: 'Lora', body: 'Raleway', mood: 'Natural & Calm', recommended: false },
]

const logoStyles = [
  { id: 'wordmark', name: 'Wordmark', desc: 'Clean text-based logo — timeless and versatile', recommended: true },
  { id: 'icon', name: 'Icon + Wordmark', desc: 'Symbol paired with your brand name — most recognisable', recommended: false },
  { id: 'monogram', name: 'Monogram', desc: 'Initials-based — elegant and minimal', recommended: false },
]

export default function IdentityPage() {
  const [selectedPalette, setSelectedPalette] = useState('earthy')
  const [selectedFont, setSelectedFont] = useState('elegant')
  const [selectedLogo, setSelectedLogo] = useState('wordmark')
  const [copied, setCopied] = useState<string | null>(null)
  const [isPro] = useState(false)

  const palette = palettes.find(p => p.id === selectedPalette)!

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopied(hex)
    setTimeout(() => setCopied(null), 1500)
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
            <p className="text-white/40 text-sm">AI-recommended for Savanna Skincare</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A2E3D] border border-white/8 text-white/50 hover:text-white text-xs font-medium transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
          </button>
          {isPro ? (
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A7A6E]/10 border border-[#1A7A6E]/20 text-[#1A7A6E] text-xs font-medium transition-all hover:bg-[#1A7A6E]/20">
              <Download className="w-3.5 h-3.5" /> Export Brand Kit
            </button>
          ) : (
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A2E3D] border border-white/8 text-white/30 text-xs font-medium cursor-not-allowed">
              <Lock className="w-3.5 h-3.5" /> Export (Pro)
            </button>
          )}
        </div>
      </div>

      {/* Colour Palettes */}
      <section className="mb-10">
        <h2 className="text-lg font-display font-semibold text-white mb-1">Colour Palette</h2>
        <p className="text-white/40 text-sm mb-5">AI-recommended based on your brand personality and sector</p>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {palettes.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPalette(p.id)}
              className={`text-left rounded-2xl border p-4 transition-all ${selectedPalette === p.id ? 'border-[#1A7A6E]/50 bg-[#1A7A6E]/5' : 'border-white/8 bg-[#1A2E3D] hover:border-white/20'}`}
            >
              <div className="flex gap-1.5 mb-3">
                {p.colors.slice(0, 5).map(c => (
                  <div key={c.hex} className="flex-1 h-8 rounded-lg" style={{ backgroundColor: c.hex }} />
                ))}
              </div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-white font-medium text-sm">{p.name}</span>
                {p.recommended && <span className="bg-[#1A7A6E]/20 text-[#1A7A6E] text-[10px] font-bold px-1.5 py-0.5 rounded-full">AI Pick</span>}
              </div>
              <div className="text-white/40 text-xs">{p.desc}</div>
              {selectedPalette === p.id && <CheckCircle className="w-4 h-4 text-[#1A7A6E] mt-2" />}
            </button>
          ))}
        </div>

        {/* Selected palette detail */}
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
          <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Selected: {palette.name}</div>
          <div className="grid grid-cols-5 gap-3">
            {palette.colors.map((c) => (
              <div key={c.hex} className="text-center">
                <button
                  onClick={() => copyHex(c.hex)}
                  className="w-full aspect-square rounded-xl mb-2 relative group transition-transform hover:scale-105"
                  style={{ backgroundColor: c.hex }}
                >
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
        </div>
      </section>

      {/* Typography */}
      <section className="mb-10">
        <h2 className="text-lg font-display font-semibold text-white mb-1">Typography</h2>
        <p className="text-white/40 text-sm mb-5">Font pairings that match your brand personality</p>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {fontPairings.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFont(f.id)}
              className={`text-left rounded-2xl border p-5 transition-all ${selectedFont === f.id ? 'border-[#1A7A6E]/50 bg-[#1A7A6E]/5' : 'border-white/8 bg-[#1A2E3D] hover:border-white/20'}`}
            >
              <div className="mb-3">
                <div className="text-white text-xl font-bold mb-1" style={{ fontFamily: f.heading }}>{f.heading}</div>
                <div className="text-white/50 text-sm" style={{ fontFamily: f.body }}>{f.body} — body text</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-xs">{f.mood}</span>
                {f.recommended && <span className="bg-[#1A7A6E]/20 text-[#1A7A6E] text-[10px] font-bold px-1.5 py-0.5 rounded-full">AI Pick</span>}
              </div>
              {selectedFont === f.id && <CheckCircle className="w-4 h-4 text-[#1A7A6E] mt-2" />}
            </button>
          ))}
        </div>

        {/* Typography preview */}
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
          <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Typography Preview</div>
          <div className="bg-[#162330] rounded-xl p-6">
            <div className="text-white text-3xl font-bold mb-2" style={{ fontFamily: fontPairings.find(f => f.id === selectedFont)?.heading }}>
              Savanna Skincare
            </div>
            <div className="text-white/50 text-base mb-4" style={{ fontFamily: fontPairings.find(f => f.id === selectedFont)?.heading }}>
              Formulated for African Skin. Made in Kenya.
            </div>
            <div className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: fontPairings.find(f => f.id === selectedFont)?.body }}>
              We make premium natural skincare products formulated specifically for African skin and the Kenyan climate — using locally sourced ingredients that actually work.
            </div>
          </div>
        </div>
      </section>

      {/* Logo Direction */}
      <section className="mb-10">
        <h2 className="text-lg font-display font-semibold text-white mb-1">Logo Direction</h2>
        <p className="text-white/40 text-sm mb-5">AI-recommended logo style for your brand</p>
        <div className="grid md:grid-cols-3 gap-4">
          {logoStyles.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLogo(l.id)}
              className={`text-left rounded-2xl border p-5 transition-all ${selectedLogo === l.id ? 'border-[#1A7A6E]/50 bg-[#1A7A6E]/5' : 'border-white/8 bg-[#1A2E3D] hover:border-white/20'}`}
            >
              <div className="h-16 bg-[#162330] rounded-xl flex items-center justify-center mb-4">
                {l.id === 'wordmark' && <span className="text-white font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>Savanna</span>}
                {l.id === 'icon' && <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#8B4513]" /><span className="text-white font-bold">Savanna</span></div>}
                {l.id === 'monogram' && <span className="text-white font-bold text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>SS</span>}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-medium text-sm">{l.name}</span>
                {l.recommended && <span className="bg-[#1A7A6E]/20 text-[#1A7A6E] text-[10px] font-bold px-1.5 py-0.5 rounded-full">AI Pick</span>}
              </div>
              <div className="text-white/40 text-xs">{l.desc}</div>
              {selectedLogo === l.id && <CheckCircle className="w-4 h-4 text-[#1A7A6E] mt-2" />}
            </button>
          ))}
        </div>
      </section>

      {/* Brand Guidelines Preview */}
      <section>
        <div className="bg-gradient-to-br from-[#1A7A6E]/10 to-[#1A2E3D] border border-[#1A7A6E]/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-white">Brand Guidelines Document</h2>
            {!isPro && <span className="bg-[#D9910B]/10 text-[#D9910B] text-xs font-bold px-3 py-1 rounded-full border border-[#D9910B]/20">Pro Feature</span>}
          </div>
          <p className="text-white/50 text-sm mb-5">Your complete brand guidelines document — ready to share with designers, printers, and your team.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {['Colour usage rules', 'Typography hierarchy', 'Logo usage guide', 'Do\'s and Don\'ts', 'Social media templates', 'Business card specs', 'Email signature', 'Brand voice guide'].map(item => (
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