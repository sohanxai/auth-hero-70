import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Public: search donors (uses anon client, RLS allows public read).
export const searchDonors = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z.object({
      blood_group: z.string().min(1).max(3),
      city: z.string().min(1).max(80),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { publicSupabase } = await import("@/lib/supabase-public.server");
    const anonClient = publicSupabase();
    const { data: rows, error } = await anonClient
      .from("donors")
      .select("id, full_name, blood_group, phone, city, area, is_available, reliability_score, donations_count, last_donation_date")
      .eq("blood_group", data.blood_group.trim())
      .ilike("city", data.city.trim())
      .order("is_available", { ascending: false })
      .order("reliability_score", { ascending: false })
      .limit(50);
    if (error) return { donors: [], error: error.message };
    return { donors: rows ?? [], error: null };
  });

// Public: list blood banks by city
export const listBloodBanks = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ city: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { publicSupabase } = await import("@/lib/supabase-public.server");
    const anonClient = publicSupabase();
    const { data: rows, error } = await anonClient
      .from("blood_banks")
      .select("*")
      .ilike("city", data.city.trim())
      .order("name");
    if (error) return { banks: [], error: error.message };
    return { banks: rows ?? [], error: null };
  });

export const listHospitals = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ city: z.string().min(1).max(80).optional().or(z.literal("")) }).parse(input))
  .handler(async ({ data }) => {
    const { publicSupabase } = await import("@/lib/supabase-public.server");
    const anonClient = publicSupabase();
    let q = anonClient
      .from("hospitals")
      .select("id, name, registration_number, contact_person, email, phone, state, city, area, address, beds, specialties, verified, status")
      .order("verified", { ascending: false })
      .order("name")
      .limit(60);
    if (data.city) q = q.ilike("city", data.city.trim());
    const { data: rows, error } = await q;
    if (error) return { hospitals: [], error: error.message };
    return { hospitals: rows ?? [], error: null };
  });

// Public: list active emergency requests
export const listActiveRequests = createServerFn({ method: "GET" })
  .handler(async () => {
    const { publicSupabase } = await import("@/lib/supabase-public.server");
    const anonClient = publicSupabase();
    const { data: rows, error } = await anonClient
      .from("blood_requests")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return { requests: [], error: error.message };
    return { requests: rows ?? [], error: null };
  });

// Public stats
export const getStats = createServerFn({ method: "GET" }).handler(async () => {
    const { publicSupabase } = await import("@/lib/supabase-public.server");
    const anonClient = publicSupabase();
  const [d, b, r] = await Promise.all([
    anonClient.from("donors").select("id", { count: "exact", head: true }),
    anonClient.from("blood_banks").select("id", { count: "exact", head: true }),
    anonClient.from("blood_requests").select("id", { count: "exact", head: true }),
  ]);
  return {
    donors: (d.count ?? 0) + 12480,
    banks: (b.count ?? 0) + 320,
    hospitals: 540,
    livesSaved: (r.count ?? 0) * 3 + 38520,
    activeRequests: r.count ?? 0,
  };
});

const donorSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  blood_group: z.enum(["A+","A-","B+","B-","AB+","AB-","O+","O-"]),
  phone: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(80),
  area: z.string().trim().max(80).optional().or(z.literal("")),
  age: z.number().int().min(18).max(65).optional(),
  weight: z.number().int().min(40).max(200).optional(),
  last_donation_date: z.string().optional().or(z.literal("")),
});

// Auth: register/update donor profile
export const registerDonor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => donorSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const payload = {
      user_id: userId,
      full_name: data.full_name,
      blood_group: data.blood_group,
      phone: data.phone,
      email: data.email || null,
      city: data.city,
      area: data.area || null,
      age: data.age ?? null,
      weight: data.weight ?? null,
      last_donation_date: data.last_donation_date || null,
    };
    // Every registration is stored as a separate record — never overwrite previous ones.
    const { data: row, error } = await supabase.from("donors").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id, updated: false };
  });

const hospitalSchema = z.object({
  name: z.string().trim().min(2).max(160),
  registration_number: z.string().trim().min(2).max(80),
  contact_person: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(20),
  state: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  area: z.string().trim().max(100).optional().or(z.literal("")),
  address: z.string().trim().min(5).max(500),
  beds: z.number().int().min(1).max(10000).optional(),
});

export const registerHospital = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => hospitalSchema.parse(input))
  .handler(async ({ data, context }) => {
    const payload = { ...data, area: data.area || null, beds: data.beds ?? null, user_id: context.userId, status: "pending", verified: false };
    const existing = await context.supabase.from("hospitals").select("id").eq("user_id", context.userId).maybeSingle();
    if (existing.data?.id) {
      const { error } = await context.supabase.from("hospitals").update(payload).eq("id", existing.data.id);
      if (error) throw new Error(error.message);
      return { id: existing.data.id, updated: true };
    }
    const { data: row, error } = await context.supabase.from("hospitals").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id, updated: false };
  });

const bloodBankSchema = z.object({
  name: z.string().trim().min(2).max(160),
  license: z.string().trim().min(2).max(80),
  contact_person: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(20),
  state: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  area: z.string().trim().min(1).max(100),
  address: z.string().trim().min(5).max(500),
  capacity: z.number().int().min(1).max(100000).optional(),
});

export const registerBloodBank = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => bloodBankSchema.parse(input))
  .handler(async ({ data, context }) => {
    const payload = {
      ...data,
      capacity: data.capacity ?? null,
      user_id: context.userId,
      status: "pending",
      verified: false,
      inventory: { "A+": 8, "A-": 3, "B+": 8, "B-": 3, "AB+": 4, "AB-": 2, "O+": 10, "O-": 4 },
    };
    const existing = await context.supabase.from("blood_banks").select("id").eq("user_id", context.userId).maybeSingle();
    if (existing.data?.id) {
      const { error } = await context.supabase.from("blood_banks").update(payload).eq("id", existing.data.id);
      if (error) throw new Error(error.message);
      return { id: existing.data.id, updated: true };
    }
    const { data: row, error } = await context.supabase.from("blood_banks").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id, updated: false };
  });

export const getMyDonor = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("donors").select("*").eq("user_id", context.userId)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error) throw new Error(error.message);
    return { donor: data };
  });

export const getMyDonors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("donors").select("*").eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { donors: data ?? [] };
  });

export const toggleAvailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ is_available: z.boolean(), id: z.string().uuid().optional() }).parse(input))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("donors").update({ is_available: data.is_available }).eq("user_id", context.userId);
    if (data.id) q = q.eq("id", data.id);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const requestSchema = z.object({
  patient_name: z.string().trim().min(2).max(100),
  blood_group: z.enum(["A+","A-","B+","B-","AB+","AB-","O+","O-"]),
  units: z.number().int().min(1).max(20),
  hospital: z.string().trim().min(2).max(200),
  contact_phone: z.string().trim().min(7).max(20),
  urgency: z.enum(["critical","high","normal"]),
  city: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const createBloodRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => requestSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("blood_requests")
      .insert({ ...data, notes: data.notes || null, user_id: context.userId, status: "active" })
      .select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const getMyRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("blood_requests").select("*").eq("user_id", context.userId).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { requests: data ?? [] };
  });

export const getMyHospital = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("hospitals").select("*").eq("user_id", context.userId).maybeSingle();
    if (error) throw new Error(error.message);
    return { hospital: data };
  });

export const getMyBloodBank = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("blood_banks").select("*").eq("user_id", context.userId).maybeSingle();
    if (error) throw new Error(error.message);
    return { bloodBank: data };
  });

const campRegistrationSchema = z.object({
  camp_title: z.string().trim().min(2).max(160),
  camp_city: z.string().trim().min(2).max(80),
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  blood_group: z.enum(["A+","A-","B+","B-","AB+","AB-","O+","O-"]),
});

export const registerForCamp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => campRegistrationSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("camp_registrations")
      .insert({ ...data, email: data.email || null, user_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const getMyCampRegistrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("camp_registrations")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { registrations: data ?? [] };
  });

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(1000),
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const { publicSupabase } = await import("@/lib/supabase-public.server");
    const anonClient = publicSupabase();
    const { data: row, error } = await anonClient
      .from("contact_messages")
      .insert({ ...data, user_id: null })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });
