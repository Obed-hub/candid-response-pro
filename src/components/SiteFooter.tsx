import { Logo } from "./Logo";

export const SiteFooter = () => (
  <footer className="border-t border-border bg-secondary/40">
    <div className="container py-12 grid gap-8 md:grid-cols-2 lg:grid-cols-5">
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
        <h4 className="font-semibold text-sm mb-3">Industries</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="/industries/restaurants" className="hover:text-foreground">Restaurants</a></li>
          <li><a href="/industries/salons" className="hover:text-foreground">Salons & Spas</a></li>
          <li><a href="/industries/gyms" className="hover:text-foreground">Gyms & Fitness</a></li>
          <li><a href="/industries/saas" className="hover:text-foreground">SaaS & Startups</a></li>
          <li><a href="/industries/clinics" className="hover:text-foreground">Clinics</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-3">Locations</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="/locations/london" className="hover:text-foreground">London</a></li>
          <li><a href="/locations/united-states" className="hover:text-foreground">United States</a></li>
          <li><a href="/locations/nigeria" className="hover:text-foreground">Nigeria</a></li>
          <li><a href="/locations/ghana" className="hover:text-foreground">Ghana</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-3">Company</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="/about-us" className="hover:text-foreground">About Us</a></li>
          <li><a href="/privacy" className="hover:text-foreground">Privacy</a></li>
          <li><a href="/terms" className="hover:text-foreground">Terms</a></li>
        </ul>
      </div>
    </div>
    <div className="container py-6 border-t border-border text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-4 text-center sm:text-left">
      <span>© {new Date().getFullYear()} userpov. Built with care.</span>
      <span>Made for business owners who actually listen 🐝</span>
    </div>
  </footer>
);
