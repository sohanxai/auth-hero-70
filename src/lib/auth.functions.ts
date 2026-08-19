import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const loginReadinessSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(6).max(128),
});

export const makeLegacyAccountLoginReady = createServerFn({ method: "POST" })
  .inputValidator((input) => loginReadinessSchema.parse(input))
  .handler(async ({ data }) => {
    const url = process.env.SUPABASE_URL;
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !publishableKey) return { checked: false };

    const authClient = createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const firstAttempt = await authClient.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (!firstAttempt.error) {
      await authClient.auth.signOut();
      return { checked: true };
    }

    if (!/confirm|verified|verification/i.test(firstAttempt.error.message)) {
      return { checked: true };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const targetEmail = data.email.trim().toLowerCase();
    let page = 1;

    while (page <= 20) {
      const { data: usersPage, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: 100,
      });
      if (error) return { checked: false };

      const user = usersPage.users.find((item) => item.email?.toLowerCase() === targetEmail);
      if (user) {
        if (!user.email_confirmed_at && !user.confirmed_at) {
          await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true });
        }
        return { checked: true };
      }

      if (usersPage.users.length < 100) break;
      page += 1;
    }

    return { checked: true };
  });