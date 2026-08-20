import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BackButton } from "@/components/site/BackButton";
import { SearchableSelect } from "@/components/site/SearchableSelect";
import { STATES, STATE_CITIES } from "@/lib/blood-data";
import { supabase } from "@/integrations/supabase/client";
import { registerHospital } from "@/lib/bloodconnect.functions";

export const Route = createFileRoute("/hospital-register")({
  head: () => ({ meta: [
    { title: "Register Your Hospital \u2014 BloodConnect" },
    { name: "description", content: "Onboard your hospital to BloodConnect to raise verified blood requests instantly." },
    { property: "og:title", content: "Register Your Hospital \u2014 BloodConnect" },
    { property: "og:description", content: "Onboard your hospital to BloodConnect to raise verified blood requests instantly." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: HospitalRegister,
});

function HospitalRegister() {
  const navigate = useNavigate();
  const [state, setState] = useState("Maharashtra");
  const [city, setCity] = useState("Mumbai");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const cities = useMemo(() => STATE_CITIES[state] ?? [], [state]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) {
      toast.error("Please create an account before registering a hospital.");
      navigate({ to: "/auth", search: { mode: "signup" } });
      return;
    }
    const f = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await registerHospital({ data: {
        name: String(f.get("name")),
        registration_number: String(f.get("reg_no")),
        contact_person: String(f.get("contact_person")),
        email: String(f.get("email")),
        phone: String(f.get("phone")),
        state,
        city,
        area: String(f.get("area") || ""),
        address: String(f.get("address")),
        beds: Number(f.get("beds") || 0) || undefined,
      }});
      toast.success("Hospital registered successfully!");
      setDone(true);
      setTimeout(() => navigate({ to: "/hospital-dashboard" }), 900);
    } catch (err: any) {
      toast.error(err.message ?? "Hospital registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
        <h1 className="mt-4 text-3xl font-bold">Hospital Registration Submitted</h1>
        <p className="mt-2 text-muted-foreground">Our team will verify your details and activate your hospital dashboard within 24 hours.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/hospital-dashboard"><Button className="bg-gradient-primary shadow-glow">Go to Hospital Dashboard</Button></Link>
          <Button variant="outline" onClick={() => navigate({ to: "/" })}>Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <BackButton />
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 text-secondary px-4 py-1.5 text-xs font-semibold">
          <Building2 className="h-3.5 w-3.5" /> Partner with BloodConnect
        </div>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold">Hospital Registration</h1>
        <p className="mt-2 text-muted-foreground">Connect your hospital to India's largest verified donor network.</p>
      </div>

      <Card className="mt-6 p-6 md:p-8 shadow-elegant">
        <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><Label>Hospital Name *</Label><Input name="name" required className="mt-1" /></div>
          <div><Label>Registration Number *</Label><Input name="reg_no" required className="mt-1" /></div>
          <div><Label>Contact Person *</Label><Input name="contact_person" required className="mt-1" /></div>
          <div><Label>Email *</Label><Input name="email" type="email" required className="mt-1" /></div>
          <div><Label>Phone *</Label><Input name="phone" required className="mt-1" /></div>
          <div><Label>State *</Label><div className="mt-1"><SearchableSelect value={state} onChange={(s) => { setState(s); const f = STATE_CITIES[s]?.[0]; if (f) setCity(f); }} options={STATES} /></div></div>
          <div><Label>City *</Label><div className="mt-1"><SearchableSelect value={city} onChange={setCity} options={cities} /></div></div>
          <div><Label>Area / Locality</Label><Input name="area" className="mt-1" /></div>
          <div className="md:col-span-2"><Label>Address *</Label><Textarea name="address" required className="mt-1" /></div>
          <div><Label>Password *</Label><Input name="password" type="password" required minLength={6} className="mt-1" /></div>
          <div><Label>Beds / Capacity</Label><Input name="beds" type="number" className="mt-1" /></div>
          <Button disabled={loading} type="submit" size="lg" className="md:col-span-2 bg-gradient-primary shadow-glow mt-2">
            {loading ? "Submitting..." : "Register Hospital"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
