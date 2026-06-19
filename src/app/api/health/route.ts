import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createServiceClient()

    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Supabase query failed',
          details: error.message,
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Backend API is reachable',
      supabase: {
        connected: true,
        profileCount: count ?? 0,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Backend API failed to initialize',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
