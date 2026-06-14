-- EchoStaff AI Database Schema
-- Phase 2A initial migration

-- 1. Profiles (user metadata linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text default 'owner',
  created_at timestamptz default now()
);

-- 2. Workspaces (multi-tenant containers)
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  industry text,
  region text,
  overview text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Brand Brains (associated with workspaces)
create table if not exists public.brand_brains (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade unique,
  tone_of_voice text,
  business_overview text,
  products_services jsonb default '[]'::jsonb,
  pricing_notes text,
  faqs jsonb default '[]'::jsonb,
  do_rules jsonb default '[]'::jsonb,
  dont_rules jsonb default '[]'::jsonb,
  policies jsonb default '[]'::jsonb,
  owner_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Agents (linked to workspaces)
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  brand_brain_id uuid references public.brand_brains(id) on delete set null,
  name text not null,
  role text,
  personality text,
  tone text,
  channels jsonb default '[]'::jsonb,
  status text default 'Training',
  call_readiness_score integer default 0,
  last_simulation_result text,
  needs_training boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Conversations
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  customer_name text,
  channel text,
  summary text,
  sentiment text,
  lead_status text,
  needs_follow_up boolean default false,
  scenario_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Messages (linked to conversations)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  role text not null, -- 'user', 'agent', 'system'
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 7. Training Items
create table if not exists public.training_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  source_conversation_id uuid references public.conversations(id) on delete set null,
  question text,
  ai_answer text,
  owner_correction text,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. Call Scenarios
create table if not exists public.call_scenarios (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  title text not null,
  persona_name text,
  customer_mood text,
  customer_goal text,
  opening_line text,
  expected_outcome text,
  difficulty text,
  created_at timestamptz default now()
);

-- 9. Call Simulations
create table if not exists public.call_simulations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete cascade,
  scenario_id uuid references public.call_scenarios(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  scorecard jsonb default '{}'::jsonb,
  status text default 'completed',
  created_at timestamptz default now()
);

-- RLS helper function to check workspace ownership
create or replace function public.is_workspace_owner(workspace_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.workspaces w
    where w.id = workspace_uuid and w.owner_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.brand_brains enable row level security;
alter table public.agents enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.training_items enable row level security;
alter table public.call_scenarios enable row level security;
alter table public.call_simulations enable row level security;

-- RLS Policies

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Workspaces
create policy "Users can view own workspaces" on public.workspaces for select using (auth.uid() = owner_id);
create policy "Users can insert own workspaces" on public.workspaces for insert with check (auth.uid() = owner_id);
create policy "Users can update own workspaces" on public.workspaces for update using (auth.uid() = owner_id);
create policy "Users can delete own workspaces" on public.workspaces for delete using (auth.uid() = owner_id);

-- Brand Brains
create policy "Workspace owner can view brand_brains" on public.brand_brains for select using (is_workspace_owner(workspace_id));
create policy "Workspace owner can insert brand_brains" on public.brand_brains for insert with check (is_workspace_owner(workspace_id));
create policy "Workspace owner can update brand_brains" on public.brand_brains for update using (is_workspace_owner(workspace_id));
create policy "Workspace owner can delete brand_brains" on public.brand_brains for delete using (is_workspace_owner(workspace_id));

-- Agents
create policy "Workspace owner can view agents" on public.agents for select using (is_workspace_owner(workspace_id));
create policy "Workspace owner can insert agents" on public.agents for insert with check (is_workspace_owner(workspace_id));
create policy "Workspace owner can update agents" on public.agents for update using (is_workspace_owner(workspace_id));
create policy "Workspace owner can delete agents" on public.agents for delete using (is_workspace_owner(workspace_id));

-- Conversations
create policy "Workspace owner can view conversations" on public.conversations for select using (is_workspace_owner(workspace_id));
create policy "Workspace owner can insert conversations" on public.conversations for insert with check (is_workspace_owner(workspace_id));
create policy "Workspace owner can update conversations" on public.conversations for update using (is_workspace_owner(workspace_id));
create policy "Workspace owner can delete conversations" on public.conversations for delete using (is_workspace_owner(workspace_id));

-- Messages
create policy "Workspace owner can view messages" on public.messages for select using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id and is_workspace_owner(c.workspace_id)
  )
);
create policy "Workspace owner can insert messages" on public.messages for insert with check (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id and is_workspace_owner(c.workspace_id)
  )
);

-- Training Items
create policy "Workspace owner can view training_items" on public.training_items for select using (is_workspace_owner(workspace_id));
create policy "Workspace owner can insert training_items" on public.training_items for insert with check (is_workspace_owner(workspace_id));
create policy "Workspace owner can update training_items" on public.training_items for update using (is_workspace_owner(workspace_id));
create policy "Workspace owner can delete training_items" on public.training_items for delete using (is_workspace_owner(workspace_id));

-- Call Scenarios
create policy "Workspace owner can view call_scenarios" on public.call_scenarios for select using (is_workspace_owner(workspace_id));
create policy "Workspace owner can insert call_scenarios" on public.call_scenarios for insert with check (is_workspace_owner(workspace_id));
create policy "Workspace owner can update call_scenarios" on public.call_scenarios for update using (is_workspace_owner(workspace_id));
create policy "Workspace owner can delete call_scenarios" on public.call_scenarios for delete using (is_workspace_owner(workspace_id));

-- Call Simulations
create policy "Workspace owner can view call_simulations" on public.call_simulations for select using (is_workspace_owner(workspace_id));
create policy "Workspace owner can insert call_simulations" on public.call_simulations for insert with check (is_workspace_owner(workspace_id));
create policy "Workspace owner can update call_simulations" on public.call_simulations for update using (is_workspace_owner(workspace_id));
create policy "Workspace owner can delete call_simulations" on public.call_simulations for delete using (is_workspace_owner(workspace_id));

-- Trigger to automatically create a profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'owner'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
