import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateIdentityRecommendations } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const { sector, businessName, brandPersonality, brandDesired, currentPalette, hasLogo } = body

    const recommendations = await generateIdentityRecommendations(
      sector || '', businessName || 'Your Organisation',
      brandPersonality, brandDesired, currentPalette || 'earthy', hasLogo || false
    )

    return NextResponse.json({ recommendations })
  } catch (error: any) {
    console.error('Identity AI error:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}