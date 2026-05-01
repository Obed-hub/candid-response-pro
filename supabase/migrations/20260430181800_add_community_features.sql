-- Migration: Add community features to feedback table
ALTER TABLE "public"."feedback" 
ADD COLUMN IF NOT EXISTS "is_public" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "is_featured" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "upvotes_count" integer DEFAULT 0;

-- Create feedback_upvotes table
CREATE TABLE IF NOT EXISTS "public"."feedback_upvotes" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "feedback_id" uuid REFERENCES "public"."feedback"("id") ON DELETE CASCADE,
    "session_id" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    UNIQUE("feedback_id", "session_id")
);

-- RLS for feedback_upvotes
ALTER TABLE "public"."feedback_upvotes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can upvote feedback" 
ON "public"."feedback_upvotes" FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view upvotes" 
ON "public"."feedback_upvotes" FOR SELECT 
USING (true);

-- Allow public to view public feedback
CREATE POLICY "Anyone can view public feedback" 
ON "public"."feedback" FOR SELECT 
USING (is_public = true);

-- Trigger to increment/decrement upvotes_count in feedback table
CREATE OR REPLACE FUNCTION public.handle_feedback_upvote()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.feedback 
        SET upvotes_count = upvotes_count + 1 
        WHERE id = NEW.feedback_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.feedback 
        SET upvotes_count = upvotes_count - 1 
        WHERE id = OLD.feedback_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_feedback_upvote ON public.feedback_upvotes;
CREATE TRIGGER on_feedback_upvote
AFTER INSERT OR DELETE ON public.feedback_upvotes
FOR EACH ROW EXECUTE FUNCTION public.handle_feedback_upvote();
