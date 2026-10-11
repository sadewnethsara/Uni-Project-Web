import { createClient } from "@supabase/supabase-js";
import * as fs from 'fs';
import * as path from 'path';

// Environment credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Remapping of legacy naming anomalies & variants to canonical vegetable IDs
const VEGETABLE_REMAP: Record<string, string> = {
  // Bitter Gourd
  "bitter-gourd--other-": "bitter-gourd",
  "bitter-gourd--villag": "bitter-gourd",
  "bitter-gourd--village": "bitter-gourd",
  "bitter-gourd--village-": "bitter-gourd",
  "bitter gourd": "bitter-gourd",
  
  // Beet root
  "beet-root-n-eliya-": "beet-root",
  "beet-root--n-eliya-": "beet-root",
  "beet root": "beet-root",
  "beetroot": "beet-root",
  
  // Brinjals
  "brinjals--other-": "brinjals",
  "brinjals--village-": "brinjals",
  "brinjal": "brinjals",
  "eggplant": "brinjals",
  
  // Potatoes
  "potato-imported-": "potato--imported-",
  "potato--nuwaraeliya--": "potato--nuwaraeliya-",
  "nuwaraeliya": "potato--nuwaraeliya-",
  "welimada": "potato--welimada-",
  "valimada": "potato--welimada-",
  "potato-welimada": "potato--welimada-",
  "potato-nuwaraeliya": "potato--nuwaraeliya-",
  
  // Onions
  "b-onion-imported": "imported",
  "b-onion-imported-": "imported",
  
  // Bananas / Fruits
  "ambul-rs-kg-": "ambul",
  "kolikuttu--rs-fruits-": "kolikuttu",
  "papaya--rs-kg-": "papaya",
  
  // Rice
  "nadu-1": "nadu",
  "nadu-2": "nadu",
  "samba-3": "samba-2",
  "ponne-1": "ponne-samba",
  "samba-ponne-1": "ponne-samba",
  
  // Other
  "cabbage": "cabbage--kandy-",
  "radish": "raddish",
  "eggs--rs-egg---": "white"
};

// Strict blocklist for OCR artifacts, header leaks, and corrupted formula strings
const JUNK_ITEMS = new Set([
  "-", ".", "head", "karathak", "karathako", "kora", "imported-rice",
  "d-a-t-a-m-anagement-division", "i-n-f-o-r-m-a-t-i-o-n-d-i-v-i-s-i-o-n",
  "i-n-f-ormation-division", "information-division", "marketing---food-policy-division",
  "kiri-ponne-pall-ponne-", "imported----div-0-", "sinnan----div-0-", "vedalan----div-0-",
  "vedalan----div-0---div-0-", "welimada----div-0-", "samba-1----div-0-", "samba-1----div-0---div-0-",
  "samba-3------div-0-", "raw-red--ref-----ref---ref-", "orange", "pineapple---small"
]);

function resolveVegetableId(rawItem: string, rawCategory: string | undefined, validVegIds: Set<string>): string | null {
  if (!rawItem) return null;
  const rawLower = rawItem.toLowerCase().trim();
  const rawSlug = rawLower.replace(/[^a-z0-9]/g, '-');
  const catLower = (rawCategory || '').toLowerCase().trim();

  // 1. Strict blacklist check
  if (JUNK_ITEMS.has(rawSlug) || JUNK_ITEMS.has(rawLower)) return null;
  if (rawSlug.includes("div-0") || rawSlug.includes("ref") || rawSlug.includes("division")) return null;
  if (rawSlug === "" || rawSlug === "-" || rawSlug === ".") return null;

  // 2. Category-specific context resolution (Crucial: differentiates Imported Potato vs Imported Big Onion)
  if (catLower.includes("potato")) {
    if (rawSlug.includes("nuwaraeliya") || rawSlug.includes("nuwara-eliya") || rawSlug.includes("nuwara")) {
      return "potato--nuwaraeliya-";
    }
    if (rawSlug.includes("welimada") || rawSlug.includes("valimada")) {
      return "potato--welimada-";
    }
    if (rawSlug.includes("imported") || rawSlug.includes("imp")) {
      return "potato--imported-";
    }
  }

  // 3. Remap check
  let targetId = VEGETABLE_REMAP[rawSlug] || VEGETABLE_REMAP[rawLower] || rawSlug;

  // 4. Foreign key check against active canonical commodities
  if (validVegIds.has(targetId)) {
    return targetId;
  }

  // Reject unmapped/unrecognized items — NEVER auto-insert into vegetables dimension table
  return null;
}

function resolveMarketId(rawMarket: string, validMarketIds: Set<string>): string | null {
  if (!rawMarket) return null;
  const m = rawMarket.toLowerCase().trim();

  if (m.includes("peliyagod") || m.includes("peliyagoda")) return "peliyagoda";
  if (m.includes("pettah") || m.includes("petha")) return "pettah";
  if (m.includes("dambulla")) return "dambulla";
  if (m.includes("kandy")) return "kandy";
  if (m.includes("keppetipola") || m.includes("kappetipola") || m.includes("akeppetipola")) return "keppetipola";
  if (m.includes("meegoda") || m.includes("megoda")) return "meegoda";
  if (m.includes("norochchole") || m.includes("norochchol")) return "norochchole";
  if (m.includes("thambuththegam") || m.includes("t'thegama") || m.includes("hambuththegam") || m.includes("ambuththega")) return "thambuththegama";
  if (m.includes("nuwara")) return "nuwara-eliya";
  if (m.includes("bandarawela")) return "bandarawela";
  if (m.includes("veyangoda")) return "veyangoda";
  if (m.includes("manning")) return "manning";

  const directSlug = m.replace(/[^a-z0-9]/g, '-');
  if (validMarketIds.has(directSlug)) return directSlug;

  return null;
}

async function syncData() {
  console.log("==================================================");
  console.log("Starting Enterprise NAMIS Data Sync Pipeline...");
  console.log("==================================================");

  const priceDataDir = path.join(process.cwd(), 'price_data');
  if (!fs.existsSync(priceDataDir)) {
    console.log(`Directory not found: ${priceDataDir}. Skipping sync.`);
    return;
  }

  const files = fs.readdirSync(priceDataDir);
  const jsonFiles = files.filter((f: string) => f.endsWith('.json')).map(name => ({
    name,
    path: path.join(priceDataDir, name)
  }));

  console.log(`Found ${jsonFiles.length} JSON files to process.`);

  // Load canonical commodities and markets from Supabase (Strict FK validation)
  const { data: existingVegs, error: vegErr } = await supabase.from('vegetables').select('id');
  if (vegErr || !existingVegs) {
    throw new Error(`Failed to fetch canonical vegetables: ${vegErr?.message}`);
  }
  const validVegIds = new Set(existingVegs.map(v => v.id));

  const { data: existingMarkets, error: mktErr } = await supabase.from('markets').select('id');
  if (mktErr || !existingMarkets) {
    throw new Error(`Failed to fetch canonical markets: ${mktErr?.message}`);
  }
  const validMarketIds = new Set(existingMarkets.map(m => m.id));

  console.log(`Loaded ${validVegIds.size} canonical commodities and ${validMarketIds.size} canonical markets.`);

  let totalUpserted = 0;
  let totalSkipped = 0;

  for (const file of jsonFiles) {
    let fileData: string;
    try {
      fileData = fs.readFileSync(file.path, 'utf8');
    } catch {
      continue;
    }

    let data: any[];
    try {
      data = JSON.parse(fileData);
    } catch {
      continue;
    }

    if (!Array.isArray(data)) continue;

    const priceRecords: any[] = [];

    for (const entry of data) {
      if (!entry.item || !entry.date || !entry.market) continue;

      // 1. Resolve canonical vegetable (category-aware)
      const vegId = resolveVegetableId(entry.item, entry.category, validVegIds);
      if (!vegId) {
        totalSkipped++;
        continue;
      }

      // 2. Resolve canonical market
      const marketId = resolveMarketId(entry.market, validMarketIds);
      if (!marketId) {
        totalSkipped++;
        continue;
      }

      // 3. Resolve numerical price
      let price = entry.average_price;
      if (price == null && entry.min_price != null && entry.max_price != null) {
        price = (entry.min_price + entry.max_price) / 2;
      }

      // 4. Domain boundary & sanity check (Reject <= 0, > 25000, NaN)
      if (typeof price !== 'number' || isNaN(price) || price <= 0 || price > 25000) {
        totalSkipped++;
        continue;
      }

      const minPrice = (typeof entry.min_price === 'number' && entry.min_price > 0 && entry.min_price <= 25000)
        ? entry.min_price : null;
      const maxPrice = (typeof entry.max_price === 'number' && entry.max_price > 0 && entry.max_price <= 25000)
        ? entry.max_price : null;

      priceRecords.push({
        date: entry.date,
        market_id: marketId,
        vegetable_id: vegId,
        price: Math.round(price * 100) / 100,
        min_price: minPrice,
        max_price: maxPrice,
        price_type: 'wholesale',
        source: 'harti'
      });
    }

    if (priceRecords.length > 0) {
      // In-batch deduplication on unique constraint (vegetable_id, market_id, date, price_type)
      const dedupMap = new Map<string, any>();
      for (const pr of priceRecords) {
        const key = `${pr.vegetable_id}-${pr.market_id}-${pr.date}-${pr.price_type}`;
        dedupMap.set(key, pr);
      }
      const uniqueRecords = Array.from(dedupMap.values());

      // Free-tier batch guardrail: 500 records per POST request (Rule 2.C)
      const batchSize = 500;
      for (let i = 0; i < uniqueRecords.length; i += batchSize) {
        const batch = uniqueRecords.slice(i, i + batchSize);
        const { error } = await supabase
          .from('price_entries')
          .upsert(batch, { onConflict: 'vegetable_id,market_id,date,price_type' });

        if (error) {
          console.error(`  [ERROR] Upserting batch in ${file.name}:`, error.message);
        } else {
          totalUpserted += batch.length;
        }
      }
    }
  }

  console.log("==================================================");
  console.log(`Sync complete! Total records upserted: ${totalUpserted}, Skipped non-canonical/invalid: ${totalSkipped}`);
  console.log("==================================================");
}

syncData().catch(console.error);
