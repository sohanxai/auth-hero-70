import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Shield, Users, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/site/BackButton";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About BloodConnect \u2014 Our Mission" },
    { name: "description", content: "BloodConnect is India's AI-powered platform connecting donors, blood banks and hospitals in real time." },
    { property: "og:title", content: "About BloodConnect \u2014 Our Mission" },
    { property: "og:description", content: "BloodConnect is India's AI-powered platform connecting donors, blood banks and hospitals in real time." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <BackButton />
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About BloodConnect</h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
        BloodConnect is an AI-powered blood donation and emergency blood-finding platform built to solve
        one of India's biggest healthcare problems — blood unavailability during emergencies.
      </p>

      <div className="mt-10 grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-2xl">Our Mission</h2>
          <p className="mt-3 text-muted-foreground">
            Make blood available to every patient within minutes, by connecting them to verified donors and
            blood banks in real time across all Indian states and union territories.
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold text-2xl">Our Vision</h2>
          <p className="mt-3 text-muted-foreground">
            A future where no patient dies from blood shortage — powered by community, technology, and
            partnerships with leading hospitals and blood banks.
          </p>
        </Card>
      </div>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { i: Heart, t: "12,000+", l: "Verified donors" },
          { i: Shield, t: "320+", l: "Partner blood banks" },
          { i: Users, t: "540+", l: "Hospitals" },
          { i: Activity, t: "38,000+", l: "Lives impacted" },
        ].map((s) => (
          <Card key={s.l} className="p-5 text-center">
            <s.i className="mx-auto h-7 w-7 text-primary" />
            <p className="mt-3 font-display font-bold text-2xl">{s.t}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link to="/donate"><Button size="lg" className="bg-gradient-primary shadow-glow">Join as a Donor</Button></Link>
      </div>
    </div>
  );
}
