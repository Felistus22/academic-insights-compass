-- Fix security issue: Restrict students table access to authenticated users only
-- Remove the overly permissive "Anyone can view students" policy
DROP POLICY IF EXISTS "Anyone can view students" ON public.students;

-- Create new policy that only allows authenticated users to view students
CREATE POLICY "Authenticated users can view students" 
ON public.students 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update the management policy to be more specific
DROP POLICY IF EXISTS "Authenticated users can manage students" ON public.students;

-- Create separate policies for different operations with proper authentication checks
CREATE POLICY "Authenticated users can insert students" 
ON public.students 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update students" 
ON public.students 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete students" 
ON public.students 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Also fix similar issues with other sensitive tables
-- Fix teachers table
DROP POLICY IF EXISTS "Anyone can view teachers" ON public.teachers;

CREATE POLICY "Authenticated users can view teachers" 
ON public.teachers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can manage teachers" ON public.teachers;

CREATE POLICY "Authenticated users can insert teachers" 
ON public.teachers 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update teachers" 
ON public.teachers 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete teachers" 
ON public.teachers 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Fix marks table 
DROP POLICY IF EXISTS "Anyone can view marks" ON public.marks;

CREATE POLICY "Authenticated users can view marks" 
ON public.marks 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can manage marks" ON public.marks;

CREATE POLICY "Authenticated users can insert marks" 
ON public.marks 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update marks" 
ON public.marks 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete marks" 
ON public.marks 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Fix activity_logs table
DROP POLICY IF EXISTS "Anyone can view activity logs" ON public.activity_logs;

CREATE POLICY "Authenticated users can view activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can manage activity logs" ON public.activity_logs;

CREATE POLICY "Authenticated users can insert activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Keep exams and subjects readable since they're less sensitive reference data
-- But still restrict management to authenticated users only