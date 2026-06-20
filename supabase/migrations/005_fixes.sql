-- ============================================================
-- BrandOS Fixes Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── FIX 1: Add INSERT policy for payments table ───────────────────────────────
-- The original schema only had SELECT. Users need to INSERT their own payments.
CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

-- ── FIX 2: Add INSERT/UPDATE policies for visual_identity ─────────────────────
-- Ensure users can save their visual identity selections
DROP POLICY IF EXISTS "Users can manage own identity" ON public.visual_identity;
CREATE POLICY "Users can manage own identity" ON public.visual_identity
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── FIX 3: Add INSERT/UPDATE policies for marketing_plan ──────────────────────
DROP POLICY IF EXISTS "Users can manage own marketing" ON public.marketing_plan;
CREATE POLICY "Users can manage own marketing" ON public.marketing_plan
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── FIX 4: Add INSERT/UPDATE policies for brand_discovery ─────────────────────
DROP POLICY IF EXISTS "Users can manage own discovery" ON public.brand_discovery;
CREATE POLICY "Users can manage own discovery" ON public.brand_discovery
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── FIX 5: Add INSERT/UPDATE policies for brand_strategy ──────────────────────
DROP POLICY IF EXISTS "Users can manage own strategy" ON public.brand_strategy;
CREATE POLICY "Users can manage own strategy" ON public.brand_strategy
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── FIX 6: Add INSERT/UPDATE policies for content_posts ───────────────────────
DROP POLICY IF EXISTS "Users can manage own content" ON public.content_posts;
CREATE POLICY "Users can manage own content" ON public.content_posts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── FIX 7: Add INSERT/UPDATE policies for chat_messages ───────────────────────
DROP POLICY IF EXISTS "Users can manage own chat" ON public.chat_messages;
CREATE POLICY "Users can manage own chat" ON public.chat_messages
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── FIX 8: Add INSERT/UPDATE policies for profiles ────────────────────────────
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ── FIX 9: Multi-currency support columns ─────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'KES',
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Kenya',
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Africa/Nairobi';

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'KES',
  ADD COLUMN IF NOT EXISTS amount_usd numeric(10,2);

-- ── FIX 10: Onboarding progress tracking ──────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_dismissed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- ── VERIFY: Check all policies are in place ───────────────────────────────────
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('payments', 'profiles', 'brand_discovery', 'brand_strategy', 'visual_identity', 'marketing_plan', 'content_posts', 'chat_messages')
ORDER BY tablename, cmd;