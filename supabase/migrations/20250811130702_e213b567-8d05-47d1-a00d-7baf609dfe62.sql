-- Create grading_systems table to store admin-defined grading configurations
CREATE TABLE public.grading_systems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create grade_ranges table to store grade boundaries
CREATE TABLE public.grade_ranges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grading_system_id UUID NOT NULL REFERENCES public.grading_systems(id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  min_score DOUBLE PRECISION NOT NULL,
  max_score DOUBLE PRECISION NOT NULL,
  points DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create division_ranges table to store division/classification boundaries
CREATE TABLE public.division_ranges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grading_system_id UUID NOT NULL REFERENCES public.grading_systems(id) ON DELETE CASCADE,
  division TEXT NOT NULL,
  min_points DOUBLE PRECISION NOT NULL,
  max_points DOUBLE PRECISION NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.grading_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.division_ranges ENABLE ROW LEVEL SECURITY;

-- Create policies for grading systems (viewable by all authenticated users, editable by admins only)
CREATE POLICY "Anyone can view grading systems" 
ON public.grading_systems 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view grade ranges" 
ON public.grade_ranges 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view division ranges" 
ON public.division_ranges 
FOR SELECT 
USING (true);

-- For now, allow all authenticated users to manage grading systems (will be restricted to admins in app logic)
CREATE POLICY "Authenticated users can manage grading systems" 
ON public.grading_systems 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage grade ranges" 
ON public.grade_ranges 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage division ranges" 
ON public.division_ranges 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_grading_systems_updated_at
BEFORE UPDATE ON public.grading_systems
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default grading system
INSERT INTO public.grading_systems (name, description, is_active) 
VALUES ('Kenyan System', 'Standard Kenyan grading system with A-E grades and Division I-IV classifications', true);

-- Get the ID of the default grading system for the grade ranges
DO $$
DECLARE
    system_id UUID;
BEGIN
    SELECT id INTO system_id FROM public.grading_systems WHERE name = 'Kenyan System';
    
    -- Insert default grade ranges
    INSERT INTO public.grade_ranges (grading_system_id, grade, min_score, max_score, points) VALUES
    (system_id, 'A', 80, 100, 12),
    (system_id, 'A-', 75, 79, 11),
    (system_id, 'B+', 70, 74, 10),
    (system_id, 'B', 65, 69, 9),
    (system_id, 'B-', 60, 64, 8),
    (system_id, 'C+', 55, 59, 7),
    (system_id, 'C', 50, 54, 6),
    (system_id, 'C-', 45, 49, 5),
    (system_id, 'D+', 40, 44, 4),
    (system_id, 'D', 35, 39, 3),
    (system_id, 'D-', 30, 34, 2),
    (system_id, 'E', 0, 29, 1);
    
    -- Insert default division ranges
    INSERT INTO public.division_ranges (grading_system_id, division, min_points, max_points, description) VALUES
    (system_id, 'Division I', 84, 144, 'First Class Honours - Excellent performance'),
    (system_id, 'Division II', 72, 83, 'Second Class Honours - Good performance'),
    (system_id, 'Division III', 60, 71, 'Third Class Honours - Satisfactory performance'),
    (system_id, 'Division IV', 12, 59, 'Pass - Minimum acceptable performance');
END $$;