import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const plans = [
  { name: "Free", price: "$0", desc: "Perfect to get started", features: ["1 feedback space","50 submissions / month","Shareable feedback link","Basic dashboard"], cta: "Start free", featured: false },
  { name: "Pro", price: "$19", desc: "For growing businesses", features: ["Unlimited feedback","QR code generator","Website widget","Feedback categories","Export feedback","Email notifications","Custom branding"], cta: "Upgrade to Pro", featured: true },
  { name: "Business", price: "$49", desc: "For multi-location teams", features: ["Multiple business locations","Team members","Advanced analytics","Priority support","API access (coming)","White-label (coming)"], cta: "Talk to sales", featured: false },
];

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <SiteHeader />
    <section className="container py-20">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <span className="text-4xl">💎</span>
        <h1 className="text-4xl md:text-5xl font-bold mt-3">Simple, honest pricing</h1>
        <p className="text-muted-foreground mt-4 text-lg">Start free. Upgrade when you grow.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {plans.map((p) => (
          <Card key={p.name} className={`p-6 relative ${p.featured ? "border-primary shadow-glow" : "border-border"}`}>
            {p.featured && <span className="absolute -top-3 right-6 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>}
            <h3 className="font-bold text-lg">{p.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-4xl font-bold">{p.price}</span>
              <span className="text-muted-foreground text-sm mb-1">/month</span>
            </div>
            <Button asChild className={`w-full mt-5 ${p.featured ? "bg-gradient-cta shadow-glow" : ""}`} variant={p.featured ? "default" : "outline"}>
              <Link to="/signup">{p.cta}</Link>
            </Button>
            <ul className="mt-6 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
    <SiteFooter />
  </div>
);

export default Pricing;
