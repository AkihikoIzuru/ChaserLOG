-- Create violations table for member penalties and violations
CREATE TABLE IF NOT EXISTS public.violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL CHECK (violation_type IN ('template', 'custom')),
  violation_name TEXT NOT NULL,
  custom_violation_name TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT,
  violation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_violations_member_id ON public.violations(member_id);
CREATE INDEX idx_violations_severity ON public.violations(severity);
CREATE INDEX idx_violations_date ON public.violations(violation_date);

-- Enable Row Level Security
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on violations" 
  ON public.violations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated users to insert violations" 
  ON public.violations 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update violations" 
  ON public.violations 
  FOR UPDATE 
  USING (true);
