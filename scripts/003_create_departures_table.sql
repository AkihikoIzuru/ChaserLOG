-- Create member_departures table to track members who left
CREATE TABLE IF NOT EXISTS public.member_departures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  departure_reason TEXT NOT NULL,
  departed_at DATE NOT NULL,
  tenure_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_departures_member_id ON public.member_departures(member_id);
CREATE INDEX idx_departures_date ON public.member_departures(departed_at);

-- Enable Row Level Security
ALTER TABLE public.member_departures ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on departures" 
  ON public.member_departures 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated users to insert departures" 
  ON public.member_departures 
  FOR INSERT 
  WITH CHECK (true);
