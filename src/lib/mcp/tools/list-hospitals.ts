import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "list_hospitals",
  title: "List hospitals",
  description: "List verified partner hospitals, optionally filtered by city.",
  inputSchema: { city: z.string().max(80).optional().describe("Optional city filter.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ city }) => {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false },
    });
    let q = supabase
      .from("hospitals")
      .select("id, name, contact_person, email, phone, state, city, area, address, beds, specialties, verified, status")
      .order("verified", { ascending: false })
      .order("name")
      .limit(60);
    if (city) q = q.eq("city", city);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { hospitals: data ?? [] },
    };
  },
});
