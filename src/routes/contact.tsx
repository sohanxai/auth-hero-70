import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BackButton } from "@/components/site/BackButton";
import { submitContactMessage } from "@/lib/bloodconnect.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact BloodConnect \u2014 Support & Partnerships" },
    { name: "description", content: "Reach the BloodConnect team for emergency support, hospital partnerships or general questions." },
    { property: "og:title", content: "Contact BloodConnect \u2014 Support & Partnerships" },
    { property: "og:description", content: "Reach the BloodConnect team for emergency support, hospital partnerships or general questions." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: Contact,
});

function Contact() {
  const [sending, setSending] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setSending(true);
    try {
      await submitContactMessage({ data: {
        name: String(f.get("name")),
        email: String(f.get("email")),
        subject: String(f.get("subject")),
        message: String(f.get("message")),
      }});
      form.reset();
      toast.success("Message sent! We'll be in touch within 24h.");
    } catch (err: any) {
      toast.error(err.message ?? "Message could not be sent");
    } finally {
      setSending(false);
    }
  }
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <BackButton />
      <h1 className="text-4xl font-bold">Contact us</h1>
      <p className="mt-2 text-muted-foreground">We typically respond within a few hours.</p>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4">
          <Info icon={<Mail className="h-5 w-5 text-primary" />} label="Email" value="hello@bloodconnect.app" />
          <Info icon={<Phone className="h-5 w-5 text-primary" />} label="Helpline (24/7)" value="+91 1800-123-456" />
          <Info icon={<MapPin className="h-5 w-5 text-primary" />} label="Office" value="Mumbai, Maharashtra, India" />
        </Card>
        <Card className="p-6 lg:col-span-2">
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            <div><Label>Name</Label><Input name="name" required minLength={2} maxLength={100} className="mt-1" /></div>
            <div><Label>Email</Label><Input name="email" required type="email" maxLength={255} className="mt-1" /></div>
            <div className="sm:col-span-2"><Label>Subject</Label><Input name="subject" required minLength={2} maxLength={160} className="mt-1" /></div>
            <div className="sm:col-span-2"><Label>Message</Label><Textarea name="message" required minLength={10} maxLength={1000} className="mt-1 min-h-[120px]" /></div>
            <Button disabled={sending} className="sm:col-span-2 bg-gradient-primary shadow-glow">{sending ? "Sending..." : "Send message"}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="h-10 w-10 grid place-items-center rounded-xl bg-primary/10">{icon}</span>
      <div><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="font-semibold">{value}</p></div>
    </div>
  );
}
