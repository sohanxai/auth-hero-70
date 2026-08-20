import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, MapPin, Phone, Shield, Droplet, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/site/BackButton";
import { BloodGroupBadge } from "@/components/site/BloodGroupBadge";
import { SearchableSelect } from "@/components/site/SearchableSelect";
import { BLOOD_GROUPS, STATES, STATE_CITIES, generateDemoBloodBanks, generateDemoDonors, type BloodGroup } from "@/lib/blood-data";
import { searchDonors, listBloodBanks } from "@/lib/bloodconnect.functions";

export const Route = createFileRoute("/find-blood")({
  head: () => ({ meta: [
    { title: "Find Blood Donors & Blood Banks \u2014 BloodConnect" },
    { name: "description", content: "Search verified donors and blood banks across India by blood group and city." },
    { property: "og:title", content: "Find Blood Donors & Blood Banks \u2014 BloodConnect" },
    { property: "og:description", content: "Search verified donors and blood banks across India by blood group and city." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: FindBlood,
});

function FindBlood() {
  const [group, setGroup] = useState<BloodGroup>("O+");
  const [state, setState] = useState<string>("Maharashtra");
  const [city, setCity] = useState<string>("Mumbai");

  const cityOptions = useMemo(() => STATE_CITIES[state] ?? [], [state]);

  const search = useMutation({
    mutationFn: async () => {
      const [d, b] = await Promise.all([
        searchDonors({ data: { blood_group: group, city } }),
        listBloodBanks({ data: { city } }),
      ]);
      const real = (d.donors ?? []).map((x) => ({ ...x, isDemo: false as const }));
      const need = Math.max(0, 5 - real.length);
      const demo = generateDemoDonors(group, city, need);
      const banks = b.banks?.length ? b.banks : generateDemoBloodBanks(city, 3);
      return { donors: [...real, ...demo], banks };
    },
  });

  const results = search.data;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <BackButton />
      <div className="max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold">Find Blood</h1>
        <p className="mt-2 text-muted-foreground">Search verified donors and nearby blood banks across India.</p>
      </div>

      <Card className="mt-8 p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <Label>Blood Group</Label>
            <div className="mt-1">
              <SearchableSelect value={group} onChange={(v) => setGroup(v as BloodGroup)} options={BLOOD_GROUPS as unknown as string[]} placeholder="Blood group" searchPlaceholder="Search group..." />
            </div>
          </div>
          <div>
            <Label>State / UT</Label>
            <div className="mt-1">
              <SearchableSelect value={state} onChange={(s) => { setState(s); const first = STATE_CITIES[s]?.[0]; if (first) setCity(first); }} options={STATES} placeholder="Select state" searchPlaceholder="Search state..." />
            </div>
          </div>
          <div>
            <Label>City</Label>
            <div className="mt-1">
              <SearchableSelect value={city} onChange={setCity} options={cityOptions} placeholder="Select city" searchPlaceholder="Search city..." disabled={!cityOptions.length} />
            </div>
          </div>
          <Button size="lg" onClick={() => search.mutate()} disabled={search.isPending || !city} className="bg-gradient-primary shadow-glow h-11">
            <Search className="mr-2 h-4 w-4" /> {search.isPending ? "Searching..." : "Search"}
          </Button>
        </div>
      </Card>

      {results && (
        <div className="mt-10 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="font-semibold text-xl mb-4 flex items-center gap-2"><Droplet className="h-5 w-5 text-primary" /> Nearby Donors ({results.donors.length})</h2>
            <div className="space-y-3">
              {results.donors.map((d) => (
                <Card key={d.id} className="p-4 flex flex-wrap items-center gap-4 hover:shadow-elegant transition">
                  <BloodGroupBadge group={d.blood_group} />
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{d.full_name}</p>
                      {d.isDemo && <Badge variant="outline" className="text-xs">Demo</Badge>}
                      {d.is_available ? <Badge className="bg-success text-success-foreground text-xs">Available</Badge> : <Badge variant="secondary" className="text-xs">Unavailable</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {d.area}, {d.city}</span>
                      <span className="inline-flex items-center gap-1"><Shield className="h-3 w-3" /> Reliability {d.reliability_score}</span>
                      <span>{d.donations_count} donations</span>
                    </p>
                  </div>
                  <a href={`tel:${d.phone}`}><Button size="sm" variant="outline"><Phone className="mr-2 h-3 w-3" />Contact</Button></a>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-secondary" /> Blood Banks</h2>
            <div className="space-y-3">
              {results.banks.map((b: any) => {
                const units = (b.inventory ?? {})[group] ?? 0;
                return (
                  <Card key={b.id} className="p-4">
                    <p className="font-semibold">{b.name}</p>
                    {b.isDemo && <Badge variant="outline" className="mt-2 text-xs">Demo Blood Bank</Badge>}
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.area}, {b.city}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm"><strong className="text-primary">{units}</strong> units of {group}</span>
                      <a href={`tel:${b.phone}`}><Button size="sm" variant="ghost"><Phone className="h-3 w-3" /></Button></a>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
