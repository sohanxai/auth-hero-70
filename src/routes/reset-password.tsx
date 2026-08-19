import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Droplet, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/auth-errors";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset your password — BloodConnect" },
      { name: "description", content: "Choose a new password for your BloodConnect account and get back to saving lives." },
      { property: "og:title", content: "Reset your password — BloodConnect" },
      { property: "og:description", content: "Choose a new password for your BloodConnect account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    }).catch(() => {});
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password") ?? "");
    const confirm = String(f.get("confirm") ?? "");
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirm) return toast.error("Passwords do not match.");

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return toast.error(friendlyAuthError(error));
      toast.success("Password updated. You're all set!");
      navigate({ to: "/dashboard" });
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
          <span className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-primary text-primary-foreground">
            <Droplet className="h-5 w-5" fill="currentColor" />
          </span>
          Blood<span className="text-primary">Connect</span>
        </Link>
        <h1 className="text-lg font-semibold text-center">Set a new password</h1>
        {!ready ? (
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Waiting for your reset link… If you landed here directly, request a new link from the{" "}
            <Link to="/auth" className="text-primary hover:underline">login page</Link>.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <Label>New password</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Lock className="h-4 w-4" /></span>
                <Input className="pl-9" name="password" type="password" required minLength={6} />
              </div>
            </div>
            <div>
              <Label>Confirm password</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Lock className="h-4 w-4" /></span>
                <Input className="pl-9" name="confirm" type="password" required minLength={6} />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-glow">
              {loading ? "Updating..." : "Update password"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
