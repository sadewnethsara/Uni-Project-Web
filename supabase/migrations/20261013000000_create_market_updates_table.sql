-- Migration: Market Updates & Notification History Table
-- Tracks daily published market bulletins and dispatched push notifications.

CREATE TABLE IF NOT EXISTS public.market_updates (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    date DATE NOT NULL,
    markets TEXT[] NOT NULL DEFAULT '{}',
    total_commodities INT NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    fcm_message_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for rapid lookup of recent updates
CREATE INDEX IF NOT EXISTS idx_market_updates_date ON public.market_updates (date DESC);

-- Enable RLS
ALTER TABLE public.market_updates ENABLE ROW LEVEL SECURITY;

-- Allow public read so Flutter mobile app and web app can display update history
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Public market updates are viewable by everyone' 
        AND tablename = 'market_updates'
    ) THEN
        CREATE POLICY "Public market updates are viewable by everyone" 
        ON public.market_updates FOR SELECT USING (true);
    END IF;
END $$;
