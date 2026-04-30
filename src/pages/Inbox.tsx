import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search } from "lucide-react";

const STATUSES = ["All","New","In Review","Resolved","Archived"];
const CATEGORIES = ["All","Complaint","Suggestion","Review","Testimonial","Bug Report","Service Experience","Delivery Experience","Product Feedback","Other"];

const Inbox = () => {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [biz, setBiz] = useState("All");
  const [status, setStatus] = useState("All");
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: bizs } = await supabase.from("businesses").select("*").eq("owner_id", user.id);
      setBusinesses(bizs ?? []);
      const ids = (bizs ?? []).map((b: any) => b.id);
      if (ids.length === 0) return;
      const { data } = await supabase.from("feedback").select("*, businesses(business_name)").in("business_id", ids).order("created_at", { ascending: false });
      setList(data ?? []);
    })();
  }, [user]);

  const filtered = useMemo(() => list.filter((f: any) => {
    if (biz !== "All" && f.business_id !== biz) return false;
    if (status !== "All" && f.status !== status) return false;
    if (cat !== "All" && f.category !== cat) return false;
    if (q && !f.message.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [list, biz, status, cat, q]);

  const statusColor = (s: string) => ({ "New": "bg-primary-soft text-primary", "In Review": "bg-warning-soft text-warning", "Resolved": "bg-success-soft text-success", "Archived": "bg-secondary text-muted-foreground" } as any)[s];

  return (
    <AppShell>
      <h1 className="text-3xl font-bold mb-1">Feedback inbox</h1>
      <p className="text-muted-foreground mb-6">All customer feedback in one place.</p>

      <Card className="p-4 mb-5 grid sm:grid-cols-4 gap-3">
        <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" /><Input placeholder="Search…" className="pl-9" value={q} onChange={(e)=>setQ(e.target.value)} /></div>
        <Select value={biz} onValueChange={setBiz}>
          <SelectTrigger><SelectValue placeholder="Business" /></SelectTrigger>
          <SelectContent><SelectItem value="All">All businesses</SelectItem>{businesses.map((b:any)=><SelectItem key={b.id} value={b.id}>{b.business_name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s)=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
        <Select value={cat} onValueChange={setCat}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((s)=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center"><div className="text-5xl mb-3">📭</div><p className="text-muted-foreground">No feedback matches your filters.</p></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((f: any) => (
            <Link key={f.id} to={`/feedback-detail/${f.id}`} className="block">
              <Card className="p-4 hover:shadow-card transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-soft text-primary grid place-items-center font-semibold">
                    {f.is_anonymous ? "?" : (f.customer_name?.[0] ?? "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{f.message}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {f.is_anonymous ? "Anonymous" : (f.customer_name ?? "Customer")} · {f.businesses?.business_name} · {f.category ?? "Other"} · {new Date(f.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {f.rating && <div className="text-warning text-sm">{"★".repeat(f.rating)}<span className="text-muted-foreground/40">{"★".repeat(5 - f.rating)}</span></div>}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(f.status)}`}>{f.status}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Inbox;
