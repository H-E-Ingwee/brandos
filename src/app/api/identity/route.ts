import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  selected_palette: z.string().optional(),
  palette_colors: z.array(z.object({
    name: z.string(),
    hex: z.string(),
    label: z.string(),
  })).optional(),
  selected_font: z.string().optional(),
  heading_font: z.string().optional(),
  body_font: z.string().optional(),
  selected_logo_style: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: identity } = await supabase
      .from('visual_identity')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ identity })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch identity' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

    const { data: identity, error } = await supabase
      .from('visual_identity')
      .upsert({ user_id: user.id, ...parsed.data }, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Failed to save identity' }, { status: 500 })

    return NextResponse.json({ identity })
  } catch {
    return NextResponse.json({ error: 'Failed to save identity' }, { status: 500 })
  }
}