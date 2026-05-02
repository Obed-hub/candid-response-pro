-- Migration: Sync database schema with application types
-- Ensures all columns used in the app exist in the database

-- 1. Feedback table updates
ALTER TABLE "public"."feedback" 
ADD COLUMN IF NOT EXISTS "is_public" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "is_featured" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "upvotes_count" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "audio_url" text,
ADD COLUMN IF NOT EXISTS "visual_url" text,
ADD COLUMN IF NOT EXISTS "business_reply" text,
ADD COLUMN IF NOT EXISTS "reply_at" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "guest_session_id" uuid,
ADD COLUMN IF NOT EXISTS "trigger_id" uuid,
ADD COLUMN IF NOT EXISTS "trigger_type" text,
ADD COLUMN IF NOT EXISTS "session_id" text;

-- 2. Businesses table updates
ALTER TABLE "public"."businesses" 
ADD COLUMN IF NOT EXISTS "page_views" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "form_started" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "app_installs" integer DEFAULT 0;

-- 3. Widget Settings table updates
ALTER TABLE "public"."widget_settings" 
ADD COLUMN IF NOT EXISTS "exit_intent_enabled" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "delay_seconds" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "scroll_percent" integer DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN "public"."feedback"."audio_url" IS 'Stores base64 encoded audio or a URL to the audio file';
COMMENT ON COLUMN "public"."feedback"."visual_url" IS 'Stores a URL to a screenshot or visual feedback';
COMMENT ON COLUMN "public"."businesses"."page_views" IS 'Total number of times the public feedback page was viewed';
COMMENT ON COLUMN "public"."businesses"."form_started" IS 'Number of times a user started interacting with the feedback form';
COMMENT ON COLUMN "public"."businesses"."app_installs" IS 'Number of times the PWA was installed';
