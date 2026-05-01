import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Check, Trash2, AlertCircle, MessageSquare, Mail, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata: any;
}

export const NotificationsCenter = ({ businessIds }: { businessIds: string[] }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (businessIds.length === 0) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .in("business_id", businessIds)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching notifications:", error);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload: any) => {
          // Client side check if we don't have a specific filter
          if (businessIds.includes(payload.new.business_id)) {
            fetchNotifications();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [JSON.stringify(businessIds)]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      toast.error("Failed to mark as read");
    } else {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete notification");
    } else {
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Notification deleted");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent_feedback': return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'new_feedback': return <MessageSquare className="w-4 h-4 text-primary" />;
      case 'follow_up': return <Mail className="w-4 h-4 text-indigo-500" />;
      case 'weekly_summary': return <BarChart3 className="w-4 h-4 text-slate-500" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) return <div className="animate-pulse space-y-3">
    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-xl" />)}
  </div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Recent Alerts
        </h3>
        {notifications.some(n => !n.is_read) && (
          <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] animate-pulse">
            New
          </Badge>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-10 bg-secondary/20 rounded-2xl border border-dashed border-border">
          <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground italic">No alerts yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card 
              key={n.id} 
              className={`p-4 transition-all border-l-4 ${
                !n.is_read ? "border-l-primary bg-primary/5" : "border-l-transparent"
              } hover:shadow-md group relative`}
            >
              <div className="flex gap-3">
                <div className={`mt-0.5 p-2 rounded-lg ${!n.is_read ? 'bg-primary/10' : 'bg-secondary/50'}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <h4 className={`text-sm font-bold truncate ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {n.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-muted-foreground/60 mt-2 block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!n.is_read && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 text-success hover:bg-success/10"
                    onClick={() => markAsRead(n.id)}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  onClick={() => deleteNotification(n.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
