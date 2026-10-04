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
        let marketId = entry.market.toLowerCase().trim();
        // Adjust for any mismatch between dataset and UI
        if (marketId === "kappetipola") marketId = "keppetipola";
        
        let marketObj = markets.find(m => m.id === marketId);
        if (!marketObj) {
          marketObj = {
            id: marketId,
            name: entry.market,
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
      const dateStr = priceRecords[0].date;
      const { data: existingPrices } = await supabase
        .from('price_entries')
        .select('*')
        .eq('date', dateStr);
        
      const inserts: any[] = [];
      const updates: any[] = [];

      priceRecords.forEach(pr => {
        const existing = existingPrices?.find(ep => ep.vegetable_id === pr.vegetable_id && ep.market_id === pr.market_id);
        if (existing) {
          updates.push({ ...pr, id: existing.id });
        } else {
          inserts.push(pr);
        }
      });

      // Handle inserts (avoiding duplicates inside the same batch)
      const uniqueInserts: any[] = [];
      const seen = new Set();
      for (const item of inserts) {
        const key = `${item.date}-${item.market_id}-${item.vegetable_id}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueInserts.push(item);
        }
      }

      if (uniqueInserts.length > 0) {
        const { error } = await supabase.from('price_entries').insert(uniqueInserts);
        if (error) console.error(`Error inserting prices for ${file.name}:`, error.message);
        else console.log(`Inserted ${uniqueInserts.length} prices from ${file.name}`);
      }

      // Handle updates
      for (const up of updates) {
        const { id, ...updateData } = up;
        const { error } = await supabase.from('price_entries').update(updateData).eq('id', id);
        if (error) console.error(`Error updating price ${id} for ${file.name}:`, error.message);
      }
      
      if (updates.length > 0) {
        console.log(`Updated ${updates.length} existing prices from ${file.name}`);
      }
    }
  }

  console.log("Sync complete!");
}

syncData().catch(console.error);
