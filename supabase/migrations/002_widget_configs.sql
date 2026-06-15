-- SQL migration for website widget configurations table
-- Phase 2C widget config setup

create table if not exists public.widget_configs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade unique,
  agent_id uuid references public.agents(id) on delete set null,
  public_key text unique not null,
  enabled boolean default true,
  greeting text,
  accent_color text default '#10b981',
  display_name text,
  allowed_domains jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.widget_configs enable row level security;

-- authenticated workspace owners can perform all actions
create policy "Workspace owners can manage widget configurations"
  on public.widget_configs
  for all
  to authenticated
  using (public.is_workspace_owner(workspace_id))
  with check (public.is_workspace_owner(workspace_id));
