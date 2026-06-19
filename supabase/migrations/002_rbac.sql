-- ============================================================
-- BrandOS RBAC — Team Members & Invitations
-- Run this in Supabase SQL Editor AFTER 001_schema.sql
-- ============================================================

-- ── ORGANISATIONS ─────────────────────────────────────────────────────────────
-- Each user's brand workspace is an "organisation"
-- The owner is the user who created the account
create table if not exists public.organisations (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null unique,
  name text not null,
  slug text unique, -- URL-friendly name e.g. "savanna-skincare"
  plan text not null default 'free' check (plan in ('free', 'growth', 'pro', 'agency')),
  max_members integer not null default 1, -- free=1, growth=1, pro=3, agency=unlimited
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── TEAM MEMBERS ──────────────────────────────────────────────────────────────
create table if not exists public.team_members (
  id uuid default uuid_generate_v4() primary key,
  organisation_id uuid references public.organisations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  invited_by uuid references public.profiles(id),
  joined_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(organisation_id, user_id)
);

-- ── INVITATIONS ───────────────────────────────────────────────────────────────
create table if not exists public.invitations (
  id uuid default uuid_generate_v4() primary key,
  organisation_id uuid references public.organisations(id) on delete cascade not null,
  invited_by uuid references public.profiles(id) on delete cascade not null,
  email text not null,
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz default now(),
  unique(organisation_id, email)
);

-- ── AUDIT LOG ─────────────────────────────────────────────────────────────────
-- Track all admin actions for accountability
create table if not exists public.audit_log (
  id uuid default uuid_generate_v4() primary key,
  organisation_id uuid references public.organisations(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) not null,
  action text not null, -- e.g. 'invite_member', 'remove_member', 'change_role', 'generate_strategy'
  target_id uuid, -- the affected user or resource
  target_type text, -- 'user', 'brand_strategy', 'content_post', etc.
  metadata jsonb, -- additional context
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.organisations enable row level security;
alter table public.team_members enable row level security;
alter table public.invitations enable row level security;
alter table public.audit_log enable row level security;

-- ── HELPER FUNCTIONS ──────────────────────────────────────────────────────────

-- Get the organisation_id for the current user (as owner)
create or replace function public.get_my_org_id()
returns uuid as $$
  select id from public.organisations where owner_id = auth.uid() limit 1;
$$ language sql security definer stable;

-- Get the organisation_id for the current user (as owner OR member)
create or replace function public.get_accessible_org_ids()
returns setof uuid as $$
  select id from public.organisations where owner_id = auth.uid()
  union
  select organisation_id from public.team_members where user_id = auth.uid();
$$ language sql security definer stable;

-- Check if current user has a specific role in an organisation
create or replace function public.has_org_role(org_id uuid, required_role text)
returns boolean as $$
declare
  user_role text;
  is_owner boolean;
begin
  -- Owner always has full access
  select exists(select 1 from public.organisations where id = org_id and owner_id = auth.uid()) into is_owner;
  if is_owner then return true; end if;

  -- Check team member role
  select role into user_role from public.team_members
  where organisation_id = org_id and user_id = auth.uid();

  if user_role is null then return false; end if;

  -- Role hierarchy: admin > editor > viewer
  return case required_role
    when 'viewer' then user_role in ('viewer', 'editor', 'admin')
    when 'editor' then user_role in ('editor', 'admin')
    when 'admin'  then user_role = 'admin'
    else false
  end;
end;
$$ language plpgsql security definer stable;

-- Check if current user can modify brand data (editor or above)
create or replace function public.can_edit_org(org_id uuid)
returns boolean as $$
  select public.has_org_role(org_id, 'editor');
$$ language sql security definer stable;

-- Check if current user is admin of an org
create or replace function public.is_org_admin(org_id uuid)
returns boolean as $$
  select public.has_org_role(org_id, 'admin');
$$ language sql security definer stable;

-- ── ORGANISATIONS POLICIES ────────────────────────────────────────────────────
create policy "Owners can manage their org" on public.organisations
  for all using (owner_id = auth.uid());

create policy "Members can view their org" on public.organisations
  for select using (
    id in (select organisation_id from public.team_members where user_id = auth.uid())
  );

-- ── TEAM MEMBERS POLICIES ─────────────────────────────────────────────────────
-- Members can see other members of their org
create policy "Members can view team" on public.team_members
  for select using (
    organisation_id in (select public.get_accessible_org_ids())
  );

-- Only org owner or admin can add/remove members
create policy "Admins can manage team" on public.team_members
  for insert with check (
    organisation_id = public.get_my_org_id()
    or public.is_org_admin(organisation_id)
  );

create policy "Admins can update roles" on public.team_members
  for update using (
    organisation_id = public.get_my_org_id()
    or public.is_org_admin(organisation_id)
  );

create policy "Admins can remove members" on public.team_members
  for delete using (
    organisation_id = public.get_my_org_id()
    or public.is_org_admin(organisation_id)
  );

-- ── INVITATIONS POLICIES ──────────────────────────────────────────────────────
-- Org owner and admins can create invitations
create policy "Admins can create invitations" on public.invitations
  for insert with check (
    organisation_id = public.get_my_org_id()
    or public.is_org_admin(organisation_id)
  );

-- Members can view invitations for their org
create policy "Members can view invitations" on public.invitations
  for select using (
    organisation_id in (select public.get_accessible_org_ids())
    or email = (select email from auth.users where id = auth.uid())
  );

-- Admins can update (cancel) invitations
create policy "Admins can update invitations" on public.invitations
  for update using (
    organisation_id = public.get_my_org_id()
    or public.is_org_admin(organisation_id)
    or email = (select email from auth.users where id = auth.uid())
  );

-- ── AUDIT LOG POLICIES ────────────────────────────────────────────────────────
create policy "Members can view audit log" on public.audit_log
  for select using (
    organisation_id in (select public.get_accessible_org_ids())
  );

create policy "System can insert audit log" on public.audit_log
  for insert with check (
    organisation_id in (select public.get_accessible_org_ids())
  );

-- ── UPDATE EXISTING TABLE RLS FOR TEAM ACCESS ─────────────────────────────────

-- Brand Discovery: owner OR team member with editor+ can write, viewer can read
drop policy if exists "Users can manage own discovery" on public.brand_discovery;

create policy "Owner can manage discovery" on public.brand_discovery
  for all using (user_id = auth.uid());

create policy "Team editors can modify discovery" on public.brand_discovery
  for update using (
    exists (
      select 1 from public.organisations o
      join public.team_members tm on tm.organisation_id = o.id
      where o.owner_id = brand_discovery.user_id
      and tm.user_id = auth.uid()
      and tm.role in ('editor', 'admin')
    )
  );

create policy "Team viewers can read discovery" on public.brand_discovery
  for select using (
    exists (
      select 1 from public.organisations o
      join public.team_members tm on tm.organisation_id = o.id
      where o.owner_id = brand_discovery.user_id
      and tm.user_id = auth.uid()
    )
  );

-- Brand Strategy: same pattern
drop policy if exists "Users can manage own strategy" on public.brand_strategy;

create policy "Owner can manage strategy" on public.brand_strategy
  for all using (user_id = auth.uid());

create policy "Team editors can modify strategy" on public.brand_strategy
  for update using (
    exists (
      select 1 from public.organisations o
      join public.team_members tm on tm.organisation_id = o.id
      where o.owner_id = brand_strategy.user_id
      and tm.user_id = auth.uid()
      and tm.role in ('editor', 'admin')
    )
  );

create policy "Team viewers can read strategy" on public.brand_strategy
  for select using (
    exists (
      select 1 from public.organisations o
      join public.team_members tm on tm.organisation_id = o.id
      where o.owner_id = brand_strategy.user_id
      and tm.user_id = auth.uid()
    )
  );

-- Content Posts: editors can create, viewers can read
drop policy if exists "Users can manage own content" on public.content_posts;

create policy "Owner can manage content" on public.content_posts
  for all using (user_id = auth.uid());

create policy "Team editors can create content" on public.content_posts
  for insert with check (
    exists (
      select 1 from public.organisations o
      join public.team_members tm on tm.organisation_id = o.id
      where o.owner_id = content_posts.user_id
      and tm.user_id = auth.uid()
      and tm.role in ('editor', 'admin')
    )
  );

create policy "Team members can read content" on public.content_posts
  for select using (
    exists (
      select 1 from public.organisations o
      join public.team_members tm on tm.organisation_id = o.id
      where o.owner_id = content_posts.user_id
      and tm.user_id = auth.uid()
    )
  );

-- ── TRIGGERS ──────────────────────────────────────────────────────────────────

-- Auto-create organisation when user signs up
create or replace function public.handle_new_organisation()
returns trigger as $$
declare
  org_slug text;
begin
  -- Generate slug from business name or email
  org_slug := lower(regexp_replace(
    coalesce(new.business_name, split_part((select email from auth.users where id = new.id), '@', 1)),
    '[^a-z0-9]', '-', 'g'
  ));

  -- Ensure slug uniqueness
  while exists(select 1 from public.organisations where slug = org_slug) loop
    org_slug := org_slug || '-' || floor(random() * 1000)::text;
  end loop;

  insert into public.organisations (owner_id, name, slug, plan, max_members)
  values (
    new.id,
    coalesce(new.business_name, 'My Brand'),
    org_slug,
    new.plan,
    case new.plan
      when 'free' then 1
      when 'growth' then 1
      when 'pro' then 3
      when 'agency' then 999
      else 1
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Run after profile is created
drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_organisation();

-- Sync plan changes from profiles to organisations
create or replace function public.sync_org_plan()
returns trigger as $$
begin
  if new.plan <> old.plan then
    update public.organisations
    set
      plan = new.plan,
      max_members = case new.plan
        when 'free' then 1
        when 'growth' then 1
        when 'pro' then 3
        when 'agency' then 999
        else 1
      end
    where owner_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_plan_change on public.profiles;
create trigger on_plan_change
  after update on public.profiles
  for each row execute procedure public.sync_org_plan();

-- Updated_at trigger for new tables
create trigger handle_updated_at before update on public.organisations
  for each row execute procedure public.handle_updated_at();