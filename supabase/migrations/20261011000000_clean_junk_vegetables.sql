-- ==============================================================================
-- Migration: Clean Corrupted, OCR Artifact & Duplicate Vegetable Commodities
-- Date: 2026-10-11
--
-- Features:
-- - Removes 47 invalid / corrupted / duplicate entries from public.vegetables:
--   * Stray punctuation: '-', '.'
--   * Bulletin header/division leaks: 'd-a-t-a-m-anagement-division', 'head',
--     'i-n-f-o-r-m-a-t-i-o-n-d-i-v-i-s-i-o-n', 'i-n-f-ormation-division',
--     'information-division', 'marketing---food-policy-division'
--   * Excel formula error strings: '#DIV/0!' and '#REF!' entries
--   * OCR partial-word fragments: 'karathak', 'karathako'
--   * Discontinued / duplicate rice entries: 'kiri-ponne-pall-ponne-', 'kora',
--     'imported-rice', 'nadu-1', 'nadu-2', 'samba-3', 'ponne-1', 'samba-ponne-1'
--   * Duplicate vegetables & naming variations: 'beet-root-n-eliya-',
--     'beet-root--n-eliya-', 'bitter-gourd--other-', 'bitter-gourd--villag',
--     'bitter-gourd--village', 'bitter-gourd--village-', 'brinjals--other-',
--     'brinjals--village-', 'eggplant', 'nuwaraeliya', 'welimada',
--     'potato--nuwaraeliya--', 'potato-imported-', 'b-onion-imported',
--     'b-onion-imported-', 'ambul-rs-kg-', 'kolikuttu--rs-fruits-',
--     'papaya--rs-kg-', 'eggs--rs-egg---', 'orange', 'pineapple---small'
-- - Leaves exactly the 54 verified canonical commodities in public.vegetables.
-- ==============================================================================

-- 1. Remap any lingering price_entries / price_discrepancies if any exist (defense-in-depth)
UPDATE public.price_entries SET vegetable_id = 'beet-root' WHERE vegetable_id IN ('beet-root-n-eliya-', 'beet-root--n-eliya-');
UPDATE public.price_entries SET vegetable_id = 'bitter-gourd' WHERE vegetable_id IN ('bitter-gourd--other-', 'bitter-gourd--villag', 'bitter-gourd--village', 'bitter-gourd--village-');
UPDATE public.price_entries SET vegetable_id = 'brinjals' WHERE vegetable_id IN ('brinjals--other-', 'brinjals--village-', 'eggplant');
UPDATE public.price_entries SET vegetable_id = 'potato--imported-' WHERE vegetable_id IN ('potato-imported-');
UPDATE public.price_entries SET vegetable_id = 'potato--nuwaraeliya-' WHERE vegetable_id IN ('potato--nuwaraeliya--', 'nuwaraeliya');
UPDATE public.price_entries SET vegetable_id = 'potato--welimada-' WHERE vegetable_id IN ('welimada');
UPDATE public.price_entries SET vegetable_id = 'imported' WHERE vegetable_id IN ('b-onion-imported', 'b-onion-imported-');
UPDATE public.price_entries SET vegetable_id = 'ambul' WHERE vegetable_id IN ('ambul-rs-kg-');
UPDATE public.price_entries SET vegetable_id = 'kolikuttu' WHERE vegetable_id IN ('kolikuttu--rs-fruits-');
UPDATE public.price_entries SET vegetable_id = 'papaya' WHERE vegetable_id IN ('papaya--rs-kg-');
UPDATE public.price_entries SET vegetable_id = 'nadu' WHERE vegetable_id IN ('nadu-1', 'nadu-2');
UPDATE public.price_entries SET vegetable_id = 'samba-2' WHERE vegetable_id IN ('samba-3');
UPDATE public.price_entries SET vegetable_id = 'ponne-samba' WHERE vegetable_id IN ('ponne-1', 'samba-ponne-1');
UPDATE public.price_entries SET vegetable_id = 'white' WHERE vegetable_id IN ('eggs--rs-egg---');

UPDATE public.price_discrepancies SET vegetable_id = 'beet-root' WHERE vegetable_id IN ('beet-root-n-eliya-', 'beet-root--n-eliya-');
UPDATE public.price_discrepancies SET vegetable_id = 'bitter-gourd' WHERE vegetable_id IN ('bitter-gourd--other-', 'bitter-gourd--villag', 'bitter-gourd--village', 'bitter-gourd--village-');
UPDATE public.price_discrepancies SET vegetable_id = 'brinjals' WHERE vegetable_id IN ('brinjals--other-', 'brinjals--village-', 'eggplant');
UPDATE public.price_discrepancies SET vegetable_id = 'potato--imported-' WHERE vegetable_id IN ('potato-imported-');
UPDATE public.price_discrepancies SET vegetable_id = 'potato--nuwaraeliya-' WHERE vegetable_id IN ('potato--nuwaraeliya--', 'nuwaraeliya');
UPDATE public.price_discrepancies SET vegetable_id = 'potato--welimada-' WHERE vegetable_id IN ('welimada');
UPDATE public.price_discrepancies SET vegetable_id = 'imported' WHERE vegetable_id IN ('b-onion-imported', 'b-onion-imported-');
UPDATE public.price_discrepancies SET vegetable_id = 'ambul' WHERE vegetable_id IN ('ambul-rs-kg-');
UPDATE public.price_discrepancies SET vegetable_id = 'kolikuttu' WHERE vegetable_id IN ('kolikuttu--rs-fruits-');
UPDATE public.price_discrepancies SET vegetable_id = 'papaya' WHERE vegetable_id IN ('papaya--rs-kg-');
UPDATE public.price_discrepancies SET vegetable_id = 'nadu' WHERE vegetable_id IN ('nadu-1', 'nadu-2');
UPDATE public.price_discrepancies SET vegetable_id = 'samba-2' WHERE vegetable_id IN ('samba-3');
UPDATE public.price_discrepancies SET vegetable_id = 'ponne-samba' WHERE vegetable_id IN ('ponne-1', 'samba-ponne-1');
UPDATE public.price_discrepancies SET vegetable_id = 'white' WHERE vegetable_id IN ('eggs--rs-egg---');

-- 2. Delete all 47 non-canonical, corrupted, and duplicate vegetable entries
DELETE FROM public.vegetables
WHERE id IN (
    '-',
    'ambul-rs-kg-',
    'b-onion-imported',
    'b-onion-imported-',
    'beet-root--n-eliya-',
    'beet-root-n-eliya-',
    'bitter-gourd--other-',
    'bitter-gourd--villag',
    'bitter-gourd--village',
    'bitter-gourd--village-',
    'brinjals--other-',
    'brinjals--village-',
    'd-a-t-a-m-anagement-division',
    'eggplant',
    'eggs--rs-egg---',
    'head',
    'i-n-f-o-r-m-a-t-i-o-n-d-i-v-i-s-i-o-n',
    'i-n-f-ormation-division',
    'imported----div-0-',
    'imported-rice',
    'information-division',
    'karathak',
    'karathako',
    'kiri-ponne-pall-ponne-',
    'kolikuttu--rs-fruits-',
    'kora',
    'marketing---food-policy-division',
    'nadu-1',
    'nadu-2',
    'nuwaraeliya',
    'orange',
    'papaya--rs-kg-',
    'pineapple---small',
    'ponne-1',
    'potato--nuwaraeliya--',
    'potato-imported-',
    'raw-red--ref-----ref---ref-',
    'samba-1----div-0-',
    'samba-1----div-0---div-0-',
    'samba-3',
    'samba-3------div-0-',
    'samba-ponne-1',
    'sinnan----div-0-',
    'vedalan----div-0-',
    'vedalan----div-0---div-0-',
    'welimada',
    'welimada----div-0-'
);
