-- Migration: Add two-way feedback fields to the feedback table

ALTER TABLE "public"."feedback" 
ADD COLUMN "guest_session_id" uuid,
ADD COLUMN "business_reply" text,
ADD COLUMN "reply_at" timestamp with time zone;

-- Optional: Create an index for quick lookup by guest_session_id if they have a lot of submissions
CREATE INDEX IF NOT EXISTS "feedback_guest_session_id_idx" ON "public"."feedback" ("guest_session_id");
