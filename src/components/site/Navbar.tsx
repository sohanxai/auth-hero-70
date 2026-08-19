import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/", label: "Home" },
  { to: "/find-blood", label: "Find Blood" },
  { to: "/donate", label: "Become a Donor" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Droplet className="h-5 w-5" fill="currentColor" />
            </span>
            <span>Blood<span className="text-primary">Connect</span></span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            {signedIn ? (
              <>
                <Link to="/dashboard"><Button variant="ghost" size="sm">Dashboard</Button></Link>
                <Button size="sm" variant="outline" onClick={async () => { await supabase.auth.signOut(); }}>Sign out</Button>
              </>
            ) : (
              <>
                <Link to="/auth"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link to="/auth" search={{ mode: "signup" }}><Button size="sm" className="bg-gradient-primary shadow-glow">Register</Button></Link>
              </>
            )}
          </div>

          <button className="lg:hidden p-2" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden pb-4 space-y-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted">
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t flex gap-2">
              {signedIn ? (
                <>
                  <Link to="/dashboard" className="flex-1"><Button variant="outline" className="w-full">Dashboard</Button></Link>
                  <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); }}>Sign out</Button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="flex-1"><Button variant="outline" className="w-full">Login</Button></Link>
                  <Link to="/auth" search={{ mode: "signup" }} className="flex-1"><Button className="w-full bg-gradient-primary">Register</Button></Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
