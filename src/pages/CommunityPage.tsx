import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThumbsUp, MessageSquare, Search, Filter, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

const CommunityPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isEmbedded = searchParams.get("embed") === "true";
  const isStandalone = searchParams.get("standalone") === "true";
  
  const [business, setBusiness] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [upvotedItems, setUpvotedItems] = useState<string[]>([]);

  useEffect(() => {
    // Load upvoted items from local storage to prevent double upvoting in same session
    const saved = localStorage.getItem(`upvoted_${slug}`);
    if (saved) setUpvotedItems(JSON.parse(saved));
  }, [slug]);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("feedback_slug", slug)
        .single();
      
      if (biz) {
        setBusiness(biz);
        fetchFeedback(biz.id);

        // Set up Realtime listener
        const channel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'feedback',
              filter: `business_id=eq.${biz.id}`
            },
            (payload) => {
              console.log('Change received!', payload);
              if (payload.eventType === 'INSERT') {
                if (payload.new.is_public) {
                  setFeedbacks(prev => [payload.new, ...prev]);
                }
              } else if (payload.eventType === 'UPDATE') {
                setFeedbacks(prev => prev.map(f => f.id === payload.new.id ? payload.new : f));
              } else if (payload.eventType === 'DELETE') {
                setFeedbacks(prev => prev.filter(f => f.id === payload.old.id));
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } else {
        setLoading(false);
      }
    })();
  }, [slug]);

  const fetchFeedback = async (bizId: string) => {
    const { data } = await supabase
      .from("feedback")
      .select("*")
      .eq("business_id", bizId)
      .eq("is_public", true)
      .order("upvotes_count", { ascending: false });
    
    setFeedbacks(data ?? []);
    setLoading(false);
  };

  const handleUpvote = async (feedbackId: string) => {
    if (upvotedItems.includes(feedbackId)) {
      toast.info("You've already upvoted this!");
      return;
    }

    // Generate a simple session ID if not exists
    let sessionId = localStorage.getItem("fb_session_id");
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2);
      localStorage.setItem("fb_session_id", sessionId);
    }

    const { error } = await (supabase as any)
      .from("feedback_upvotes")
      .insert({ feedback_id: feedbackId, session_id: sessionId });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        toast.info("You've already upvoted this!");
      } else {
        toast.error("Failed to upvote. Try again.");
      }
      return;
    }

    const newUpvoted = [...upvotedItems, feedbackId];
    setUpvotedItems(newUpvoted);
    localStorage.setItem(`upvoted_${slug}`, JSON.stringify(newUpvoted));
    toast.success("Upvoted!");
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = f.message?.toLowerCase().includes(search.toLowerCase()) || 
                         f.category?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filter === "all") return true;
    if (filter === "planned") return f.status?.toLowerCase() === "planned";
    if (filter === "in-progress") return f.status?.toLowerCase() === "in progress" || f.status?.toLowerCase() === "in-progress";
    if (filter === "completed") return f.status?.toLowerCase() === "completed" || f.status?.toLowerCase() === "shipped";
    return f.category?.toLowerCase() === filter.toLowerCase();
  });

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground animate-pulse">Loading community board...</p>
    </div>
  );

  if (!business) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 text-center">
      <Card className="p-8 max-w-md shadow-xl border-none">
        <h2 className="text-2xl font-bold mb-2">Space not found</h2>
        <p className="text-muted-foreground mb-6">The community board you're looking for doesn't exist or has been moved.</p>
        <Button asChild variant="outline"><a href="/">Go Home</a></Button>
      </Card>
    </div>
  );

  return (
    <div className={`min-h-screen ${(isEmbedded && !isStandalone) ? "bg-transparent" : "bg-[#fafafa] dark:bg-zinc-950"} pb-12`}>
      <SEO 
        title={`${business.business_name} Group Roadmap`} 
        description={`Vote on features and see the future of ${business.business_name}. Join the community and share your feedback.`}
        keywords={`roadmap, feedback, community, upvote, group roadmap, ${business.business_name}`}
      />
      
      {/* JSON-LD Schema for SEO */}
      {!isEmbedded && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `${business.business_name} Group Roadmap`,
            "description": `Public feedback and product roadmap for ${business.business_name}`,
            "url": window.location.href,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": feedbacks.length,
              "itemListElement": feedbacks.slice(0, 10).map((f, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "name": f.message.substring(0, 60),
                "description": f.message
              }))
            }
          })}
        </script>
      )}

      {(!isEmbedded || isStandalone) && (
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 py-4 px-6 mb-8 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              {business.logo_url && <img src={business.logo_url} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />}
              <div>
                <h1 className="font-bold text-lg leading-tight">{business.business_name}</h1>
                <p className="text-xs text-muted-foreground">Community Feedback</p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
              <a href={`/feedback/${slug}`}><ArrowLeft className="w-4 h-4 mr-2" /> Submit Feedback</a>
            </Button>
          </div>
        </div>
      )}

      <div className={`${(isEmbedded && !isStandalone) ? "px-2" : "max-w-5xl mx-auto px-4"}`}>
        {(!isEmbedded || isStandalone) ? (
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Group Roadmap</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Help us shape the future of <b>{business.business_name}</b> by upvoting your favorite ideas and suggestions.
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight mb-1">Group Roadmap</h2>
            <p className="text-xs text-muted-foreground">Upvote ideas and see what's coming next.</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sticky top-[80px] sm:top-[73px] bg-[#fafafa]/80 dark:bg-zinc-950/80 backdrop-blur-md py-2 z-40">
          <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
            <TabsList className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="planned" className="text-xs">Planned</TabsTrigger>
              <TabsTrigger value="in-progress" className="text-xs">In Progress</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">Shipped</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search ideas..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div>

        {filteredFeedbacks.length === 0 ? (
          <Card className="p-16 text-center border-dashed bg-transparent">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No feedback found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">Be the first to share an idea with the community!</p>
            {(!isEmbedded || isStandalone) && (
              <Button asChild className="mt-6 bg-gradient-cta shadow-glow">
                <a href={`/feedback/${slug}`}>Submit feedback</a>
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredFeedbacks.map((item) => (
              <Card key={item.id} className="p-5 border-none shadow-sm hover:shadow-md transition-all group bg-white dark:bg-zinc-900 overflow-hidden relative">
                <div className="flex gap-5">
                  <div className="flex flex-col items-center justify-start pt-1">
                    <button 
                      onClick={() => handleUpvote(item.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                        upvotedItems.includes(item.id) 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "bg-zinc-50 dark:bg-zinc-800/50 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                      }`}
                    >
                      <ThumbsUp className={`w-5 h-5 ${upvotedItems.includes(item.id) ? "fill-primary" : ""}`} />
                      <span className="text-sm font-bold">{item.upvotes_count || 0}</span>
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.status && (
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] font-bold uppercase tracking-wider border-none ${
                              item.status.toLowerCase() === 'planned' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                              item.status.toLowerCase() === 'in progress' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                              item.status.toLowerCase() === 'completed' || item.status.toLowerCase() === 'shipped' ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                          >
                            {item.status}
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.category || "General"}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 leading-tight">
                      {item.message.length > 100 ? item.message.substring(0, 100) + "..." : item.message}
                    </h3>
                    
                    {item.message.length > 100 && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                        {item.message}
                      </p>
                    )}

                    {item.business_reply && (
                      <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                            {business.business_name[0]}
                          </div>
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">Official Reply</span>
                        </div>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 italic">
                          "{item.business_reply}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-16 text-center pb-8 flex flex-col items-center justify-center gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm text-[11px] font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Realtime community board active
          </div>
          {isEmbedded && (
            <div className="text-[9px] text-muted-foreground/50 uppercase font-bold tracking-[0.2em]">
              Powered by <span className="text-primary/60">UserPOV</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
