import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "search_donors",
  title: "Search blood donors",
  description: "Find available blood donors by blood group and city.",
  inputSchema: {
    blood_group: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).describe("Donor blood group."),
    city: z.string().min(1).max(80).describe("City name."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ blood_group, city }) => {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase
      .from("donors")
      .select("id, full_name, blood_group, phone, city, area, is_available, reliability_score, donations_count, last_donation_date")
      .eq("blood_group", blood_group)
      .eq("city", city)
      .order("is_available", { ascending: false })
      .order("reliability_score", { ascending: false })
      .limit(50);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { donors: data ?? [] },
    };
  },
});
