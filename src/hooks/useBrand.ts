'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BrandDiscovery, BrandStrategy, VisualIdentity, MarketingPlan } from '@/lib/supabase/types'

export function useBrand(userId: string | undefined) {
  const [discovery, setDiscovery] = useState<BrandDiscovery | null>(null)
  const [strategy, setStrategy] = useState<BrandStrategy | null>(null)
  const [identity, setIdentity] = useState<VisualIdentity | null>(null)
  const [marketingPlan, setMarketingPlan] = useState<MarketingPlan | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!userId) return
    const supabase = createClient()
    setLoading(true)

    const [d, s, i, m] = await Promise.all([
      supabase.from('brand_discovery').select('*').eq('user_id', userId).single(),
      supabase.from('brand_strategy').select('*').eq('user_id', userId).single(),
      supabase.from('visual_identity').select('*').eq('user_id', userId).single(),
      supabase.from('marketing_plan').select('*').eq('user_id', userId).single(),
    ])

    setDiscovery(d.data)
    setStrategy(s.data)
    setIdentity(i.data)
    setMarketingPlan(m.data)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Calculate overall brand progress
  const progress = (() => {
    let score = 0
    if (discovery?.completed) score += 20
    if (strategy?.positioning_statement) score += 20
    if (identity?.selected_palette) score += 15
    if (marketingPlan?.plan_data) score += 20
    if (strategy?.brand_score && strategy.brand_score > 50) score += 15
    return Math.min(score, 100)
  })()

  // Module completion status
  const moduleStatus = {
    discovery: discovery?.completed ? 'complete' : discovery ? 'in-progress' : 'not-started',
    strategy: strategy?.positioning_statement ? 'complete' : discovery?.completed ? 'available' : 'locked',
    identity: identity?.selected_palette ? 'complete' : strategy?.positioning_statement ? 'available' : 'locked',
    marketing: marketingPlan?.plan_data ? 'complete' : strategy?.positioning_statement ? 'available' : 'locked',
    content: 'available', // always available once strategy exists
    analytics: 'available',
  }

  return {
    discovery,
    strategy,
    identity,
    marketingPlan,
    loading,
    progress,
    moduleStatus,
    refresh: fetchAll,
  }
}