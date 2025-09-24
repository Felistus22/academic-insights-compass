-- Fix RLS policies to use correct 'app_metadata' instead of 'app_meta_data'

-- Drop existing policies for teachers table
DROP POLICY IF EXISTS "Admins can manage teachers" ON public.teachers;

-- Create corrected policy for teachers
CREATE POLICY "Admins can manage teachers" ON public.teachers
FOR ALL USING (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
);

-- Drop existing policies for students table
DROP POLICY IF EXISTS "Admins can delete students" ON public.students;
DROP POLICY IF EXISTS "Admins can insert students" ON public.students; 
DROP POLICY IF EXISTS "Admins can update students" ON public.students;

-- Create corrected policies for students
CREATE POLICY "Admins can insert students" ON public.students
FOR INSERT WITH CHECK (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
);

CREATE POLICY "Admins can update students" ON public.students  
FOR UPDATE USING (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
);

CREATE POLICY "Admins can delete students" ON public.students
FOR DELETE USING (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
);

-- Fix marks table policies too
DROP POLICY IF EXISTS "Teachers and admins can delete marks" ON public.marks;
DROP POLICY IF EXISTS "Teachers and admins can insert marks" ON public.marks;
DROP POLICY IF EXISTS "Teachers and admins can update marks" ON public.marks; 
DROP POLICY IF EXISTS "Teachers and admins can view marks" ON public.marks;

-- Create corrected policies for marks
CREATE POLICY "Teachers and admins can view marks" ON public.marks
FOR SELECT USING (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text OR auth.uid() IS NOT NULL
);

CREATE POLICY "Teachers and admins can insert marks" ON public.marks
FOR INSERT WITH CHECK (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text OR auth.uid() IS NOT NULL
);

CREATE POLICY "Teachers and admins can update marks" ON public.marks
FOR UPDATE USING (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text OR auth.uid() IS NOT NULL
);

CREATE POLICY "Teachers and admins can delete marks" ON public.marks
FOR DELETE USING (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text OR auth.uid() IS NOT NULL
);

-- Fix profiles table policies too
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create corrected policies for profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text OR auth.uid() = id
);

CREATE POLICY "Admins can insert profiles" ON public.profiles
FOR INSERT WITH CHECK (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
);

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text OR auth.uid() = id
);