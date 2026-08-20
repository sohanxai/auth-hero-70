import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import {
  ArrowRight, Heart, Shield, Activity, Clock, Search, UserPlus, CheckCircle, Zap, Star,
  Calendar, MapPin, Award, HeartPulse, Droplet, Users, Building2, Sparkles, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getStats } from "@/lib/bloodconnect.functions";
import { BLOOD_GROUPS, COMPATIBILITY, type BloodGroup } from "@/lib/blood-data";
import { useState } from "react";
import { BloodGroupBadge } from "@/components/site/BloodGroupBadge";
import { AnimatedCounter } from "@/components/site/AnimatedCounter";
import heroBg from "@/assets/hero-bg.jpg";
import campImg from "@/assets/camp.jpg";
import benefitsImg from "@/assets/benefits.jpg";

const statsQO = queryOptions({ queryKey: ["stats"], queryFn: () => getStats() });

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(statsQO),
  head: () => ({
    meta: [
      { title: "BloodConnect — Find Blood Donors & Blood Banks Instantly" },
      { name: "description", content: "Search verified blood donors, blood banks and hospitals across India in seconds, and join upcoming donation camps." },
      { property: "og:title", content: "BloodConnect — Find Blood Donors Instantly" },
      { property: "og:description", content: "Verified donors, blood banks and hospitals connected in real time across India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
  errorComponent: ({ error }) => <div className="p-12 text-center text-muted-foreground">{error.message}</div>,
});

const CAMPS = [
  { date: "Jun 12", month: "2026", title: "Shalini Tai Mghe Hospital", org: "Apollo Hospitals", city: "Mumbai", area: "Bandra West", slots: 120, filled: 84 },
  { date: "Jun 18", month: "2026", title: "Tech Park Donation Drive", org: "Fortis Healthcare", city: "Bengaluru", area: "Whitefield", slots: 80, filled: 52 },
  { date: "Jun 25", month: "2026", title: "Community Lifesavers Camp", org: "Red Cross Society", city: "Delhi", area: "Connaught Place", slots: 150, filled: 41 },
  { date: "Jul 03", month: "2026", title: "University Wellness Fair", org: "Manipal Hospitals", city: "Hyderabad", area: "Gachibowli", slots: 100, filled: 18 },
];

const PARTNERS = [
  { name: "Apollo Hospitals", type: "Hospital Network" },
  { name: "Fortis Healthcare", type: "Hospital Network" },
  { name: "Manipal Hospitals", type: "Hospital Network" },
  { name: "Max Healthcare", type: "Hospital Network" },
  { name: "Red Cross Blood Bank", type: "Blood Bank" },
  { name: "Rotary Blood Centre", type: "Blood Bank" },
  { name: "Lions Blood Bank", type: "Blood Bank" },
  { name: "AIIMS Blood Centre", type: "Blood Bank" },
];

function Home() {
  const { data: stats } = useSuspenseQuery(statsQO);
  const [selected, setSelected] = useState<BloodGroup>("O+");
  const compat = COMPATIBILITY[selected];

  return (
    <div className="overflow-hidden">
      {/* ===================== HERO ===================== */}
      <section className="relative min-h-[92vh] flex items-center">
        <img src={heroBg} alt="" aria-hidden width={1920} height={1152} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background/95 via-background/80 to-background/60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute -z-10 top-20 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -z-10 bottom-20 right-0 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 backdrop-blur px-4 py-1.5 text-xs font-medium shadow-card mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered donor matching • Trusted by {stats.hospitals}+ hospitals
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Every drop <br className="hidden sm:block" />
              <span className="text-gradient-primary">saves a life.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Connect with verified donors, find blood banks instantly, and join donation camps near you. Real-time availability, zero friction.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/find-blood">
                <Button size="lg" className="bg-gradient-primary shadow-glow text-base h-12 px-6 hover:scale-105 transition-transform">
                  <Search className="mr-2 h-5 w-5" /> Find Blood Now
                </Button>
              </Link>
              <Link to="/donate">
                <Button size="lg" variant="outline" className="text-base h-12 px-6 bg-card/60 backdrop-blur hover:bg-card">
                  <Heart className="mr-2 h-5 w-5" /> Become a Donor
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { icon: Shield, label: "Verified donors", c: "text-success" },
                { icon: Clock, label: "24/7 support", c: "text-secondary" },
                { icon: Activity, label: "Real-time", c: "text-primary" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-start gap-1.5">
                  <b.icon className={`h-5 w-5 ${b.c}`} />
                  <span className="text-xs font-medium text-muted-foreground">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:justify-self-end w-full max-w-md animate-float">
            <div className="absolute -inset-6 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
            <Card className="relative glass border-white/20 p-6 shadow-elegant rounded-3xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Live Network</p>
                  <p className="font-display font-bold text-xl mt-0.5">India-wide coverage</p>
                </div>
                <span className="h-10 w-10 grid place-items-center rounded-full bg-success/15">
                  <HeartPulse className="h-5 w-5 text-success animate-pulse" />
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_GROUPS.map((g) => (
                  <div key={g} className="aspect-square grid place-items-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/10 font-display font-bold text-primary hover:scale-105 transition-transform cursor-default">
                    {g}
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="font-display font-bold text-2xl text-primary"><AnimatedCounter value={stats.donors} /></p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Donors</p>
                </div>
                <div>
                  <p className="font-display font-bold text-2xl text-secondary"><AnimatedCounter value={stats.banks} /></p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Banks</p>
                </div>
                <div>
                  <p className="font-display font-bold text-2xl text-success"><AnimatedCounter value={stats.livesSaved} /></p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Lives</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ===================== ANIMATED STATS BAR ===================== */}
      <section className="border-y bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
          {[
            { v: stats.donors, l: "Registered Donors", s: "+" },
            { v: stats.banks, l: "Blood Banks" },
            { v: stats.hospitals, l: "Hospitals" },
            { v: stats.livesSaved, l: "Lives Saved", s: "+" },
            { v: stats.activeRequests, l: "Active Camps" },
          ].map((s) => (
            <div key={s.l} className="hover:scale-105 transition-transform">
              <p className="font-display font-bold text-3xl md:text-4xl text-gradient-primary">
                <AnimatedCounter value={s.v} suffix={s.s ?? ""} />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== WHY DONATE ===================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 bg-gradient-medical opacity-15 blur-3xl rounded-full" />
            <img src={benefitsImg} alt="Doctor holding red heart symbolising blood donation" loading="lazy" width={1024} height={768} className="relative rounded-3xl shadow-elegant aspect-[4/3] object-cover" />
            <Card className="absolute -bottom-6 -right-6 glass border-white/20 p-4 shadow-elegant rounded-2xl hidden md:block">
              <div className="flex items-center gap-3">
                <span className="h-12 w-12 grid place-items-center rounded-xl bg-primary/15 text-primary">
                  <Droplet className="h-6 w-6" fill="currentColor" />
                </span>
                <div>
                  <p className="font-display font-bold text-xl">1 donation = 3 lives</p>
                  <p className="text-xs text-muted-foreground">Whole blood is separated into 3 components</p>
                </div>
              </div>
            </Card>
          </div>
          <div className="order-1 lg:order-2">
            <Badge variant="secondary" className="mb-4">Why Donate Blood?</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Your blood is someone's <span className="text-primary">second chance</span></h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">Every two seconds, someone in India needs blood. There's no substitute — only donors can save lives.</p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {[
                { i: HeartPulse, t: "Heart-healthy", d: "Lowers blood viscosity & cardiovascular risk." },
                { i: Activity, t: "Free health check", d: "Hb, BP, pulse & infection screening included." },
                { i: Sparkles, t: "Replenishes cells", d: "Stimulates fresh red blood cell production." },
                { i: Award, t: "Save 3 lives", d: "Plasma, platelets & red cells help 3 patients." },
              ].map((b) => (
                <div key={b.t} className="group flex gap-4 p-5 rounded-2xl border bg-card hover:shadow-elegant hover:-translate-y-1 transition-all">
                  <span className="h-10 w-10 shrink-0 grid place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <b.i className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{b.t}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{b.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== BLOOD DONATION FACTS ===================== */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">Blood Donation Facts</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Numbers that move people</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { v: 38, s: "%", l: "of population eligible to donate", c: "from-primary/20 to-primary/5" },
              { v: 3, s: "", l: "lives saved per single donation", c: "from-secondary/20 to-secondary/5" },
              { v: 90, s: " days", l: "between safe whole-blood donations", c: "from-success/20 to-success/5" },
              { v: 12, s: "M+", l: "units needed in India annually", c: "from-warning/20 to-warning/5" },
            ].map((f) => (
              <Card key={f.l} className={`relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br ${f.c} border-white/40 hover:shadow-elegant hover:-translate-y-2 transition-all`}>
                <p className="font-display font-bold text-5xl md:text-6xl text-foreground">
                  <AnimatedCounter value={f.v} suffix={f.s} />
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-snug">{f.l}</p>
                <Droplet className="absolute -bottom-2 -right-2 h-20 w-20 text-primary/10" fill="currentColor" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== UPCOMING DONATION CAMPS ===================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Badge variant="secondary" className="mb-4">Awareness & Outreach</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Upcoming Donation Camps</h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-2xl">Join a verified camp in your city — partnered with leading hospitals & blood banks.</p>
          </div>
          <Link to="/camps" className="self-start md:self-end"><Button variant="outline">View all camps <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Featured camp with image */}
          <Card className="lg:row-span-2 overflow-hidden rounded-3xl border-0 shadow-elegant group">
            <div className="relative h-64 lg:h-80 overflow-hidden">
              <img src={campImg} alt="Outdoor blood donation camp" loading="lazy" width={1024} height={768} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">Featured</Badge>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs uppercase tracking-wider opacity-90">Mega Drive</p>
                <p className="font-display font-bold text-2xl mt-1">India Lifesavers Week</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" /> Jun 10 – Jun 18, 2026
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-secondary" /> 24 cities • 86 partner centres
              </div>
              <p className="mt-4 text-sm leading-relaxed">National blood donation week with on-spot health screening, refreshments, and lifesaver certificates.</p>
              <Link to="/donate"><Button className="mt-5 w-full bg-gradient-primary shadow-glow">Register Now <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            </div>
          </Card>

          {/* Compact camp list */}
          {CAMPS.map((c) => {
            const pct = Math.round((c.filled / c.slots) * 100);
            return (
              <Card key={c.title} className="group p-5 rounded-3xl border hover:shadow-elegant hover:-translate-y-1 transition-all">
                <div className="flex gap-4">
                  <div className="shrink-0 w-16 text-center rounded-2xl bg-gradient-primary text-primary-foreground py-2 shadow-glow">
                    <p className="text-[10px] uppercase font-semibold opacity-90">{c.date.split(" ")[0]}</p>
                    <p className="font-display font-bold text-2xl leading-none">{c.date.split(" ")[1]}</p>
                    <p className="text-[10px] mt-0.5 opacity-90">{c.month}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-base truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.org}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {c.area}, {c.city}
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{c.filled}/{c.slots} registered</span>
                        <span className="font-semibold text-primary">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <Link to="/donate"><Button size="sm" variant="outline" className="mt-3 w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                      Register
                    </Button></Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Awareness banner */}
        <Card className="mt-10 relative overflow-hidden rounded-3xl bg-gradient-hero text-primary-foreground p-8 md:p-12 shadow-elegant">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <span className="h-14 w-14 shrink-0 grid place-items-center rounded-2xl bg-white/20 backdrop-blur">
                <TrendingUp className="h-7 w-7" />
              </span>
              <div>
                <p className="font-display font-bold text-2xl md:text-3xl">Host a camp at your workplace</p>
                <p className="mt-2 opacity-90 max-w-xl">We provide medical staff, equipment, and logistics. Free for partners.</p>
              </div>
            </div>
            <Link to="/hospital-register"><Button size="lg" variant="secondary" className="shrink-0">Partner with us <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </Card>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Four steps to save a life</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { i: UserPlus, t: "Register", d: "Create your free account in under a minute." },
              { i: CheckCircle, t: "Verify Profile", d: "Confirm your blood group and contact details." },
              { i: Search, t: "Search or Donate", d: "Find blood near you or set your availability." },
              { i: Zap, t: "Connect Instantly", d: "Direct contact with donors or blood banks." },
            ].map((s, i) => (
              <Card key={s.t} className="p-6 rounded-2xl hover:shadow-elegant hover:-translate-y-2 transition-all relative overflow-hidden bg-card">
                <span className="absolute top-3 right-4 font-display font-bold text-6xl text-primary/10">0{i + 1}</span>
                <span className="grid place-items-center h-12 w-12 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow mb-4">
                  <s.i className="h-6 w-6" />
                </span>
                <h3 className="font-display font-semibold text-lg">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== COMPATIBILITY ===================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Badge variant="secondary" className="mb-4">Compatibility Guide</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Know your <span className="text-primary">blood group</span></h2>
          <p className="mt-3 text-muted-foreground text-lg">Select your blood group to see who you can help and who can help you.</p>
          <div className="mt-8 grid grid-cols-4 gap-3 max-w-md">
            {BLOOD_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setSelected(g)}
                className={`aspect-square rounded-2xl font-display font-bold text-lg transition-all hover:scale-105 ${selected === g ? "bg-gradient-primary text-primary-foreground shadow-glow scale-105" : "bg-card border-2 hover:border-primary"}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <Card className="p-6 rounded-2xl glass border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-8 w-8 grid place-items-center rounded-lg bg-primary/15 text-primary"><ArrowRight className="h-4 w-4" /></span>
              <p className="text-sm font-medium text-muted-foreground">You can donate to</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {compat.canDonateTo.map((g) => <BloodGroupBadge key={g} group={g} className="h-12 w-12 text-base" />)}
            </div>
          </Card>
          <Card className="p-6 rounded-2xl glass border-secondary/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-8 w-8 grid place-items-center rounded-lg bg-secondary/15 text-secondary"><Heart className="h-4 w-4" /></span>
              <p className="text-sm font-medium text-muted-foreground">You can receive from</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {compat.canReceiveFrom.map((g) => <BloodGroupBadge key={g} group={g} className="h-12 w-12 text-base" />)}
            </div>
          </Card>
        </div>
      </section>

      {/* ===================== PARTNERS ===================== */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">Trusted Partners</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Partner hospitals & blood banks</h2>
            <p className="mt-3 text-muted-foreground">Working with India's most trusted healthcare institutions.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PARTNERS.map((p) => (
              <Card key={p.name} className="p-6 rounded-2xl text-center hover:shadow-elegant hover:-translate-y-1 transition-all bg-card group">
                <span className="inline-grid place-items-center h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary mb-3 group-hover:scale-110 transition-transform">
                  {p.type === "Hospital Network" ? <Building2 className="h-6 w-6" /> : <Droplet className="h-6 w-6" fill="currentColor" />}
                </span>
                <p className="font-display font-semibold text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.type}</p>
                <div className="mt-4 grid gap-2">
                  <Link to="/hospitals"><Button size="sm" variant="outline" className="w-full">View Details</Button></Link>
                  <Link to={p.type === "Hospital Network" ? "/hospital-register" : "/blood-bank-register"}><Button size="sm" className="w-full bg-gradient-primary">Register</Button></Link>
                  <Link to="/contact"><Button size="sm" variant="ghost" className="w-full">Contact</Button></Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== SUCCESS STORIES ===================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="secondary" className="mb-4">Success Stories</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Real people, real lives saved</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "Himanshu", r: "Patient's daughter", t: "BloodConnect found 3 O- donors within 8 minutes during my mother's surgery. Life-saving." },
            { n: "Sohan Akare", r: "Website Admin", t: "We've reduced our emergency blood-sourcing time by 70% since partnering with BloodConnect." },
            { n: "Dr. Pawan Talwekar", r: "Donor • 6× Lifesaver", t: "I've donated 6 times through the platform. The reminders and reliability score keep me motivated." },
          ].map((tm) => (
            <Card key={tm.n} className="p-7 rounded-2xl hover:shadow-elegant hover:-translate-y-1 transition-all relative">
              <div className="flex gap-0.5 text-warning mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4" fill="currentColor" />)}
              </div>
              <p className="text-base leading-relaxed">"{tm.t}"</p>
              <div className="mt-6 pt-5 border-t flex items-center gap-3">
                <span className="h-11 w-11 grid place-items-center rounded-full bg-gradient-primary text-primary-foreground font-display font-bold">
                  {tm.n[0]}
                </span>
                <div>
                  <p className="font-semibold text-sm">{tm.n}</p>
                  <p className="text-xs text-muted-foreground">{tm.r}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Frequently asked questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {[
              { q: "Who can donate blood?", a: "Healthy adults aged 18–65, weighing at least 50kg, with no recent illness or medication. Use our eligibility checker for details." },
              { q: "How often can I donate?", a: "Whole-blood donors can give every 90 days. Platelet donors every 14 days." },
              { q: "Is BloodConnect free to use?", a: "Yes — BloodConnect is completely free for donors, patients, hospitals, and blood banks." },
              { q: "How are donors verified?", a: "We verify phone, email, and ID. Reliability scores update based on response rate and donations." },
              { q: "Can I host a donation camp?", a: "Absolutely. Reach out via the partner form and our team will help with staff, equipment, and logistics — free of cost." },
            ].map((f, i) => (
              <AccordionItem key={i} value={`f${i}`} className="bg-card rounded-2xl border px-6">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <Card className="relative bg-gradient-hero text-primary-foreground p-10 md:p-16 text-center shadow-elegant overflow-hidden rounded-[2rem] border-0">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <span className="inline-grid place-items-center h-14 w-14 rounded-2xl bg-white/20 backdrop-blur mb-6">
              <Droplet className="h-7 w-7" fill="currentColor" />
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Every drop counts.<br className="hidden md:block" /> Every minute matters.</h2>
            <p className="mt-4 opacity-90 max-w-xl mx-auto text-lg">Join thousands of donors saving lives every day across India.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/donate"><Button size="lg" variant="secondary" className="h-12 px-7 font-semibold">Register as Donor <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/find-blood"><Button size="lg" variant="outline" className="h-12 px-7 bg-transparent border-white/40 text-white hover:bg-white hover:text-primary">Find Blood Near Me</Button></Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm opacity-90">
              <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {stats.donors.toLocaleString()}+ donors</span>
              <span className="flex items-center gap-2"><Building2 className="h-4 w-4" /> {stats.hospitals}+ hospitals</span>
              <span className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> {stats.livesSaved.toLocaleString()}+ lives saved</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
