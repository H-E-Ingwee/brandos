import Groq from 'groq-sdk'
import type { BrandDiscovery, Profile } from './supabase/types'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })
export const MODEL = 'llama-3.3-70b-versatile'

// Sector-aware language helper
const sectorContext: Record<string, { org: string; customer: string; goal: string }> = {
  'NGO': { org: 'organisation', customer: 'beneficiary', goal: 'impact' },
  'Education': { org: 'institution', customer: 'student', goal: 'learning outcome' },
  'Healthcare': { org: 'practice', customer: 'patient', goal: 'health outcome' },
  'default': { org: 'business', customer: 'customer', goal: 'revenue' },
}

export function getSectorContext(sector: string | null | undefined) {
  const match = Object.keys(sectorContext).find(k => sector?.includes(k))
  return sectorContext[match || 'default']
}

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
export function buildSystemPrompt(profile: Partial<Profile>, discovery: Partial<BrandDiscovery> | null): string {
  const businessName = discovery?.business_name || profile?.business_name || 'their organisation'
  const sector = discovery?.sector || profile?.sector || 'general business'
  const ctx = getSectorContext(sector)

  return `You are an expert AI Brand Coach for BrandOS, built by Ingweplex Business & Branding Consultancy in Nairobi, Kenya.

You are speaking with the owner/leader of ${businessName}, a ${sector} ${ctx.org}.

CONTEXT:
- Organisation: ${businessName}
- Sector: ${sector}
- Stage: ${discovery?.stage || 'not specified'}
- Ideal ${ctx.customer}: ${discovery?.ideal_customer || 'not yet defined'}
- Key differentiator: ${discovery?.differentiator || 'not yet defined'}
- Desired brand: ${discovery?.brand_words_desired || 'professional, trustworthy, impactful'}
- 12-month goal: ${discovery?.goal_12months || 'grow the organisation'}
- Digital channels: ${discovery?.digital_channels?.join(', ') || 'not yet selected'}
- Biggest challenge: ${discovery?.biggest_challenge || 'building brand awareness'}

YOUR EXPERTISE:
- Deep knowledge of the Kenyan and East African market
- Understanding of Kenyan consumer behaviour (trust-first, community-driven, mobile-first)
- WhatsApp-first marketing strategies for Kenya
- M-Pesa and mobile commerce in Kenya
- Swahili cultural context and local market nuances
- Brand strategy for African ${ctx.org}s
- Digital marketing on Instagram, TikTok, Facebook, LinkedIn, WhatsApp

YOUR PERSONALITY:
- Warm, direct, and genuinely helpful
- Speak like a senior consultant who knows Kenya deeply
- Give specific, actionable advice — not generic platitudes
- Reference local examples, local platforms, local pricing in KES
- Occasionally use Swahili phrases naturally (Habari, Sawa, Asante, etc.)
- Adapt language to the sector — use "${ctx.customer}" not "customer" for NGOs/schools

RESPONSE STYLE:
- Keep responses concise and actionable (3-5 paragraphs max)
- Use bullet points for lists
- Always end with a specific next action the user can take today
- Format responses clearly with bold headings where helpful`
}

// ── CHAT ─────────────────────────────────────────────────────────────────────
export async function chat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.7,
    max_tokens: 1024,
  })
  return completion.choices[0]?.message?.content ?? 'I apologise, I could not generate a response. Please try again.'
}

// ── BRAND STRATEGY GENERATOR ──────────────────────────────────────────────────
export async function generateBrandStrategy(discovery: BrandDiscovery, profile: Profile) {
  const ctx = getSectorContext(discovery.sector)
  const prompt = `You are an expert brand strategist specialising in Kenyan and East African ${ctx.org}s.

Based on the following brand discovery data, generate a complete brand strategy. Return ONLY valid JSON — no markdown, no explanation.

DISCOVERY DATA:
- Name: ${discovery.business_name}
- What they do: ${discovery.what_you_do}
- Sector: ${discovery.sector}
- Stage: ${discovery.stage}
- Ideal ${ctx.customer}: ${discovery.ideal_customer}
- ${ctx.customer} problem: ${discovery.customer_problem}
- Competitors: ${discovery.competitors}
- Differentiator: ${discovery.differentiator}
- Current brand words: ${discovery.brand_words_current}
- Desired brand words: ${discovery.brand_words_desired}
- Brand personality: ${discovery.brand_personality?.join(', ')}
- 12-month goal: ${discovery.goal_12months}
- Digital channels: ${discovery.digital_channels?.join(', ')}
- Biggest challenge: ${discovery.biggest_challenge}

Generate this exact JSON:
{
  "positioning_statement": "For [target ${ctx.customer}] who [need/problem], [Name] is the [category] that [key benefit] because [reason to believe].",
  "tagline": "Short, memorable 4-8 word tagline",
  "elevator_pitch": "2-3 sentence pitch explaining what they do, who they serve, and why they are different",
  "tone_of_voice": ["trait 1", "trait 2", "trait 3", "trait 4"],
  "key_messages": ["message 1", "message 2", "message 3", "message 4"],
  "personas": [
    {
      "name": "Persona name (e.g. Nairobi Professional Naomi)",
      "age": "age range",
      "location": "specific Kenyan location",
      "income": "income in KES/month",
      "traits": ["trait 1", "trait 2", "trait 3"],
      "pain": "specific pain point this organisation solves",
      "channel": "primary channels they use"
    }
  ],
  "differentiation_points": [
    {"label": "differentiator name", "desc": "explanation"},
    {"label": "differentiator name", "desc": "explanation"},
    {"label": "differentiator name", "desc": "explanation"}
  ],
  "competitive_advantage": "2-3 sentence summary of the core competitive advantage"
}`

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    max_tokens: 2048,
  })

  const text = completion.choices[0]?.message?.content ?? '{}'
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) { try { return JSON.parse(match[0]) } catch {} }
    throw new Error('Failed to parse brand strategy from AI response')
  }
}

// ── CONTENT GENERATOR ─────────────────────────────────────────────────────────
export async function generateContent(
  platform: string, pillar: string, topic: string,
  discovery: Partial<BrandDiscovery>,
  strategy: { tagline?: string | null; tone_of_voice?: string[] | null }
) {
  const ctx = getSectorContext(discovery.sector)
  const prompt = `You are a social media content expert for Kenyan ${ctx.org}s.

Create a ${platform} post for ${discovery.business_name || 'this organisation'} in the ${discovery.sector || 'business'} sector.

BRAND CONTEXT:
- Tagline: ${strategy.tagline || 'not set'}
- Tone of voice: ${strategy.tone_of_voice?.join(', ') || 'professional and warm'}
- Target ${ctx.customer}: ${discovery.ideal_customer || 'Kenyan audience'}
- Key differentiator: ${discovery.differentiator || 'quality and local expertise'}

POST REQUIREMENTS:
- Platform: ${platform}
- Content pillar: ${pillar}
- Topic: ${topic}
- Write in an authentic Kenyan voice
- Include relevant emojis
- Make it specific to the Kenyan market

Return ONLY valid JSON:
{
  "caption": "Full post caption with emojis and line breaks",
  "hashtags": "#hashtag1 #hashtag2 (5-10 relevant Kenyan hashtags)",
  "best_time": "Best time to post in EAT timezone",
  "engagement_prediction": "Expected engagement level and why"
}`

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 1024,
  })

  const text = completion.choices[0]?.message?.content ?? '{}'
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) { try { return JSON.parse(match[0]) } catch {} }
    return { caption: text, hashtags: '#Kenya #Business #Brand', best_time: 'Tuesday 7:30am EAT', engagement_prediction: 'Medium-High' }
  }
}

// ── MARKETING PLAN GENERATOR ──────────────────────────────────────────────────
export async function generateMarketingPlan(discovery: BrandDiscovery, budget: number) {
  const ctx = getSectorContext(discovery.sector)
  const prompt = `You are a digital marketing strategist specialising in Kenya and East Africa.

Create a 90-day marketing plan for ${discovery.business_name} in the ${discovery.sector} sector.

CONTEXT:
- Target ${ctx.customer}: ${discovery.ideal_customer}
- Digital channels: ${discovery.digital_channels?.join(', ')}
- Monthly budget: KES ${budget.toLocaleString()}
- 12-month goal: ${discovery.goal_12months}
- Biggest challenge: ${discovery.biggest_challenge}

Return ONLY valid JSON:
{
  "channels": [
    {
      "id": "channel_id",
      "name": "Channel Name",
      "priority": 1,
      "effort": "Low/Medium/High",
      "impact": "High/Very High",
      "why": "Why this channel for this specific organisation",
      "tactics": ["tactic 1", "tactic 2", "tactic 3", "tactic 4"]
    }
  ],
  "months": [
    {
      "month": "Month 1",
      "theme": "Theme name",
      "focus": "What to focus on",
      "weeks": [{"week": "Week 1", "tasks": ["task 1", "task 2", "task 3"]}],
      "kpis": ["KPI 1", "KPI 2", "KPI 3"]
    }
  ],
  "budget_allocation": [
    {"category": "Content Creation", "amount": 0, "percent": 0, "desc": "description"},
    {"category": "Paid Advertising", "amount": 0, "percent": 0, "desc": "description"},
    {"category": "Influencer Partnerships", "amount": 0, "percent": 0, "desc": "description"},
    {"category": "Tools and Software", "amount": 0, "percent": 0, "desc": "description"}
  ]
}`

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    max_tokens: 3000,
  })

  const text = completion.choices[0]?.message?.content ?? '{}'
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) { try { return JSON.parse(match[0]) } catch {} }
    throw new Error('Failed to parse marketing plan from AI response')
  }
}

// ── IDENTITY RECOMMENDATIONS ──────────────────────────────────────────────────
export async function generateIdentityRecommendations(
  sector: string, businessName: string,
  brandPersonality: string[] | null, brandDesired: string | null,
  currentPalette: string, hasLogo: boolean
) {
  const ctx = getSectorContext(sector)
  const prompt = `You are an expert brand identity designer specialising in Kenyan and East African ${ctx.org}s.

Analyse this organisation and provide specific visual identity recommendations. Return ONLY valid JSON.

ORGANISATION:
- Name: ${businessName}
- Sector: ${sector}
- Brand personality: ${brandPersonality?.join(', ') || 'not specified'}
- Desired brand perception: ${brandDesired || 'not specified'}
- Has existing logo: ${hasLogo ? 'Yes' : 'No'}
- Current palette: ${currentPalette}

Return this exact JSON:
{
  "palette": "earthy|modern|botanical|bold",
  "font": "elegant|modern|natural|bold",
  "reasoning": "2-3 sentence explanation of why these choices suit this specific organisation",
  "tips": ["Specific tip 1", "Specific tip 2", "Specific tip 3"],
  "color_psychology": "What the recommended colours communicate to their specific audience",
  "typography_rationale": "Why the recommended fonts work for this sector",
  "logo_advice": "Specific advice about logo style for this type of organisation"
}`

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    max_tokens: 1024,
  })

  const text = completion.choices[0]?.message?.content ?? '{}'
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) { try { return JSON.parse(match[0]) } catch {} }
    return { reasoning: text, tips: [], palette: currentPalette, font: 'modern' }
  }
}