import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMarketingPlan } from '@/lib/gemini'
import { z } from 'zod'

const schema = z.object({
  budget: z.number().min(1000).max(1000000).optional().default(25000),
  channels: z.array(z.string()).optional(),
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
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { budget, channels } = parsed.data

    // Get discovery data
    const { data: discovery, error: discoveryError } = await supabase
      .from('brand_discovery')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (discoveryError || !discovery || !discovery.completed) {
      return NextResponse.json(
        { error: 'Complete Brand Discovery first' },
        { status: 400 }
      )
    }

    // Generate marketing plan
    const planData = await generateMarketingPlan(discovery, budget)

    // Upsert to database
    const { data: savedPlan, error: saveError } = await supabase
      .from('marketing_plan')
      .upsert({
        user_id: user.id,
        monthly_budget: budget,
        selected_channels: channels || discovery.digital_channels || [],
        plan_data: planData,
        generated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (saveError) {
      console.error('Marketing plan save error:', saveError)
      return NextResponse.json({ error: 'Failed to save marketing plan' }, { status: 500 })
    }

    return NextResponse.json({ plan: savedPlan })

  } catch (error) {
    console.error('Marketing plan generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate marketing plan. Please try again.' },
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

    const { data: plan } = await supabase
      .from('marketing_plan')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ plan })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch marketing plan' }, { status: 500 })
  }
}