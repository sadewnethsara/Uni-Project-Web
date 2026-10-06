-- ==============================================================================
-- Migration: Drop Redundant cbsl_price_entries Table
-- Date: 2026-10-06
--
-- Rationale:
-- In NAMIS, all multi-source price discovery feeds (HARTI, CRAN, CBSL, Dambulla)
-- are normalized into the primary unified 'price_entries' table (source = 'cbsl').
-- The legacy wide-format table 'cbsl_price_entries' is empty and unused.
-- Dropping this table keeps the production schema clean and prevents confusion.
-- ==============================================================================

DROP TABLE IF EXISTS public.cbsl_price_entries CASCADE;
