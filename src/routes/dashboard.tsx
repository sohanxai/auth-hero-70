import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Heart, LogOut, User as UserIcon, Droplet, Activity, MapPin, Phone, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { getMyDonors, toggleAvailability, getMyRequests } from "@/lib/bloodconnect.functions";
import { BloodGroupBadge } from "@/components/site/BloodGroupBadge";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "Your Dashboard \u2014 BloodConnect" },
    { name: "description", content: "Track your donations, requests and availability status in one place." },
    { property: "og:title", content: "Your Dashboard \u2014 BloodConnect" },
    { property: "og:description", content: "Track your donations, requests and availability status in one place." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) { navigate({ to: "/auth" }); return; }
      setUser(data.user);
      try {
        const [d, r] = await Promise.all([getMyDonors(), getMyRequests()]);
        setDonors(d.donors); setRequests(r.requests);
      } catch (e: any) { toast.error(e.message); }
      finally { setLoading(false); }
    })();
  }, [navigate]);

  async function onToggle(id: string, v: boolean) {
    setDonors((prev) => prev.map((d) => (d.id === id ? { ...d, is_available: v } : d)));
    try { await toggleAvailability({ data: { is_available: v, id } }); toast.success(v ? "You're available" : "Set to unavailable"); }
    catch (e: any) { toast.error(e.message); }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading) return <div className="p-20 text-center text-muted-foreground">Loading dashboard...</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
        </div>
        <Button variant="outline" onClick={signOut}><LogOut className="mr-2 h-4 w-4" /> Sign out</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-xl flex items-center gap-2"><UserIcon className="h-5 w-5 text-primary" /> Donor Registrations {donors.length > 0 && <Badge variant="secondary">{donors.length}</Badge>}</h2>
            <Link to="/donate"><Button size="sm" variant="outline"><Edit className="mr-2 h-3 w-3" /> Add new</Button></Link>
          </div>
          {donors.length > 0 ? (
            <div className="space-y-6">
              {donors.map((donor) => (
              <div key={donor.id} className="space-y-4 rounded-xl border p-4">
              <div className="flex items-center gap-4">
                <BloodGroupBadge group={donor.blood_group} />
                <div className="flex-1">
                  <p className="font-semibold text-lg">{donor.full_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-3 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {donor.area ?? "—"}, {donor.city}</span>
                    <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {donor.phone}</span>
                  </p>
                </div>
                <Badge className="bg-success/15 text-success">{donor.reliability_score}% reliable</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted p-4">
                <div>
                  <p className="font-semibold">Availability</p>
                  <p className="text-xs text-muted-foreground">Turn off if you can't donate right now.</p>
                </div>
                <Switch checked={donor.is_available} onCheckedChange={(v) => onToggle(donor.id, v)} />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <Stat label="Donations" value={donor.donations_count} />
                <Stat label="Last donation" value={donor.last_donation_date ?? "—"} />
                <Stat label="Lives helped" value={(donor.donations_count ?? 0) * 3} />
              </div>
              </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Heart className="mx-auto h-10 w-10 text-primary" />
              <p className="mt-3 font-semibold">No donor registrations yet</p>
              <p className="text-sm text-muted-foreground mt-1">Register to start saving lives.</p>
              <Link to="/donate"><Button className="mt-4 bg-gradient-primary shadow-glow">Become a Donor</Button></Link>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-xl flex items-center gap-2 mb-4"><Activity className="h-5 w-5 text-secondary" /> Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/find-blood"><Button variant="outline" className="w-full justify-start"><Droplet className="mr-2 h-4 w-4 text-primary" /> Find Blood</Button></Link>
            <Link to="/donate"><Button variant="outline" className="w-full justify-start"><Heart className="mr-2 h-4 w-4 text-primary" /> Update Donor Profile</Button></Link>
            <Link to="/hospital-register"><Button variant="outline" className="w-full justify-start">Register Hospital</Button></Link>
            <Link to="/blood-bank-register"><Button variant="outline" className="w-full justify-start">Register Blood Bank</Button></Link>
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-semibold text-xl mb-4">Your Blood Requests</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven't created any requests yet.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center gap-4 p-3 rounded-lg border">
                <BloodGroupBadge group={r.blood_group} />
                <div className="flex-1">
                  <p className="font-semibold">{r.patient_name} • {r.units} units</p>
                  <p className="text-xs text-muted-foreground">{r.hospital} • {r.city}</p>
                </div>
                <Badge>{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <p className="font-display font-bold text-xl">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
