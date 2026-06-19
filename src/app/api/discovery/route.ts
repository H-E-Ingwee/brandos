import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  business_name: z.string().optional(),
  what_you_do: z.string().optional(),
  sector: z.string().optional(),
  stage: z.string().optional(),
  ideal_customer: z.string().optional(),
  customer_problem: z.string().optional(),
  competitors: z.string().optional(),
  differentiator: z.string().optional(),
  brand_words_current: z.string().optional(),
  brand_words_desired: z.string().optional(),
  brand_personality: z.array(z.string()).optional(),
  goal_12months: z.string().optional(),
  digital_channels: z.array(z.string()).optional(),
  biggest_challenge: z.string().optional(),
  completed: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { data: discovery } = await supabase
      .from('brand_discovery')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ discovery })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch discovery' }, { status: 500 })
  }
}

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
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { ...parsed.data, user_id: user.id }

    // If marking as completed, set completed_at
    if (parsed.data.completed) {
      updateData.completed_at = new Date().toISOString()
    }

    // Also update profile business_name if provided
    if (parsed.data.business_name) {
      await supabase.from('profiles')
        .update({ business_name: parsed.data.business_name })
        .eq('id', user.id)
    }

    const { data: discovery, error: upsertError } = await supabase
      .from('brand_discovery')
      .upsert(updateData, { onConflict: 'user_id' })
      .select()
      .single()

    if (upsertError) {
      console.error('Discovery upsert error:', upsertError)
      return NextResponse.json({ error: 'Failed to save discovery' }, { status: 500 })
    }

    return NextResponse.json({ discovery })
  } catch (error) {
    console.error('Discovery save error:', error)
    return NextResponse.json({ error: 'Failed to save discovery' }, { status: 500 })
  }
}