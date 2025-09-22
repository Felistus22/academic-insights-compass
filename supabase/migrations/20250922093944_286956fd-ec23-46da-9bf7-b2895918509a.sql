-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  email text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING ((auth.jwt() -> 'app_meta_data' ->> 'role') = 'admin');

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING ((auth.jwt() -> 'app_meta_data' ->> 'role') = 'admin');

CREATE POLICY "Admins can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK ((auth.jwt() -> 'app_meta_data' ->> 'role') = 'admin');

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.email
  );
  RETURN new;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

CREATE POLICY "Admins can manage students" 
ON public.students 
FOR INSERT, UPDATE, DELETE 
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

CREATE POLICY "Teachers and admins can manage marks" 
ON public.marks 
FOR INSERT, UPDATE, DELETE 
USING (
  (auth.jwt() -> 'app_meta_data' ->> 'role') = 'admin' OR 
  auth.uid() IS NOT NULL
);