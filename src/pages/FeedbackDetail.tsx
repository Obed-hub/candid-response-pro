import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Trash2, Mail, User, Send, Heart, Eye, BellRing } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["New","In Review","Planned","In-Progress","Shipped","Resolved","Archived"];

const FeedbackDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);

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

  const sendReply = async () => {
    if (!id || !reply.trim()) return;
    setReplying(true);
    const { error } = await supabase.from("feedback").update({
      business_reply: reply,
      reply_at: new Date().toISOString(),
      status: f.status === "New" ? "In Review" : f.status
    }).eq("id", id);
    setReplying(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Reply sent");
    setF((prev: any) => ({ ...prev, business_reply: reply, reply_at: new Date().toISOString(), status: prev.status === "New" ? "In Review" : prev.status }));
    setReply("");
  };

  const toggleFeatured = async () => {
    if (!id) return;
    const newState = !f.is_featured;
    const { error } = await supabase.from("feedback").update({ is_featured: newState }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setF((prev: any) => ({ ...prev, is_featured: newState }));
    toast.success(newState ? "Added to Wall of Love" : "Removed from Wall of Love");
  };

  const togglePublic = async () => {
    if (!id) return;
    const newState = !f.is_public;
    const { error } = await supabase.from("feedback").update({ is_public: newState }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setF((prev: any) => ({ ...prev, is_public: newState }));
    toast.success(newState ? "Shared with community board" : "Removed from community board");
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
            <Button variant={f.is_featured ? "default" : "outline"} size="icon" onClick={toggleFeatured} className={f.is_featured ? "bg-rose-500 hover:bg-rose-600 text-white" : ""}>
              <Heart className={`w-4 h-4 ${f.is_featured ? "fill-current" : ""}`} />
            </Button>
            <Button variant={f.is_public ? "default" : "outline"} size="icon" onClick={togglePublic} className={f.is_public ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}>
              <Eye className={`w-4 h-4 ${f.is_public ? "fill-current" : ""}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={remove}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        </div>

        <div className="bg-secondary/40 rounded-xl p-5 text-base leading-relaxed space-y-4">
          <p>{f.message}</p>
          {f.audio_url && (
            <div className="pt-2 border-t border-border/50">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2">
                Voice Memo
              </span>
              <audio src={f.audio_url} controls className="h-10 w-full max-w-sm" />
            </div>
          )}
          {f.visual_url && (
            <div className="pt-2 border-t border-border/50">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2">
                <Eye className="w-3 h-3" /> Annotated Screenshot
              </span>
              <img 
                src={f.visual_url} 
                alt="Visual Feedback" 
                className="rounded-lg border border-border shadow-sm max-h-96 w-auto cursor-zoom-in" 
                onClick={() => window.open(f.visual_url, '_blank')}
              />
            </div>
          )}
        </div>
        <div className="mt-6 pt-6 border-t border-border grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /> {f.is_anonymous ? "Anonymous" : (f.customer_name ?? "—")}</div>
          <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> {f.customer_email ?? "—"}</div>
          <div className="text-muted-foreground">Submitted {new Date(f.created_at).toLocaleString()}</div>
        </div>

        {/* Reply Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-lg font-semibold mb-4">Your Response</h3>
          {f.business_reply ? (
            <div className="bg-primary/5 p-4 rounded-xl border-l-2 border-primary">
              <p className="text-sm">{f.business_reply}</p>
              <div className="text-xs text-muted-foreground mt-2">Replied {new Date(f.reply_at).toLocaleString()}</div>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea 
                value={reply} 
                onChange={(e) => setReply(e.target.value)} 
                placeholder="Write a response to the customer..." 
                className="resize-none"
                rows={4}
              />
              <Button onClick={sendReply} disabled={replying || !reply.trim()} className="gap-2">
                <Send className="w-4 h-4" /> {replying ? "Sending..." : "Send Reply"}
              </Button>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <BellRing className="w-3 h-3 text-primary" /> The customer will receive a real-time notification if they are viewing the page or have added it to their home screen.
              </p>
            </div>
          )}
        </div>
      </Card>
    </AppShell>
  );
};

export default FeedbackDetail;
