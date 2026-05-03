import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SEO } from "@/components/SEO";
import { seoPages } from "@/data/seo-data";
import { 
  CheckCircle2, ArrowRight, MessageSquare, HelpCircle, 
  Lightbulb, AlertCircle, Sparkles, QrCode, Globe2, Zap 
} from "lucide-react";
import NotFound from "./NotFound";

export const DynamicSEOPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const page = seoPages.find((p) => p.slug === slug);

  if (!page) {
    return <NotFound />;
  }

  // Transform hero title if it follows the old generic pattern
  const displayHeroTitle = page.heroTitle.startsWith("Feedback insights for") 
    ? `Collect anonymous client feedback as a ${page.name}`
    : page.heroTitle;

  // Find related pages dynamically for better internal linking
  const dynamicRelated = [
    // Same type pages (industries, locations, etc.)
    ...seoPages.filter(p => p.type === page.type && p.slug !== page.slug).slice(0, 4),
    // Different type pages for variety
    ...seoPages.filter(p => p.type !== page.type).slice(0, 2)
  ].map(p => p.slug);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO
        title={page.metaTitle}
        description={page.metaDescription}
        keywords={`${page.keyword}, feedback, userpov, customer insights`}
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": page.type === "location" ? "LocalBusiness" : "Service",
          "name": `UserPOV for ${page.name}`,
          "description": page.metaDescription,
          "url": `https://userpov.com/${page.type === "location" ? "locations" : page.type === "industry" ? "industries" : "use-cases"}/${page.slug}`,
          "provider": {
            "@type": "Organization",
            "name": "UserPOV",
            "url": "https://userpov.com"
          },
          "areaServed": page.type === "location" ? {
            "@type": "City",
            "name": page.name
          } : undefined,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://userpov.com/${page.type === "location" ? "locations" : page.type === "industry" ? "industries" : "use-cases"}/${page.slug}`
          }
        })}
      </script>
      <SiteHeader />

      {/* HERO */}
      <section className="relative bg-gradient-hero overflow-hidden border-b border-border">
        <div className="container py-16 md:py-24 flex flex-col items-center text-center space-y-6 animate-fade-in">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> For {page.name}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight max-w-4xl mx-auto">
            {displayHeroTitle}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {page.heroSubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button asChild size="lg" className="bg-gradient-cta shadow-glow h-14 px-8 text-lg font-bold">
              <Link to="/signup">{page.ctaPrimary} <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
            {page.ctaSecondary && (
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-primary text-primary hover:bg-primary/5">
                {page.ctaSecondary}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS (Moved up) */}
      <section className="bg-zinc-950 text-white py-16 md:py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Why honest feedback matters</h2>
                <p className="text-zinc-400 text-lg">Don't let silent churn kill your business. Capture the insights you're missing.</p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-destructive flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5" /> The Problem
                  </h4>
                  <ul className="space-y-3">
                    {page.painPoints.map((pp, i) => (
                      <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm leading-relaxed">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                        {pp}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-success flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> The Outcome
                  </h4>
                  <ul className="space-y-3">
                    {page.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm leading-relaxed">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-[2rem] p-1 border border-white/10 shadow-2xl">
                <div className="bg-zinc-900 rounded-[1.8rem] p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-black text-xs">YOU</div>
                    <div className="flex-1 h-px bg-white/10" />
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-primary">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">2-Way Communication</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6 italic">
                    "I loved the experience, but the checkout was a bit slow."
                  </p>
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
                    <strong>Your Response:</strong> "Thanks for letting us know! We just optimized our payment gateway."
                  </div>
                  <Button className="w-full h-12 font-bold bg-primary text-black hover:bg-primary/90">
                    See the Dashboard
                  </Button>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[100px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="container py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How it works for {page.name}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Practical scenarios where UserPOV helps you improve.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {page.useCases.map((uc, i) => (
            <Card key={i} className="p-8 border-border hover:shadow-card transition-all group border-b-4 border-b-transparent hover:border-b-primary">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{uc.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{uc.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* PRODUCT VISUAL BLOCK */}
      <section className="bg-secondary/20 py-16 md:py-20 border-y border-border">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="bg-white rounded-3xl shadow-elegant p-4 border border-border">
                <div className="aspect-[4/3] bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-primary" />
                  </div>
                  <h4 className="font-bold text-xl">Dynamic Feedback Hub</h4>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Your customers scan a QR code or click a link to share thoughts instantly and anonymously.
                  </p>
                  <div className="w-full h-8 bg-zinc-200 rounded-lg animate-pulse" />
                  <div className="w-3/4 h-8 bg-zinc-200 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-32 bg-primary rounded-2xl shadow-2xl p-6 text-black flex flex-col justify-between">
                <MessageSquare className="w-6 h-6" />
                <div className="font-bold leading-tight">100% Anonymous</div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">Built for {page.name}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Whether you're managing a physical store, a digital agency, or a global platform, UserPOV scales with you. No apps for customers to download, just instant insights.
              </p>
              <ul className="space-y-4 pt-4">
                {["No registration required for users", "Real-time AI sentiment analysis", "Private two-way messaging", "Export data for CRM integration"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SAMPLE FEEDBACK */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">What you'll start hearing</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Real examples of the insights our {page.name.toLowerCase()} clients receive.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {page.sampleFeedback.map((sf, i) => (
              <Card key={i} className="p-8 border-border shadow-sm italic relative overflow-hidden bg-card/50">
                <div className="absolute top-4 right-4 text-primary opacity-10">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <p className="text-lg leading-relaxed font-medium">"{sf}"</p>
                <div className="mt-6 pt-6 border-t border-border flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-200" />
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Anonymous {page.name} Customer
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container py-16 md:py-20 border-t border-border">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Features for {page.name}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Everything you need to collect and manage insights effectively.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {page.features.map((f, i) => (
            <Card key={i} className="p-8 border-border flex gap-6 items-start hover:bg-secondary/10 transition-colors border-l-4 border-l-primary/30">
              <div className="w-10 h-10 bg-primary-soft rounded-xl flex items-center justify-center shrink-0">
                {i % 4 === 0 ? <QrCode className="w-5 h-5 text-primary" /> : 
                 i % 4 === 1 ? <Globe2 className="w-5 h-5 text-primary" /> : 
                 i % 4 === 2 ? <Zap className="w-5 h-5 text-primary" /> : 
                 <CheckCircle2 className="w-5 h-5 text-primary" />}
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">{f.name}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{f.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary/10 py-16 md:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Common Questions</h2>
              <p className="text-muted-foreground text-lg">Everything you need to know about feedback for {page.name.toLowerCase()}.</p>
            </div>
            <div className="space-y-4">
              {page.faqs.map((faq, i) => (
                <div key={i} className="p-6 md:p-8 rounded-2xl border border-border bg-card shadow-sm">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed pl-8 text-sm md:text-base">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RELATED PAGES / INTERNAL LINKING */}
      <section className="border-y border-border py-16">
        <div className="container">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center">Explore More Clusters</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {dynamicRelated.map((relatedSlug) => {
              const relatedPage = seoPages.find(p => p.slug === relatedSlug);
              return (
                <Button key={relatedSlug} asChild variant="outline" className="rounded-full px-5 h-10 border-border hover:bg-white hover:text-primary hover:border-primary transition-all text-xs font-semibold">
                  <Link to={`/${relatedPage?.type === 'location' ? 'locations' : relatedPage?.type === 'industry' ? 'industries' : 'use-cases'}/${relatedSlug}`}>
                    {relatedPage?.name || relatedSlug.replace(/-/g, ' ')}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container py-16 md:py-24">
        <div className="rounded-[2.5rem] bg-gradient-cta text-primary-foreground p-10 md:p-16 text-center shadow-elegant relative overflow-hidden group border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
          <h2 className="text-3xl md:text-6xl font-bold mb-6 tracking-tight">
            Ready to hear the <br className="hidden md:block" />unspoken truth?
          </h2>
          <p className="mt-4 text-primary-foreground/90 max-w-xl mx-auto text-lg md:text-xl">
            Start collecting honest, anonymous feedback for your {page.name.toLowerCase()} business today.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="h-16 px-10 text-xl font-bold shadow-2xl">
              <Link to="/signup">Get Started for Free <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-bold border-white/20 hover:bg-white/10 text-white">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};
