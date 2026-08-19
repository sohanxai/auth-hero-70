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
  head: () => ({ meta: [{ title: "Login / Register — BloodConnect" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { mode, next } = Route.useSearch();
  const [tab, setTab] = useState<"login" | "signup">(mode ?? "login");
  const [loading, setLoading] = useState(false);

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
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <Field icon={<Mail className="h-4 w-4" />} label="Email" name="email" type="email" required />
              <Field icon={<Lock className="h-4 w-4" />} label="Password" name="password" type="password" required minLength={6} />
              <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-glow">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
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
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
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
