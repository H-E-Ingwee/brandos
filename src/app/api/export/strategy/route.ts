import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    // Fetch all brand data
    const [profileRes, discoveryRes, strategyRes, identityRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('brand_discovery').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('brand_strategy').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('visual_identity').select('*').eq('user_id', user.id).maybeSingle(),
    ])

    const profile = profileRes.data
    const discovery = discoveryRes.data
    const strategy = strategyRes.data
    const identity = identityRes.data

    if (!strategy?.positioning_statement) {
      return NextResponse.json({ error: 'Generate your brand strategy first before exporting.' }, { status: 400 })
    }

    const businessName = discovery?.business_name || profile?.business_name || 'Your Brand'
    const primaryColor = identity?.palette_colors?.[0]?.hex || '#F25C05'
    const date = new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })

    // Generate HTML-based PDF (using browser print)
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${businessName} — Brand Strategy</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #fff; color: #1A1A1A; }
  .page { max-width: 800px; margin: 0 auto; padding: 0; }

  /* Cover */
  .cover { background: #0F1D26; color: white; padding: 60px 50px; min-height: 280px; position: relative; overflow: hidden; }
  .cover::after { content: ''; position: absolute; top: -80px; right: -80px; width: 300px; height: 300px; background: ${primaryColor}; opacity: 0.08; border-radius: 50%; }
  .cover-badge { display: inline-block; background: ${primaryColor}20; border: 1px solid ${primaryColor}40; color: ${primaryColor}; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 14px; border-radius: 20px; margin-bottom: 20px; }
  .cover h1 { font-family: 'Poppins', sans-serif; font-size: 36px; font-weight: 800; color: white; line-height: 1.1; margin-bottom: 8px; }
  .cover h2 { font-size: 18px; font-weight: 400; color: rgba(255,255,255,0.5); margin-bottom: 30px; }
  .cover-meta { display: flex; gap: 30px; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
  .cover-meta-item { font-size: 12px; color: rgba(255,255,255,0.4); }
  .cover-meta-item strong { display: block; color: rgba(255,255,255,0.8); font-size: 13px; margin-bottom: 2px; }
  .accent-bar { height: 4px; background: linear-gradient(90deg, ${primaryColor}, #D9910B); }

  /* Content */
  .content { padding: 50px; }
  .section { margin-bottom: 40px; page-break-inside: avoid; }
  .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #F5F1EB; }
  .section-number { width: 32px; height: 32px; background: ${primaryColor}; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 14px; flex-shrink: 0; }
  .section-title { font-family: 'Poppins', sans-serif; font-size: 18px; font-weight: 700; color: #0F1D26; }

  /* Cards */
  .card { background: #F9F6F1; border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 4px solid ${primaryColor}; }
  .card-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${primaryColor}; margin-bottom: 8px; }
  .card-content { font-size: 14px; line-height: 1.7; color: #444; }
  .card-content strong { color: #1A1A1A; }

  /* Positioning */
  .positioning-box { background: #0F1D26; color: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
  .positioning-box p { font-size: 15px; line-height: 1.7; font-style: italic; color: rgba(255,255,255,0.85); }

  /* Personas */
  .persona-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .persona-card { background: #F9F6F1; border-radius: 12px; padding: 18px; }
  .persona-name { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 14px; color: #0F1D26; margin-bottom: 4px; }
  .persona-meta { font-size: 12px; color: #888; margin-bottom: 10px; }
  .persona-detail { font-size: 12px; color: #555; line-height: 1.5; margin-bottom: 6px; }
  .persona-detail strong { color: #333; }
  .trait-list { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
  .trait { background: ${primaryColor}15; color: ${primaryColor}; font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 20px; }

  /* Messages */
  .message-list { list-style: none; }
  .message-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #F0EDE8; }
  .message-item:last-child { border-bottom: none; }
  .message-num { width: 22px; height: 22px; background: ${primaryColor}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
  .message-text { font-size: 13px; line-height: 1.6; color: #444; }

  /* Tone */
  .tone-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .tone-tag { background: #1A7A6E15; color: #1A7A6E; border: 1px solid #1A7A6E30; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; }

  /* Differentiation */
  .diff-item { display: flex; gap: 14px; padding: 14px; background: #F9F6F1; border-radius: 10px; margin-bottom: 10px; }
  .diff-dot { width: 10px; height: 10px; background: ${primaryColor}; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
  .diff-label { font-weight: 700; font-size: 13px; color: #0F1D26; margin-bottom: 3px; }
  .diff-desc { font-size: 12px; color: #666; line-height: 1.5; }

  /* Footer */
  .footer { background: #0F1D26; color: rgba(255,255,255,0.4); padding: 20px 50px; font-size: 11px; display: flex; justify-content: space-between; align-items: center; }
  .footer strong { color: ${primaryColor}; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page-break { page-break-before: always; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- COVER -->
  <div class="cover">
    <div class="cover-badge">Brand Strategy Document</div>
    <h1>${businessName}</h1>
    <h2>Complete Brand Strategy & Identity Framework</h2>
    <div class="cover-meta">
      <div class="cover-meta-item"><strong>Generated</strong>${date}</div>
      <div class="cover-meta-item"><strong>Sector</strong>${discovery?.sector || 'General'}</div>
      <div class="cover-meta-item"><strong>Brand Score</strong>${strategy.brand_score || 0}/100</div>
      <div class="cover-meta-item"><strong>Powered by</strong>BrandOS by Ingweplex</div>
    </div>
  </div>
  <div class="accent-bar"></div>

  <div class="content">

    <!-- POSITIONING -->
    <div class="section">
      <div class="section-header">
        <div class="section-number">1</div>
        <div class="section-title">Brand Positioning Statement</div>
      </div>
      <div class="positioning-box">
        <p>"${strategy.positioning_statement}"</p>
      </div>
      ${strategy.tagline ? `
      <div class="card">
        <div class="card-label">Brand Tagline</div>
        <div class="card-content" style="font-size:18px;font-weight:700;color:#0F1D26;font-family:'Poppins',sans-serif;">${strategy.tagline}</div>
      </div>` : ''}
      ${strategy.elevator_pitch ? `
      <div class="card">
        <div class="card-label">Elevator Pitch</div>
        <div class="card-content">${strategy.elevator_pitch}</div>
      </div>` : ''}
    </div>

    <!-- PERSONAS -->
    ${strategy.personas && Array.isArray(strategy.personas) && strategy.personas.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <div class="section-number">2</div>
        <div class="section-title">Customer Personas (${strategy.personas.length})</div>
      </div>
      <div class="persona-grid">
        ${(strategy.personas as any[]).map((p: any) => `
        <div class="persona-card">
          <div class="persona-name">${p.name || 'Persona'}</div>
          <div class="persona-meta">${p.age || ''} · ${p.location || ''}</div>
          ${p.income ? `<div class="persona-detail"><strong>Income:</strong> ${p.income}</div>` : ''}
          ${p.channel ? `<div class="persona-detail"><strong>Channels:</strong> ${p.channel}</div>` : ''}
          ${p.pain ? `<div class="persona-detail"><strong>Pain point:</strong> ${p.pain}</div>` : ''}
          ${p.traits && p.traits.length > 0 ? `
          <div class="trait-list">
            ${p.traits.map((t: string) => `<span class="trait">${t}</span>`).join('')}
          </div>` : ''}
        </div>`).join('')}
      </div>
    </div>` : ''}

    <!-- MESSAGING -->
    ${(strategy.key_messages && strategy.key_messages.length > 0) || (strategy.tone_of_voice && strategy.tone_of_voice.length > 0) ? `
    <div class="section">
      <div class="section-header">
        <div class="section-number">3</div>
        <div class="section-title">Messaging Framework</div>
      </div>
      ${strategy.key_messages && strategy.key_messages.length > 0 ? `
      <div class="card">
        <div class="card-label">Key Messages</div>
        <ul class="message-list">
          ${strategy.key_messages.map((m: string, i: number) => `
          <li class="message-item">
            <div class="message-num">${i + 1}</div>
            <div class="message-text">${m}</div>
          </li>`).join('')}
        </ul>
      </div>` : ''}
      ${strategy.tone_of_voice && strategy.tone_of_voice.length > 0 ? `
      <div class="card">
        <div class="card-label">Tone of Voice</div>
        <div class="tone-grid">
          ${strategy.tone_of_voice.map((t: string) => `<span class="tone-tag">${t}</span>`).join('')}
        </div>
      </div>` : ''}
    </div>` : ''}

    <!-- COMPETITIVE ADVANTAGE -->
    ${strategy.competitive_advantage || (strategy.differentiation_points && Array.isArray(strategy.differentiation_points) && strategy.differentiation_points.length > 0) ? `
    <div class="section">
      <div class="section-header">
        <div class="section-number">4</div>
        <div class="section-title">Competitive Advantage</div>
      </div>
      ${strategy.competitive_advantage ? `
      <div class="card">
        <div class="card-label">Core Advantage</div>
        <div class="card-content">${strategy.competitive_advantage}</div>
      </div>` : ''}
      ${strategy.differentiation_points && Array.isArray(strategy.differentiation_points) ? (strategy.differentiation_points as any[]).map((p: any) => `
      <div class="diff-item">
        <div class="diff-dot"></div>
        <div>
          <div class="diff-label">${p.label}</div>
          <div class="diff-desc">${p.desc}</div>
        </div>
      </div>`).join('') : ''}
    </div>` : ''}

  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div><strong>${businessName}</strong> · Brand Strategy Document · ${date}</div>
    <div>Generated by <strong>BrandOS</strong> · Powered by Ingweplex · brandosapp.vercel.app</div>
  </div>

</div>

<script>
  // Auto-trigger print dialog
  window.onload = function() {
    setTimeout(function() { window.print(); }, 500);
  };
</script>
</body>
</html>`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error: any) {
    console.error('PDF export error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}