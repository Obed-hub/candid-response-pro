import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Trash2, Mail, User } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["New","In Review","Resolved","Archived"];

const FeedbackDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data } = await supabase.from("feedback").select("*, businesses(business_name)").eq("id", id).maybeSingle();
      setF(data);
    })();
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!id) return;
    const { error } = await supabase.from("feedback").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setF((prev: any) => ({ ...prev, status }));
    toast.success("Status updated");
  };

  const remove = async () => {
    if (!id) return;
    if (!confirm("Delete this feedback?")) return;
    const { error } = await supabase.from("feedback").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted"); nav("/inbox");
  };

  if (!f) return <AppShell><div className="text-muted-foreground">Loading…</div></AppShell>;

  const sentimentEmoji = f.rating >= 4 ? "😊" : f.rating <= 2 ? "😞" : "😐";

  return (
    <AppShell>
      <Button variant="ghost" onClick={() => nav("/inbox")} className="mb-4"><ArrowLeft className="w-4 h-4 mr-1" /> Back to inbox</Button>
      <Card className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-4xl">{sentimentEmoji}</span>
              {f.rating && <div className="text-warning text-xl">{"★".repeat(f.rating)}<span className="text-muted-foreground/40">{"★".repeat(5 - f.rating)}</span></div>}
            </div>
            <div className="text-sm text-muted-foreground">{f.businesses?.business_name} · {f.category ?? "Other"} · {f.source}</div>
          </div>
          <div className="flex gap-2">
            <Select value={f.status} onValueChange={updateStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s)=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={remove}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        </div>

        <div className="bg-secondary/40 rounded-xl p-5 text-base leading-relaxed">{f.message}</div>

        <div className="mt-6 pt-6 border-t border-border grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /> {f.is_anonymous ? "Anonymous" : (f.customer_name ?? "—")}</div>
          <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> {f.customer_email ?? "—"}</div>
          <div className="text-muted-foreground">Submitted {new Date(f.created_at).toLocaleString()}</div>
        </div>
      </Card>
    </AppShell>
  );
};

export default FeedbackDetail;
