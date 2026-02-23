
-- Add display_name to advisors so we don't need profiles for public display
ALTER TABLE public.advisors ADD COLUMN display_name TEXT;

-- Update existing seed data
UPDATE public.advisors SET display_name = 'Dr. Anita Deshmukh' WHERE user_id = 'a1b2c3d4-1111-4000-8000-000000000001';
UPDATE public.advisors SET display_name = 'Er. Vikram Singh' WHERE user_id = 'a1b2c3d4-2222-4000-8000-000000000002';
UPDATE public.advisors SET display_name = 'Dr. Kavitha Nair' WHERE user_id = 'a1b2c3d4-3333-4000-8000-000000000003';
UPDATE public.advisors SET display_name = 'Prof. Raghunath Iyer' WHERE user_id = 'a1b2c3d4-4444-4000-8000-000000000004';
