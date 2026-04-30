import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, ExternalLink, Building2, Copy } from "lucide-react";
import { toast } from "sonner";

const Businesses = () => {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from("businesses").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
      setList(data ?? []); setLoading(false);
    })();
  }, [user]);

  const copy = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/feedback/${slug}`);
    toast.success("Link copied!");
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">Your businesses</h1><p className="text-muted-foreground mt-1">Each business has its own feedback space.</p></div>
        <Button asChild className="bg-gradient-cta shadow-glow"><Link to="/businesses/new"><Plus className="w-4 h-4 mr-1" /> New business</Link></Button>
      </div>
      {loading ? <div className="text-muted-foreground">Loading…</div> : list.length === 0 ? (
        <Card className="p-10 text-center bg-gradient-soft">
          <div className="text-5xl mb-3">🏪</div>
          <h2 className="font-semibold text-lg">No businesses yet</h2>
          <p className="text-muted-foreground text-sm mt-1">Create your first feedback space to get started.</p>
          <Button asChild className="mt-5 bg-gradient-cta"><Link to="/businesses/new">Create business</Link></Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary grid place-items-center"><Building2 className="w-5 h-5" /></div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-success-soft text-success">{b.business_type ?? "Business"}</span>
              </div>
              <h3 className="font-semibold">{b.business_name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[2rem]">{b.description ?? "No description"}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => copy(b.feedback_slug)}><Copy className="w-3.5 h-3.5 mr-1" /> Copy link</Button>
                <Button size="sm" asChild><a href={`/feedback/${b.feedback_slug}`} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Businesses;
