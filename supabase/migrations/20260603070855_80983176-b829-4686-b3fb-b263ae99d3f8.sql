
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Donors
CREATE TABLE public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL,
  area TEXT,
  age INT,
  weight INT,
  last_donation_date DATE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  reliability_score INT NOT NULL DEFAULT 85,
  donations_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.donors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donors TO authenticated;
GRANT ALL ON public.donors TO service_role;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read donors" ON public.donors FOR SELECT USING (true);
CREATE POLICY "auth insert own donor" ON public.donors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner update donor" ON public.donors FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner delete donor" ON public.donors FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Blood banks
CREATE TABLE public.blood_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  address TEXT,
  phone TEXT NOT NULL,
  inventory JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blood_banks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blood_banks TO authenticated;
GRANT ALL ON public.blood_banks TO service_role;
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read banks" ON public.blood_banks FOR SELECT USING (true);

-- Blood requests
CREATE TABLE public.blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  units INT NOT NULL DEFAULT 1,
  hospital TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'high',
  city TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blood_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blood_requests TO authenticated;
GRANT ALL ON public.blood_requests TO service_role;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read requests" ON public.blood_requests FOR SELECT USING (true);
CREATE POLICY "auth insert request" ON public.blood_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner update request" ON public.blood_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner delete request" ON public.blood_requests FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_donors_search ON public.donors(blood_group, city);
CREATE INDEX idx_requests_status ON public.blood_requests(status, created_at DESC);
