import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Droplet, LogOut, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getMyBloodBank } from "@/lib/bloodconnect.functions";

export const Route = createFileRoute("/blood-bank-dashboard")({
  head: () => ({ meta: [
    { title: "Blood Bank Dashboard \u2014 BloodConnect" },
    { name: "description", content: "Update stock levels and respond to hospital blood requests in real time." },
    { property: "og:title", content: "Blood Bank Dashboard \u2014 BloodConnect" },
    { property: "og:description", content: "Update stock levels and respond to hospital blood requests in real time." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: BloodBankDashboard,
});

function BloodBankDashboard() {
  const navigate = useNavigate();
  const [bloodBank, setBloodBank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) { navigate({ to: "/auth" }); return; }
      try {
        const result = await getMyBloodBank();
        setBloodBank(result.bloodBank);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) return <div className="p-20 text-center text-muted-foreground">Loading blood bank dashboard...</div>;

  const inventory = bloodBank?.inventory && typeof bloodBank.inventory === "object" ? bloodBank.inventory : {};

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div><h1 className="text-3xl font-bold">Blood Bank Dashboard</h1><p className="text-muted-foreground text-sm mt-1">Manage registration status and blood inventory.</p></div>
        <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}><LogOut className="mr-2 h-4 w-4" /> Sign out</Button>
      </div>

      {bloodBank ? (
        <div className="space-y-6">
          <Card className="p-6 shadow-elegant">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-4"><span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><Droplet /></span><div><h2 className="text-xl font-semibold">{bloodBank.name}</h2><p className="mt-1 text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {bloodBank.area ? `${bloodBank.area}, ` : ""}{bloodBank.city}, {bloodBank.state}</p><p className="mt-1 text-sm text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {bloodBank.phone}</p></div></div>
              <Badge className={bloodBank.verified ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>{bloodBank.verified ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}{bloodBank.verified ? "Verified" : "Pending verification"}</Badge>
            </div>
            <div className="mt-6 grid sm:grid-cols-3 gap-3 text-center"><Stat label="Capacity" value={bloodBank.capacity ?? "—"} /><Stat label="Status" value={bloodBank.status} /><Stat label="License" value={bloodBank.license ?? "—"} /></div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-xl mb-4">Current Inventory</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(inventory).map(([group, units]) => <Stat key={group} label={group} value={`${units} units`} />)}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-10 text-center"><Droplet className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-3 font-semibold text-xl">No blood bank registered</h2><p className="mt-1 text-sm text-muted-foreground">Create your blood bank profile to activate this dashboard.</p><Link to="/blood-bank-register"><Button className="mt-5 bg-gradient-primary shadow-glow">Register Blood Bank</Button></Link></Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return <div className="rounded-xl bg-muted p-4"><p className="font-display font-bold text-xl capitalize">{value}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</p></div>;
}