
-- Smart Triggers Table
CREATE TABLE public.smart_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  trigger_type text NOT NULL,
  trigger_name text NOT NULL,
  description text,
  is_enabled boolean NOT NULL DEFAULT false,
  conditions jsonb DEFAULT '{}',
  action_type text NOT NULL DEFAULT 'show_widget',
  prompt_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, trigger_type)
);

ALTER TABLE public.smart_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage triggers" ON public.smart_triggers 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid())
  );

CREATE POLICY "Public triggers read" ON public.smart_triggers
  FOR SELECT USING (is_enabled = true);

-- Trigger Events Table
CREATE TABLE public.trigger_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  trigger_id uuid REFERENCES public.smart_triggers(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  page_url text,
  session_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trigger_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert events" ON public.trigger_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners read events" ON public.trigger_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid())
);

-- Notifications Table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid())
  );

-- Update Feedback table
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS trigger_id uuid REFERENCES public.smart_triggers(id);
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS trigger_type text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS session_id text;

-- Function to initialize default triggers for a business (Manual call version)
CREATE OR REPLACE FUNCTION public.initialize_business_triggers(p_business_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.smart_triggers (business_id, trigger_type, trigger_name, description, is_enabled, conditions, action_type, prompt_text)
  VALUES 
    (p_business_id, 'exit_intent', 'Exit Intent Trigger', 'Show feedback prompt when a visitor is about to leave your website.', false, '{}', 'show_widget', 'Before you go, what stopped you today?'),
    (p_business_id, 'time_on_page', 'Time on Page Trigger', 'Show feedback prompt after a visitor spends some time on a page.', true, '{"delay_seconds": 30}', 'show_widget', 'How is your experience so far?'),
    (p_business_id, 'scroll_depth', 'Scroll Depth Trigger', 'Show feedback prompt after a visitor scrolls down a page.', false, '{"scroll_percentage": 75}', 'show_widget', 'Was this page helpful?'),
    (p_business_id, 'pricing_dropoff', 'Pricing Page Drop-Off', 'Show feedback when a visitor leaves the pricing page.', true, '{"url_contains": ["/pricing", "/plans", "/subscription"]}', 'show_widget', 'Is there anything stopping you from choosing a plan?'),
    (p_business_id, 'checkout_abandonment', 'Checkout Abandonment', 'Show feedback when a visitor leaves the checkout page.', true, '{"url_contains": ["/checkout", "/payment", "/billing"]}', 'show_widget', 'Did something go wrong at checkout?'),
    (p_business_id, 'low_rating_alert', 'Low Rating Owner Alert', 'Notify you immediately when a customer leaves a 1 or 2 star rating.', true, '{"rating_lte": 2}', 'notify_owner', 'Urgent feedback received'),
    (p_business_id, 'follow_up_48h', '48-Hour Follow-Up', 'Remind you to follow up with unresolved feedback after 48 hours.', true, '{"delay_hours": 48}', 'notify_owner', 'Follow up with this customer'),
    (p_business_id, 'weekly_summary', 'Weekly Feedback Summary', 'Get a weekly summary of your feedback performance.', true, '{}', 'notify_owner', 'Weekly Summary')
  ON CONFLICT (business_id, trigger_type) DO NOTHING;
END;
$$;

-- Trigger function that uses the manual version
CREATE OR REPLACE FUNCTION public.initialize_default_triggers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.initialize_business_triggers(NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger to initialize default triggers on business creation
DROP TRIGGER IF EXISTS on_business_created_init_triggers ON public.businesses;
CREATE TRIGGER on_business_created_init_triggers
  AFTER INSERT ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.initialize_default_triggers();

-- Function to handle low rating notification
CREATE OR REPLACE FUNCTION public.handle_low_rating_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trigger_enabled boolean;
BEGIN
  SELECT is_enabled INTO v_trigger_enabled 
  FROM public.smart_triggers 
  WHERE business_id = NEW.business_id AND trigger_type = 'low_rating_alert';

  IF v_trigger_enabled AND NEW.rating <= 2 THEN
    INSERT INTO public.notifications (business_id, type, title, message, metadata)
    VALUES (
      NEW.business_id, 
      'urgent_feedback', 
      'Urgent feedback received', 
      'A customer submitted low-rated feedback (' || NEW.rating || ' stars) that needs attention.',
      jsonb_build_object('feedback_id', NEW.id, 'rating', NEW.rating)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for low rating notifications
DROP TRIGGER IF EXISTS on_feedback_low_rating ON public.feedback;
CREATE TRIGGER on_feedback_low_rating
  AFTER INSERT ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.handle_low_rating_notification();
