import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { Star, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Complaint","Suggestion","Review","Testimonial","Bug Report","Service Experience","Delivery Experience","Product Feedback","Other"];

const schema = z.object({
  message: z.string().trim().min(3, "Please share a bit more").max(2000),
  customer_name: z.string().trim().max(80).optional(),
  customer_email: z.string().trim().email("Invalid email").max(255).or(z.literal("")).optional(),
});

const PublicFeedback = () => {
  const { slug } = useParams();
  const [biz, setBiz] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ rating: 0, category: "Review", message: "", customer_name: "", customer_email: "", anonymous: true });

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data } = await supabase.from("businesses").select("*").eq("feedback_slug", slug).eq("is_public", true).maybeSingle();
      if (!data) { setNotFound(true); return; }
      setBiz(data);
    })();
  }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ message: form.message, customer_name: form.customer_name || undefined, customer_email: form.customer_email || undefined });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (!biz) return;
    setLoading(true);
    const sentiment = form.rating >= 4 ? "positive" : form.rating > 0 && form.rating <= 2 ? "negative" : "neutral";
    const { error } = await supabase.from("feedback").insert({
      business_id: biz.id,
      message: parsed.data.message,
      rating: form.rating || null,
      category: form.category,
      source: "Public Page",
      status: "New",
      sentiment,
      is_anonymous: form.anonymous,
      customer_name: form.anonymous ? null : (form.customer_name || null),
      customer_email: form.anonymous ? null : (form.customer_email || null),
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
  };

  if (notFound) return (
    <div className="min-h-screen grid place-items-center bg-gradient-soft p-6 text-center">
      <Card className="p-10 max-w-md"><div className="text-5xl mb-3">🤔</div><h1 className="text-xl font-bold">Feedback space not found</h1><p className="text-muted-foreground text-sm mt-1">The link may be invalid or the business is no longer public.</p></Card>
    </div>
  );

  if (!biz) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  if (done) return (
    <div className="min-h-screen grid place-items-center bg-gradient-soft p-6">
      <Card className="p-10 max-w-md text-center animate-fade-in">
        <div className="text-7xl mb-3">🎉</div>
        <h1 className="text-2xl font-bold">Thank you!</h1>
        <p className="text-muted-foreground mt-2">Your feedback has been sent to {biz.business_name}. They'll be grateful you spoke up. 💙</p>
        <Button className="mt-6 bg-gradient-cta" onClick={() => { setDone(false); setForm({ rating: 0, category: "Review", message: "", customer_name: "", customer_email: "", anonymous: true }); }}>Submit another</Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-soft py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6"><Logo className="justify-center inline-flex" /></div>
        <Card className="p-8 shadow-elegant">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">💬</div>
            <h1 className="text-2xl font-bold">{biz.business_name}</h1>
            <p className="text-muted-foreground text-sm mt-1">{biz.description ?? "We'd love to hear your honest feedback."}</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <Label className="block mb-2 text-center">How would you rate your experience?</Label>
              <div className="flex justify-center gap-1.5">
                {[1,2,3,4,5].map((n) => (
                  <button type="button" key={n} onClick={() => setForm({...form, rating:n})} className="p-1 transition-transform hover:scale-110">
                    <Star className={`w-9 h-9 ${form.rating >= n ? "fill-warning text-warning" : "text-muted-foreground/40"}`} />
                  </button>
                ))}
              </div>
              {form.rating > 0 && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {form.rating === 5 && "Amazing! 🤩"}
                  {form.rating === 4 && "Glad you enjoyed it! 😊"}
                  {form.rating === 3 && "Thanks for the honesty 🙂"}
                  {form.rating === 2 && "We hear you, sorry about that 😟"}
                  {form.rating === 1 && "We're really sorry — let's fix this 💙"}
                </p>
              )}
            </div>

            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v)=>setForm({...form, category:v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c)=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div>
              <Label>Your feedback</Label>
              <Textarea rows={5} value={form.message} onChange={(e)=>setForm({...form, message:e.target.value})} placeholder="Tell us what went well — or what didn't. Honest feedback helps us improve. 💬" />
            </div>

            <label className="flex items-start gap-3 p-4 rounded-lg bg-secondary/60 cursor-pointer">
              <input type="checkbox" className="mt-0.5" checked={form.anonymous} onChange={(e)=>setForm({...form, anonymous:e.target.checked})} />
              <div>
                <div className="text-sm font-medium flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-success" /> Submit anonymously</div>
                <div className="text-xs text-muted-foreground">Your name and email won't be shared.</div>
              </div>
            </label>

            {!form.anonymous && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Your name</Label><Input value={form.customer_name} onChange={(e)=>setForm({...form, customer_name:e.target.value})} placeholder="Optional" /></div>
                <div><Label>Email</Label><Input type="email" value={form.customer_email} onChange={(e)=>setForm({...form, customer_email:e.target.value})} placeholder="Optional" /></div>
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-cta shadow-glow" size="lg" disabled={loading}>{loading ? "Sending…" : "Send feedback ✨"}</Button>
            <p className="text-xs text-center text-muted-foreground">Powered by <b>Feedback Pro</b></p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PublicFeedback;
