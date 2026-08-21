import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Server-only Supabase client for PUBLIC (anon) reads inside server functions.
// It never touches localStorage and never persists a session, so it is safe in
// SSR / serverless (Vercel, Netlify, Cloudflare, Node) environments.
let _client: ReturnType<typeof build> | undefined;

function build() {
  const url = process.env['SUPABASE_URL'] ?? process.env['VITE_SUPABASE_URL'];
  const key =
    process.env['SUPABASE_PUBLISHABLE_KEY'] ??
    process.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ??
    process.env['SUPABASE_ANON_KEY'];

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY environment variables on the server.",
    );
  }

  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        // New-format sb_publishable_* keys are opaque, not JWTs.
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export function publicSupabase() {
  if (!_client) _client = build();
  return _client;
}
