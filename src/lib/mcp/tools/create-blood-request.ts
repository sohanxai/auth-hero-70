import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "create_blood_request",
  title: "Create blood request",
  description: "Create an emergency blood request as the signed-in user.",
  inputSchema: {
    patient_name: z.string().min(2).max(100),
    blood_group: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
    units: z.number().int().min(1).max(20),
    hospital: z.string().min(2).max(200),
    contact_phone: z.string().min(7).max(20),
    urgency: z.enum(["critical", "high", "normal"]),
    city: z.string().min(2).max(80),
    notes: z.string().max(500).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("blood_requests")
      .insert({ ...input, notes: input.notes ?? null, user_id: ctx.getUserId(), status: "active" })
      .select("id")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Created blood request ${data.id}` }],
      structuredContent: { id: data.id },
    };
  },
});
