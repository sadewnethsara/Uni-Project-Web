import { createClient } from "@supabase/supabase-js";
import * as https from "https";

// Make sure these are set in your environment variables before running
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
// Use the service role key to bypass RLS policies if inserting data
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);



import * as fs from 'fs';
import * as path from 'path';

// ... other imports

async function syncData() {
  console.log("Starting data sync...");

  console.log("Reading local JSON files from price_data directory...");
  const priceDataDir = path.join(process.cwd(), 'price_data');
  
  if (!fs.existsSync(priceDataDir)) {
    console.error(`Directory not found: ${priceDataDir}`);
    console.log("Make sure to run the Python scraper first to generate the JSON files.");
    process.exit(1);
  }

  const files = fs.readdirSync(priceDataDir);
  const jsonFiles = files.filter((f: string) => f.endsWith('.json')).map(name => ({
    name,
    path: path.join(priceDataDir, name)
  }));

  console.log(`Found ${jsonFiles.length} files to process.`);

  // Load existing categories, vegetables, and markets
  const { data: existingCats } = await supabase.from('categories').select('*');
  const { data: existingVegs } = await supabase.from('vegetables').select('*');
  const { data: existingMarkets } = await supabase.from('markets').select('*');
  
  let categories = [...(existingCats || [])];
  let vegetables = [...(existingVegs || [])];
  let markets = [...(existingMarkets || [])];

  for (const file of jsonFiles) {
    console.log(`Processing ${file.name}...`);
    const fileData = fs.readFileSync(file.path, 'utf8');
    const data = JSON.parse(fileData);
    
    let priceRecords: any[] = [];

    for (const entry of data) {
      if (!entry.category || !entry.item) continue;

      let catName = entry.category;
      let catId = catName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      let cat = categories.find(c => c.id === catId);
      if (!cat) {
        cat = { id: catId, name: catName, emoji: "📁", name_si: "" };
        categories.push(cat);
        await supabase.from('categories').upsert([cat]);
      }

      let itemName = entry.item;
      let itemId = itemName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      let veg = vegetables.find(v => v.id === itemId);
      if (!veg) {
        veg = {
          id: itemId,
          category_id: catId,
          name: itemName,
          name_si: "",
          emoji: "🥬",
          unit: entry.unit || "kg"
        };
        vegetables.push(veg);
        await supabase.from('vegetables').upsert([veg]);
      }

      let price = entry.average_price;
      if (price == null && entry.min_price != null && entry.max_price != null) {
        price = (entry.min_price + entry.max_price) / 2;
      }

      if (price != null && entry.date && entry.market) {
        let rawMarket = entry.market.toLowerCase().trim();
        let marketId = rawMarket;
        let displayName = entry.market;

        // Canonical market mapping matching UI ANALYZE_MARKETS
        if (rawMarket.includes("peliyagoda")) { marketId = "peliyagoda"; displayName = "Peliyagoda"; }
        else if (rawMarket.includes("pettah")) { marketId = "pettah"; displayName = "Pettah"; }
        else if (rawMarket.includes("dambulla")) { marketId = "dambulla"; displayName = "Dambulla"; }
        else if (rawMarket.includes("kandy")) { marketId = "kandy"; displayName = "Kandy"; }
        else if (rawMarket.includes("keppetipola") || rawMarket.includes("kappetipola")) { marketId = "keppetipola"; displayName = "Keppetipola"; }
        else if (rawMarket.includes("meegoda") || rawMarket.includes("megoda")) { marketId = "meegoda"; displayName = "Meegoda"; }
        else if (rawMarket.includes("norochchole")) { marketId = "norochchole"; displayName = "Norochchole"; }
        else if (rawMarket.includes("thambuththegama") || rawMarket.includes("t'thegama") || rawMarket.includes("hambuththegam")) { marketId = "thambuththegama"; displayName = "Thambuththegama"; }
        else if (rawMarket.includes("nuwara")) { marketId = "nuwara-eliya"; displayName = "Nuwara Eliya"; }
        else if (rawMarket.includes("bandarawela")) { marketId = "bandarawela"; displayName = "Bandarawela"; }
        else if (rawMarket.includes("veyangoda")) { marketId = "veyangoda"; displayName = "Veyangoda"; }
        else if (rawMarket.includes("manning")) { marketId = "manning"; displayName = "Manning Market"; }
        
        let marketObj = markets.find(m => m.id === marketId);
        if (!marketObj) {
          marketObj = {
            id: marketId,
            name: displayName,
            name_si: "",
            district: "",
            emoji: "🏢"
          };
          markets.push(marketObj);
          await supabase.from('markets').upsert([marketObj]);
        }
        
        priceRecords.push({
          date: entry.date,
          market_id: marketId,
          vegetable_id: itemId,
          price: price
        });
      }
    }

    if (priceRecords.length > 0) {
      // Deduplicate in memory for this file to avoid sending duplicates in the same payload
      const uniqueRecordsMap = new Map<string, any>();
      for (const pr of priceRecords) {
        const key = `${pr.date}-${pr.market_id}-${pr.vegetable_id}`;
        uniqueRecordsMap.set(key, pr);
      }
      const uniqueRecords = Array.from(uniqueRecordsMap.values());

      // Upsert in batches of 2000 for maximum performance
      const batchSize = 2000;
      for (let i = 0; i < uniqueRecords.length; i += batchSize) {
        const batch = uniqueRecords.slice(i, i + batchSize);
        const { error } = await supabase
          .from('price_entries')
          .upsert(batch, { onConflict: 'date,market_id,vegetable_id' });

        if (error) {
          console.error(`Error upserting batch for ${file.name}:`, error.message);
        } else {
          console.log(`Upserted batch of ${batch.length} prices from ${file.name} (Progress: ${Math.min(i + batchSize, uniqueRecords.length)}/${uniqueRecords.length})`);
        }
      }
    }
  }

  console.log("Sync complete!");
}

syncData().catch(console.error);
