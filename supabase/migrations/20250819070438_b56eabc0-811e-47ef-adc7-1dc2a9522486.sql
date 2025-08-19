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
      WHERE id = auth.uid() 
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

-- Create role-based policies for marks table
-- Teachers can only view marks for subjects they teach, admins can see all
CREATE POLICY "Role-based marks access" 
ON public.marks 
FOR SELECT 
USING (public.can_access_marks(subjectid));

-- Teachers can only insert marks for subjects they teach
CREATE POLICY "Teachers can insert marks for their subjects" 
ON public.marks 
FOR INSERT 
WITH CHECK (public.can_access_marks(subjectid));

-- Teachers can only update marks for subjects they teach
CREATE POLICY "Teachers can update marks for their subjects" 
ON public.marks 
FOR UPDATE 
USING (public.can_access_marks(subjectid))
WITH CHECK (public.can_access_marks(subjectid));

-- Teachers can only delete marks for subjects they teach
CREATE POLICY "Teachers can delete marks for their subjects" 
ON public.marks 
FOR DELETE 
USING (public.can_access_marks(subjectid));

-- Create a function to check if current user can manage students (for student data access)
CREATE OR REPLACE FUNCTION public.can_manage_students()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN auth.uid() IS NULL THEN false
    WHEN EXISTS (
      SELECT 1 FROM teachers 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'principal', 'teacher')
    ) THEN true
    ELSE false
  END;
$$;

-- Update students table policies to use role-based access
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can insert students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can update students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can delete students" ON public.students;

-- Create role-based policies for students table
CREATE POLICY "School staff can view students" 
ON public.students 
FOR SELECT 
USING (public.can_manage_students());

CREATE POLICY "School staff can insert students" 
ON public.students 
FOR INSERT 
WITH CHECK (public.can_manage_students());

CREATE POLICY "School staff can update students" 
ON public.students 
FOR UPDATE 
USING (public.can_manage_students())
WITH CHECK (public.can_manage_students());

CREATE POLICY "Admins can delete students" 
ON public.students 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM teachers 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'principal')
  )
);