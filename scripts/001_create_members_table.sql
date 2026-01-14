-- Create members table for Chasing Daylight community
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL UNIQUE,
  discord_username TEXT NOT NULL,
  roblox_username TEXT NOT NULL,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX idx_members_nickname ON public.members(nickname);
CREATE INDEX idx_members_status ON public.members(status);

-- Enable Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for this demo, allowing anonymous read)
CREATE POLICY "Allow public read access on members" 
  ON public.members 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated users to insert members" 
  ON public.members 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update members" 
  ON public.members 
  FOR UPDATE 
  USING (true);
