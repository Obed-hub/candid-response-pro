import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { useAuth } from "@/contexts/AuthContext";

export const SiteHeader = () => {
  const { user } = useAuth();
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="/#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="/#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="/#use-cases" className="hover:text-foreground transition-colors">Use cases</a>
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button onClick={() => nav("/dashboard")}>Open dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => nav("/login")}>Log in</Button>
              <Button onClick={() => nav("/signup")} className="bg-gradient-cta shadow-glow">Get started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
