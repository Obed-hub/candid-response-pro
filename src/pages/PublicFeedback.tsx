import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Star, ShieldCheck, Download, MessageSquareReply, CheckCircle, Mail, BellRing,  ChevronDown, X, Camera, Mic, Trash2, Send, Sparkles, MessageSquare, ArrowLeft, Info } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Gif } from "@giphy/react-components";
import Turnstile from "react-turnstile";
import { SEO } from "@/components/SEO";

const CATEGORIES = ["Complaint","Suggestion","Review","Testimonial","Bug Report","Service Experience","Delivery Experience","Product Feedback","Other"];

const schema = z.object({
  message: z.string().trim().min(3, "Please share a bit more").max(2000),
  customer_name: z.string().trim().max(80).optional(),
  customer_email: z.string().trim().email("Invalid email").max(255).or(z.literal("")).optional(),
});

// Using custom Giphy API key provided by user
const gf = new GiphyFetch("YCVN4A5HiJoIPeHmevssRWu9biqT54bJ");

const CATEGORY_SUGGESTIONS: Record<string, string[]> = {
  Review: ["Everything was perfect! 🌟", "Great experience", "Fast and easy", "Friendly support"],
  Complaint: ["Pricing is too high 💰", "Too confusing", "Missing features", "Technical bug"],
  Suggestion: ["Add a free trial", "More payment options", "Better mobile view", "Dark mode please!"],
  Question: ["Is there a discount?", "How do I start?", "Support hours?", "Trial period?"],
  Pricing: ["Pricing is too high 💰", "Need a monthly plan", "Is there a free trial?", "Too expensive for me"]
};

const PublicFeedback = () => {
  const { slug } = useParams();
  const [biz, setBiz] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ rating: 0, category: "Review", message: "", customer_name: "", customer_email: "", anonymous: true, is_public: false });
  const [sessionId, setSessionId] = useState<string>("");
  const [pastFeedback, setPastFeedback] = useState<any[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [formGif, setFormGif] = useState<any>(null);
  const [doneGif, setDoneGif] = useState<any>(null);
  const [impactStats, setImpactStats] = useState<number | null>(null);
  
  // Widget/Embed state
  const isEmbed = new URLSearchParams(window.location.search).get("embed") === "true";
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [widgetSettings, setWidgetSettings] = useState<any>(null);
  const [smartTriggers, setSmartTriggers] = useState<any[]>([]);
  const [triggerPrompt, setTriggerPrompt] = useState<string | null>(null);
  const [activeTrigger, setActiveTrigger] = useState<{ id: string, type: string } | null>(null);
  const [step, setStep] = useState(0); // 0: Intent, 1: Form
  
  // Analytics
  const [hasStartedForm, setHasStartedForm] = useState(false);

  // Audio Recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);

  // Spam Prevention State
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [formStartTime, setFormStartTime] = useState<number | null>(null);

  useEffect(() => {
    let sid = localStorage.getItem("guest_session_id");
    if (!sid) {
      sid = uuidv4();
      localStorage.setItem("guest_session_id", sid);
    }
    setSessionId(sid);
    
    // Save slug for PWA persistence
    if (slug) {
      localStorage.setItem("last_feedback_slug", slug);
    }

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const fetchGif = async (query: string, type: 'stickers' | 'gifs' = 'stickers') => {
      try {
        const res = await gf.search(query, { sort: "relevant", limit: 10, type });
        if (res.data.length > 0) {
          const random = Math.floor(Math.random() * res.data.length);
          if (type === 'stickers') setFormGif(res.data[random]);
          else setDoneGif(res.data[random]);
        }
      } catch (err) {
        console.error("Giphy error:", err);
      }
    };

    // Initial GIFs
    fetchGif("funny wave", "stickers");
    fetchGif("funny celebration", "gifs");

    // Expose fetchGif for dynamic updates
    (window as any).refreshFeedbackGif = fetchGif;

    // Handle messages from parent (for visual feedback)
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === "visual-data") {
        setVisualUrl(e.data.dataUrl);
        setForm(prev => ({ ...prev, category: "Bug Report" }));
        toast.success("Screenshot captured!");
      }
      if (e.data.type === "set-prompt") {
        setTriggerPrompt(e.data.message);
        setActiveTrigger({ id: e.data.triggerId, type: e.data.triggerType });
        setForm(prev => ({ ...prev, category: "Question" }));
        setStep(1);
      }
      if (e.data.type === "log-trigger-event" && biz) {
        supabase.from("trigger_events").insert({
          business_id: biz.id,
          trigger_id: e.data.triggerId,
          event_type: e.data.triggerType,
          page_url: e.data.url,
          session_id: localStorage.getItem("guest_session_id")
        }).then();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data } = await supabase.from("businesses").select("*").eq("feedback_slug", slug).eq("is_public", true).maybeSingle();
      if (!data) { setNotFound(true); return; }
      setBiz(data);

      // Funnel Analytics: Page View
      const viewedKey = `viewed_${data.id}`;
      if (!sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, "1");
        await supabase.from("businesses").update({ page_views: (data.page_views || 0) + 1 }).eq("id", data.id);
      }

      const { count } = await supabase.from("feedback").select("*", { count: "exact", head: true }).eq("business_id", data.id).eq("status", "Resolved");
      if (count !== null) setImpactStats(count);

      // Fetch Widget Settings & Triggers
      const { data: settings } = await supabase.from("widget_settings").select("*").eq("business_id", data.id).maybeSingle();
      const { data: triggers } = await supabase.from("smart_triggers").select("*").eq("business_id", data.id).eq("is_enabled", true);
      
      if (isEmbed) {
        if (settings) setWidgetSettings(settings);
        if (triggers) setSmartTriggers(triggers);
        window.parent.postMessage({ 
          type: "init-settings", 
          settings: { ...(settings || {}), smart_triggers: triggers || [] } 
        }, "*");
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (biz && sessionId) {
      // Initial fetch
      supabase.from("feedback").select("*").eq("business_id", biz.id).eq("guest_session_id", sessionId).order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data) {
            setPastFeedback(data);
          }
        });

      // Real-time subscription for replies
      const channel = supabase
        .channel('public-feedback-replies')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'feedback',
            filter: `guest_session_id=eq.${sessionId}`
          },
          (payload) => {
            const updatedFeedback = payload.new as any;
            setPastFeedback(prev => {
              const existing = prev.find(f => f.id === updatedFeedback.id);
              if (updatedFeedback.business_reply && (!existing || !existing.business_reply)) {
                toast.success(`New reply from ${biz.business_name}!`, {
                  icon: <MessageSquareReply className="w-4 h-4 text-primary" />,
                  duration: 5000,
                });
              }
              return prev.map(f => f.id === updatedFeedback.id ? updatedFeedback : f);
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [biz, sessionId]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleFormInteract = () => {
    if (!formStartTime) setFormStartTime(Date.now());
    
    if (!hasStartedForm && biz) {
      setHasStartedForm(true);
      const startedKey = `started_${biz.id}`;
      if (!sessionStorage.getItem(startedKey)) {
        sessionStorage.setItem(startedKey, "1");
        supabase.from("businesses").update({ form_started: (biz.form_started || 0) + 1 }).eq("id", biz.id).then();
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      setRecordingTime(0);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      handleFormInteract();
    } catch (err) {
      toast.error("Could not access microphone.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setAudioBase64(null);
    setRecordingTime(0);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Honeypot check
    if (honeypot) {
      console.warn("Spam detected: Honeypot filled");
      setDone(true); // Fake success for bots
      return;
    }

    // 2. Timing check (min 3 seconds)
    if (formStartTime && Date.now() - formStartTime < 3000) {
      toast.error("Please take a moment to review your feedback before sending.");
      return;
    }

    // 3. Turnstile check
    if (!turnstileToken) {
      toast.error("Please complete the security check.");
      return;
    }

    if (!form.rating) { toast.error("Please provide a rating first."); return; }
    const parsed = schema.safeParse({ message: form.message, customer_name: form.customer_name || undefined, customer_email: form.customer_email || undefined });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (!biz) return;
    setLoading(true);
    const sentiment = form.rating >= 4 ? "positive" : form.rating > 0 && form.rating <= 2 ? "negative" : "neutral";
    const { error } = await supabase.from("feedback").insert({
      business_id: biz.id,
      message: parsed.data.message,
      rating: form.rating,
      category: form.category,
      source: isEmbed ? "Website Widget" : "Public Page",
      status: "New",
      sentiment,
      trigger_id: activeTrigger?.id || null,
      trigger_type: activeTrigger?.type || null,
      session_id: sessionId,
      is_anonymous: form.anonymous,
      customer_name: form.anonymous ? null : (form.customer_name || null),
      customer_email: form.anonymous ? null : (form.customer_email || null),
      guest_session_id: sessionId,
      audio_url: audioBase64 || null,
      visual_url: visualUrl || null,
      is_public: form.is_public
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
    setAudioBase64(null);
    setAudioUrl(null);
    setVisualUrl(null);
    if (isEmbed) {
      setTimeout(() => window.parent.postMessage("close-widget", "*"), 2000);
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        // Track App Install
        if (biz) {
          await supabase.from("businesses").update({ app_installs: (biz.app_installs || 0) + 1 }).eq("id", biz.id);
        }
      }
    }
  };

  if (notFound) return (
    <div className="min-h-screen grid place-items-center bg-gradient-soft p-4 text-center">
      <Card className="p-8 max-w-sm w-full"><div className="text-5xl mb-3">🤔</div><h1 className="text-xl font-bold">Feedback space not found</h1><p className="text-muted-foreground text-sm mt-1">The link may be invalid.</p></Card>
    </div>
  );

  if (!biz) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  if (done) return (
    <div className="min-h-screen grid place-items-center bg-gradient-soft p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="fixed top-0 left-0 w-64 h-64 bg-success/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      
      <Card className="p-6 sm:p-8 max-w-[420px] w-full animate-fade-in shadow-2xl shadow-green-900/5 border-0 ring-1 ring-black/5 bg-white relative overflow-hidden rounded-[2rem] z-10">
        
        {/* Subtle decorative shapes inside card */}
        <div className="absolute top-16 left-6 w-1.5 h-1.5 rounded-full bg-success opacity-60" />
        <div className="absolute top-24 right-10 w-2 h-2 rounded-full bg-primary opacity-80" />
        <div className="absolute top-36 right-4 w-1.5 h-1.5 rounded-full bg-primary/40 opacity-60" />
        
        {doneGif ? (
          <div className="flex justify-center mb-6 rounded-3xl overflow-hidden shadow-sm relative z-10 bg-secondary/20">
            <Gif gif={doneGif} width={300} className="w-full h-auto object-cover" />
          </div>
        ) : (
          <div className="flex justify-center mb-6">
            <div className="text-7xl mb-3">🎉</div>
          </div>
        )}
        
        <div className="text-center mb-6 relative z-10">
          <h1 className="text-3xl font-extrabold flex items-center justify-center gap-2 text-gray-900">
            Thank you! <CheckCircle className="w-8 h-8 text-green-500 fill-green-100" />
          </h1>
          <p className="text-gray-600 mt-3 font-medium text-[15px]">
            Your feedback has been successfully sent to <br/>
            <span className="text-green-600 font-bold text-lg">{biz.business_name}</span>.
          </p>
        </div>
        
        <div className="bg-green-50/80 border border-green-100/50 rounded-2xl p-4 mb-5 flex gap-4 items-center relative z-10">
          <div className="bg-white p-2.5 rounded-full shadow-sm shrink-0">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-gray-900 text-[15px]">We've received your feedback</h4>
            <p className="text-gray-600 text-xs mt-1 leading-relaxed">
              {biz.business_name} will be notified and may respond soon.
            </p>
          </div>
        </div>
        
        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-5 mb-8 relative z-10">
          {/* Phone Illustration background */}
          <div className="absolute -right-6 top-8 w-28 h-56 bg-gray-900 rounded-[2rem] border-[6px] border-gray-900 shadow-2xl hidden sm:block">
             <div className="bg-gray-100 w-full h-full p-2 pt-6 relative rounded-t-[1.5rem]">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-4 bg-gray-900 rounded-b-xl"></div>
               <div className="w-14 h-14 bg-green-500 rounded-2xl mx-auto mt-6 flex items-center justify-center relative shadow-sm">
                 <MessageSquare className="w-7 h-7 text-white fill-white" />
                 <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#ff4b4b] rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">1</div>
               </div>
               <div className="grid grid-cols-2 gap-2 mt-8 px-2">
                 <div className="h-6 bg-gray-200 rounded-lg"></div>
                 <div className="h-6 bg-gray-200 rounded-lg"></div>
                 <div className="h-6 bg-gray-200 rounded-lg"></div>
                 <div className="h-6 bg-gray-200 rounded-lg"></div>
               </div>
             </div>
          </div>

          <div className="relative z-10 w-full sm:w-[70%] text-left">
            <div className="flex gap-3 items-center mb-3">
              <div className="bg-white p-2.5 rounded-full shadow-sm">
                <BellRing className="w-6 h-6 text-primary fill-primary/10" />
              </div>
              <h3 className="font-bold text-primary text-lg">Get your reply!</h3>
            </div>
            <p className="text-[13px] text-gray-700 leading-relaxed font-medium mb-5">
              Add this app to your Home Screen to get instantly notified when {biz.business_name} responds to your feedback.
            </p>
            
            {deferredPrompt ? (
              <Button onClick={handleInstallClick} className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md rounded-2xl h-12">
                <Download className="w-5 h-5" /> Add to Home Screen
              </Button>
            ) : (
              <div className="bg-white border border-primary/20 rounded-2xl p-3 flex items-start gap-3 shadow-sm">
                <Smartphone className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div className="text-[11px] text-gray-700 leading-[1.6]">
                  <span className="font-bold text-gray-900">iOS / Safari:</span> Tap the Share <Share className="inline w-3.5 h-3.5 text-primary mb-0.5 mx-0.5" /> icon, then select <span className="text-primary font-bold">Add to Home Screen.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button variant="outline" className="w-full h-14 border border-green-200 text-green-700 bg-white hover:bg-green-50/50 font-bold text-[15px] rounded-2xl transition-colors relative z-10" onClick={() => { setDone(false); setForm({ rating: 0, category: "Review", message: "", customer_name: "", customer_email: "", anonymous: true, is_public: false }); }}>
          <ArrowLeft className="w-5 h-5 mr-2 text-green-600" /> Return to form
        </Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-soft py-6 px-4 flex flex-col items-center">
      <SEO 
        title={`Give Feedback to ${biz.business_name}`} 
        description={`Share your thoughts, suggestions or complaints with ${biz.business_name}. Your voice matters!`}
      />
      <div className="w-full max-w-md mx-auto space-y-6">
        
        {deferredPrompt && (
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border shadow-sm flex items-center justify-between animate-in slide-in-from-top-4">
            <div className="text-sm font-medium">Get notified when we reply</div>
            <Button size="sm" onClick={handleInstallClick} className="gap-2"><Download className="w-3.5 h-3.5" /> Add to Home Screen</Button>
          </div>
        )}

        <Card className="p-6 sm:p-8 shadow-2xl border-0 ring-1 ring-black/5 bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-cta" />
          
          {step === 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center text-center mb-8 mt-2">
                {biz.logo_url ? (
                  <img src={biz.logo_url} alt={biz.business_name} className="w-16 h-16 rounded-2xl object-cover shadow-md mb-4" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl mb-4">💬</div>
                )}
                <h1 className="text-xl font-bold tracking-tight">What do you want to share?</h1>
                <p className="text-muted-foreground text-sm mt-1">Help us improve by choosing an option below.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "Review", label: "Review", emoji: "⭐", sub: "Rate us", color: "hover:border-warning/50 hover:bg-warning/5 text-warning" },
                  { id: "Complaint", label: "Complaint", emoji: "😠", sub: "Report issue", color: "hover:border-destructive/50 hover:bg-destructive/5 text-destructive" },
                  { id: "Suggestion", label: "Suggestion", emoji: "💡", sub: "Share idea", color: "hover:border-blue-500/50 hover:bg-blue-500/5 text-blue-500" },
                  { id: "Question", label: "Question", emoji: "❓", sub: "Get help", color: "hover:border-purple-500/50 hover:bg-purple-500/5 text-purple-500" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, category: opt.id });
                      setStep(1);
                      handleFormInteract();
                      // Dynamic relatable GIF
                      const query = 
                        opt.id === "Complaint" ? "upset funny" :
                        opt.id === "Suggestion" ? "thinking funny" :
                        opt.id === "Bug Report" ? "detective funny" :
                        opt.id === "Question" ? "thinking funny" : "happy funny";
                      (window as any).refreshFeedbackGif(query, "stickers");
                    }}
                    className={`p-4 rounded-2xl border border-border text-left transition-all group ${opt.color}`}
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{opt.emoji}</div>
                    <div className="font-bold text-foreground">{opt.label}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{opt.sub}</div>
                  </button>
                ))}
              </div>
              
              {isEmbed && (
                <Button type="button" variant="ghost" size="sm" className="absolute top-4 right-4" onClick={() => window.parent.postMessage("close-widget", "*")}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-left-4">
                <Button type="button" variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setStep(0)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h2 className="font-bold text-lg leading-none">{form.category}</h2>
                  <p className="text-xs text-muted-foreground mt-1">Sharing with {biz.business_name}</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center mb-6">
                {triggerPrompt && (
                  <div className="w-full mb-4 p-4 bg-primary/10 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-top-4">
                    <p className="text-primary font-bold text-lg leading-tight">“{triggerPrompt}”</p>
                    <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-widest opacity-70">Question from our team</p>
                  </div>
                )}
                
                {impactStats !== null && impactStats > 0 && step === 1 && (
                  <div className="mb-4 bg-success/10 text-success-foreground px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 border border-success/20">
                    <CheckCircle className="w-3 h-3" /> {impactStats} {impactStats === 1 ? "suggestion" : "suggestions"} implemented
                  </div>
                )}
              </div>

              <form onSubmit={submit} className="space-y-6">
                <div className={`bg-secondary/30 p-5 rounded-2xl transition-all ${form.category === "Review" ? "opacity-100" : "opacity-70 scale-95"}`}>
                  <Label className="block mb-3 text-center text-base font-semibold">Rate your experience</Label>
                  <div className="flex justify-center gap-2">
                    {[1,2,3,4,5].map((n) => (
                      <button type="button" key={n} onClick={() => { 
                        setForm({...form, rating:n}); 
                        handleFormInteract(); 
                        // Update GIF based on rating
                        const query = n >= 4 ? "happy dance" : n <= 2 ? "sad face" : "thinking funny";
                        (window as any).refreshFeedbackGif(query, "stickers");
                      }} className="p-2 transition-all hover:scale-110 active:scale-95 touch-manipulation">
                        <Star className={`w-10 h-10 ${form.rating >= n ? "fill-warning text-warning drop-shadow-sm" : "text-muted-foreground/30"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {formGif && (
                  <div className="flex justify-center my-4 pointer-events-none opacity-90">
                    <Gif gif={formGif} width={150} />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Textarea onClick={handleFormInteract} className="resize-none text-base p-4" rows={4} value={form.message} onChange={(e)=>setForm({...form, message:e.target.value})} placeholder={
                      form.category === "Complaint" ? "What went wrong? We're here to listen. 😠" :
                      form.category === "Suggestion" ? "How can we make things better? 💡" :
                      form.category === "Question" ? "What can we help you with? ❓" :
                      "Tell us what went well — or what didn't. 💬"
                    } />
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(triggerPrompt?.toLowerCase().includes('pricing') || triggerPrompt?.toLowerCase().includes('plan')) 
                        ? CATEGORY_SUGGESTIONS.Pricing.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, message: suggestion });
                                handleFormInteract();
                              }}
                              className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary-foreground hover:bg-primary/20 hover:border-primary/40 transition-all whitespace-nowrap animate-in fade-in zoom-in-50"
                            >
                              {suggestion}
                            </button>
                          ))
                        : CATEGORY_SUGGESTIONS[form.category]?.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, message: suggestion });
                                handleFormInteract();
                              }}
                              className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-primary/10 bg-primary/5 text-primary-foreground/70 hover:bg-primary/10 hover:border-primary/30 transition-all whitespace-nowrap"
                            >
                              {suggestion}
                            </button>
                          ))
                      }
                    </div>
                  </div>

                  {isEmbed && !visualUrl && (
                    <Button type="button" variant="outline" className="w-full gap-2 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10" onClick={() => window.parent.postMessage("start-visual-feedback", "*")}>
                      <Camera className="w-4 h-4" /> Mark what is wrong on this page
                    </Button>
                  )}

                  {visualUrl && (
                    <div className="relative rounded-xl overflow-hidden border-2 border-primary/50 shadow-md">
                      <img src={visualUrl} alt="Visual annotation" className="w-full h-auto" />
                      <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2 h-8 w-8 rounded-full" onClick={() => setVisualUrl(null)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white text-[10px] py-1 text-center font-bold uppercase tracking-wider">
                        Visual Attachment Added
                      </div>
                    </div>
                  )}

                  {/* Audio Recorder Section */}
                  <div className="bg-secondary/20 p-4 rounded-xl border border-border/50">
                    <Label className="block mb-2 text-sm font-semibold flex items-center gap-2">
                      <Mic className="w-4 h-4" /> Voice Memo (Optional)
                    </Label>
                    
                    {!isRecording && !audioUrl && (
                      <Button type="button" variant="outline" className="w-full gap-2 border-dashed" onClick={startRecording}>
                        <Mic className="w-4 h-4 text-muted-foreground" /> Tap to Record
                      </Button>
                    )}

                    {isRecording && (
                      <div className="flex items-center justify-between bg-destructive/10 text-destructive px-4 py-3 rounded-lg border border-destructive/20 animate-pulse">
                        <div className="flex items-center gap-2 font-mono font-bold">
                          <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-ping"></div>
                          00:{recordingTime.toString().padStart(2, "0")} / 01:00
                        </div>
                        <Button type="button" size="sm" variant="destructive" onClick={stopRecording} className="h-8 shadow-sm">
                          <Square className="w-4 h-4 mr-1 fill-current" /> Stop
                        </Button>
                      </div>
                    )}

                    {audioUrl && !isRecording && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 bg-primary/5 p-2 rounded-lg border border-primary/10">
                          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => {
                            const audio = new Audio(audioUrl);
                            audio.play();
                          }}>
                            <Play className="w-4 h-4 fill-current" />
                          </Button>
                          <div className="flex-1 h-1.5 bg-primary/20 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-full animate-progress-audio"></div>
                          </div>
                          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={deleteRecording}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {!form.anonymous && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-300">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Your Name</Label>
                        <Input id="name" value={form.customer_name} onChange={(e)=>setForm({...form, customer_name:e.target.value})} placeholder="John Doe" className="h-11 bg-secondary/20 border-border/50 focus:ring-primary/20" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Your Email</Label>
                        <Input id="email" type="email" value={form.customer_email} onChange={(e)=>setForm({...form, customer_email:e.target.value})} placeholder="john@example.com" className="h-11 bg-secondary/20 border-border/50 focus:ring-primary/20" />
                        <p className="text-[10px] text-muted-foreground mt-1 ml-1 flex items-center gap-1">
                          <BellRing className="w-3 h-3" /> Get notified when they reply
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2 pb-1">
                    <div className="flex items-center space-x-2">
                      <button type="button" role="switch" aria-checked={form.anonymous} onClick={() => setForm({...form, anonymous:!form.anonymous})} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 ${form.anonymous ? "bg-primary" : "bg-gray-200"}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.anonymous ? "translate-x-5" : "translate-x-0"}`}></span>
                      </button>
                      <Label className="text-sm font-medium cursor-pointer" onClick={() => setForm({...form, anonymous:!form.anonymous})}>Submit anonymously</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button type="button" role="switch" aria-checked={form.is_public} onClick={() => setForm({...form, is_public:!form.is_public})} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 ${form.is_public ? "bg-blue-600" : "bg-gray-200"}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.is_public ? "translate-x-5" : "translate-x-0"}`}></span>
                      </button>
                      <div className="flex flex-col">
                        <Label className="text-sm font-medium cursor-pointer" onClick={() => setForm({...form, is_public:!form.is_public})}>Share with the community</Label>
                        <p className="text-[10px] text-muted-foreground">This allows others to see and upvote your idea.</p>
                      </div>
                    </div>
                  </div>

                  {/* Honeypot Field (Invisible to humans) */}
                  <div className="opacity-0 absolute -z-10 h-0 overflow-hidden pointer-events-none">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
                  </div>

                  {/* Turnstile Verification */}
                  <div className="flex justify-center py-2 scale-90 sm:scale-100 origin-center transition-all">
                    <Turnstile
                      sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAADFoPD3AWx1rw0yT"}
                      onVerify={(token) => setTurnstileToken(token)}
                      theme="light"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-bold bg-gradient-cta shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all rounded-2xl group">
                    {loading ? (
                      <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">Send Feedback <MessageSquareReply className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></div>
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest pt-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Encrypted & Secure Feedback
                  </div>
                </div>
              </form>
            </>
          )}
        </Card>


        {pastFeedback.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold px-2 flex items-center gap-2"><MessageSquareReply className="w-5 h-5 text-primary" /> Your Submissions</h3>
            {pastFeedback.map((fb) => (
              <Card key={fb.id} className="p-5 shadow-sm border-0 ring-1 ring-black/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-warning text-sm">{"★".repeat(fb.rating || 0)}</div>
                  <div className="text-xs text-muted-foreground">{new Date(fb.created_at).toLocaleDateString()}</div>
                  <div className={`text-xs px-2 py-0.5 rounded-full ml-auto ${fb.status === 'Resolved' ? 'bg-success/10 text-success' : 'bg-secondary text-muted-foreground'}`}>{fb.status}</div>
                </div>
                <p className="text-sm mb-3 text-foreground/90">{fb.message}</p>
                
                {fb.business_reply ? (
                  <div className="mt-3 bg-primary/5 rounded-lg p-4 border-l-2 border-primary">
                    <div className="text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
                      {biz.logo_url ? <img src={biz.logo_url} className="w-4 h-4 rounded-full" /> : '💬'} 
                      Reply from {biz.business_name}
                    </div>
                    <p className="text-sm text-foreground/80">{fb.business_reply}</p>
                    {fb.reply_at && <div className="text-[10px] text-muted-foreground mt-2">{new Date(fb.reply_at).toLocaleString()}</div>}
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-muted-foreground italic">Waiting for response...</div>
                )}
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default PublicFeedback;
