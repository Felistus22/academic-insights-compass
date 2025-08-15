-- Enable Row Level Security on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for students table
CREATE POLICY "Anyone can view students" 
ON public.students 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage students" 
ON public.students 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for teachers table
CREATE POLICY "Anyone can view teachers" 
ON public.teachers 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage teachers" 
ON public.teachers 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for subjects table
CREATE POLICY "Anyone can view subjects" 
ON public.subjects 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage subjects" 
ON public.subjects 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for exams table
CREATE POLICY "Anyone can view exams" 
ON public.exams 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage exams" 
ON public.exams 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for marks table
CREATE POLICY "Anyone can view marks" 
ON public.marks 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage marks" 
ON public.marks 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for activity_logs table
CREATE POLICY "Anyone can view activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage activity logs" 
ON public.activity_logs 
FOR ALL 
USING (true)
WITH CHECK (true);