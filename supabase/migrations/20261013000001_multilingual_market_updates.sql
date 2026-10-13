-- Migration: Add Multilingual Columns to market_updates Table
-- Supports Sinhala (si), Tamil (ta), and English (en) in-app notification history.

ALTER TABLE public.market_updates 
ADD COLUMN IF NOT EXISTS title_si TEXT,
ADD COLUMN IF NOT EXISTS title_ta TEXT,
ADD COLUMN IF NOT EXISTS message_si TEXT,
ADD COLUMN IF NOT EXISTS message_ta TEXT;
