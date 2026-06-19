'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Palette, Upload, Sparkles, CheckCircle, Copy, Lock, Loader2, Save, X, Plus, RefreshCw, Wand2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { BrandStrategy, Profile } from '@/lib/supabase/types'

// Sector-aware language
const sectorLabels: Record<string, { org: string; product: string; customer: string; goal: string }> = {
  'NGO / Social Enterprise': { org: 'organisation', product: 'programme', customer: 'beneficiary', goal: 'impact' },
  'Education': { org: 'institution', product: 'course', customer: 'student', goal: 'learning outcome' },
  'Healthcare / Wellness': { org: 'practice', product: 'service', customer: 'patient', goal: 'health outcome' },
  'default': { org: 'business', product: 'product', customer: 'customer', goal: 'revenue' },
}

const getSectorLabel = (sector: string | null, key: keyof typeof sectorLabels['default']) => {
  const match = Object.keys(sectorLabels).find(k => sector?.includes(k.split(' ')[0]))
  return sectorLabels[match || 'default'][key]
}

const defaultPalettes = [
  { id: 'earthy', name: 'Savanna Earth', desc: 'Warm, natural, authentically African', colors: [{ name: 'Primary', hex: '#8B4513', label: 'Savanna Brown' }, { name: 'Secondary', hex: '#D4A853', label: 'Acacia Gold' }, { name: 'Accent', hex: '#2D6A4F', label: 'Forest Green' }, { name: 'Light', hex: '#F5ECD7', label: 'Cream Sand' }, { name: 'Dark', hex: '#1A0F0A', label: 'Deep Earth' }], bestFor: ['Healthcare', 'Agriculture', 'Restaurant', 'NGO'] },
  { id: 'modern', name: 'Modern Nairobi', desc: 'Clean, premium, urban professional', colors: [{ name: 'Primary', hex: '#1A1A2E', label: 'Midnight Navy' }, { name: 'Secondary', hex: '#E94560', label: 'Coral Rose' }, { name: 'Accent', hex: '#F5A623', label: 'Warm Gold' }, { name: 'Light', hex: '#F8F9FA', label: 'Pure White' }, { name: 'Dark', hex: '#0D0D1A', label: 'Deep Night' }], bestFor: ['Technology', 'Professional', 'Finance', 'E-Commerce'] },
  { id: 'botanical', name: 'Botanical Glow', desc: 'Fresh, natural, wellness-focused', colors: [{ name: 'Primary', hex: '#2D6A4F', label: 'Deep Green' }, { name: 'Secondary', hex: '#95D5B2', label: 'Mint Fresh' }, { name: 'Accent', hex: '#F4A261', label: 'Warm Peach' }, { name: 'Light', hex: '#F0FFF4', label: 'Soft Mint' }, { name: 'Dark', hex: '#1B4332', label: 'Forest Dark' }], bestFor: ['Healthcare', 'Education', 'NGO'] },
  { id: 'bold', name: 'Bold Impact', desc: 'Energetic, confident, market-leading', colors: [{ name: 'Primary', hex: '#C0392B', label: 'Power Red' }, { name: 'Secondary', hex: '#F39C12', label: 'Energy Orange' }, { name: 'Accent', hex: '#2C3E50', label: 'Deep Slate' }, { name: 'Light', hex: '#FDFEFE', label: 'Clean White' }, { name: 'Dark', hex: '#1A252F', label: 'Dark Slate' }], bestFor: ['E-Commerce', 'Restaurant', 'Technology'] },
  { id: 'custom', name: 'Custom Palette', desc: 'Your own brand colours', colors: [], bestFor: [] },
]

const fontPairings = [
  { id: 'elegant', heading: 'Playfair Display', body: 'Inter', mood: 'Elegant & Premium' },
  { id: 'modern', heading: 'Poppins', body: 'Open Sans', mood: 'Modern & Clean' },
  { id: 'natural', heading: 'Lora', body: 'Raleway', mood: 'Natural & Calm' },
  { id: 'bold', heading: 'Montserrat', body: 'Source Sans 3', mood: 'Bold & Confident' },
  { id: 'custom', heading: '', body: '', mood: 'Custom Fonts' },
]

const logoStyles = [
  { id: 'wordmark', name: 'Wordmark', desc: 'Text-based — timeless and versatile' },
  { id: 'icon', name: 'Icon + Wordmark', desc: 'Symbol + name — most recognisable' },
  { id: 'monogram', name: 'Monogram', desc: 'Initials-based — elegant and minimal' },
  { id: 'uploaded', name: 'My Logo', desc: 'Use your uploaded logo' },
]

export default function IdentityPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [strategy, setStrategy] = useState<BrandStrategy | null>(null)
  const [identity, setIdentity] = useState<any>(null)
  const [discovery, setDiscovery] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<any>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [selectedPalette, setSelectedPalette] = useState('earthy')
  const [selectedFont, setSelectedFont] = useState('elegant')
  const [selectedLogo, setSelectedLogo] = useState('wordmark')
  const [customColors, setCustomColors] = useState([
    { name: 'Primary', hex: '#F25C05', label: 'Brand Primary' },
    { name: 'Secondary', hex: '#D9910B', label: 'Brand Secondary' },
    { name: 'Accent', hex: '#1A7A6E', label: 'Brand Accent' },
    { name: 'Light', hex: '#F9F6F1', label: 'Background' },
    { name: 'Dark', hex: '#0F1D26', label: 'Dark' },
  ])
  const [customHeadingFont, setCustomHeadingFont] = useState('')
  const [customBodyFont, setCustomBodyFont] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'logo' | 'colors' | 'fonts' | 'preview'>('logo')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const businessName = discovery?.business_name || profile?.business_name || 'Your Brand'
  const sector = discovery?.sector || profile?.sector || ''
  const isPro = profile?.plan === 'pro' || profile?.plan === 'agency'

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [profileRes, strategyRes, identityRes, discoveryRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('brand_strategy').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('visual_identity').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('brand_discovery').select('business_name, sector, brand_personality, brand_words_desired').eq('user_id', user.id).maybeSingle(),
      ])
      setProfile(profileRes.data)
      setStrategy(strategyRes.data)
      setDiscovery(discoveryRes.data)
      if (identityRes.data) {
        setIdentity(identityRes.data)
        setSelectedPalette(identityRes.data.selected_palette || 'earthy')
        setSelectedFont(identityRes.data.selected_font || 'elegant')
        setSelectedLogo(identityRes.data.selected_logo_style || 'wordmark')
        if (identityRes.data.logo_url) setLogoUrl(identityRes.data.logo_url)
        if (identityRes.data.custom_colors) setCustomColors(identityRes.data.custom_colors)
        if (identityRes.data.custom_fonts) {
          setCustomHeadingFont(identityRes.data.custom_fonts.heading || '')
          setCustomBodyFont(identityRes.data.custom_fonts.body || '')
        }
        if (identityRes.data.ai_recommendations) setAiRecommendations(identityRes.data.ai_recommendations)
      } else if (discoveryRes.data?.sector) {
        const s = discoveryRes.data.sector
        const rec = defaultPalettes.find(p => p.bestFor.some(b => s.includes(b)))
        if (rec) setSelectedPalette(rec.id)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const saveIdentity = useCallback(async (overrides?: Record<string, unknown>) => {
    setSaving(true)
    const currentPalette = defaultPalettes.find(p => p.id === selectedPalette)
    const font = fontPairings.find(f => f.id === selectedFont)
    try {
      await fetch('/api/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_palette: selectedPalette,
          palette_colors: selectedPalette === 'custom' ? customColors : currentPalette?.colors,
          selected_font: selectedFont,
          heading_font: selectedFont === 'custom' ? customHeadingFont : font?.heading,
          body_font: selectedFont === 'custom' ? customBodyFont : font?.body,
          selected_logo_style: selectedLogo,
          logo_url: logoUrl,
          custom_colors: customColors,
          custom_fonts: { heading: customHeadingFont, body: customBodyFont },
          ai_recommendations: aiRecommendations,
          ...overrides,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    finally { setSaving(false) }
  }, [selectedPalette, selectedFont, selectedLogo, customColors, customHeadingFont, customBodyFont, logoUrl, aiRecommendations])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Logo must be under 5MB'); return }
    setUploadingLogo(true)
    const preview = URL.createObjectURL(file)
    setLogoPreview(preview)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const ext = file.name.split('.').pop()
      const path = `${user.id}/logo-${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from('brand-assets').upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('brand-assets').getPublicUrl(path)
      setLogoUrl(publicUrl)
      setSelectedLogo('uploaded')
      await saveIdentity({ logo_url: publicUrl, selected_logo_style: 'uploaded' })
    } catch (err) {
      console.error('Logo upload error:', err)
      alert('Upload failed. Please ensure the brand-assets storage bucket is created in Supabase.')
    } finally {
      setUploadingLogo(false)
    }
  }

  const generateAIRecommendations = async () => {
    setAiGenerating(true)
    try {
      const response = await fetch('/api/generate/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector, businessName,
          brandPersonality: discovery?.brand_personality,
          brandDesired: discovery?.brand_words_desired,
          currentPalette: selectedPalette,
          hasLogo: !!logoUrl,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setAiRecommendations(data.recommendations)
        if (data.recommendations?.palette) setSelectedPalette(data.recommendations.palette)
        if (data.recommendations?.font) setSelectedFont(data.recommendations.font)
        await saveIdentity({ ai_recommendations: data.recommendations })
      }
    } catch (err) {
      console.error('AI generation error:', err)
    } finally {
      setAiGenerating(false)
    }
  }

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopied(hex)
    setTimeout(() => setCopied(null), 1500)
  }

  const currentPaletteColors = selectedPalette === 'custom' ? customColors : (defaultPalettes.find(p => p.id === selectedPalette)?.colors || [])
  const currentFont = fontPairings.find(f => f.id === selectedFont)
  const headingFont = selectedFont === 'custom' ? customHeadingFont || 'Poppins' : currentFont?.heading || 'Poppins'
  const bodyFont = selectedFont === 'custom' ? customBodyFont || 'Inter' : currentFont?.body || 'Inter'

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" /></div>

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A7A6E]/15 flex items-center justify-center">
            <Palette className="w-5 h-5 text-[#1A7A6E]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">Visual Identity</h1>
            <p className="text-white/40 text-sm">Build your brand's visual system — logo, colours, typography</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saving && <div className="flex items-center gap-1.5 text-white/40 text-xs"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</div>}
          {saved && <div className="flex items-center gap-1.5 text-[#1A7A6E] text-xs"><Save className="w-3.5 h-3.5" /> Saved</div>}
          <button onClick={generateAIRecommendations} disabled={aiGenerating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F25C05]/10 border border-[#F25C05]/20 text-[#F25C05] text-xs font-medium hover:bg-[#F25C05]/20 transition-all disabled:opacity-40">
            {aiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            AI Recommend
          </button>
          <button onClick={() => saveIdentity()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A7A6E]/10 border border-[#1A7A6E]/20 text-[#1A7A6E] text-xs font-medium hover:bg-[#1A7A6E]/20 transition-all">
            <Save className="w-3.5 h-3.5" /> Save All
          </button>
        </div>
      </div>

      {/* AI Recommendations Banner */}
      {aiRecommendations && (
        <div className="bg-[#F25C05]/10 border border-[#F25C05]/20 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <Wand2 className="w-5 h-5 text-[#F25C05] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-[#F25C05] font-semibold text-sm mb-1">AI Brand Identity Recommendations</div>
              <p className="text-white/70 text-sm leading-relaxed">{aiRecommendations.reasoning}</p>
              {aiRecommendations.tips && (
                <div className="mt-3 space-y-1">
                  {aiRecommendations.tips.map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#F25C05] text-xs mt-0.5">→</span>
                      <span className="text-white/60 text-xs">{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setAiRecommendations(null)} className="text-white/20 hover:text-white/50 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Section tabs */}
      <div className="flex gap-1 bg-[#1A2E3D] border border-white/8 rounded-xl p-1 mb-8 w-fit">
        {[
          { id: 'logo', label: '🎨 Logo' },
          { id: 'colors', label: '🎨 Colours' },
          { id: 'fonts', label: '✍️ Typography' },
          { id: 'preview', label: '👁️ Preview' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSection(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === tab.id ? 'bg-[#F25C05]/10 text-[#F25C05] border border-[#F25C05]/20' : 'text-white/40 hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* LOGO SECTION */}
      {activeSection === 'logo' && (
        <div className="space-y-6">
          {/* Upload area */}
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
            <h2 className="text-white font-display font-semibold mb-2">Upload Your Logo</h2>
            <p className="text-white/40 text-sm mb-5">Upload your existing logo (PNG, SVG, JPG — max 5MB). If you don't have one yet, choose a logo style below.</p>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/15 hover:border-[#F25C05]/40 rounded-2xl p-8 text-center cursor-pointer transition-all group"
            >
              {uploadingLogo ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-[#F25C05] animate-spin" />
                  <p className="text-white/50 text-sm">Uploading your logo...</p>
                </div>
              ) : logoPreview || logoUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <img src={logoPreview || logoUrl || ''} alt="Logo" className="max-h-24 max-w-48 object-contain rounded-lg" />
                  <div>
                    <p className="text-[#1A7A6E] text-sm font-semibold">✓ Logo uploaded</p>
                    <p className="text-white/30 text-xs mt-1">Click to replace</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#F25C05]/10 flex items-center justify-center group-hover:bg-[#F25C05]/20 transition-all">
                    <Upload className="w-7 h-7 text-[#F25C05]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Click to upload your logo</p>
                    <p className="text-white/30 text-xs mt-1">PNG, SVG, JPG or WebP · Max 5MB</p>
                  </div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>

          {/* Logo style */}
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
            <h2 className="text-white font-display font-semibold mb-2">Logo Style Direction</h2>
            <p className="text-white/40 text-sm mb-5">If you don't have a logo yet, choose a style to guide your designer or AI generation.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {logoStyles.map((l) => {
                const isSelected = selectedLogo === l.id
                const isDisabled = l.id === 'uploaded' && !logoUrl
                return (
                  <button key={l.id} onClick={() => { if (!isDisabled) { setSelectedLogo(l.id); saveIdentity({ selected_logo_style: l.id }) } }}
                    disabled={isDisabled}
                    className={`text-left p-4 rounded-xl border transition-all ${isDisabled ? 'opacity-30 cursor-not-allowed border-white/5 bg-[#162330]' : isSelected ? 'border-[#1A7A6E]/50 bg-[#1A7A6E]/5' : 'border-white/8 bg-[#162330] hover:border-white/20'}`}>
                    <div className="h-12 bg-[#0F1D26] rounded-lg flex items-center justify-center mb-3">
                      {l.id === 'wordmark' && <span className="text-white font-bold text-sm" style={{ fontFamily: `${headingFont}, serif` }}>{businessName.split(' ')[0]}</span>}
                      {l.id === 'icon' && <div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-full bg-[#F25C05]" /><span className="text-white font-bold text-xs">{businessName.split(' ')[0]}</span></div>}
                      {l.id === 'monogram' && <span className="text-white font-bold text-xl" style={{ fontFamily: `${headingFont}, serif` }}>{businessName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}</span>}
                      {l.id === 'uploaded' && logoUrl && <img src={logoUrl} alt="Logo" className="max-h-10 max-w-24 object-contain" />}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-xs">{l.name}</span>
                      {isSelected && <CheckCircle className="w-3 h-3 text-[#1A7A6E]" />}
                    </div>
                    <div className="text-white/30 text-[10px]">{l.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* COLOURS SECTION */}
      {activeSection === 'colors' && (
        <div className="space-y-6">
          {/* Preset palettes */}
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
            <h2 className="text-white font-display font-semibold mb-2">Choose a Colour Palette</h2>
            <p className="text-white/40 text-sm mb-5">Select a preset or choose "Custom" to enter your own brand colours.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {defaultPalettes.map((p) => {
                const isSelected = selectedPalette === p.id
                return (
                  <button key={p.id} onClick={() => { setSelectedPalette(p.id); saveIdentity({ selected_palette: p.id, palette_colors: p.id === 'custom' ? customColors : p.colors }) }}
                    className={`text-left rounded-xl border p-4 transition-all ${isSelected ? 'border-[#1A7A6E]/50 bg-[#1A7A6E]/5' : 'border-white/8 bg-[#162330] hover:border-white/20'}`}>
                    {p.id !== 'custom' ? (
                      <div className="flex gap-1 mb-3">
                        {p.colors.map(c => <div key={c.hex} className="flex-1 h-7 rounded-lg" style={{ backgroundColor: c.hex }} />)}
                      </div>
                    ) : (
                      <div className="flex gap-1 mb-3">
                        {customColors.map(c => <div key={c.hex} className="flex-1 h-7 rounded-lg" style={{ backgroundColor: c.hex }} />)}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{p.name}</span>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#1A7A6E]" />}
                    </div>
                    <div className="text-white/30 text-xs mt-0.5">{p.desc}</div>
                  </button>
                )
              })}
            </div>

            {/* Custom colour editor */}
            {selectedPalette === 'custom' && (
              <div className="bg-[#162330] border border-white/8 rounded-xl p-5">
                <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Your Custom Colours</div>
                <div className="space-y-3">
                  {customColors.map((color, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input type="color" value={color.hex}
                        onChange={e => {
                          const updated = [...customColors]
                          updated[i] = { ...updated[i], hex: e.target.value }
                          setCustomColors(updated)
                        }}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <div className="flex-1">
                        <input type="text" value={color.hex}
                          onChange={e => {
                            const updated = [...customColors]
                            updated[i] = { ...updated[i], hex: e.target.value }
                            setCustomColors(updated)
                          }}
                          className="w-full bg-[#0F1D26] border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#F25C05]/60 transition-all"
                          placeholder="#000000"
                        />
                      </div>
                      <input type="text" value={color.label}
                        onChange={e => {
                          const updated = [...customColors]
                          updated[i] = { ...updated[i], label: e.target.value }
                          setCustomColors(updated)
                        }}
                        className="w-32 bg-[#0F1D26] border border-white/10 rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none focus:border-[#F25C05]/60 transition-all"
                        placeholder="Colour name"
                      />
                      <span className="text-white/30 text-xs w-16">{color.name}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => saveIdentity({ custom_colors: customColors, palette_colors: customColors })}
                  className="mt-4 flex items-center gap-2 bg-[#F25C05]/10 border border-[#F25C05]/20 text-[#F25C05] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#F25C05]/20 transition-all">
                  <Save className="w-3.5 h-3.5" /> Save Custom Colours
                </button>
              </div>
            )}
          </div>

          {/* Colour detail */}
          {currentPaletteColors.length > 0 && (
            <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
              <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Colour Details — Click to Copy Hex Code</div>
              <div className="grid grid-cols-5 gap-3">
                {currentPaletteColors.map((c) => (
                  <div key={c.hex} className="text-center">
                    <button onClick={() => copyHex(c.hex)}
                      className="w-full aspect-square rounded-xl mb-2 relative group transition-transform hover:scale-105 shadow-lg"
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
            </div>
          )}
        </div>
      )}

      {/* FONTS SECTION */}
      {activeSection === 'fonts' && (
        <div className="space-y-6">
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
            <h2 className="text-white font-display font-semibold mb-2">Typography</h2>
            <p className="text-white/40 text-sm mb-5">Choose a font pairing or enter your own brand fonts.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {fontPairings.map((f) => {
                const isSelected = selectedFont === f.id
                return (
                  <button key={f.id} onClick={() => { setSelectedFont(f.id); saveIdentity({ selected_font: f.id, heading_font: f.heading, body_font: f.body }) }}
                    className={`text-left rounded-xl border p-5 transition-all ${isSelected ? 'border-[#1A7A6E]/50 bg-[#1A7A6E]/5' : 'border-white/8 bg-[#162330] hover:border-white/20'}`}>
                    {f.id !== 'custom' ? (
                      <div className="mb-3">
                        <div className="text-white text-lg font-bold mb-1" style={{ fontFamily: `${f.heading}, serif` }}>{f.heading}</div>
                        <div className="text-white/50 text-sm" style={{ fontFamily: `${f.body}, sans-serif` }}>{f.body} — body</div>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <div className="text-white text-sm font-bold mb-1">{customHeadingFont || 'Custom Heading'}</div>
                        <div className="text-white/50 text-xs">{customBodyFont || 'Custom Body'}</div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 text-xs">{f.mood}</span>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#1A7A6E]" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Custom font input */}
            {selectedFont === 'custom' && (
              <div className="bg-[#162330] border border-white/8 rounded-xl p-5">
                <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Your Custom Fonts</div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Heading Font</label>
                    <input type="text" value={customHeadingFont} onChange={e => setCustomHeadingFont(e.target.value)}
                      placeholder="e.g. Playfair Display, Georgia"
                      className="w-full bg-[#0F1D26] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F25C05]/60 transition-all" />
                    <p className="text-white/20 text-xs mt-1">Use Google Fonts name or system font</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Body Font</label>
                    <input type="text" value={customBodyFont} onChange={e => setCustomBodyFont(e.target.value)}
                      placeholder="e.g. Inter, Open Sans"
                      className="w-full bg-[#0F1D26] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F25C05]/60 transition-all" />
                  </div>
                </div>
                <button onClick={() => saveIdentity({ selected_font: 'custom', heading_font: customHeadingFont, body_font: customBodyFont })}
                  className="mt-4 flex items-center gap-2 bg-[#F25C05]/10 border border-[#F25C05]/20 text-[#F25C05] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#F25C05]/20 transition-all">
                  <Save className="w-3.5 h-3.5" /> Save Custom Fonts
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PREVIEW SECTION */}
      {activeSection === 'preview' && (
        <div className="space-y-6">
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
            <h2 className="text-white font-display font-semibold mb-5">Brand Identity Preview</h2>
            {/* Mock brand card */}
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: currentPaletteColors[3]?.hex || '#F9F6F1' }}>
              {/* Header */}
              <div className="p-6" style={{ backgroundColor: currentPaletteColors[0]?.hex || '#0F1D26' }}>
                <div className="flex items-center gap-3 mb-4">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-10 object-contain" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: currentPaletteColors[1]?.hex || '#D9910B' }}>
                      <span className="text-white font-bold text-sm">{businessName[0]}</span>
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-lg" style={{ fontFamily: `${headingFont}, serif`, color: currentPaletteColors[3]?.hex || '#FFFFFF' }}>
                      {businessName}
                    </div>
                    {strategy?.tagline && (
                      <div className="text-sm opacity-70" style={{ fontFamily: `${bodyFont}, sans-serif`, color: currentPaletteColors[3]?.hex || '#FFFFFF' }}>
                        {strategy.tagline}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Body */}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: `${headingFont}, serif`, color: currentPaletteColors[4]?.hex || '#1A1A1A' }}>
                  {strategy?.positioning_statement ? 'Our Promise' : 'Welcome'}
                </h3>
                <p className="text-base leading-relaxed mb-4" style={{ fontFamily: `${bodyFont}, sans-serif`, color: currentPaletteColors[4]?.hex || '#444444', opacity: 0.8 }}>
                  {strategy?.elevator_pitch || `${businessName} is committed to delivering exceptional value to every ${getSectorLabel(sector, 'customer')} we serve.`}
                </p>
                <button className="px-5 py-2.5 rounded-xl font-semibold text-sm" style={{ backgroundColor: currentPaletteColors[2]?.hex || '#F25C05', color: '#FFFFFF', fontFamily: `${bodyFont}, sans-serif` }}>
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Colour swatches */}
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Your Brand Colours</div>
            <div className="flex gap-3 flex-wrap">
              {currentPaletteColors.map(c => (
                <div key={c.hex} className="flex items-center gap-2 bg-[#162330] rounded-xl px-3 py-2">
                  <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: c.hex }} />
                  <div>
                    <div className="text-white text-xs font-mono">{c.hex}</div>
                    <div className="text-white/30 text-[10px]">{c.label}</div>
                  </div>
                  <button onClick={() => copyHex(c.hex)} className="text-white/20 hover:text-white/60 transition-colors ml-1">
                    {copied === c.hex ? <CheckCircle className="w-3 h-3 text-[#1A7A6E]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Typography preview */}
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6">
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Typography Preview</div>
            <div className="bg-[#162330] rounded-xl p-5 space-y-3">
              <div className="text-3xl font-bold text-white" style={{ fontFamily: `${headingFont}, serif` }}>{headingFont}</div>
              <div className="text-lg text-white/70" style={{ fontFamily: `${headingFont}, serif` }}>Heading — {businessName}</div>
              <div className="text-base text-white/50 leading-relaxed" style={{ fontFamily: `${bodyFont}, sans-serif` }}>
                {bodyFont} — Body text. {strategy?.elevator_pitch?.slice(0, 100) || `Professional ${getSectorLabel(sector, 'org')} serving ${getSectorLabel(sector, 'customer')}s across East Africa.`}
              </div>
            </div>
          </div>

          {/* Brand guidelines CTA */}
          <div className="bg-gradient-to-br from-[#1A7A6E]/10 to-[#1A2E3D] border border-[#1A7A6E]/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-display font-semibold">Brand Guidelines Document</h2>
              {!isPro && <span className="bg-[#D9910B]/10 text-[#D9910B] text-xs font-bold px-3 py-1 rounded-full border border-[#D9910B]/20">Pro Feature</span>}
            </div>
            <p className="text-white/50 text-sm mb-4">Download your complete brand guidelines — colour codes, typography rules, logo usage, and do's & don'ts.</p>
            <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${isPro ? 'bg-[#1A7A6E] hover:bg-[#22A090] text-white' : 'bg-[#1A2E3D] border border-white/10 text-white/30 cursor-not-allowed'}`}>
              {isPro ? '📄 Download Brand Guidelines PDF' : '🔒 Upgrade to Pro to Download'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}