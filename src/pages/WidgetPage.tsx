import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Copy } from "lucide-react";
import { toast } from "sonner";

const WidgetPage = () => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [w, setW] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from("businesses").select("*").eq("owner_id", user.id);
      setBusinesses(data ?? []);
      if (data?.[0]) setSelected(data[0].id);
    })();
  }, [user]);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      const { data } = await supabase.from("widget_settings").select("*").eq("business_id", selected).maybeSingle();
      setW(data);
    })();
  }, [selected]);

  const save = async () => {
    if (!w) return;
    const { error } = await supabase.from("widget_settings").update({
      widget_title: w.widget_title, button_text: w.button_text, position: w.position, theme: w.theme, is_enabled: w.is_enabled,
    }).eq("id", w.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Widget saved!");
  };

  const biz = businesses.find((b) => b.id === selected);
  const embed = biz ? `<script async src="${window.location.origin}/widget.js" data-feedback-pro="${biz.feedback_slug}"></script>` : "";

  return (
    <AppShell>
      <h1 className="text-3xl font-bold mb-1">Website widget</h1>
      <p className="text-muted-foreground mb-6">Embed a feedback button on your website or online store.</p>

      {businesses.length === 0 ? (
        <Card className="p-10 text-center"><div className="text-5xl mb-3">🧩</div><p className="text-muted-foreground">Create a business first.</p></Card>
      ) : (
        <>
          <Card className="p-4 mb-5">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{businesses.map((b)=><SelectItem key={b.id} value={b.id}>{b.business_name}</SelectItem>)}</SelectContent>
            </Select>
          </Card>

          {w && (
            <div className="grid lg:grid-cols-2 gap-5">
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div><Label>Widget enabled</Label><p className="text-xs text-muted-foreground">Toggle to show or hide the button on your site.</p></div>
                  <Switch checked={w.is_enabled} onCheckedChange={(v)=>setW({...w, is_enabled:v})} />
                </div>
                <div><Label>Widget title</Label><Input value={w.widget_title} onChange={(e)=>setW({...w, widget_title:e.target.value})} /></div>
                <div><Label>Button text</Label><Input value={w.button_text} onChange={(e)=>setW({...w, button_text:e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Position</Label>
                    <Select value={w.position} onValueChange={(v)=>setW({...w, position:v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">Bottom right</SelectItem>
                        <SelectItem value="bottom-left">Bottom left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Theme</Label>
                    <Select value={w.theme} onValueChange={(v)=>setW({...w, theme:v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={save} className="bg-gradient-cta shadow-glow">Save widget settings</Button>

                <div className="pt-4 border-t border-border">
                  <Label className="block mb-2">Embed code</Label>
                  <p className="text-xs text-muted-foreground mb-2">Copy this and paste before the closing &lt;/body&gt; tag of your website.</p>
                  <div className="flex gap-2">
                    <code className="block flex-1 text-xs bg-secondary p-3 rounded-md break-all">{embed}</code>
                    <Button size="icon" variant="outline" onClick={()=>{navigator.clipboard.writeText(embed); toast.success("Copied!");}}><Copy className="w-4 h-4" /></Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <Label className="block mb-3">Live preview</Label>
                <div className={`relative rounded-xl border border-border p-6 h-80 ${w.theme === "dark" ? "bg-foreground/95" : "bg-secondary/40"}`}>
                  <div className={`text-xs ${w.theme === "dark" ? "text-background/70" : "text-muted-foreground"}`}>Your website</div>
                  <div className={`mt-3 h-3 w-32 rounded ${w.theme === "dark" ? "bg-background/20" : "bg-muted"}`} />
                  <div className={`mt-2 h-3 w-44 rounded ${w.theme === "dark" ? "bg-background/20" : "bg-muted"}`} />
                  {w.is_enabled && (
                    <button className={`absolute bottom-4 ${w.position === "bottom-left" ? "left-4" : "right-4"} bg-gradient-cta text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-full shadow-glow flex items-center gap-1.5`}>
                      <MessageSquare className="w-4 h-4" /> {w.button_text}
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Title shown in form: <b className="text-foreground">{w.widget_title}</b></p>
              </Card>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
};

export default WidgetPage;
