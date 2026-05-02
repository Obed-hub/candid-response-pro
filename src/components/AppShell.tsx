import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Logo } from "./Logo";
import { LayoutDashboard, Inbox, Building2, QrCode, Code2, Settings, LogOut, Sparkles, Zap, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/businesses", label: "Businesses", icon: Building2 },
  { to: "/inbox", label: "Feedback inbox", icon: Inbox },
  { to: "/qr", label: "QR codes", icon: QrCode },
  { to: "/widget", label: "Website widget", icon: Code2 },
  { to: "/triggers", label: "Smart Triggers", icon: Zap },
  { to: "/settings", label: "Settings", icon: Settings },
];

const SidebarContent = ({ onNavigate, onSignOut, email, goPricing }: { onNavigate?: () => void; onSignOut: () => void; email?: string; goPricing: () => void }) => (
  <>
    <div className="px-6 py-5 border-b border-border"><Logo /></div>
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive ? "bg-primary-soft text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`
          }
        >
          <Icon className="w-4 h-4" /> {label}
        </NavLink>
      ))}
    </nav>
    <div className="p-3 border-t border-border space-y-2">
      <div className="rounded-lg bg-gradient-soft p-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-foreground mb-1"><Sparkles className="w-3.5 h-3.5 text-primary" /> Free plan</div>
        <p className="text-muted-foreground mb-2">50 feedback / month included.</p>
        <Button size="sm" className="w-full" onClick={() => { goPricing(); onNavigate?.(); }}>Upgrade</Button>
      </div>
      <div className="flex items-center justify-between px-2 py-2 text-xs">
        <span className="truncate text-muted-foreground" title={email ?? ""}>{email}</span>
        <button onClick={onSignOut} className="text-muted-foreground hover:text-destructive">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  </>
);

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { signOut, user } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const handleSignOut = async () => { await signOut(); nav("/"); };
  return (
    <div className="min-h-screen flex bg-secondary/30">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card sticky top-0 h-screen">
        <SidebarContent onSignOut={handleSignOut} email={user?.email ?? undefined} goPricing={() => nav("/pricing")} />
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden border-b border-border bg-card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 flex flex-col">
                <SidebarContent
                  onNavigate={() => setOpen(false)}
                  onSignOut={async () => { setOpen(false); await handleSignOut(); }}
                  email={user?.email ?? undefined}
                  goPricing={() => nav("/pricing")}
                />
              </SheetContent>
            </Sheet>
            <Logo />
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign out</Button>
        </div>
        <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
