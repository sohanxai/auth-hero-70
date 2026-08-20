import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, CheckCircle2, Clock, LogOut, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getMyHospital } from "@/lib/bloodconnect.functions";

export const Route = createFileRoute("/hospital-dashboard")({
  head: () => ({ meta: [
    { title: "Hospital Dashboard \u2014 BloodConnect" },
    { name: "description", content: "Manage blood requests, inventory needs and donor responses for your hospital." },
    { property: "og:title", content: "Hospital Dashboard \u2014 BloodConnect" },
    { property: "og:description", content: "Manage blood requests, inventory needs and donor responses for your hospital." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: HospitalDashboard,
});

function HospitalDashboard() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) { navigate({ to: "/auth" }); return; }
      try {
        const result = await getMyHospital();
        setHospital(result.hospital);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) return <div className="p-20 text-center text-muted-foreground">Loading hospital dashboard...</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div><h1 className="text-3xl font-bold">Hospital Dashboard</h1><p className="text-muted-foreground text-sm mt-1">Manage your hospital registration and blood requests.</p></div>
        <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}><LogOut className="mr-2 h-4 w-4" /> Sign out</Button>
      </div>
      {hospital ? (
        <Card className="p-6 shadow-elegant">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-4"><span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary/10 text-secondary"><Building2 /></span><div><h2 className="text-xl font-semibold">{hospital.name}</h2><p className="mt-1 text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {hospital.area ? `${hospital.area}, ` : ""}{hospital.city}, {hospital.state}</p><p className="mt-1 text-sm text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {hospital.phone}</p></div></div>
            <Badge className={hospital.verified ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>{hospital.verified ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}{hospital.verified ? "Verified" : "Pending verification"}</Badge>
          </div>
          <div className="mt-6 grid sm:grid-cols-3 gap-3 text-center"><Stat label="Beds" value={hospital.beds ?? "—"} /><Stat label="Status" value={hospital.status} /><Stat label="Blood requests" value="0" /></div>
        </Card>
      ) : (
        <Card className="p-10 text-center"><Building2 className="mx-auto h-10 w-10 text-secondary" /><h2 className="mt-3 font-semibold text-xl">No hospital registered</h2><p className="mt-1 text-sm text-muted-foreground">Create your hospital profile to activate this dashboard.</p><Link to="/hospital-register"><Button className="mt-5 bg-gradient-primary shadow-glow">Register Hospital</Button></Link></Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return <div className="rounded-xl bg-muted p-4"><p className="font-display font-bold text-xl capitalize">{value}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</p></div>;
}