import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Copy, Download, Type } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const QrPage = () => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [tagText, setTagText] = useState("Scan to share your honest feedback");
  const [isDownloading, setIsDownloading] = useState(false);

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
  const qrSrc = url ? `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=10&data=${encodeURIComponent(url)}` : "";

  const handleDownload = async () => {
    if (!biz || !qrSrc) return;
    setIsDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 1000;
      canvas.height = 1200;

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load QR Image
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      qrImg.src = qrSrc;
      
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
      });

      // Draw QR Code (Centered)
      const qrSize = 800;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 100;
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Draw Business Name
      ctx.fillStyle = "#000000";
      ctx.font = "bold 52px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(biz.business_name, canvas.width / 2, qrY + qrSize + 80);

      // Draw Tag Text
      ctx.fillStyle = "#4b5563";
      ctx.font = "42px Inter, sans-serif";
      ctx.fillText(tagText, canvas.width / 2, qrY + qrSize + 160);

      // Draw branding
      ctx.fillStyle = "#FFB800";
      ctx.font = "bold 32px Inter, sans-serif";
      ctx.fillText("userpov.online", canvas.width / 2, canvas.height - 80);

      // Download
      const link = document.createElement("a");
      link.download = `${biz.feedback_slug}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("QR Code downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate QR download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

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
                <p className="text-xs text-muted-foreground mb-5">{tagText}</p>
                <img src={qrSrc} alt="QR code" className="mx-auto bg-card p-3 rounded-xl shadow-card border border-border" width={300} height={300} />
                  <div className="flex flex-col sm:flex-row gap-2 mt-5 justify-center">
                    <Button variant="outline" onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copied!"); }}><Copy className="w-4 h-4 mr-1" /> Copy link</Button>
                    <Button onClick={handleDownload} disabled={isDownloading} className="bg-gradient-cta">
                      {isDownloading ? "Generating..." : <><Download className="w-4 h-4 mr-1" /> Download QR</>}
                    </Button>
                  </div>
                </Card>

                <div className="space-y-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Type className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">Customize tag text</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="tag-text">Bottom Label</Label>
                        <Input 
                          id="tag-text" 
                          value={tagText} 
                          onChange={(e) => setTagText(e.target.value)} 
                          placeholder="e.g. Scan to share feedback"
                          className="mt-1"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">This text will appear below the QR code in your download.</p>
                      </div>
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
              </div>
          )}
        </>
      )}
    </AppShell>
  );
};

export default QrPage;
