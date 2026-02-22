
-- =====================
-- ADVISORS TABLE
-- =====================
CREATE TABLE public.advisors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  specialization TEXT[] NOT NULL DEFAULT '{}',
  experience_years INTEGER NOT NULL DEFAULT 0,
  hourly_rate NUMERIC NOT NULL DEFAULT 0,
  bio TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  total_consultations INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;

-- Anyone can browse advisors
CREATE POLICY "Advisors are viewable by everyone"
  ON public.advisors FOR SELECT
  USING (true);

-- Only agronomists can create their own advisor profile
CREATE POLICY "Agronomists can create their own advisor profile"
  ON public.advisors FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'agronomist'::app_role) AND auth.uid() = user_id);

-- Only the advisor can update their own profile
CREATE POLICY "Advisors can update their own profile"
  ON public.advisors FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can manage all advisors
CREATE POLICY "Admins can manage advisors"
  ON public.advisors FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_advisors_updated_at
  BEFORE UPDATE ON public.advisors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- CROP DIAGNOSTICS TABLE
-- =====================
CREATE TABLE public.crop_diagnostics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL,
  crop_type TEXT NOT NULL,
  image_url TEXT,
  diagnosis_result JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crop_diagnostics ENABLE ROW LEVEL SECURITY;

-- Farmers can insert their own diagnostics
CREATE POLICY "Farmers can insert their own diagnostics"
  ON public.crop_diagnostics FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'farmer'::app_role) AND auth.uid() = farmer_id);

-- Farmers can view their own diagnostics
CREATE POLICY "Farmers can view their own diagnostics"
  ON public.crop_diagnostics FOR SELECT
  USING (auth.uid() = farmer_id);

-- Agronomists can view all diagnostics (read-only)
CREATE POLICY "Agronomists can view all diagnostics"
  ON public.crop_diagnostics FOR SELECT
  USING (has_role(auth.uid(), 'agronomist'::app_role));

-- Admins can manage all diagnostics
CREATE POLICY "Admins can manage diagnostics"
  ON public.crop_diagnostics FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_crop_diagnostics_updated_at
  BEFORE UPDATE ON public.crop_diagnostics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add diagnostic images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('diagnostic-images', 'diagnostic-images', false)
ON CONFLICT (id) DO NOTHING;

-- Farmers can upload their own diagnostic images
CREATE POLICY "Farmers can upload diagnostic images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'diagnostic-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view their own diagnostic images
CREATE POLICY "Users can view their own diagnostic images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'diagnostic-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Agronomists can view all diagnostic images
CREATE POLICY "Agronomists can view all diagnostic images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'diagnostic-images' AND has_role(auth.uid(), 'agronomist'::app_role));
