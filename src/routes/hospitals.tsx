import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { BackButton } from "@/components/site/BackButton";
import { SearchableSelect } from "@/components/site/SearchableSelect";
import { STATES, STATE_CITIES } from "@/lib/blood-data";

export const Route = createFileRoute("/hospitals")({
  head: () => ({ meta: [
    { title: "Partner Hospitals \u2014 BloodConnect" },
    { name: "description", content: "Explore hospitals partnered with BloodConnect for fast, verified blood supply." },
    { property: "og:title", content: "Partner Hospitals \u2014 BloodConnect" },
    { property: "og:description", content: "Explore hospitals partnered with BloodConnect for fast, verified blood supply." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: HospitalsPage,
});

const HOSPITALS = [
  { id: "apollo-mumbai", name: "Apollo Hospitals", city: "Mumbai", state: "Maharashtra", area: "Bandra West", phone: "+91 1800-500-1066", beds: 420 },
  { id: "fortis-bengaluru", name: "Fortis Healthcare", city: "Bengaluru", state: "Karnataka", area: "Bannerghatta Road", phone: "+91 1800-102-6767", beds: 380 },
  { id: "max-delhi", name: "Max Healthcare", city: "New Delhi", state: "Delhi", area: "Saket", phone: "+91 11-2651-5050", beds: 530 },
  { id: "manipal-hyderabad", name: "Manipal Hospitals", city: "Hyderabad", state: "Telangana", area: "Gachibowli", phone: "+91 40-6165-6565", beds: 300 },
  { id: "aiims-delhi", name: "AIIMS Blood Centre", city: "New Delhi", state: "Delhi", area: "Ansari Nagar", phone: "+91 11-2659-3212", beds: 900 },
  { id: "ruby-pune", name: "Ruby Hall Clinic", city: "Pune", state: "Maharashtra", area: "Sassoon Road", phone: "+91 20-6645-5100", beds: 350 },
];

function HospitalsPage() {
  const [state, setState] = useState("Maharashtra");
  const [city, setCity] = useState("Mumbai");
  const cities = useMemo(() => STATE_CITIES[state] ?? [], [state]);
  const visible = HOSPITALS.filter((h) => h.city === city || h.state === state);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <BackButton />
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <Badge variant="secondary">Verified network</Badge>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold">Partner Hospitals</h1>
          <p className="mt-2 text-muted-foreground">Browse hospitals connected to BloodConnect and register your institution.</p>
        </div>
        <Link to="/hospital-register"><Button className="bg-gradient-primary shadow-glow">Register Hospital</Button></Link>
      </div>
      <Card className="mt-8 p-5 grid md:grid-cols-2 gap-4">
        <div><Label>State / UT</Label><div className="mt-1"><SearchableSelect value={state} onChange={(s) => { setState(s); setCity(STATE_CITIES[s]?.[0] ?? ""); }} options={STATES} /></div></div>
        <div><Label>City</Label><div className="mt-1"><SearchableSelect value={city} onChange={setCity} options={cities} /></div></div>
      </Card>
      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((h) => (
          <Card key={h.id} className="p-5 hover:shadow-elegant transition">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary/10 text-secondary"><Building2 className="h-5 w-5" /></span>
              <div><p className="font-semibold">{h.name}</p><p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {h.area}, {h.city}</p></div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm"><span className="inline-flex items-center gap-1 text-success"><ShieldCheck className="h-4 w-4" /> Verified</span><span>{h.beds} beds</span></div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <Link to="/hospitals"><Button size="sm" variant="outline" className="w-full">View</Button></Link>
              <Link to="/hospital-register"><Button size="sm" className="w-full bg-gradient-primary">Register</Button></Link>
              <a href={`tel:${h.phone}`}><Button size="sm" variant="ghost" className="w-full"><Phone className="h-3 w-3" /></Button></a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}