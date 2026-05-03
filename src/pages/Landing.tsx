import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import heroImg from "@/assets/hero-feedback.jpg";
import {
  QrCode, Globe2, ShieldCheck, LineChart, MessageSquare, Star, Smile, Frown, Meh,
  Store, Utensils, Scissors, ShoppingBag, GraduationCap, Stethoscope, Code2, Briefcase,
  User, Church, Sparkles, ArrowRight, CheckCircle2, AlertTriangle, EyeOff, Inbox,
  Zap, Tag, Activity, Mail, Download, Building2, Heart,
  Users, Share2, Search, ArrowUpCircle
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const useCases = [
  { icon: Utensils, title: "Restaurants", desc: "QR codes on tables — rate food, service, and waiting time.", link: "/industries/restaurants" },
  { icon: Scissors, title: "Salons & Spas", desc: "Receipts include a QR — clients rate their stylist privately.", link: "/industries/salons" },
  { icon: ShoppingBag, title: "Supermarkets", desc: "Posters at checkout collect honest store experience reviews.", link: "/industries/supermarkets" },
  { icon: GraduationCap, title: "Schools", desc: "Anonymous parent and student feedback after events or terms.", link: "/industries/schools" },
  { icon: Stethoscope, title: "Clinics", desc: "Patients leave private feedback after appointments.", link: "/industries/clinics" },
  { icon: Store, title: "Online stores", desc: "Add a widget on product pages to catch checkout & delivery issues.", link: "/industries/ecommerce" },
  { icon: Code2, title: "SaaS websites", desc: "Embed the widget so users report bugs without leaving the app.", link: "/industries/saas" },
  { icon: Briefcase, title: "Agencies", desc: "Send a feedback link after each project milestone.", link: "/industries/agencies" },
  { icon: User, title: "Freelancers", desc: "Collect testimonials that double as social proof on your site.", link: "/industries/freelancers" },
  { icon: Church, title: "Churches & events", desc: "QR cards at the door collect anonymous community feedback.", link: "/industries/events" },
];

const features = [
  { icon: EyeOff, title: "Anonymous feedback", desc: "Customers speak freely — name and email are optional." },
  { icon: Globe2, title: "Public feedback page", desc: "Each business gets a beautiful shareable link." },
  { icon: Users, title: "Public community board", desc: "Let users upvote ideas and see your public roadmap." },
  { icon: Search, title: "SEO optimized", desc: "Your roadmap and feedback are discoverable by search engines." },
  { icon: MessageSquare, title: "2-way communication", desc: "Reply to feedback and close the loop with your customers." },
  { icon: QrCode, title: "QR code generator", desc: "Print, scan, collect. Perfect for physical locations." },
  { icon: Code2, title: "Website widget", desc: "Embed a feedback button on your online store or SaaS." },
  { icon: Star, title: "Rating system", desc: "1–5 star ratings with category breakdowns." },
  { icon: Sparkles, title: "AI sentiment detection", desc: "Quickly spot positive vs. negative feedback automatically." },
  { icon: Heart, title: "Real human connection", desc: "Build trust with personal responses to every piece of feedback." },
  { icon: Activity, title: "Status workflow", desc: "Move feedback through New → Planned → Shipped." },
  { icon: Building2, title: "Multi-business support", desc: "Manage multiple shops, brands, or locations." },
];

const Landing = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  const [signupCount, setSignupCount] = useState(4942);

  useEffect(() => {
    // PWA Smart Redirect: If launched from home screen, return to last visited feedback page
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const lastSlug = localStorage.getItem("last_feedback_slug");

    // Only redirect if standalone, has a slug, and is NOT logged in as a business owner
    if (!authLoading && !session && isStandalone && lastSlug) {
      navigate(`/feedback/${lastSlug}`, { replace: true });
    }

    // Simulated real-time signup counter
    const interval = setInterval(() => {
      setSignupCount(prev => {
        if (prev >= 4998) return prev;
        return prev + (Math.random() > 0.7 ? 1 : 0);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate, session, authLoading]);
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO
        title="userpov - Understand Why Your Visitors Leave"
        description="98% of your visitors leave without buying. userpov helps you capture their honest feedback via exit-intent triggers and website widgets before they're gone forever."
        keywords="feedback, user intent, exit intent, visitor abandonment, customer reviews, website widget, anonymous feedback, user pov"
      />
      <SiteHeader />

      {/* HERO */}
      <section className="relative bg-gradient-hero overflow-hidden">
        <div className="container py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 animate-fade-in">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> For physical stores & online platforms
            </span>
            <h1 className="text-3xl md:text-6xl font-bold leading-[1.1] tracking-tight">
              98% of your visitors leave silently — <br className="hidden sm:block" /><span className="text-primary">get the userpov 🐝</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              They don't buy, they don't sign up, and they don't tell you why. userpov captures the real reason they're leaving via smart exit-intent triggers, so you can fix your funnel fast.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-cta shadow-glow">
                <Link to="/signup">Start collecting feedback <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button size="lg" variant="outline" onClick={() => (window as any).toggleUserPOVWidget?.(true)}>
                Talk with Us
              </Button>
            </div>

            {/* REAL-TIME COUNTER */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm mb-2 gap-1">
                <span className="font-bold text-foreground">🔥 {signupCount.toLocaleString()} / 5,000 spots claimed</span>
                <span className="text-primary font-bold animate-pulse">{5000 - signupCount} spots left!</span>
              </div>
              <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-cta transition-all duration-1000 ease-out"
                  style={{ width: `${(signupCount / 5000) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 font-medium">
                IMPORTANT: The 3-month free trial ends when the first 50 people sign up. No credit card required.
              </p>
            </div>

            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> 3 Month Free Trial</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> No credit card</div>
            </div>
          </div>
          <div className="relative">
            <img src={heroImg} alt="userpov dashboard, in-store QR code, and mobile feedback form" width={1536} height={1024} className="w-full rounded-2xl shadow-elegant border border-border" />
            <div className="hidden md:flex absolute -left-6 top-10 bg-card rounded-xl shadow-card border border-border p-3 gap-2 items-center animate-float">
              <span className="text-2xl">🎉</span>
              <div className="text-xs">
                <div className="font-semibold">New 5-star review!</div>
                <div className="text-muted-foreground">"Amazing service" — Anonymous</div>
              </div>
            </div>
            <div className="hidden md:flex absolute -right-4 bottom-10 bg-card rounded-xl shadow-card border border-border p-3 gap-2 items-center" style={{ animationDelay: "1s" }}>
              <span className="text-2xl">💬</span>
              <div className="text-xs">
                <div className="font-semibold">Complaint resolved</div>
                <div className="text-muted-foreground">Avg. response: 2h 14m</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* T-SHAPE CHOICE SECTION */}
      <section className="container py-24">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Two Paths, One Goal</Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">How do you collect your userPOV?</h2>
          <p className="text-muted-foreground text-lg">Whether you live in the cloud or on the high street, we've got you covered.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-0 rounded-[2.5rem] overflow-hidden border border-border shadow-2xl">
          {/* DIGITAL SIDE */}
          <div className="p-8 md:p-16 bg-white flex flex-col items-start justify-between border-b md:border-b-0 md:border-r border-border hover:bg-slate-50/50 transition-colors group">
            <div>
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Online & Digital</h3>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                For SaaS, E-commerce, and Content creators. Catch visitors before they bounce.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  { icon: Zap, text: "Exit-Intent Triggers" },
                  { icon: Code2, text: "Embeddable Widget" },
                  { icon: Activity, text: "Scroll & Time Triggers" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                      <item.icon className="w-3.5 h-3.5 text-success" />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full text-center">
              <Button className="w-full h-12 text-md font-bold" onClick={() => (window as any).toggleUserPOVWidget?.(true)}>Live Roadmap Demo</Button>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest font-bold">Includes 2-way communication</p>
            </div>
          </div>

          {/* PHYSICAL SIDE */}
          <div className="p-8 md:p-16 bg-slate-50/30 flex flex-col items-start justify-between hover:bg-white transition-colors group">
            <div>
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Physical & Local</h3>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                For Restaurants, Retail, and Salons. Collect feedback at the moment of truth.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  { icon: QrCode, text: "Instant QR Generation" },
                  { icon: Building2, text: "Table & Counter Stands" },
                  { icon: Star, text: "Private Google Review Guard" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                      <item.icon className="w-3.5 h-3.5 text-success" />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full text-center">
              <Button asChild variant="outline" className="w-full h-12 text-md font-bold border-primary text-primary hover:bg-primary/5">
                <Link to="/signup">Print QR Code</Link>
              </Button>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest font-bold">Includes 2-way communication</p>
            </div>
          </div>
        </div>

        {/* TWO WAY COMM CONNECTOR (The bottom of the T) */}
        <div className="max-w-4xl mx-auto mt-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-8 rounded-3xl border border-primary/10 text-center animate-pulse-slow">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] font-bold text-white">YOU</div>
              </div>
              <div className="h-[2px] w-12 bg-primary/20 relative">
                <div className="absolute top-1/2 -translate-y-1/2 right-0 w-2 h-2 rounded-full bg-primary" />
              </div>
              <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="h-[2px] w-12 bg-primary/20 relative">
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 rounded-full bg-primary" />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-lg">Two-Way Communication</h4>
              <p className="text-sm text-muted-foreground">Don't just listen. Reply, resolve, and turn critics into fans instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY & ROADMAP SECTION */}
      <section className="bg-zinc-950 text-white py-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[120px] -z-0" />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                <Users className="w-4 h-4" /> Community Driven
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Build a community around your <span className="text-primary">product roadmap</span>.
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Don't just collect feedback — engage with it. Let your customers upvote features, track progress, and see what's coming next. SEO-optimized and ready to rank.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: ArrowUpCircle, title: "Upvote Ideas", desc: "Let your fans tell you what to build next." },
                  { icon: Globe2, title: "Public Roadmap", desc: "Transparency that builds deep trust." },
                  { icon: Search, title: "SEO Friendly", desc: "Appear in search results for your features." },
                  { icon: MessageSquare, title: "2-Way Chat", desc: "Real conversations with your customers." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden lg:overflow-visible">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4 px-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  <div className="ml-4 text-[10px] text-zinc-500 font-mono">roadmap.userpov.online/your-brand</div>
                </div>
                <div className="space-y-3">
                  {[
                    { t: "Add dark mode support", v: 142, s: "Planned" },
                    { t: "Integrate with Slack", v: 89, s: "In Progress" },
                    { t: "Mobile app for iOS", v: 215, s: "Shipped" },
                  ].map((r, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex flex-col items-center justify-center">
                          <span className="text-xs font-bold text-primary">{r.v}</span>
                          <span className="text-[8px] uppercase font-bold text-primary/60">votes</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{r.t}</div>
                          <div className="text-[10px] text-zinc-500">Suggested by Anonymous</div>
                        </div>
                      </div>
                      <Badge className="bg-zinc-800 text-zinc-300 border-none text-[10px]">{r.s}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="container py-20">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
          <p className="text-muted-foreground mt-3 text-lg">From zero to first feedback in under 5 minutes.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "01", emoji: "🏗️", title: "Create your feedback space", desc: "Sign up and add your business. We generate a public feedback page instantly." },
            { n: "02", emoji: "📲", title: "Share your link, QR, or widget", desc: "Print the QR for your shop, share the link, or embed the widget on your site." },
            { n: "03", emoji: "📊", title: "Read, organize, and engage", desc: "Respond to feedback, push feature ideas to your public roadmap, and let the community upvote them." },
          ].map((s) => (
            <div key={s.n} className="relative p-6 rounded-2xl border border-border bg-card shadow-sm">
              <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-bold">STEP {s.n}</div>
              <div className="text-4xl mb-3">{s.emoji}</div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* USE CASES */}
      <section id="use-cases" className="bg-secondary/40 py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Built for physical and online businesses</h2>
            <p className="text-muted-foreground mt-3 text-lg">One platform, every type of customer interaction.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {useCases.map((u) => (
              <Link key={u.title} to={u.link}>
                <Card className="h-full p-5 hover:shadow-card hover:-translate-y-0.5 transition-all border-border cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-success-soft text-success grid place-items-center mb-3 group-hover:scale-110 transition-transform">
                    <u.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-1">{u.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{u.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT MOCKUP */}
      <section id="mockup" className="container py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">A complete toolkit for visitor insights</h2>
          <p className="text-muted-foreground mt-3 text-lg">Dashboard, exit-intent triggers, abandonment forms, and beautiful public boards — all included.</p>
        </div>
        <div className="rounded-3xl border border-border bg-gradient-soft p-6 md:p-10">
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Dashboard preview */}
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">Rating & sentiment dashboard</div>
                  <div className="font-semibold">Bella's Café — Overview</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs bg-success-soft text-success font-semibold">Live</span>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { l: "Total", v: "248", emoji: "💬" },
                  { l: "Avg rating", v: "4.6", emoji: "⭐" },
                  { l: "Positive", v: "182", emoji: "😊" },
                  { l: "Negative", v: "21", emoji: "😞" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-secondary/60 p-3">
                    <div className="text-xs text-muted-foreground">{s.l}</div>
                    <div className="font-bold text-lg flex items-center gap-1">{s.v} <span>{s.emoji}</span></div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { name: "Anonymous", msg: "Loved the new menu! ❤️", r: 5, tag: "Review" },
                  { name: "Sarah K.", msg: "Waiting time was a bit long today.", r: 3, tag: "Complaint" },
                  { name: "Anonymous", msg: "Could you add more vegan options?", r: 4, tag: "Suggestion" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <div className="w-8 h-8 rounded-full bg-primary-soft text-primary grid place-items-center font-semibold text-xs">{f.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{f.msg}</div>
                      <div className="text-xs text-muted-foreground">{f.name} · {f.tag}</div>
                    </div>
                    <div className="flex text-warning text-sm">{"★".repeat(f.r)}<span className="text-muted-foreground">{"★".repeat(5 - f.r)}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR + widget */}
            <div className="space-y-5">
              <div className="bg-card rounded-2xl border border-border shadow-card p-5 text-center">
                <div className="text-xs text-muted-foreground mb-2">QR code for store</div>
                <div className="mx-auto w-32 h-32 rounded-lg bg-foreground/95 grid place-items-center">
                  <QrCode className="w-20 h-20 text-background" strokeWidth={1.2} />
                </div>
                <p className="mt-3 text-sm font-semibold">Scan to share your honest feedback</p>
              </div>
              <div className="bg-card rounded-2xl border border-border shadow-card p-5">
                <div className="text-xs text-muted-foreground mb-2">Website feedback widget</div>
                <div className="rounded-lg border border-border bg-secondary/40 p-4 relative h-32">
                  <div className="absolute bottom-3 right-3 bg-gradient-cta text-primary-foreground text-xs font-semibold px-3 py-2 rounded-full shadow-glow flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Send a Message
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Embed in 1 line on any site.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-secondary/30 py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need, nothing you don't</h2>
            <p className="text-muted-foreground mt-3 text-lg">Designed for non-technical owners. Powerful enough for teams.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <Card key={f.title} className="p-5 border-border bg-card hover:shadow-card transition-shadow">
                <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary grid place-items-center mb-3">
                  <f.icon className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="container py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">A dashboard built for action 📈</h2>
          <p className="text-muted-foreground mt-3 text-lg">Filter by business, rating, category, and status — and respond fast.</p>
        </div>
        <div className="rounded-2xl border border-border shadow-elegant overflow-hidden bg-card">
          <div className="bg-secondary/60 border-b border-border px-5 py-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-destructive/70"></span>
            <span className="w-3 h-3 rounded-full bg-warning/70"></span>
            <span className="w-3 h-3 rounded-full bg-success/70"></span>
            <span className="ml-3 text-xs text-muted-foreground">app.userpov.online/dashboard</span>
          </div>
          <div className="p-6 grid lg:grid-cols-4 gap-5">
            <div className="space-y-3 lg:col-span-1">
              <div className="text-sm font-semibold">Filters</div>
              {["All businesses", "Bella's Café", "Online store"].map((b) => (
                <div key={b} className="text-sm px-3 py-2 rounded-md bg-secondary/60">{b}</div>
              ))}
              <div className="text-sm font-semibold pt-3">Status</div>
              {["New 12", "In Review 4", "Resolved 188"].map((s) => (
                <div key={s} className="text-sm px-3 py-2 rounded-md border border-border">{s}</div>
              ))}
            </div>
            <div className="lg:col-span-3 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { l: "Total feedback", v: "1,284", emoji: "💬" },
                  { l: "Avg rating", v: "4.6 ★", emoji: "⭐" },
                  { l: "Negative alerts", v: "9", emoji: "🚨" },
                  { l: "Positive", v: "82%", emoji: "😊" },
                ].map((s) => (
                  <Card key={s.l} className="p-4">
                    <div className="text-xs text-muted-foreground">{s.l}</div>
                    <div className="text-2xl font-bold">{s.v} <span className="text-base">{s.emoji}</span></div>
                  </Card>
                ))}
              </div>
              <Card className="p-4">
                <div className="text-sm font-semibold mb-3">Recent feedback</div>
                <div className="space-y-2">
                  {[
                    { msg: "Best coffee in town! ☕❤️", r: 5, tag: "Testimonial" },
                    { msg: "Site checkout failed twice 😣", r: 2, tag: "Bug Report" },
                    { msg: "Friendly staff, quick service.", r: 5, tag: "Review" },
                    { msg: "Please open earlier on Sundays!", r: 4, tag: "Suggestion" },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/60">
                      <div className="flex-1 text-sm">{f.msg}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{f.tag}</span>
                      <div className="text-warning text-sm">{"★".repeat(f.r)}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-secondary/30 py-20" id="pricing">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">The only plan you'll ever need</h2>
            <p className="text-muted-foreground mt-3 text-lg">Full access. Zero fees for 3 months. No credit card required.</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 md:p-10 border-primary shadow-glow relative overflow-hidden bg-white/80 backdrop-blur-sm">
              <div className="absolute top-0 right-0 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-bl-xl">
                3 MONTHS FREE
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-bold">Full Access Plan</h3>
                  <ul className="space-y-2.5">
                    {[
                      "Unlimited feedback spaces",
                      "Exit-intent Smart Triggers",
                      "AI Sentiment Detection",
                      "QR Code Generator",
                      "Website Widget",
                      "Priority Support"
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-center md:border-l border-border md:pl-8 min-w-[200px]">
                  <div className="text-4xl font-black text-foreground">$0</div>
                  <div className="text-muted-foreground text-sm font-medium">for 3 months</div>
                  <Button asChild className="w-full mt-6 bg-gradient-cta shadow-glow">
                    <Link to="/signup">Start Free Trial</Link>
                  </Button>
                  <p className="text-[10px] text-muted-foreground mt-3 italic">
                    Trial ends after first 50 signups
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container py-20">
        <div className="rounded-3xl bg-gradient-cta text-primary-foreground p-10 md:p-16 text-center shadow-elegant relative overflow-hidden">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Start listening to the visitors you never hear from
          </h2>
          <p className="mt-4 text-primary-foreground/90 max-w-xl mx-auto">
            Get the userpov on your site performance today. Free forever, no credit card required.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-7">
            <Link to="/signup">Create your feedback space <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Landing;
