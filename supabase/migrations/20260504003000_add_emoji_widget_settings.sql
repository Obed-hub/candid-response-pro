-- Add emoji widget settings to widget_settings table
ALTER TABLE widget_settings 
ADD COLUMN IF NOT EXISTS emoji_widget_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS emoji_widget_title TEXT DEFAULT 'How was your experience?',
ADD COLUMN IF NOT EXISTS emoji_widget_followup TEXT DEFAULT 'What could we have done better?';
