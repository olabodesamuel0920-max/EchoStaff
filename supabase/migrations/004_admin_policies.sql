-- SQL migration for admin RLS permissions
-- Phase 3A: Admin Security Policies

-- Redefine is_workspace_owner to allow platform administrators full access to all workspace resources
CREATE OR REPLACE FUNCTION public.is_workspace_owner(workspace_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = workspace_uuid AND (
      w.owner_id = auth.uid() OR
      auth.jwt() ->> 'email' IN ('admin@echostaff.ai', 'olabodesamuel0920+echo1@gmail.com')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies to workspaces table for administrators to view and edit all workspaces
CREATE POLICY "Admins can view all workspaces" ON public.workspaces FOR SELECT
USING (auth.jwt() ->> 'email' IN ('admin@echostaff.ai', 'olabodesamuel0920+echo1@gmail.com'));

CREATE POLICY "Admins can update all workspaces" ON public.workspaces FOR UPDATE
USING (auth.jwt() ->> 'email' IN ('admin@echostaff.ai', 'olabodesamuel0920+echo1@gmail.com'));
