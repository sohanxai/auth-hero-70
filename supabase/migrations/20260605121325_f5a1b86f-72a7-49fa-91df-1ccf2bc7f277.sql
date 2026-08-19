GRANT INSERT ON public.contact_messages TO anon;
CREATE POLICY "public create contact message" ON public.contact_messages FOR INSERT TO anon WITH CHECK (user_id IS NULL);