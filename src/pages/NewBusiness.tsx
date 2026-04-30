import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) + "-" + Math.random().toString(36).slice(2, 6);

const schema = z.object({
  business_name: z.string().trim().min(2).max(80),
  business_type: z.string().min(1),
  description: z.string().max(500).optional(),
  website_url: z.string().url().or(z.literal("")).optional(),
  physical_address: z.string().max(200).optional(),
});

const types = ["Restaurant","Café","Salon","Supermarket","School","Clinic","Online store","SaaS","Agency","Freelancer","Church","Other"];

const NewBusiness = () => {
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ business_name: "", business_type: "Restaurant", description: "", website_url: "", physical_address: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (!user) return;
    setLoading(true);
    const slug = slugify(form.business_name);
    const { data, error } = await supabase.from("businesses").insert({
      owner_id: user.id,
      business_name: parsed.data.business_name,
      business_type: parsed.data.business_type,
      description: parsed.data.description || null,
      website_url: parsed.data.website_url || null,
      physical_address: parsed.data.physical_address || null,
      feedback_slug: slug,
      is_public: true,
    }).select().single();
    if (error || !data) { setLoading(false); toast.error(error?.message ?? "Failed"); return; }
    // create default widget settings + qr record
    await supabase.from("widget_settings").insert({ business_id: data.id });
    await supabase.from("qr_codes").insert({ business_id: data.id, qr_url: `${window.location.origin}/feedback/${slug}` });
    toast.success("Feedback space created! 🎉");
    nav("/businesses");
  };

  return (
    <AppShell>
      <h1 className="text-3xl font-bold mb-1">Create a feedback space</h1>
      <p className="text-muted-foreground mb-8">Each business gets a public page, QR, and widget.</p>
      <Card className="p-8 max-w-2xl">
        <form onSubmit={submit} className="space-y-5">
          <div><Label>Business name</Label><Input value={form.business_name} onChange={(e)=>setForm({...form, business_name:e.target.value})} placeholder="Bella's Café" /></div>
          <div>
            <Label>Type</Label>
            <Select value={form.business_type} onValueChange={(v)=>setForm({...form, business_type:v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{types.map((t)=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Description (optional)</Label><Textarea value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} placeholder="What does your business do?" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Website (optional)</Label><Input value={form.website_url} onChange={(e)=>setForm({...form, website_url:e.target.value})} placeholder="https://" /></div>
            <div><Label>Address (optional)</Label><Input value={form.physical_address} onChange={(e)=>setForm({...form, physical_address:e.target.value})} placeholder="123 Main St" /></div>
          </div>
          <Button type="submit" disabled={loading} className="bg-gradient-cta shadow-glow">{loading ? "Creating…" : "Create feedback space"}</Button>
        </form>
      </Card>
    </AppShell>
  );
};

export default NewBusiness;
