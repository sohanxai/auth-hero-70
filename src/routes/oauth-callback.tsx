import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Droplet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/auth-errors";

type CallbackSearch = { next?: string };

export const Route = createFileRoute("/oauth-callback")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): CallbackSearch => ({
    next: typeof s.next === "string" && s.next.startsWith("/") ? s.next : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Finishing sign-in \u2014 BloodConnect" },
      { name: "description", content: "Completing your secure BloodConnect sign-in. You will be redirected to your dashboard in a moment." },
      { property: "og:title", content: "Finishing sign-in \u2014 BloodConnect" },
      { property: "og:description", content: "Completing your secure BloodConnect sign-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OAuthCallback,
});

function OAuthCallback() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let done = false;

    const finish = (session: unknown) => {
      if (done || !session) return;
      done = true;
      if (next) window.location.href = next;
      else navigate({ to: "/dashboard", replace: true });
    };

    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const providerError = params.get("error_description") ?? hash.get("error_description") ?? params.get("error");
    if (providerError) {
      setError(friendlyAuthError(new Error(providerError)));
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => finish(session));

    (async () => {
      try {
        const code = params.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }
        const { data } = await supabase.auth.getSession();
        if (data.session) finish(data.session);
        else {
          // Give the implicit-flow hash listener a moment before declaring failure.
          setTimeout(() => {
            if (!done) setError("We couldn't complete the sign-in. Please try again.");
          }, 4000);
        }
      } catch (err) {
        setError(friendlyAuthError(err));
      }
    })();

    return () => subscription.unsubscribe();
  }, [navigate, next]);

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 text-center">
      <div className="space-y-4">
        <span className="mx-auto grid place-items-center h-12 w-12 rounded-xl bg-gradient-primary text-primary-foreground animate-pulse">
          <Droplet className="h-6 w-6" fill="currentColor" />
        </span>
        {error ? (
          <>
            <h1 className="font-display text-xl font-bold">Sign-in failed</h1>
            <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
            <a href="/auth" className="text-sm text-primary hover:underline">Back to sign in</a>
          </>
        ) : (
          <>
            <h1 className="font-display text-xl font-bold">Finishing sign-in…</h1>
            <p className="text-sm text-muted-foreground">Securely verifying your Google account.</p>
          </>
        )}
      </div>
    </div>
  );
}
