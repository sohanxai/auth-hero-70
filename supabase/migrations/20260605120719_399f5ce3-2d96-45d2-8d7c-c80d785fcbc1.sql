CREATE TABLE public.hospitals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  name text NOT NULL,
  registration_number text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  state text NOT NULL,
  city text NOT NULL,
  area text,
  address text NOT NULL,
  beds integer,
  specialties text[] NOT NULL DEFAULT ARRAY['Emergency Care','Blood Transfusion']::text[],
  verified boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending'
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hospitals TO authenticated;
GRANT SELECT ON public.hospitals TO anon;
GRANT ALL ON public.hospitals TO service_role;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read verified hospitals" ON public.hospitals FOR SELECT TO public USING (verified = true OR auth.uid() = user_id);
CREATE POLICY "auth insert own hospital" ON public.hospitals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner update hospital" ON public.hospitals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner delete hospital" ON public.hospitals FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.camp_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  camp_title text NOT NULL,
  camp_city text NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  blood_group text NOT NULL,
  status text NOT NULL DEFAULT 'registered'
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.camp_registrations TO authenticated;
GRANT ALL ON public.camp_registrations TO service_role;
ALTER TABLE public.camp_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth insert own camp registration" ON public.camp_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner read camp registration" ON public.camp_registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner update camp registration" ON public.camp_registrations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner delete camp registration" ON public.camp_registrations FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new'
);
GRANT INSERT, SELECT ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth create contact message" ON public.contact_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner read contact message" ON public.contact_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.blood_banks
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS license text,
  ADD COLUMN IF NOT EXISTS contact_person text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS capacity integer,
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blood_banks TO authenticated;
GRANT SELECT ON public.blood_banks TO anon;
GRANT ALL ON public.blood_banks TO service_role;
CREATE POLICY "auth insert own blood bank" ON public.blood_banks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner update blood bank" ON public.blood_banks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner delete blood bank" ON public.blood_banks FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_hospitals_updated_at
BEFORE UPDATE ON public.hospitals
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_blood_banks_updated_at ON public.blood_banks;
CREATE TRIGGER set_blood_banks_updated_at
BEFORE UPDATE ON public.blood_banks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();