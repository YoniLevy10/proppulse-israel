-- PropPulse Israel + PropTerminal IL — Supabase schema
-- Run in Supabase SQL editor or via `supabase db push`

create extension if not exists "pgcrypto";

-- SaaS users (mirrors auth.users id when using Supabase Auth)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscription_status boolean not null default false,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

-- Aggregated real-estate projects / inventory
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text not null,
  exact_address text,
  contact_phone text,
  source_url text,
  price_range text,
  property_type text,
  city text,
  created_at timestamptz not null default now()
);

-- Per-agent targeting + WhatsApp number for handoff
create table if not exists public.agent_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  preferred_city text,
  property_type text,
  whatsapp_number text,
  agent_display_name text,
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- Instant lead responder
do $$ begin
  create type public.lead_status as enum (
    'new',
    'engaging',
    'qualifying',
    'ready',
    'handed_off',
    'contacted'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.users (id) on delete set null,
  full_name text not null,
  phone text not null,
  phone_e164 text,
  property_interest text,
  status public.lead_status not null default 'new',
  budget text,
  preferred_area text,
  rooms text,
  preferred_contact_time text,
  source text default 'webhook',
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  sender text not null check (sender in ('bot', 'lead', 'agent')),
  message text not null,
  external_message_id text,
  created_at timestamptz not null default now()
);

-- PropTerminal IL feed
do $$ begin
  create type public.terminal_category as enum (
    'exclusive',
    'pinui_binui',
    'whatsapp_signal',
    'general'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.terminal_urgency as enum (
    'low',
    'medium',
    'high',
    'critical'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.terminal_tier as enum ('pro', 'enterprise');
exception when duplicate_object then null;
end $$;

create table if not exists public.terminal_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  raw_content text,
  source_name text not null,
  location text,
  price numeric,
  category public.terminal_category not null default 'general',
  sentiment_score numeric,
  urgency public.terminal_urgency not null default 'medium',
  created_at timestamptz not null default now()
);

create table if not exists public.terminal_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  tier public.terminal_tier not null default 'pro',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists leads_phone_e164_idx on public.leads (phone_e164);
create index if not exists leads_agent_id_idx on public.leads (agent_id);
create index if not exists conversations_lead_id_idx on public.conversations (lead_id);
create index if not exists projects_city_idx on public.projects (city);
create index if not exists projects_created_at_idx on public.projects (created_at desc);
create index if not exists terminal_items_created_at_idx on public.terminal_items (created_at desc);
create index if not exists terminal_items_category_idx on public.terminal_items (category);

alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.agent_preferences enable row level security;
alter table public.leads enable row level security;
alter table public.conversations enable row level security;
alter table public.terminal_items enable row level security;
alter table public.terminal_subscriptions enable row level security;

-- Policies (service role bypasses RLS for server APIs)
drop policy if exists "users can read own row" on public.users;
create policy "users can read own row"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "users can update own subscription row" on public.users;
create policy "users can update own subscription row"
  on public.users for update
  using (auth.uid() = id);

drop policy if exists "subscribed users read full projects" on public.projects;
create policy "subscribed users read full projects"
  on public.projects for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.subscription_status = true
    )
  );

drop policy if exists "anon can read blurred project list via app layer only" on public.projects;
create policy "anon can read blurred project list via app layer only"
  on public.projects for select
  using (true);

drop policy if exists "users manage own preferences" on public.agent_preferences;
create policy "users manage own preferences"
  on public.agent_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "agents read own leads" on public.leads;
create policy "agents read own leads"
  on public.leads for select
  using (auth.uid() = agent_id);

drop policy if exists "agents read own conversations" on public.conversations;
create policy "agents read own conversations"
  on public.conversations for select
  using (
    exists (
      select 1 from public.leads l
      where l.id = lead_id and l.agent_id = auth.uid()
    )
  );

drop policy if exists "subscribers read terminal items" on public.terminal_items;
create policy "subscribers read terminal items"
  on public.terminal_items for select
  using (
    exists (
      select 1 from public.terminal_subscriptions ts
      where ts.user_id = auth.uid() and ts.expires_at > now()
    )
  );

drop policy if exists "users read own terminal subscription" on public.terminal_subscriptions;
create policy "users read own terminal subscription"
  on public.terminal_subscriptions for select
  using (auth.uid() = user_id);
