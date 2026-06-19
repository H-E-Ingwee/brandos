import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

const sectorContext: Record<string, string> = {
  'NGO': 'non-profit organisation focused on social impact and community development',
  'Education': 'educational institution focused on learning outcomes and student success',
  'Healthcare': 'healthcare provider focused on patient wellbeing and health outcomes',
  'Technology': 'technology company focused on innovation and digital solutions',
  'E-Commerce': 'e-commerce business focused on customer experience and sales',
  'Restaurant': 'food and beverage business focused on dining experience',
  'Professional': 'professional services firm focused on expertise and client results',
  'Agriculture': 'agricultural business focused on food production and sustainability',
  'Finance': 'financial services provider focused on trust and financial wellbeing',
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const { sector, businessName, brandPersonality, brandDesired, currentPalette, hasLogo } = body

    const sectorDesc = Object.entries(sectorContext).find(([k]) => sector?.includes(k))?.[1] || 'business'

    const prompt = `You are an expert brand identity designer specialising in Kenyan and East African organisations.

Analyse this organisation and provide specific visual identity recommendations. Return ONLY valid JSON.

ORGANISATION:
- Name: ${businessName}
- Sector: ${sector} (${sectorDesc})
- Brand personality: ${brandPersonality?.join(', ') || 'not specified'}
- Desired brand perception: ${brandDesired || 'not specified'}
- Has existing logo: ${hasLogo ? 'Yes' : 'No'}
- Current palette selection: ${currentPalette}

Provide recommendations in this exact JSON format:
{
  "palette": "earthy|modern|botanical|bold|custom",
  "font": "elegant|modern|natural|bold",
  "reasoning": "2-3 sentence explanation of why these choices suit this specific organisation and sector",
  "tips": [
    "Specific actionable tip 1 for this organisation's visual identity",
    "Specific actionable tip 2",
    "Specific actionable tip 3"
  ],
  "color_psychology": "Brief explanation of what the recommended colours communicate to their specific audience",
  "typography_rationale": "Why the recommended fonts work for this sector and audience",
  "logo_advice": "Specific advice about logo style for this type of organisation"
}`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 1024,
    })

    const text = completion.choices[0]?.message?.content || '{}'
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let recommendations
    try {
      recommendations = JSON.parse(cleaned)
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/)
      recommendations = match ? JSON.parse(match[0]) : { reasoning: text, tips: [], palette: currentPalette, font: 'modern' }
    }

    return NextResponse.json({ recommendations })
  } catch (error: any) {
    console.error('Identity AI error:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}