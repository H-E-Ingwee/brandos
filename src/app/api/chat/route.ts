import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chat, buildSystemPrompt } from '@/lib/gemini'
import { z } from 'zod'

const schema = z.object({
  message: z.string().min(1).max(2000),
  module: z.string().optional().default('general'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
})

const PLAN_QUERY_LIMITS: Record<string, number> = {
  free: 10,
  growth: 50,
  pro: -1,
  agency: -1,
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Parse and validate body
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    const { message, module, history } = parsed.data

    // Get user profile + brand data
    const [profileResult, discoveryResult, strategyResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('brand_discovery').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('brand_strategy').select('*').eq('user_id', user.id).maybeSingle(),
    ])

    const profile = profileResult.data
    const discovery = discoveryResult.data

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check AI query limit
    const limit = PLAN_QUERY_LIMITS[profile.plan] ?? 10
    if (limit !== -1 && profile.ai_queries_used >= limit) {
      return NextResponse.json({
        error: 'AI query limit reached',
        message: `You have used all ${limit} AI queries on your ${profile.plan} plan. Upgrade to get more.`,
        upgrade_required: true,
      }, { status: 429 })
    }

    // Build system prompt with user context
    const systemPrompt = buildSystemPrompt(profile, discovery)

    // Build full message history
    const messages = [
      ...history,
      { role: 'user' as const, content: message },
    ]

    // Call Gemini
    const response = await chat(messages, systemPrompt)

    // Save message to chat history
    await supabase.from('chat_messages').insert([
      { user_id: user.id, role: 'user', content: message, module },
      { user_id: user.id, role: 'assistant', content: response, module },
    ])

    // Increment AI query count
    await supabase.from('profiles')
      .update({ ai_queries_used: profile.ai_queries_used + 1 })
      .eq('id', user.id)

    return NextResponse.json({
      response,
      queries_used: profile.ai_queries_used + 1,
      queries_limit: limit,
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    )
  }
}