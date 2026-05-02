import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Quote } from "lucide-react";
import { SEO } from "@/components/SEO";

const PublicReputation = () => {
  const { slug } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        const { data: fb } = await supabase
          .from("feedback")
          .select("*")
          .eq("business_id", biz.id)
          .eq("is_featured", true)
          .order("created_at", { ascending: false });
        
        setFeedbacks(fb ?? []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Wall of Love...</div>;
  if (!business) return <div className="min-h-screen flex items-center justify-center">Business not found.</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 py-12 px-4">
      <SEO 
        title={`Wall of Love - ${business.business_name}`} 
        description={`See what customers are saying about ${business.business_name}. Real reviews, honest feedback, and customer testimonials.`}
        keywords={`reviews for ${business.business_name}, ${business.business_name} testimonials, customer feedback`}
      />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          {business.logo_url && (
            <img src={business.logo_url} alt={business.business_name} className="h-16 mx-auto mb-6 rounded-xl shadow-sm" />
          )}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            Wall of Love
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real feedback from real customers of <b>{business.business_name}</b>.
          </p>
        </div>

        {feedbacks.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p>No featured feedback yet. Check back soon!</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {feedbacks.map((item) => (
              <Card key={item.id} className="break-inside-avoid p-6 border-none shadow-sm bg-white dark:bg-zinc-900/50 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-cta opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < (item.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-zinc-200 dark:text-zinc-800"}`} />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-zinc-100 dark:text-zinc-800 absolute top-4 right-4 -z-10" />

                <p className="text-zinc-700 dark:text-zinc-300 mb-6 leading-relaxed relative z-10 italic">
                  "{item.message}"
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-50 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-cta flex items-center justify-center text-xs font-bold text-primary-foreground uppercase">
                      {(item.customer_name || "A")[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.customer_name || "Anonymous Customer"}</div>
                      <div className="text-[10px] text-muted-foreground">Verified Feedback</div>
                    </div>
                  </div>
                  {item.category && <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{item.category}</Badge>}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-20 text-center">
          <p className="text-xs text-muted-foreground mb-4">Powered by userpov</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Collecting live feedback
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicReputation;
