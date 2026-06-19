import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateContent } from '@/lib/gemini'
import { z } from 'zod'

const schema = z.object({
  platform: z.enum(['instagram', 'whatsapp', 'tiktok', 'linkedin', 'facebook', 'twitter']),
  pillar: z.enum(['education', 'community', 'promotion']),
  topic: z.string().min(3).max(200),
  save: z.boolean().optional().default(true),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    const { platform, pillar, topic, save } = parsed.data

    // Get discovery + strategy for context
    const [discoveryResult, strategyResult] = await Promise.all([
      supabase.from('brand_discovery').select('*').eq('user_id', user.id).single(),
      supabase.from('brand_strategy').select('tagline, tone_of_voice').eq('user_id', user.id).single(),
    ])

    const discovery = discoveryResult.data
    const strategy = strategyResult.data

    if (!discovery) {
      return NextResponse.json({ error: 'Complete Brand Discovery first' }, { status: 400 })
    }

    // Generate content
    const content = await generateContent(platform, pillar, topic, discovery, strategy || {})

    // Save to database if requested
    if (save) {
      await supabase.from('content_posts').insert({
        user_id: user.id,
        platform,
        pillar,
        post_type: topic,
        caption: content.caption,
        hashtags: content.hashtags,
        best_time: content.best_time,
        engagement_prediction: content.engagement_prediction,
        status: 'draft',
      })
    }

    return NextResponse.json({ content })

  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('content_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (platform) query = query.eq('platform', platform)
    if (status) query = query.eq('status', status)

    const { data: posts, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    return NextResponse.json({ posts })

  } catch (error) {
    console.error('Content fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}