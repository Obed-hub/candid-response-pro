
-- Helper function to check and generate automation notifications
CREATE OR REPLACE FUNCTION public.check_automations(p_business_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. 48h Follow-up logic
  -- Find feedback that is 'New' and older than 48 hours, where a notification doesn't already exist
  INSERT INTO public.notifications (business_id, type, title, message, metadata)
  SELECT 
    f.business_id, 
    'follow_up', 
    'Follow up with customer', 
    'Feedback from ' || COALESCE(f.customer_name, 'Anonymous') || ' has been unresolved for over 48 hours.',
    jsonb_build_object('feedback_id', f.id)
  FROM public.feedback f
  JOIN public.smart_triggers st ON st.business_id = f.business_id AND st.trigger_type = 'follow_up_48h'
  WHERE f.business_id = ANY(p_business_ids)
    AND f.status = 'New'
    AND f.created_at < now() - interval '48 hours'
    AND st.is_enabled = true
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.metadata->>'feedback_id' = f.id::text 
        AND n.type = 'follow_up'
    );

  -- 2. Weekly Summary logic
  -- Create a summary notification if one hasn't been created in the last 7 days
  INSERT INTO public.notifications (business_id, type, title, message)
  SELECT 
    b.id, 
    'weekly_summary', 
    'Weekly Performance Summary', 
    'Your weekly feedback summary is ready. You received ' || 
    (SELECT count(*) FROM public.feedback WHERE business_id = b.id AND created_at > now() - interval '7 days') || 
    ' new responses this week.'
  FROM public.businesses b
  JOIN public.smart_triggers st ON st.business_id = b.id AND st.trigger_type = 'weekly_summary'
  WHERE b.id = ANY(p_business_ids)
    AND st.is_enabled = true
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.business_id = b.id 
        AND n.type = 'weekly_summary'
        AND n.created_at > now() - interval '7 days'
    );
END;
$$;
