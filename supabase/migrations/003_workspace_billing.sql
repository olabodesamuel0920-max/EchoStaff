-- SQL migration for workspace billing columns and usage limits
-- Phase 3A Billing Setup

ALTER TABLE public.workspaces
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'Starter AI Staff',
ADD COLUMN IF NOT EXISTS billing_status text DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz DEFAULT now() + interval '14 days',
ADD COLUMN IF NOT EXISTS monthly_message_limit integer DEFAULT 500,
ADD COLUMN IF NOT EXISTS current_month_message_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_period_start timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS usage_period_end timestamptz DEFAULT now() + interval '30 days';

-- Safe atomic increment function with auto monthly reset
CREATE OR REPLACE FUNCTION public.increment_workspace_message_count(workspace_uuid uuid)
RETURNS void AS $$
DECLARE
  curr_end timestamptz;
BEGIN
  SELECT usage_period_end INTO curr_end FROM public.workspaces WHERE id = workspace_uuid;
  
  IF curr_end IS NULL THEN
    UPDATE public.workspaces
    SET usage_period_start = now(),
        usage_period_end = now() + interval '30 days',
        current_month_message_count = 1
    WHERE id = workspace_uuid;
  ELSIF now() > curr_end THEN
    UPDATE public.workspaces
    SET current_month_message_count = 1,
        usage_period_start = now(),
        usage_period_end = now() + interval '30 days'
    WHERE id = workspace_uuid;
  ELSE
    UPDATE public.workspaces
    SET current_month_message_count = current_month_message_count + 1
    WHERE id = workspace_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
