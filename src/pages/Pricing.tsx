import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, Zap, Sparkles } from "lucide-react";

const Pricing = () => {
  const [signupCount, setSignupCount] = useState(4942);

  useEffect(() => {
    const interval = setInterval(() => {
      setSignupCount(prev => {
        if (prev >= 4998) return prev;
        return prev + (Math.random() > 0.7 ? 1 : 0);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
  <div className="min-h-screen bg-background overflow-x-hidden">
    <SiteHeader />
    <section className="container py-20">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          <span>ZERO RISK. PURE GROWTH.</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
          Capture Every Leaving User. <br />
          <span className="text-primary">Or We Pay You.</span>
        </h1>
        <p className="text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
          The world's first conversion-guaranteed feedback platform. Start your 3-month free trial today — no credit card required.
        </p>

        {/* REAL-TIME COUNTER */}
        <div className="mt-8 max-w-md mx-auto bg-primary/5 p-4 rounded-2xl border border-primary/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm mb-2 gap-1 text-left sm:text-center">
            <span className="font-bold">🔥 {signupCount.toLocaleString()} / 5,000 spots claimed</span>
            <span className="text-primary font-bold animate-pulse">{5000 - signupCount} left!</span>
          </div>
          <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-cta transition-all duration-1000"
              style={{ width: `${(signupCount / 5000) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-medium">
            The 3-month free trial ends after the first 50 signups.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative group">
        {/* Decorative Glow */}
        <div className="absolute -inset-1 bg-gradient-cta rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        
        <Card className="relative p-8 md:p-12 border-primary/20 shadow-glow bg-white/50 backdrop-blur-xl rounded-[1.5rem] overflow-hidden">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-glow">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">Full Access Plan</h3>
              </div>
              <p className="text-muted-foreground mb-8 text-lg">
                Get every tool you need to turn visitor abandonment into business growth.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Unlimited feedback spaces",
                   "AI Smart Triggers (Exit intent, Scroll, Time)",
                   "Custom Website Widget & QR Generator",
                   "Real-time Customer Notifications",
                   "Team Collaboration & Analytics",
                   "White-label Branding & Custom Exports",
                   "Priority Email & Slack Support"
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-primary-soft/50 p-8 rounded-2xl border border-primary/10 flex flex-col items-center text-center">
              <div className="mb-2 text-muted-foreground font-medium uppercase tracking-widest text-xs">PRICE</div>
              <div className="flex items-start gap-1">
                <span className="text-5xl md:text-7xl font-black tracking-tighter text-foreground">$0</span>
                <span className="text-xl font-bold text-muted-foreground mt-2">/mo</span>
              </div>
              <div className="mt-4 px-4 py-1.5 rounded-full bg-success/10 text-success text-sm font-bold">
                FREE FOR 3 MONTHS
              </div>
              
              <Button asChild size="lg" className="w-full mt-8 bg-gradient-cta hover:scale-105 transition-transform text-lg py-7 rounded-xl shadow-glow">
                <Link to="/signup">Start Free Trial</Link>
              </Button>
              
              <p className="text-sm text-muted-foreground mt-4 font-medium italic">
                * No credit card required. Cancel anytime.
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <p className="text-muted-foreground mb-4 font-medium italic">Confused about which plan is right for your business?</p>
          <Button 
            variant="outline" 
            className="rounded-full gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 px-8 py-6 h-auto text-lg font-bold shadow-sm transition-all hover:scale-105"
            onClick={() => {
              (window as any).toggleUserPOVWidget?.(true);
              // Wait for iframe to be ready and send prompt
              setTimeout(() => {
                const iframe = document.querySelector('.fb-pro-iframe-container iframe') as HTMLIFrameElement;
                if (iframe && iframe.contentWindow) {
                  iframe.contentWindow.postMessage({ 
                    type: 'set-prompt', 
                    message: "Is there anything stopping you from choosing a plan?" 
                  }, '*');
                }
              }, 500);
            }}
          >
            <MessageSquare className="w-5 h-5" /> Talk to Us
          </Button>
        </div>
      </div>

      <div className="mt-20 max-w-3xl mx-auto">
        <div className="p-8 md:p-12 border-2 border-dashed border-primary/30 rounded-[2rem] bg-gradient-to-br from-primary-soft to-transparent text-center">
          <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Our Bold Performance Guarantee</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            We are so confident in our Smart Trigger system that we'll put our money where our mouth is. 
            <strong> If you don't capture between 50 to 500 leaving customers/users per month </strong> 
            using UserPOV, we don't just stay free — <strong>we will pay you.</strong>
          </p>
          <div className="inline-block px-6 py-3 bg-white border border-primary/20 rounded-xl shadow-sm text-sm font-bold text-primary">
            TERMS APPLY • SUBJECT TO TRAFFIC MINIMUMS
          </div>
        </div>
      </div>
    </section>
    <SiteFooter />
  </div>
);
};

export default Pricing;
