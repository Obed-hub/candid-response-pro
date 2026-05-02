import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, ExternalLink, Building2, Copy, Pencil, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Businesses = () => {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState({ business_name: "", description: "", logo_url: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from("businesses").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
      setList(data ?? []); setLoading(false);
    })();
  }, [user]);

  const copy = (slug: string) => {
    navigator.clipboard.writeText(`https://userpov.online/feedback/${slug}`);
    toast.success("Link copied!");
  };

  const openEdit = (b: any) => {
    setEditing(b);
    setEditForm({ business_name: b.business_name, description: b.description || "", logo_url: b.logo_url || "" });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Use JPEG for broad compatibility and smaller base64 size without alpha
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setEditForm(prev => ({ ...prev, logo_url: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setIsSaving(true);
    const { error } = await supabase.from("businesses").update(editForm).eq("id", editing.id);
    setIsSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Business profile updated!");
    setList(list.map(b => b.id === editing.id ? { ...b, ...editForm } : b));
    setEditing(null);
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
                <Button size="sm" variant="outline" onClick={() => openEdit(b)} title="Edit profile"><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="sm" asChild><a href={`/feedback/${b.feedback_slug}`} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Business Profile</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Business Name</Label>
              <Input className="mt-1" value={editForm.business_name} onChange={e => setEditForm({...editForm, business_name: e.target.value})} />
            </div>
            <div>
              <Label>Business Logo</Label>
              <div className="flex items-center gap-4 mt-2">
                {editForm.logo_url ? (
                  <img src={editForm.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover ring-1 ring-border" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground"><ImagePlus className="w-6 h-6" /></div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>
                      Upload Image
                    </Button>
                    <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    {editForm.logo_url && (
                      <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setEditForm({...editForm, logo_url: ""})}>Remove</Button>
                    )}
                  </div>
                  <Input placeholder="Or paste image URL" value={editForm.logo_url?.startsWith('data:') ? '' : editForm.logo_url} onChange={e => setEditForm({...editForm, logo_url: e.target.value})} className="h-8 text-xs" />
                </div>
              </div>
            </div>
            <div>
              <Label>Tagline / Description</Label>
              <Textarea className="mt-1 resize-none" rows={3} placeholder="A short tagline or description for your business" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
            </div>
            <Button onClick={saveEdit} disabled={isSaving} className="w-full bg-gradient-cta shadow-glow">
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default Businesses;
