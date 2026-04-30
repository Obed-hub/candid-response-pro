import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(data ?? { id: user.id, email: user.email, full_name: "" });
    })();
  }, [user]);

  const save = async () => {
    if (!profile || !user) return;
    const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: profile.full_name, email: user.email });
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved!");
  };

  return (
    <AppShell>
      <h1 className="text-3xl font-bold mb-1">Settings</h1>
      <p className="text-muted-foreground mb-6">Manage your account and profile.</p>
      {profile && (
        <Card className="p-8 max-w-2xl space-y-4">
          <div><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
          <div><Label>Full name</Label><Input value={profile.full_name ?? ""} onChange={(e)=>setProfile({...profile, full_name:e.target.value})} /></div>
          <Button onClick={save} className="bg-gradient-cta shadow-glow">Save changes</Button>
        </Card>
      )}
    </AppShell>
  );
};

export default Settings;
