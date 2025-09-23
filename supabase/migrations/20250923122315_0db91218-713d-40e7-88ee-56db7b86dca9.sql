-- Update RLS policies on existing tables to use proper admin checks
-- Update teachers table policies
DROP POLICY IF EXISTS "Authenticated users can view teachers" ON public.teachers;
DROP POLICY IF EXISTS "Authenticated users can insert teachers" ON public.teachers;
DROP POLICY IF EXISTS "Authenticated users can update teachers" ON public.teachers;
DROP POLICY IF EXISTS "Authenticated users can delete teachers" ON public.teachers;

CREATE POLICY "Admins can manage teachers" 
ON public.teachers 
FOR ALL 
USING ((auth.jwt() -> 'app_meta_data' ->> 'role') = 'admin');

-- Update students table policies
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can insert students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can update students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can delete students" ON public.students;

CREATE POLICY "Teachers and admins can view students" 
ON public.students 
FOR SELECT 
USING (
  (auth.jwt() -> 'app_meta_data' ->> 'role') = 'admin' OR 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Admins can insert students" 
ON public.students 
FOR INSERT 
WITH CHECK ((auth.jwt() -> 'app_meta_data' ->> 'role') = 'admin');

CREATE POLICY "Admins can update students" 
ON public.students 
FOR UPDATE 
USING ((auth.jwt() -> 'app_meta_data' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete students" 
ON public.students 
FOR DELETE 
USING ((auth.jwt() -> 'app_meta_data' ->> 'role') = 'admin');

-- Update marks table policies
DROP POLICY IF EXISTS "Authenticated users can view marks" ON public.marks;
DROP POLICY IF EXISTS "Authenticated users can insert marks" ON public.marks;
DROP POLICY IF EXISTS "Authenticated users can update marks" ON public.marks;
DROP POLICY IF EXISTS "Authenticated users can delete marks" ON public.marks;

CREATE POLICY "Teachers and admins can view marks" 
ON public.marks 
FOR SELECT 
USING (
  (auth.jwt() -> 'app_meta_data' ->> 'role') = 'admin' OR 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Teachers and admins can insert marks" 
ON public.marks 
FOR INSERT 
WITH CHECK (
  (auth.jwt() -> 'app_meta_data' ->> 'role') = 'admin' OR 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Teachers and admins can update marks" 
ON public.marks 
FOR UPDATE 
USING (
  (auth.jwt() -> 'app_meta_data' ->> 'role') = 'admin' OR 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Teachers and admins can delete marks" 
ON public.marks 
FOR DELETE 
USING (
  (auth.jwt() -> 'app_meta_data' ->> 'role') = 'admin' OR 
  auth.uid() IS NOT NULL
);