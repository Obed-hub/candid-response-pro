import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Star, AlertTriangle, Smile, Plus, QrCode, Code2, ArrowRight, Mic, Filter, Eye, PenTool, Smartphone, Zap, Activity } from "lucide-react";
import { NotificationsCenter } from "@/components/NotificationsCenter";

interface Stats { 
  total: number; 
  avg: number; 
  positive: number; 
  negative: number; 
  recent: any[]; 
  byStatus: Record<string, number>; 
  businessCount: number; 
  triggerEvents: number;
  activeTriggers: number;
  businessIds: string[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ 
    total: 0, 
    avg: 0, 
    positive: 0, 
    negative: 0, 
    recent: [], 
    byStatus: {}, 
    businessCount: 0,
    triggerEvents: 0,
    activeTriggers: 0,
    businessIds: []
  });
  const [loading, setLoading] = useState(true);
  const [firstBiz, setFirstBiz] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: bizs } = await supabase.from("businesses").select("*").eq("owner_id", user.id);
      const ids = (bizs ?? []).map((b: any) => b.id);
      setFirstBiz(bizs?.[0] ?? null);
      if (ids.length === 0) { setLoading(false); return; }
      
      const [feedbackRes, triggersRes, eventsRes] = await Promise.all([
        supabase.from("feedback").select("*").in("business_id", ids).order("created_at", { ascending: false }),
        supabase.from("smart_triggers").select("*").in("business_id", ids).eq("is_enabled", true),
        supabase.from("trigger_events").select("*", { count: 'exact', head: true }).in("business_id", ids)
      ]);

      const list = feedbackRes.data ?? [];
      const ratings = list.filter((f: any) => f.rating).map((f: any) => f.rating);
      const avg = ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
      const byStatus: Record<string, number> = {};
      list.forEach((f: any) => { byStatus[f.status] = (byStatus[f.status] ?? 0) + 1; });
      
      // Run automation checks
      if (ids.length > 0) {
        (supabase.rpc as any)('check_automations', { p_business_ids: ids }).then(() => {});
      }

      setStats({
        total: list.length,
        avg: Math.round(avg * 10) / 10,
        positive: list.filter((f: any) => (f.rating ?? 0) >= 4).length,
        negative: list.filter((f: any) => (f.rating ?? 0) > 0 && f.rating <= 2).length,
        recent: list.slice(0, 6),
        byStatus,
        businessCount: bizs?.length ?? 0,
        triggerEvents: eventsRes.count ?? 0,
        activeTriggers: triggersRes.data?.length ?? 0,
        businessIds: ids
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
          <h1 className="text-2xl font-bold">Welcome to userpov!</h1>
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
        <Card className="lg:col-span-2 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent feedback</h2>
            <Link to="/inbox" className="text-sm text-primary">Open inbox →</Link>
          </div>
          {stats.recent.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm flex-grow flex flex-col justify-center">
              <div className="text-4xl mb-2">📭</div>
              No feedback yet. Share your link or QR code to start collecting.
            </div>
          ) : (
            <div className="space-y-2 flex-grow">
              {stats.recent.map((f: any) => (
                <Link key={f.id} to={`/feedback-detail/${f.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/60 border border-border">
                  <div className="w-8 h-8 rounded-full bg-primary-soft text-primary grid place-items-center font-semibold text-xs">
                    {f.is_anonymous ? "?" : (f.customer_name?.[0] ?? "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate flex items-center gap-2">
                      {f.message}
                      {f.audio_url && <Mic className="w-3 h-3 text-primary shrink-0" />}
                    </div>
                    <div className="text-xs text-muted-foreground">{f.is_anonymous ? "Anonymous" : f.customer_name} · {f.category ?? "Other"}</div>
                  </div>
                  {f.rating && <div className="text-warning text-sm">{"★".repeat(f.rating)}</div>}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{f.status}</span>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Active Triggers</span>
              </div>
              <div className="text-2xl font-bold">{stats.activeTriggers}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Automated capture systems live</p>
            </div>
            <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Trigger Events</span>
              </div>
              <div className="text-2xl font-bold">{stats.triggerEvents}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Interactions captured this month</p>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <NotificationsCenter businessIds={stats.businessIds} />
          {firstBiz && (
            <>
              {/* Funnel Analytics Card */}
              <Card className="p-5 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Filter className="w-24 h-24" /></div>
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Filter className="w-4 h-4 text-primary" /> Feedback Funnel</h3>
                
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex justify-between items-end mb-1">
                      <div className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" /> Page Views</div>
                      <div className="text-lg font-bold">{firstBiz.page_views || 0}</div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-blue-400 w-full rounded-full"></div></div>
                  </div>
                  
                  <div className="relative pl-4">
                    <div className="absolute left-[3px] top-[-10px] w-px h-6 bg-border"></div>
                    <div className="flex justify-between items-end mb-1">
                      <div className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Smartphone className="w-3 h-3" /> App Installs</div>
                      <div className="text-lg font-bold">{firstBiz.app_installs || 0}</div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full transition-all" style={{ width: `${Math.min(100, ((firstBiz.app_installs || 0) / Math.max(1, (firstBiz.page_views || 1))) * 100)}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="relative pl-8">
                    <div className="absolute left-[19px] top-[-10px] w-px h-6 bg-border"></div>
                    <div className="flex justify-between items-end mb-1">
                      <div className="text-xs font-medium text-muted-foreground flex items-center gap-1"><PenTool className="w-3 h-3" /> Form Started</div>
                      <div className="text-lg font-bold">{firstBiz.form_started || 0}</div>
                    </div>
                    {/* Calculate percentage width relative to max (page views) */}
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-warning rounded-full transition-all" style={{ width: `${Math.min(100, ((firstBiz.form_started || 0) / Math.max(1, (firstBiz.page_views || 1))) * 100)}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="relative pl-12">
                    <div className="absolute left-[35px] top-[-10px] w-px h-6 bg-border"></div>
                    <div className="flex justify-between items-end mb-1">
                      <div className="text-xs font-medium text-muted-foreground flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Submitted</div>
                      <div className="text-lg font-bold">{stats.total || 0}</div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full transition-all" style={{ width: `${Math.min(100, ((stats.total || 0) / Math.max(1, (firstBiz.page_views || 1))) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </Card>

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
                <p className="text-xs text-muted-foreground break-all">https://userpov.online/feedback/{firstBiz.feedback_slug}</p>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
