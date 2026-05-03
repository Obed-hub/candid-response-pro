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
import { Zap, Clock, MousePointer2, ChevronDown, DollarSign, ShoppingCart, AlertTriangle, Mail, BarChart3, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const SmartTriggers = () => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [triggers, setTriggers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      const { data } = await supabase.from("smart_triggers").select("*").eq("business_id", selected).order('created_at', { ascending: true });
      setTriggers(data ?? []);
      setLoading(false);
    })();
  }, [selected]);

  const updateTrigger = (id: string, updates: any) => {
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleSave = async (trigger: any) => {
    const { error } = await supabase
      .from("smart_triggers")
      .update({
        is_enabled: trigger.is_enabled,
        prompt_text: trigger.prompt_text,
        conditions: trigger.conditions,
        updated_at: new Date().toISOString()
      })
      .eq("id", trigger.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${trigger.trigger_name} updated!`);
    }
  };

  const initializeTriggers = async () => {
    if (!selected) return;
    setLoading(true);
    const { error } = await supabase.rpc('initialize_business_triggers', { p_business_id: selected });
    if (error) {
      toast.error(error.message);
    } else {
      const { data } = await supabase.from("smart_triggers").select("*").eq("business_id", selected).order('created_at', { ascending: true });
      setTriggers(data ?? []);
      toast.success("Default triggers initialized!");
    }
    setLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'exit_intent': return <MousePointer2 className="w-5 h-5 text-orange-500" />;
      case 'time_on_page': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'scroll_depth': return <ChevronDown className="w-5 h-5 text-green-500" />;
      case 'pricing_dropoff': return <DollarSign className="w-5 h-5 text-purple-500" />;
      case 'checkout_abandonment': return <ShoppingCart className="w-5 h-5 text-pink-500" />;
      case 'low_rating_alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'follow_up_48h': return <Mail className="w-5 h-5 text-indigo-500" />;
      case 'weekly_summary': return <BarChart3 className="w-5 h-5 text-slate-500" />;
      default: return <Zap className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Smart Triggers</h1>
          <p className="text-muted-foreground">Automate feedback collection and owner alerts.</p>
        </div>
        
        {businesses.length > 0 && (
          <div className="w-full md:w-64">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Select business" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.business_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-xl" />
          ))}
        </div>
      ) : triggers.length === 0 ? (
        <Card className="p-12 text-center bg-card/50 border-dashed">
          <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-semibold mb-1">No triggers found</h3>
          <p className="text-muted-foreground mb-6">Triggers are usually created automatically, but you can initialize them manually if they're missing.</p>
          <Button onClick={initializeTriggers} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-glow">
            Initialize Default Triggers
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {triggers.map((trigger) => (
            <Card key={trigger.id} className="p-6 border-border/50 hover:border-primary/20 transition-all shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-secondary/50">
                    {getIcon(trigger.trigger_type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{trigger.trigger_name}</h3>
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider mt-1">
                      {trigger.action_type === 'show_widget' ? 'Widget Action' : 'Owner Alert'}
                    </Badge>
                  </div>
                </div>
                <Switch 
                  checked={trigger.is_enabled} 
                  onCheckedChange={(v) => updateTrigger(trigger.id, { is_enabled: v })} 
                />
              </div>
              
              <p className="text-sm text-muted-foreground mb-6 flex-grow leading-relaxed">
                {trigger.trigger_type === 'exit_intent' ? "Intercept users right before they leave your site to understand what stopped them." : 
                 trigger.trigger_type === 'pricing_dropoff' ? "Detect when users abandon the pricing page to capture objections early." :
                 trigger.trigger_type === 'checkout_abandonment' ? "Reach out when users leave during checkout to fix friction points." :
                 trigger.description}
              </p>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-bold text-muted-foreground tracking-tighter">Prompt / Alert Text</Label>
                  <Input 
                    value={trigger.prompt_text || ""} 
                    onChange={(e) => updateTrigger(trigger.id, { prompt_text: e.target.value })}
                    placeholder="Enter prompt text..."
                    className="bg-secondary/20"
                  />
                </div>

                {/* Condition Editors */}
                {trigger.trigger_type === 'time_on_page' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-bold text-muted-foreground tracking-tighter">Delay (Seconds)</Label>
                    <Input 
                      type="number"
                      value={trigger.conditions?.delay_seconds || 30} 
                      onChange={(e) => updateTrigger(trigger.id, { 
                        conditions: { ...trigger.conditions, delay_seconds: parseInt(e.target.value) || 0 } 
                      })}
                      className="bg-secondary/20"
                    />
                  </div>
                )}

                {trigger.trigger_type === 'scroll_depth' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-bold text-muted-foreground tracking-tighter">Scroll Percentage (%)</Label>
                    <Input 
                      type="number"
                      value={trigger.conditions?.scroll_percentage || 75} 
                      onChange={(e) => updateTrigger(trigger.id, { 
                        conditions: { ...trigger.conditions, scroll_percentage: parseInt(e.target.value) || 0 } 
                      })}
                      className="bg-secondary/20"
                    />
                  </div>
                )}

                {(trigger.trigger_type === 'pricing_dropoff' || trigger.trigger_type === 'checkout_abandonment') && (
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-bold text-muted-foreground tracking-tighter">URL Path Contains</Label>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-secondary/20 rounded-md border border-input min-h-[38px]">
                      {trigger.conditions?.url_contains?.map((path: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-background/50">{path}</Badge>
                      ))}
                      <p className="text-[10px] text-muted-foreground mt-1 w-full italic">Pre-configured for standard {trigger.trigger_type.split('_')[0]} paths.</p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => handleSave(trigger)}
                  className="w-full bg-white hover:bg-secondary text-foreground border border-border shadow-sm mt-2 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default SmartTriggers;
