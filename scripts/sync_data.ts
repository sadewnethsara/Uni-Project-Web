import { createClient } from "@supabase/supabase-js";
import https from "https";

// Make sure these are set in your environment variables before running
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
// Use the service role key to bypass RLS policies if inserting data
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to fetch directory contents from Github API
async function fetchGithubDir(owner: string, repo: string, pathStr: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/contents/${pathStr}`,
      headers: { 'User-Agent': 'Node.js' }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to fetch github dir: ${res.statusCode} ${data}`));
        }
      });
    }).on('error', reject);
  });
}

// Function to fetch file content
async function fetchGithubFile(downloadUrl: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(downloadUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function syncData() {
  console.log("Starting data sync...");

  console.log("Fetching list of JSON files from GitHub dataset...");
  let files;
  try {
    files = await fetchGithubDir("DasunEdirisinghe", "sri-lanka-agricultural-commodity-prices-dataset", "price_data");
  } catch (err: any) {
    console.error("Error fetching repository:", err.message);
    process.exit(1);
  }

  const jsonFiles = files.filter((f: any) => f.name.endsWith('.json'));
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
    const data = await fetchGithubFile(file.download_url);
    
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
        
      const upsertPrices = priceRecords.map(pr => {
        const existing = existingPrices?.find(ep => ep.vegetable_id === pr.vegetable_id && ep.market_id === pr.market_id);
        if (existing) {
          pr.id = existing.id;
        }
        return pr;
      });

      if (upsertPrices.length > 0) {
        const { error } = await supabase.from('price_entries').upsert(upsertPrices);
        if (error) {
          console.error(`Error upserting prices for ${file.name}:`, error.message);
        } else {
          console.log(`Upserted ${upsertPrices.length} prices from ${file.name}`);
        }
      }
    }
  }

  console.log("Sync complete!");
}

syncData().catch(console.error);
