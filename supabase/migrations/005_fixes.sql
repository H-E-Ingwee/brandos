-- ============================================================
-- BrandOS RLS Fixes — CRITICAL: Run this to fix payment errors
-- ============================================================

-- Fix payments table — add INSERT and UPDATE policies
CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

-- Fix all other tables with proper ALL policies
DROP POLICY IF EXISTS "Users can manage own identity" ON public.visual_identity;
CREATE POLICY "Users can manage own identity" ON public.visual_identity
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own marketing" ON public.marketing_plan;
CREATE POLICY "Users can manage own marketing" ON public.marketing_plan
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own discovery" ON public.brand_discovery;
CREATE POLICY "Users can manage own discovery" ON public.brand_discovery
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own strategy" ON public.brand_strategy;
CREATE POLICY "Users can manage own strategy" ON public.brand_strategy
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own content" ON public.content_posts;
CREATE POLICY "Users can manage own content" ON public.content_posts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own chat" ON public.chat_messages;
CREATE POLICY "Users can manage own chat" ON public.chat_messages
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Multi-currency and onboarding columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'KES',
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Kenya',
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Africa/Nairobi',
  ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_dismissed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS avatar_url text;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'KES',
  ADD COLUMN IF NOT EXISTS amount_usd numeric(10,2);

-- Verify all policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('payments','profiles','brand_discovery','brand_strategy','visual_identity','marketing_plan','content_posts','chat_messages')
ORDER BY tablename, cmd;