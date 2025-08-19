-- Create a security definer function to check user permissions for marks access
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.can_access_marks(mark_subject_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    -- If no authenticated user, deny access
    WHEN auth.uid() IS NULL THEN false
    
    -- Check if user is a teacher and has access to this subject
    WHEN EXISTS (
      SELECT 1 FROM teachers 
      WHERE id = auth.uid()::uuid
      AND (
        role = 'admin' OR 
        role = 'principal' OR
        mark_subject_id = ANY(subjectids)
      )
    ) THEN true
    
    -- Default deny
    ELSE false
  END;
$$;

-- Drop existing overly permissive marks policies
DROP POLICY IF EXISTS "Authenticated users can view marks" ON public.marks;
DROP POLICY IF EXISTS "Authenticated users can insert marks" ON public.marks;
DROP POLICY IF EXISTS "Authenticated users can update marks" ON public.marks;
DROP POLICY IF EXISTS "Authenticated users can delete marks" ON public.marks;