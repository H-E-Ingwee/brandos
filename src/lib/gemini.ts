import Groq from 'groq-sdk'
import type { BrandDiscovery, Profile } from './supabase/types'

// Best free model on Groq — fast, smart, great for brand strategy
export const MODEL = 'llama-3.3-70b-versatile'

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY environment variable')
  }

  return new Groq({ apiKey })
}

// ── SYSTEM PROMPT BUILDER ─────────────────────────────────────────────────────
export function buildSystemPrompt(
  profile: Partial<Profile>,
  discovery: Partial<BrandDiscovery> | null
): string {
  const businessName = discovery?.business_name || profile?.business_name || 'their business'
  const sector = discovery?.sector || profile?.sector || 'general business'
  const stage = discovery?.stage || 'early stage'
  const idealCustomer = discovery?.ideal_customer || 'not yet defined'
  const differentiator = discovery?.differentiator || 'not yet defined'
  const brandDesired = discovery?.brand_words_desired || 'professional, trustworthy, impactful'
  const goal = discovery?.goal_12months || 'grow the business'
  const channels = discovery?.digital_channels?.join(', ') || 'not yet selected'
  const challenge = discovery?.biggest_challenge || 'building brand awareness'

  return `You are an expert AI Brand Coach for BrandOS, built by Ingweplex Business & Branding Consultancy in Nairobi, Kenya.

You are speaking with the owner of ${businessName}, a ${sector} business at the ${stage} stage.

BUSINESS CONTEXT:
- Business: ${businessName}
- Sector: ${sector}
- Stage: ${stage}
- Ideal customer: ${idealCustomer}
- Key differentiator: ${differentiator}
- Desired brand perception: ${brandDesired}
- 12-month goal: ${goal}
- Current digital channels: ${channels}
- Biggest challenge: ${challenge}

YOUR EXPERTISE:
- Deep knowledge of the Kenyan and East African market
- Understanding of Kenyan consumer behaviour (trust-first, community-driven, mobile-first)
- WhatsApp-first marketing strategies for Kenya
- M-Pesa and mobile commerce in Kenya
- Swahili cultural context and local market nuances
- Brand strategy for African SMEs
- Digital marketing on Instagram, TikTok, Facebook, LinkedIn, WhatsApp

YOUR PERSONALITY:
- Warm, direct, and genuinely helpful
- Speak like a senior consultant who knows Kenya deeply
- Give specific, actionable advice — not generic platitudes
- Reference local examples, local platforms, local pricing in KES
- Occasionally use Swahili phrases naturally (Habari, Sawa, Asante, etc.)
- Be honest — if something won't work in Kenya, say so

RESPONSE STYLE:
- Keep responses concise and actionable (3-5 paragraphs max)
- Use bullet points for lists
- Always end with a specific next action the user can take today
- Never give generic Western marketing advice without adapting it to Kenya`
}

// ── CHAT ─────────────────────────────────────────────────────────────────────
export async function chat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string
): Promise<string> {
  const groq = getGroqClient()

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
export async function generateBrandStrategy(
  discovery: BrandDiscovery,
  profile: Profile
): Promise<{
  positioning_statement: string
  tagline: string
  elevator_pitch: string
  tone_of_voice: string[]
  key_messages: string[]
  personas: object[]
  differentiation_points: object[]
  competitive_advantage: string
}> {
  const prompt = `You are an expert brand strategist specialising in Kenyan and East African businesses.

Based on the following brand discovery data, generate a complete brand strategy. Return ONLY valid JSON — no markdown, no explanation, just the JSON object.

DISCOVERY DATA:
- Business Name: ${discovery.business_name}
- What they do: ${discovery.what_you_do}
- Sector: ${discovery.sector}
- Stage: ${discovery.stage}
- Ideal Customer: ${discovery.ideal_customer}
- Customer Problem: ${discovery.customer_problem}
- Competitors: ${discovery.competitors}
- Differentiator: ${discovery.differentiator}
- Current Brand Words: ${discovery.brand_words_current}
- Desired Brand Words: ${discovery.brand_words_desired}
- Brand Personality: ${discovery.brand_personality?.join(', ')}
- 12-Month Goal: ${discovery.goal_12months}
- Digital Channels: ${discovery.digital_channels?.join(', ')}
- Biggest Challenge: ${discovery.biggest_challenge}

Generate this exact JSON structure:
{
  "positioning_statement": "For [target audience] who [need/problem], [Business Name] is the [category] that [key benefit] because [reason to believe].",
  "tagline": "Short, memorable 4-8 word tagline",
  "elevator_pitch": "2-3 sentence pitch that explains what they do, who they serve, and why they are different",
  "tone_of_voice": ["trait 1", "trait 2", "trait 3", "trait 4"],
  "key_messages": ["message 1", "message 2", "message 3", "message 4"],
  "personas": [
    {
      "name": "Persona name (e.g. Nairobi Professional Naomi)",
      "age": "age range",
      "location": "specific Kenyan location",
      "income": "income in KES/month",
      "traits": ["trait 1", "trait 2", "trait 3", "trait 4"],
      "pain": "specific pain point this business solves for them",
      "channel": "primary channels they use"
    }
  ],
  "differentiation_points": [
    {"label": "differentiator name", "desc": "explanation of this differentiator"},
    {"label": "differentiator name", "desc": "explanation"},
    {"label": "differentiator name", "desc": "explanation"}
  ],
  "competitive_advantage": "2-3 sentence summary of the core competitive advantage"
}`

  const groq = getGroqClient()

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
    // Try to extract JSON from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]) } catch {}
    }
    throw new Error('Failed to parse brand strategy from AI response')
  }
}

// ── CONTENT GENERATOR ─────────────────────────────────────────────────────────
export async function generateContent(
  platform: string,
  pillar: string,
  topic: string,
  discovery: Partial<BrandDiscovery>,
  strategy: { tagline?: string | null; tone_of_voice?: string[] | null }
): Promise<{
  caption: string
  hashtags: string
  best_time: string
  engagement_prediction: string
}> {
  const prompt = `You are a social media content expert for Kenyan businesses.

Create a ${platform} post for ${discovery.business_name || 'this business'} in the ${discovery.sector || 'business'} sector.

BRAND CONTEXT:
- Tagline: ${strategy.tagline || 'not set'}
- Tone of voice: ${strategy.tone_of_voice?.join(', ') || 'professional and warm'}
- Target customer: ${discovery.ideal_customer || 'Kenyan SME owners'}
- Key differentiator: ${discovery.differentiator || 'quality and local expertise'}

POST REQUIREMENTS:
- Platform: ${platform}
- Content pillar: ${pillar} (education=70%, community=20%, promotion=10%)
- Topic: ${topic}
- Write in an authentic Kenyan voice
- Include relevant emojis
- Make it specific to the Kenyan market

Return ONLY valid JSON (no markdown):
{
  "caption": "Full post caption with emojis and line breaks",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3 (5-10 relevant Kenyan hashtags)",
  "best_time": "Best time to post in EAT timezone",
  "engagement_prediction": "Expected engagement level and why"
}`

  const groq = getGroqClient()

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
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]) } catch {}
    }
    return {
      caption: text,
      hashtags: '#Kenya #Business #Brand',
      best_time: 'Tuesday 7:30am EAT',
      engagement_prediction: 'Medium-High engagement expected',
    }
  }
}

// ── MARKETING PLAN GENERATOR ──────────────────────────────────────────────────
export async function generateMarketingPlan(
  discovery: BrandDiscovery,
  budget: number
): Promise<object> {
  const prompt = `You are a digital marketing strategist specialising in Kenya and East Africa.

Create a 90-day marketing plan for ${discovery.business_name} in the ${discovery.sector} sector.

CONTEXT:
- Target customer: ${discovery.ideal_customer}
- Digital channels: ${discovery.digital_channels?.join(', ')}
- Monthly budget: KES ${budget.toLocaleString()}
- 12-month goal: ${discovery.goal_12months}
- Biggest challenge: ${discovery.biggest_challenge}

Return ONLY valid JSON (no markdown):
{
  "channels": [
    {
      "id": "channel_id",
      "name": "Channel Name",
      "priority": 1,
      "effort": "Low/Medium/High",
      "impact": "High/Very High",
      "why": "Why this channel for this specific business",
      "tactics": ["tactic 1", "tactic 2", "tactic 3", "tactic 4"]
    }
  ],
  "months": [
    {
      "month": "Month 1",
      "theme": "Theme name",
      "focus": "What to focus on",
      "weeks": [
        {
          "week": "Week 1",
          "tasks": ["task 1", "task 2", "task 3"]
        }
      ],
      "kpis": ["KPI 1", "KPI 2", "KPI 3", "KPI 4"]
    }
  ],
  "budget_allocation": [
    {"category": "Content Creation", "amount": 0, "percent": 0, "desc": "description"},
    {"category": "Paid Advertising", "amount": 0, "percent": 0, "desc": "description"},
    {"category": "Influencer Partnerships", "amount": 0, "percent": 0, "desc": "description"},
    {"category": "Tools & Software", "amount": 0, "percent": 0, "desc": "description"}
  ]
}`

  const groq = getGroqClient()

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
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]) } catch {}
    }
    throw new Error('Failed to parse marketing plan from AI response')
  }
}