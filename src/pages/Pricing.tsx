import React from "react";
import { Check, Zap, Building2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SEO } from "@/components/SEO";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for testing and small physical locations.",
    features: [
      "1 Dynamic QR Code",
      "Standard Website Widget",
      "Up to 50 responses/month",
      "Email Notifications",
      "Basic Analytics",
      "24h Support Turnaround",
    ],
    cta: "Get Started",
    popular: false,
    icon: Zap,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For growing businesses and SaaS teams.",
    features: [
      "Unlimited QR Codes",
      "Smart Behavioral Triggers",
      "Unlimited Responses",
      "Priority Private Messaging",
      "Custom Branding",
      "Advanced Analytics & Export",
      "Group Roadmap",
      "Instant Slack/Discord Alerts",
    ],
    cta: "Go Pro",
    popular: true,
    icon: Globe,
  },
  {
    name: "Business",
    price: "$99",
    period: "/mo",
    description: "For agencies and large organizations.",
    features: [
      "Multiple Business Units",
      "White-label Solution",
      "API Access",
      "Custom Domain for QR Pages",
      "Bulk QR Management",
      "Dedicated Account Manager",
      "SSO Integration",
      "SLA Guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
    icon: Building2,
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500/30">
      <SEO 
        title="Pricing Plans | UserPOV"
        description="Choose the perfect plan to capture authentic customer feedback. Start for free and scale as you grow."
      />
      <SiteHeader />
      
      <main className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl -z-10 opacity-50" />
        
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-amber-200 to-amber-500 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            No hidden fees. No complicated tiers. Just pure insights from your customers, right when it matters.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                plan.popular 
                  ? "bg-gradient-to-b from-slate-900 to-slate-950 border-amber-500/50 shadow-[0_0_40px_-15px_rgba(245,158,11,0.3)]" 
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <plan.icon size={24} />
                <h3 className="text-xl font-semibold">{plan.name}</h3>
              </div>
              
              <div className="mb-6">
                <span className="text-5xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-slate-400">{plan.period}</span>}
              </div>
              
              <p className="text-slate-400 mb-8 h-12">
                {plan.description}
              </p>
              
              <Button 
                className={`w-full py-6 text-lg font-semibold rounded-xl mb-8 ${
                  plan.popular 
                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950" 
                    : "bg-slate-800 hover:bg-slate-700 text-white"
                }`}
              >
                {plan.cta}
              </Button>
              
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-slate-300 text-sm">
                    <Check className="mt-0.5 text-amber-500 shrink-0" size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ Section Shortcut */}
        <div className="mt-24 text-center">
          <p className="text-slate-400 mb-4">Need a custom plan for your enterprise?</p>
          <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-900">
            Let's Talk Business
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Pricing;
