export type Plan = 'free' | 'growth' | 'pro' | 'agency'

export interface Profile {
  id: string
  full_name: string | null
  business_name: string | null
  sector: string | null
  business_size: string | null
  location: string | null
  phone: string | null
  avatar_url: string | null
  plan: Plan
  ai_queries_used: number
  ai_queries_reset_at: string
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export interface BrandDiscovery {
  id: string
  user_id: string
  business_name: string | null
  what_you_do: string | null
  sector: string | null
  stage: string | null
  ideal_customer: string | null
  customer_problem: string | null
  competitors: string | null
  differentiator: string | null
  brand_words_current: string | null
  brand_words_desired: string | null
  brand_personality: string[] | null
  goal_12months: string | null
  digital_channels: string[] | null
  biggest_challenge: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Persona {
  name: string
  age: string
  location: string
  income: string
  traits: string[]
  pain: string
  channel: string
}

export interface BrandStrategy {
  id: string
  user_id: string
  positioning_statement: string | null
  tagline: string | null
  elevator_pitch: string | null
  tone_of_voice: string[] | null
  key_messages: string[] | null
  personas: Persona[] | null
  differentiation_points: { label: string; desc: string }[] | null
  competitive_advantage: string | null
  brand_score: number
  generated_at: string | null
  regenerated_count: number
  created_at: string
  updated_at: string
}

export interface VisualIdentity {
  id: string
  user_id: string
  selected_palette: string
  palette_colors: { name: string; hex: string; label: string }[] | null
  selected_font: string
  heading_font: string | null
  body_font: string | null
  selected_logo_style: string
  brand_guidelines_url: string | null
  created_at: string
  updated_at: string
}

export interface MarketingPlan {
  id: string
  user_id: string
  selected_channels: string[] | null
  monthly_budget: number
  plan_data: Record<string, unknown> | null
  generated_at: string | null
  created_at: string
  updated_at: string
}

export interface ContentPost {
  id: string
  user_id: string
  platform: string
  post_type: string | null
  pillar: 'education' | 'community' | 'promotion' | null
  caption: string
  hashtags: string | null
  best_time: string | null
  engagement_prediction: string | null
  scheduled_at: string | null
  published_at: string | null
  status: 'draft' | 'scheduled' | 'published'
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  module: string | null
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  amount: number
  currency: string
  plan: string
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  payment_method: string
  flutterwave_tx_ref: string | null
  flutterwave_tx_id: string | null
  phone_number: string | null
  created_at: string
  updated_at: string
}

export const PLAN_LIMITS = {
  free: {
    ai_queries: 10,
    modules: ['discovery'],
    can_export_pdf: false,
    can_schedule: false,
    max_content_posts: 5,
  },
  growth: {
    ai_queries: 50,
    modules: ['discovery', 'strategy', 'marketing'],
    can_export_pdf: true,
    can_schedule: false,
    max_content_posts: 30,
  },
  pro: {
    ai_queries: -1, // unlimited
    modules: ['discovery', 'strategy', 'identity', 'marketing', 'content', 'analytics'],
    can_export_pdf: true,
    can_schedule: true,
    max_content_posts: -1,
  },
  agency: {
    ai_queries: -1,
    modules: ['discovery', 'strategy', 'identity', 'marketing', 'content', 'analytics'],
    can_export_pdf: true,
    can_schedule: true,
    max_content_posts: -1,
  },
}