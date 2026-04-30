import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Star, AlertTriangle, Smile, Plus, QrCode, Code2, ArrowRight } from "lucide-react";

interface Stats { total: number; avg: number; positive: number; negative: number; recent: any[]; byStatus: Record<string, number>; businessCount: number; }

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, avg: 0, positive: 0, negative: 0, recent: [], byStatus: {}, businessCount: 0 });
  const [loading, setLoading] = useState(true);
  const [firstBiz, setFirstBiz] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: bizs } = await supabase.from("businesses").select("*").eq("owner_id", user.id);
      const ids = (bizs ?? []).map((b: any) => b.id);
      setFirstBiz(bizs?.[0] ?? null);
      if (ids.length === 0) { setLoading(false); return; }
      const { data: fb } = await supabase.from("feedback").select("*").in("business_id", ids).order("created_at", { ascending: false });
      const list = fb ?? [];
      const ratings = list.filter((f: any) => f.rating).map((f: any) => f.rating);
      const avg = ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
      const byStatus: Record<string, number> = {};
      list.forEach((f: any) => { byStatus[f.status] = (byStatus[f.status] ?? 0) + 1; });
      setStats({
        total: list.length,
        avg: Math.round(avg * 10) / 10,
        positive: list.filter((f: any) => (f.rating ?? 0) >= 4).length,
        negative: list.filter((f: any) => (f.rating ?? 0) > 0 && f.rating <= 2).length,
        recent: list.slice(0, 6),
        byStatus,
        businessCount: bizs?.length ?? 0,
      });
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <AppShell><div className="text-muted-foreground">Loading dashboard…</div></AppShell>;

  if (stats.businessCount === 0) {
    return (
      <AppShell>
        <Card className="p-10 text-center bg-gradient-soft border-border">
          <div className="text-6xl mb-3">🚀</div>
          <h1 className="text-2xl font-bold">Welcome to Feedback Pro!</h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">Create your first feedback space to get a public link, QR code, and website widget.</p>
          <Button asChild className="mt-6 bg-gradient-cta shadow-glow"><Link to="/businesses/new">Create my first business <ArrowRight className="w-4 h-4 ml-1" /></Link></Button>
        </Card>
      </AppShell>
    );
  }

  const cards = [
    { l: "Total feedback", v: stats.total, icon: MessageSquare, color: "text-primary bg-primary-soft", emoji: "💬" },
    { l: "Average rating", v: stats.avg ? `${stats.avg} ★` : "—", icon: Star, color: "text-warning bg-warning-soft", emoji: "⭐" },
    { l: "Positive", v: stats.positive, icon: Smile, color: "text-success bg-success-soft", emoji: "😊" },
    { l: "Negative alerts", v: stats.negative, icon: AlertTriangle, color: "text-destructive bg-destructive-soft", emoji: "🚨" },
  ];

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Here's how your customers feel today.</p>
        </div>
        <Button asChild className="bg-gradient-cta shadow-glow"><Link to="/businesses/new"><Plus className="w-4 h-4 mr-1" /> New space</Link></Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <Card key={c.l} className="p-5">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg grid place-items-center ${c.color}`}><c.icon className="w-5 h-5" /></div>
              <span className="text-2xl">{c.emoji}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-3">{c.l}</div>
            <div className="text-2xl font-bold">{c.v}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent feedback</h2>
            <Link to="/inbox" className="text-sm text-primary">Open inbox →</Link>
          </div>
          {stats.recent.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <div className="text-4xl mb-2">📭</div>
              No feedback yet. Share your link or QR code to start collecting.
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recent.map((f: any) => (
                <Link key={f.id} to={`/feedback/${f.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/60 border border-border">
                  <div className="w-8 h-8 rounded-full bg-primary-soft text-primary grid place-items-center font-semibold text-xs">
                    {f.is_anonymous ? "?" : (f.customer_name?.[0] ?? "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{f.message}</div>
                    <div className="text-xs text-muted-foreground">{f.is_anonymous ? "Anonymous" : f.customer_name} · {f.category ?? "Other"}</div>
                  </div>
                  {f.rating && <div className="text-warning text-sm">{"★".repeat(f.rating)}</div>}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{f.status}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-5">
          {firstBiz && (
            <>
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-2"><QrCode className="w-4 h-4 text-primary" /><h3 className="font-semibold text-sm">Your QR code</h3></div>
                <p className="text-xs text-muted-foreground mb-3">Print and display in your store.</p>
                <Button asChild size="sm" variant="outline" className="w-full"><Link to="/qr">Open QR page</Link></Button>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-2"><Code2 className="w-4 h-4 text-primary" /><h3 className="font-semibold text-sm">Website widget</h3></div>
                <p className="text-xs text-muted-foreground mb-3">Embed on your online store or site.</p>
                <Button asChild size="sm" variant="outline" className="w-full"><Link to="/widget">Setup widget</Link></Button>
              </Card>
              <Card className="p-5 bg-gradient-soft">
                <h3 className="font-semibold text-sm mb-1">📣 Share your link</h3>
                <p className="text-xs text-muted-foreground break-all">{window.location.origin}/feedback/{firstBiz.feedback_slug}</p>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
