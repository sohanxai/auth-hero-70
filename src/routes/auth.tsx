import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Droplet, Mail, Lock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { credentialsSchema, friendlyAuthError, signupSchema } from "@/lib/auth-errors";
import { getMyBloodBank, getMyHospital } from "@/lib/bloodconnect.functions";

type AuthSearch = { mode?: "login" | "signup"; next?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): AuthSearch => ({
    mode: s.mode === "signup" ? "signup" : "login",
    next: typeof s.next === "string" && s.next.startsWith("/") ? s.next : undefined,
  }),
  head: () => ({ meta: [
    { title: "Login or Register — BloodConnect" },
    { name: "description", content: "Sign in or create your BloodConnect account to request blood, donate, or manage your organisation." },
    { property: "og:title", content: "Login or Register — BloodConnect" },
    { property: "og:description", content: "Sign in or create your BloodConnect account to request blood, donate, or manage your organisation." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { mode, next } = Route.useSearch();
  const [tab, setTab] = useState<"login" | "signup">(mode ?? "login");
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) {
          if (next) window.location.href = next;
          else navigate({ to: "/dashboard" });
        }
      })
      .catch(() => {
        // No session available (or auth unreachable) — stay on the auth page.
      });
  }, [navigate, next]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = credentialsSchema.safeParse({
      email: f.get("email") ?? "",
      password: f.get("password") ?? "",
    });
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0]?.message ?? "Please check your details.");
    }
    const { email, password } = parsed.data;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        return toast.error(friendlyAuthError(error));
      }
      toast.success("Welcome back!");
      await navigateToBestDashboard();
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse({
      fullName: f.get("full_name") ?? "",
      phone: f.get("phone") ?? "",
      email: f.get("email") ?? "",
      password: f.get("password") ?? "",
    });
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0]?.message ?? "Please check your details.");
    }
    const { fullName, phone, email, password } = parsed.data;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { full_name: fullName, phone },
        },
      });

      if (error) {
        setTab("login");
        return toast.error(friendlyAuthError(error));
      }

      // Supabase returns a user with an empty `identities` array when the
      // email is already registered (it does not error, for privacy).
      const alreadyRegistered =
        !!data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;
      if (alreadyRegistered) {
        setTab("login");
        return toast.error("Email already registered. Please sign in instead.");
      }

      // No session means the provider requires email confirmation.
      if (!data.session) {
        setTab("login");
        return toast.success("Account created. Please verify your email, then sign in.");
      }

      const userId = data.session.user.id;
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: userId, full_name: fullName, phone });
      if (profileError) {
        console.error("[auth] profile upsert failed", profileError);
      }

      toast.success("Welcome to BloodConnect!");
      if (next) window.location.href = next;
      else navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function navigateToBestDashboard() {
    if (next) { window.location.href = next; return; }
    try {
      const [hospital, bank] = await Promise.all([getMyHospital(), getMyBloodBank()]);
      if (bank.bloodBank) return navigate({ to: "/blood-bank-dashboard" });
      if (hospital.hospital) return navigate({ to: "/hospital-dashboard" });
    } catch {
      // The authenticated token is still settling; the general dashboard remains safe.
    }
    return navigate({ to: "/dashboard" });
  }

  async function handleGoogle() {
    setOauthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}${next ?? "/dashboard"}` },
      });
      if (error) toast.error(friendlyAuthError(error));
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setOauthLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return toast.error("Please enter a valid email address.");
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return toast.error(friendlyAuthError(error));
      toast.success("If that email is registered, a reset link is on its way.");
      setForgot(false);
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 shadow-elegant">
        <Link to="/" className="flex items-center justify-center gap-2 font-display font-bold text-2xl mb-6">
          <span className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-primary text-primary-foreground"><Droplet className="h-5 w-5" fill="currentColor" /></span>
          Blood<span className="text-primary">Connect</span>
        </Link>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            {forgot ? (
              <form onSubmit={handleForgot} className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send you a link to reset your password.
                </p>
                <Field icon={<Mail className="h-4 w-4" />} label="Email" name="email" type="email" required />
                <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-glow">
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
                <button type="button" className="w-full text-sm text-muted-foreground hover:text-foreground" onClick={() => setForgot(false)}>
                  Back to sign in
                </button>
              </form>
            ) : (
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <Field icon={<Mail className="h-4 w-4" />} label="Email" name="email" type="email" required />
              <Field icon={<Lock className="h-4 w-4" />} label="Password" name="password" type="password" required minLength={6} />
              <div className="flex justify-end -mt-2">
                <button type="button" className="text-sm text-primary hover:underline" onClick={() => setForgot(true)}>
                  Forgot password?
                </button>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-glow">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
              <OrDivider />
              <GoogleButton onClick={handleGoogle} disabled={oauthLoading} />
            </form>
            )}
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 mt-4">
              <Field icon={<User className="h-4 w-4" />} label="Full name" name="full_name" required />
              <Field icon={<Phone className="h-4 w-4" />} label="Phone" name="phone" required />
              <Field icon={<Mail className="h-4 w-4" />} label="Email" name="email" type="email" required />
              <Field icon={<Lock className="h-4 w-4" />} label="Password" name="password" type="password" required minLength={6} />
              <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-glow">
                {loading ? "Creating account..." : "Create account"}
              </Button>
              <OrDivider />
              <GoogleButton onClick={handleGoogle} disabled={oauthLoading} />
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function GoogleButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button type="button" variant="outline" className="w-full gap-2" onClick={onClick} disabled={disabled}>
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4h6.6c-.1 1.1-.9 2.8-2.5 3.9l-.02.15 3.6 2.8.25.03c2.3-2.1 3.6-5.2 3.6-8.7Z" />
        <path fill="#34A853" d="M12 24c3.3 0 6-1.1 8-2.9l-3.8-3c-1 .7-2.4 1.2-4.2 1.2a7.3 7.3 0 0 1-6.9-5l-.14.01-3.7 2.9-.05.14A12 12 0 0 0 12 24Z" />
        <path fill="#FBBC05" d="M5.1 14.3a7.4 7.4 0 0 1-.4-2.3c0-.8.15-1.6.39-2.3v-.15l-3.8-2.9-.12.06A12 12 0 0 0 0 12c0 1.9.5 3.8 1.2 5.3l3.9-3Z" />
        <path fill="#EB4335" d="M12 4.7c2.3 0 3.9 1 4.8 1.8l3.5-3.4C18 1.2 15.3 0 12 0A12 12 0 0 0 1.2 6.7l3.9 3A7.3 7.3 0 0 1 12 4.7Z" />
      </svg>
      {disabled ? "Connecting..." : "Continue with Google"}
    </Button>
  );
}

function Field({ icon, label, ...props }: { icon: React.ReactNode; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative mt-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <Input className="pl-9" {...props} />
      </div>
    </div>
  );
}
