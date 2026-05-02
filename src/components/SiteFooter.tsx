import { Logo } from "./Logo";

export const SiteFooter = () => (
  <footer className="border-t border-border bg-secondary/40">
    <div className="container py-12 grid gap-8 md:grid-cols-4">
      <div className="space-y-3">
        <Logo />
        <p className="text-sm text-muted-foreground max-w-xs">
          The point-of-view platform to stop silent churn and understand why visitors leave.
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-3">Product</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="/#features" className="hover:text-foreground">Features</a></li>
          <li><a href="/#how" className="hover:text-foreground">How it works</a></li>
          <li><a href="/pricing" className="hover:text-foreground">Pricing</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-3">Use cases</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Restaurants & cafes</li>
          <li>Online stores</li>
          <li>Schools & clinics</li>
          <li>Agencies & SaaS</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-3">Company</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>About</li>
          <li>Privacy</li>
          <li>Terms</li>
        </ul>
      </div>
    </div>
    <div className="container py-6 border-t border-border text-xs text-muted-foreground flex justify-between">
      <span>© {new Date().getFullYear()} userpov. Built with care.</span>
      <span>Made for business owners who actually listen 🐝</span>
    </div>
  </footer>
);
