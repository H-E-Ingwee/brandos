import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateBrandStrategy } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Get discovery data
    const { data: discovery, error: discoveryError } = await supabase
      .from('brand_discovery')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (discoveryError || !discovery) {
      return NextResponse.json(
        { error: 'Complete Brand Discovery first before generating strategy' },
        { status: 400 }
      )
    }

    if (!discovery.completed) {
      return NextResponse.json(
        { error: 'Brand Discovery is not yet complete' },
        { status: 400 }
      )
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Generate strategy with Gemini
    const strategy = await generateBrandStrategy(discovery, profile)

    // Calculate brand score (based on completeness of discovery)
    const fields = [
      discovery.business_name, discovery.what_you_do, discovery.sector,
      discovery.stage, discovery.ideal_customer, discovery.customer_problem,
      discovery.competitors, discovery.differentiator, discovery.brand_words_current,
      discovery.brand_words_desired, discovery.goal_12months, discovery.biggest_challenge,
    ]
    const completedFields = fields.filter(f => f && f.trim().length > 0).length
    const brandScore = Math.round((completedFields / fields.length) * 60) + 20 // 20-80 range

    // Upsert strategy to database
    const { data: savedStrategy, error: saveError } = await supabase
      .from('brand_strategy')
      .upsert({
        user_id: user.id,
        ...strategy,
        brand_score: brandScore,
        generated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (saveError) {
      console.error('Strategy save error:', saveError)
      return NextResponse.json({ error: 'Failed to save strategy' }, { status: 500 })
    }

    // Update profile onboarding status
    await supabase.from('profiles')
      .update({ onboarding_complete: true })
      .eq('id', user.id)

    return NextResponse.json({ strategy: savedStrategy, brand_score: brandScore })

  } catch (error) {
    console.error('Strategy generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate brand strategy. Please try again.' },
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

    const { data: strategy } = await supabase
      .from('brand_strategy')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ strategy })

  } catch (error) {
    console.error('Strategy fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch strategy' }, { status: 500 })
  }
}