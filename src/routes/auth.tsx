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
import { makeLegacyAccountLoginReady } from "@/lib/auth.functions";
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
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        if (next) window.location.href = next;
        else navigate({ to: "/dashboard" });
      }
    });
  }, [navigate, next]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim().toLowerCase();
    const password = String(f.get("password") ?? "");
    let { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error && /confirm|verified|verification/i.test(error.message)) {
      await makeLegacyAccountLoginReady({ data: { email, password } });
      ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
    }
    setLoading(false);
    if (error || !data.session) {
      return toast.error(error?.message || "Invalid credentials. Please check your email and password.");
    }
    toast.success("Welcome back!");
    await navigateToBestDashboard();
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true);
    const f = new FormData(e.currentTarget);
    const fullName = String(f.get("full_name") ?? "").trim();
    const phone = String(f.get("phone") ?? "").trim();
    const email = String(f.get("email") ?? "").trim().toLowerCase();
    const password = String(f.get("password") ?? "");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName, phone },
      },
    });
    if (error) {
      const existingAccount = /already|registered|exists/i.test(error.message);
      if (existingAccount) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (signInErr || !signInData.session) return toast.error("An account already exists for this email, but the password does not match.");
        toast.success("Welcome back!");
        await navigateToBestDashboard();
        return;
      }
      setLoading(false);
      return toast.error(error.message);
    }
    const duplicateWithoutNewIdentity = data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;
    let userId = data.user?.id;
    if (!data.session) {
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        setLoading(false);
        toast.error(duplicateWithoutNewIdentity ? "An account already exists for this email, but the password does not match." : "Account created, but login is waiting for email confirmation. Please sign in after confirming your email.");
        setTab("login");
        return;
      }
      userId = signInData.user?.id;
    }
    if (userId) {
      await supabase.from("profiles").upsert({ id: userId, full_name: fullName, phone });
    }
    setLoading(false);
    toast.success("Welcome to BloodConnect!");
    if (next) window.location.href = next;
    else navigate({ to: "/dashboard" });
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
