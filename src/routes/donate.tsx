import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Heart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackButton } from "@/components/site/BackButton";
import { SearchableSelect } from "@/components/site/SearchableSelect";
import { BLOOD_GROUPS, STATES, STATE_CITIES, type BloodGroup } from "@/lib/blood-data";
import { supabase } from "@/integrations/supabase/client";
import { registerDonor } from "@/lib/bloodconnect.functions";

export const Route = createFileRoute("/donate")({
  head: () => ({ meta: [
    { title: "Become a Blood Donor \u2014 BloodConnect" },
    { name: "description", content: "Register as a verified blood donor and get notified when someone nearby needs your blood group." },
    { property: "og:title", content: "Become a Blood Donor \u2014 BloodConnect" },
    { property: "og:description", content: "Register as a verified blood donor and get notified when someone nearby needs your blood group." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: DonatePage,
});

function DonatePage() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);
  const [group, setGroup] = useState<BloodGroup>("O+");
  const [state, setState] = useState("Maharashtra");
  const [city, setCity] = useState("Mumbai");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const cityOptions = useMemo(() => STATE_CITIES[state] ?? [], [state]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signedIn) { toast.error("Please sign in first"); navigate({ to: "/auth", search: { mode: "signup" } }); return; }
    const f = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await registerDonor({ data: {
        full_name: String(f.get("full_name")),
        blood_group: group,
        phone: String(f.get("phone")),
        email: String(f.get("email") || ""),
        city, area: String(f.get("area") || ""),
        age: Number(f.get("age") || 0) || undefined,
        weight: Number(f.get("weight") || 0) || undefined,
      }});
      setDone(true);
      toast.success("You're registered as a donor!");
    } catch (err: any) {
      toast.error(err.message ?? "Registration failed");
    } finally { setLoading(false); }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
        <h1 className="mt-4 text-3xl font-bold">You're a lifesaver!</h1>
        <p className="mt-2 text-muted-foreground">Your donor profile is live. We'll notify you when nearby patients need your blood group.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/dashboard"><Button className="bg-gradient-primary shadow-glow">Go to Dashboard</Button></Link>
          <Link to="/"><Button variant="outline">Back to Home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <BackButton />
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-semibold"><Heart className="h-3.5 w-3.5" /> Save up to 3 lives</div>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold">Become a Verified Donor</h1>
        <p className="mt-2 text-muted-foreground">Takes less than 60 seconds.</p>
      </div>

      {!signedIn && (
        <Card className="mt-6 p-4 bg-warning/10 border-warning/40 text-sm">
          You need an account first. <Link to="/auth" search={{ mode: "signup" }} className="font-semibold underline">Sign up</Link> or <Link to="/auth" className="font-semibold underline">Login</Link>.
        </Card>
      )}

      <Card className="mt-6 p-6 md:p-8 shadow-elegant">
        <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><Label>Full Name *</Label><Input name="full_name" required className="mt-1" /></div>
          <div><Label>Phone *</Label><Input name="phone" required className="mt-1" /></div>
          <div><Label>Email</Label><Input name="email" type="email" className="mt-1" /></div>
          <div><Label>Blood Group *</Label><div className="mt-1"><SearchableSelect value={group} onChange={(v) => setGroup(v as BloodGroup)} options={BLOOD_GROUPS as unknown as string[]} /></div></div>
          <div><Label>Age</Label><Input name="age" type="number" min={18} max={65} className="mt-1" /></div>
          <div><Label>State *</Label><div className="mt-1"><SearchableSelect value={state} onChange={(s) => { setState(s); const f = STATE_CITIES[s]?.[0]; if (f) setCity(f); }} options={STATES} /></div></div>
          <div><Label>City *</Label><div className="mt-1"><SearchableSelect value={city} onChange={setCity} options={cityOptions} /></div></div>
          <div><Label>Area / Locality</Label><Input name="area" className="mt-1" /></div>
          <div><Label>Weight (kg)</Label><Input name="weight" type="number" min={40} max={200} className="mt-1" /></div>
          <Button type="submit" disabled={loading} size="lg" className="md:col-span-2 bg-gradient-primary shadow-glow mt-2">
            {loading ? "Registering..." : "Register as Donor"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
