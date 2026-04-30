import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

const QrPage = () => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from("businesses").select("*").eq("owner_id", user.id);
      setBusinesses(data ?? []);
      if (data?.[0]) setSelected(data[0].id);
    })();
  }, [user]);

  const biz = businesses.find((b) => b.id === selected);
  const url = biz ? `${window.location.origin}/feedback/${biz.feedback_slug}` : "";
  const qrSrc = url ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(url)}` : "";

  return (
    <AppShell>
      <h1 className="text-3xl font-bold mb-1">QR codes</h1>
      <p className="text-muted-foreground mb-6">Print and display in your store, restaurant, or office.</p>

      {businesses.length === 0 ? (
        <Card className="p-10 text-center"><div className="text-5xl mb-3">📦</div><p className="text-muted-foreground">Create a business first.</p></Card>
      ) : (
        <>
          <Card className="p-4 mb-5">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{businesses.map((b)=><SelectItem key={b.id} value={b.id}>{b.business_name}</SelectItem>)}</SelectContent>
            </Select>
          </Card>

          {biz && (
            <div className="grid lg:grid-cols-2 gap-5">
              <Card className="p-8 text-center bg-gradient-soft">
                <h3 className="font-semibold text-lg mb-1">{biz.business_name}</h3>
                <p className="text-xs text-muted-foreground mb-5">Scan to share your honest feedback</p>
                <img src={qrSrc} alt="QR code" className="mx-auto bg-card p-3 rounded-xl shadow-card border border-border" width={300} height={300} />
                <div className="flex gap-2 mt-5 justify-center">
                  <Button variant="outline" onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copied!"); }}><Copy className="w-4 h-4 mr-1" /> Copy link</Button>
                  <Button asChild className="bg-gradient-cta"><a href={qrSrc} download={`${biz.feedback_slug}-qr.png`}><Download className="w-4 h-4 mr-1" /> Download QR</a></Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">Your feedback link</h3>
                <code className="block text-xs bg-secondary p-3 rounded-md break-all mb-4">{url}</code>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-2"><span className="text-xl">🖨️</span><div><b className="text-foreground">Print it.</b> Display the QR on tables, near the till, or at the door.</div></div>
                  <div className="flex gap-2"><span className="text-xl">📱</span><div><b className="text-foreground">Share it.</b> Send the link in receipts or follow-up emails.</div></div>
                  <div className="flex gap-2"><span className="text-xl">💬</span><div><b className="text-foreground">Listen.</b> Watch feedback roll in to your inbox.</div></div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
};

export default QrPage;
