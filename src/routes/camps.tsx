import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/site/BackButton";

export const Route = createFileRoute("/camps")({
  head: () => ({ meta: [
    { title: "Blood Donation Camps Near You \u2014 BloodConnect" },
    { name: "description", content: "Browse upcoming blood donation camps across India and reserve your slot in a few taps." },
    { property: "og:title", content: "Blood Donation Camps Near You \u2014 BloodConnect" },
    { property: "og:description", content: "Browse upcoming blood donation camps across India and reserve your slot in a few taps." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: Camps,
});

const ALL_CAMPS = [
  { date: "Jun 12, 2026", title: "Shalini Tai Mghe Hospital", org: "Apollo Hospitals", city: "Mumbai", area: "Bandra West", slots: 120, filled: 84 },
  { date: "Jun 18, 2026", title: "Shalinitai Meghe Hospital Sawangi", org: "Fortis Healthcare", city: "Bengaluru", area: "Whitefield", slots: 80, filled: 52 },
  { date: "Jun 25, 2026", title: "Civil Hospital Wardha", org: "Red Cross Society", city: "Delhi", area: "Connaught Place", slots: 150, filled: 41 },
  { date: "Jul 03, 2026", title: "University Wellness Fair", org: "Manipal Hospitals", city: "Hyderabad", area: "Gachibowli", slots: 100, filled: 18 },
  { date: "Jul 10, 2026", title: "Corporate Donor Drive", org: "Max Healthcare", city: "Gurugram", area: "Cyber City", slots: 90, filled: 30 },
  { date: "Jul 17, 2026", title: "Rotary Blood Camp", org: "Rotary Club", city: "Chennai", area: "Anna Nagar", slots: 110, filled: 60 },
  { date: "Jul 22, 2026", title: "Lions Mega Camp", org: "Lions Blood Bank", city: "Pune", area: "Koregaon Park", slots: 130, filled: 70 },
  { date: "Aug 01, 2026", title: "Independence Day Drive", org: "AIIMS", city: "New Delhi", area: "Ansari Nagar", slots: 200, filled: 95 },
];

function Camps() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <BackButton />
      <div className="max-w-3xl">
        <Badge variant="secondary" className="mb-3">Upcoming</Badge>
        <h1 className="text-3xl md:text-5xl font-bold">Blood Donation Camps Across India</h1>
        <p className="mt-3 text-muted-foreground text-lg">Find verified, hospital-partnered donation camps near you.</p>
      </div>

      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ALL_CAMPS.map((c) => {
          const pct = Math.round((c.filled / c.slots) * 100);
          return (
            <Card key={c.title} className="p-5 rounded-2xl hover:shadow-elegant hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5 text-primary" /> {c.date}</div>
              <p className="mt-2 font-display font-semibold text-lg">{c.title}</p>
              <p className="text-sm text-muted-foreground">{c.org}</p>
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.area}, {c.city}</p>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground inline-flex items-center gap-1"><Users className="h-3 w-3" /> {c.filled}/{c.slots}</span><span className="font-semibold text-primary">{pct}%</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} /></div>
              </div>
              <Link to="/donate"><Button className="mt-4 w-full bg-gradient-primary shadow-glow">Register</Button></Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
