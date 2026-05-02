import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Copy, Zap } from "lucide-react";
import { toast } from "sonner";

const BUTTON_TEXT_SUGGESTIONS = [
  "Send a Message",
  "Share Your Thoughts",
  "Talk to Us",
  "Tell Us What You Think",
  "Leave a Note",
  "Start a Conversation",
  "Send Us a Note",
  "Talk With Us",
  "We're Listening",
  "Let Us Know",
  "Message the Team"
];

const WidgetPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    const { error } = await (supabase as any).from("widget_settings").update({
      widget_title: w.widget_title, 
      button_text: w.button_text, 
      position: w.position, 
      theme: w.theme, 
      is_enabled: w.is_enabled,
      exit_intent_enabled: w.exit_intent_enabled,
      exit_intent_message: w.exit_intent_message,
      delay_seconds: w.delay_seconds,
      scroll_percent: w.scroll_percent,
    }).eq("id", w.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Widget saved!");
  };

  const biz = businesses.find((b) => b.id === selected);
  const embed = biz ? `<script async src="https://userpov.online/widget.js" data-userpov="${biz.feedback_slug}"></script>` : "";
  const communityEmbed = biz ? `<script async src="https://userpov.online/widget.js" data-userpov="${biz.feedback_slug}" data-mode="community"></script>` : "";

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
                <div>
                  <Label>Button text</Label>
                  <Input value={w.button_text} onChange={(e)=>setW({...w, button_text:e.target.value})} className="mb-2" />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {BUTTON_TEXT_SUGGESTIONS.map((text) => (
                      <button
                        key={text}
                        type="button"
                        onClick={() => setW({...w, button_text: text})}
                        className={`text-[10px] px-2 py-1 rounded-md border transition-all ${w.button_text === text ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/30'}`}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
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

                <div className="pt-4 border-t border-border space-y-4 text-center p-4 bg-secondary/20 rounded-xl">
                  <Zap className="w-5 h-5 mx-auto text-primary" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Automate your widget</p>
                    <p className="text-[11px] text-muted-foreground">Setup Exit Intent, Scroll depth, and behavior-based triggers.</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate("/triggers")}>
                    Manage Smart Triggers →
                  </Button>
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
                
                <div className="mt-10 pt-6 border-t border-border">
                  <h3 className="text-lg font-bold mb-2">Community Roadmap Widget</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Embed your public roadmap and feedback board so users can see what you're working on and upvote their favorite ideas.
                  </p>
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 mb-4">
                    <Label className="block mb-2 text-blue-800 dark:text-blue-300">Community Embed Code</Label>
                    <div className="flex gap-2">
                      <code className="block flex-1 text-[11px] bg-white dark:bg-black/20 p-3 rounded-md break-all border border-blue-200/50">{communityEmbed}</code>
                      <Button size="icon" variant="outline" className="border-blue-200" onClick={()=>{navigator.clipboard.writeText(communityEmbed); toast.success("Copied!");}}><Copy className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => window.open(`https://userpov.online/community/${biz?.feedback_slug}`, '_blank')}>
                    View your public board →
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
};

export default WidgetPage;
