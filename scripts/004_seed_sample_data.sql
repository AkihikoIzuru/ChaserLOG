-- Insert sample members
INSERT INTO public.members (nickname, discord_username, roblox_username, join_date, status) VALUES
  ('ShadowHunter', 'ShadowHunter#1234', 'ShadowHunter_RBX', '2023-01-15', 'active'),
  ('NeonWolf', 'NeonWolf#5678', 'NeonWolf_Gaming', '2023-06-22', 'active'),
  ('PhantomViper', 'PhantomViper#9012', 'PhantomViperX', '2023-03-10', 'active'),
  ('CrimsonFury', 'CrimsonFury#3456', 'CrimsonFury_Pro', '2024-01-05', 'active'),
  ('IceBlaze', 'IceBlaze#7890', 'IceBlazeGamer', '2023-11-20', 'inactive')
ON CONFLICT (nickname) DO NOTHING;

-- Insert sample violations
INSERT INTO public.violations (member_id, violation_type, violation_name, severity, description) 
SELECT id, 'template', 'Inappropriate Language', 'high', 'Used inappropriate language in chat' 
FROM public.members WHERE nickname = 'ShadowHunter'
ON CONFLICT DO NOTHING;

INSERT INTO public.violations (member_id, violation_type, violation_name, severity, description) 
SELECT id, 'custom', 'Spamming', 'medium', 'Spammed messages excessively' 
FROM public.members WHERE nickname = 'NeonWolf'
ON CONFLICT DO NOTHING;

-- Insert sample departures
INSERT INTO public.member_departures (member_id, departure_reason, departed_at, tenure_days)
SELECT id, 'Took a break from gaming', '2024-06-15', 540
FROM public.members WHERE nickname = 'IceBlaze'
ON CONFLICT DO NOTHING;
