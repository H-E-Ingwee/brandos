-- ============================================================
-- BrandOS Admin Seed
-- Run this in Supabase SQL Editor to set up your admin account
-- Replace the email below with YOUR email address
-- ============================================================

-- Step 1: Find your user ID and upgrade your profile to agency plan
UPDATE public.profiles
SET
  plan = 'agency',
  ai_queries_used = 0,
  onboarding_complete = true
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'Ingweplex@gmail.com'  -- ← YOUR EMAIL HERE
  LIMIT 1
);

-- Step 2: Create or update your organisation to agency plan
INSERT INTO public.organisations (owner_id, name, slug, plan, max_members)
SELECT
  p.id,
  COALESCE(p.business_name, 'Ingweplex'),
  'ingweplex',
  'agency',
  999
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'Ingweplex@gmail.com'  -- ← YOUR EMAIL HERE
ON CONFLICT (owner_id) DO UPDATE
  SET plan = 'agency', max_members = 999, name = COALESCE(EXCLUDED.name, organisations.name);

-- Step 3: Create admin_users table for platform-level admin access
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  role text not null default 'super_admin' check (role in ('super_admin', 'support')),
  created_at timestamptz default now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only super admins can see the admin_users table
CREATE POLICY "Super admins only" ON public.admin_users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Step 4: Add yourself as super admin
INSERT INTO public.admin_users (user_id, role)
SELECT p.id, 'super_admin'
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'Ingweplex@gmail.com'  -- ← YOUR EMAIL HERE
ON CONFLICT (user_id) DO NOTHING;

-- Step 5: Helper function to check if current user is platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Step 6: Verify the setup worked
SELECT
  u.email,
  p.full_name,
  p.plan,
  p.business_name,
  CASE WHEN a.user_id IS NOT NULL THEN 'YES' ELSE 'NO' END as is_admin
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.admin_users a ON a.user_id = u.id
WHERE u.email = 'Ingweplex@gmail.com';  -- ← YOUR EMAIL HERE