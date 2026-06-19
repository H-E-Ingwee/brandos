-- ============================================================
-- BrandOS Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with business information
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  business_name text,
  sector text,
  business_size text,
  location text default 'Nairobi, Kenya',
  phone text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'growth', 'pro', 'agency')),
  ai_queries_used integer not null default 0,
  ai_queries_reset_at timestamptz default now(),
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── BRAND DISCOVERY ───────────────────────────────────────────────────────────
-- Stores all 14 questionnaire answers
create table if not exists public.brand_discovery (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  business_name text,
  what_you_do text,
  sector text,
  stage text,
  ideal_customer text,
  customer_problem text,
  competitors text,
  differentiator text,
  brand_words_current text,
  brand_words_desired text,
  brand_personality text[], -- array of selected traits
  goal_12months text,
  digital_channels text[], -- array of selected channels
  biggest_challenge text,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── BRAND STRATEGY ────────────────────────────────────────────────────────────
-- AI-generated brand strategy output
create table if not exists public.brand_strategy (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  positioning_statement text,
  tagline text,
  elevator_pitch text,
  tone_of_voice text[],
  key_messages text[],
  personas jsonb, -- array of persona objects
  differentiation_points jsonb,
  competitive_advantage text,
  brand_score integer default 0,
  generated_at timestamptz,
  regenerated_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── VISUAL IDENTITY ───────────────────────────────────────────────────────────
create table if not exists public.visual_identity (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  selected_palette text default 'earthy',
  palette_colors jsonb, -- array of {name, hex, label}
  selected_font text default 'elegant',
  heading_font text,
  body_font text,
  selected_logo_style text default 'wordmark',
  brand_guidelines_url text, -- PDF download URL (Pro feature)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── MARKETING PLAN ────────────────────────────────────────────────────────────
create table if not exists public.marketing_plan (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  selected_channels text[],
  monthly_budget integer default 25000, -- in KES
  plan_data jsonb, -- full 90-day plan structure
  generated_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── CONTENT LIBRARY ───────────────────────────────────────────────────────────
create table if not exists public.content_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null check (platform in ('instagram', 'whatsapp', 'tiktok', 'linkedin', 'facebook', 'twitter')),
  post_type text,
  pillar text check (pillar in ('education', 'community', 'promotion')),
  caption text not null,
  hashtags text,
  best_time text,
  engagement_prediction text,
  scheduled_at timestamptz,
  published_at timestamptz,
  status text default 'draft' check (status in ('draft', 'scheduled', 'published')),
  created_at timestamptz default now()
);

-- ── AI CHAT HISTORY ───────────────────────────────────────────────────────────
create table if not exists public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  module text, -- which module the chat is in (strategy, marketing, etc.)
  created_at timestamptz default now()
);

-- ── PAYMENTS ──────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null, -- in KES
  currency text default 'KES',
  plan text not null,
  status text default 'pending' check (status in ('pending', 'success', 'failed', 'cancelled')),
  payment_method text default 'mpesa',
  flutterwave_tx_ref text unique,
  flutterwave_tx_id text,
  phone_number text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.brand_discovery enable row level security;
alter table public.brand_strategy enable row level security;
alter table public.visual_identity enable row level security;
alter table public.marketing_plan enable row level security;
alter table public.content_posts enable row level security;
alter table public.chat_messages enable row level security;
alter table public.payments enable row level security;

-- Profiles: users can only read/update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Brand Discovery
create policy "Users can manage own discovery" on public.brand_discovery for all using (auth.uid() = user_id);

-- Brand Strategy
create policy "Users can manage own strategy" on public.brand_strategy for all using (auth.uid() = user_id);

-- Visual Identity
create policy "Users can manage own identity" on public.visual_identity for all using (auth.uid() = user_id);

-- Marketing Plan
create policy "Users can manage own marketing" on public.marketing_plan for all using (auth.uid() = user_id);

-- Content Posts
create policy "Users can manage own content" on public.content_posts for all using (auth.uid() = user_id);

-- Chat Messages
create policy "Users can manage own chat" on public.chat_messages for all using (auth.uid() = user_id);

-- Payments: users can view their own, only service role can insert/update
create policy "Users can view own payments" on public.payments for select using (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: runs after every new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to all tables
create trigger handle_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.brand_discovery for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.brand_strategy for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.visual_identity for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.marketing_plan for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.payments for each row execute procedure public.handle_updated_at();

-- Reset AI query count monthly
create or replace function public.reset_ai_queries()
returns void as $$
begin
  update public.profiles
  set ai_queries_used = 0, ai_queries_reset_at = now()
  where ai_queries_reset_at < now() - interval '30 days';
end;
$$ language plpgsql security definer;