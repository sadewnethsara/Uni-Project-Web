# 🌾 NAMIS Harvest Timing & Vegetable Price Optimization Blueprint
## Multi-Variable Predictive Intelligence & "When-to-Plant" Decision Engine

---

## 🎯 1. Executive Summary & Core Mission

The ultimate objective of the **National Agricultural Market Information System (NAMIS)** predictive engine is to solve the fundamental economic dilemma faced by Sri Lankan farmers, agribusinesses, and traders:

> **"If I want to harvest a crop and sell it at the highest market price in Sri Lanka, WHICH VEGETABLE should I grow, WHICH ECONOMIC CENTRE should I sell to, and on WHAT EXACT DATE should I plant today to maximize my net profit?"**

Rather than merely displaying backward-looking price charts, NAMIS acts as a **Prescriptive Agricultural Optimization Engine**. It works backward from predicted future price peaks to calculate the **Optimal Planting Date ($t_{\text{plant}}$)**:

$$\text{Optimal Planting Date} = t_{\text{target\_peak}} - D_{\text{maturity\_days}}$$

$$\text{Net Profit}(\text{Crop}, \text{Market}, t_{\text{plant}}) = \left[ \mathbb{E}\big(P_{\text{wholesale}}(t_{\text{harvest}}, \text{Market})\big) \times Y_{\text{yield}} \right] - C_{\text{production}}(t_{\text{plant}}) - C_{\text{logistics}}(\text{Farm} \to \text{Market})$$

---

## 🧭 2. Complete Variable Inventory Matrix

To predict future vegetable prices with institutional precision, the model ingests data across **7 core domains**. Below is the master tracking matrix of what is already collected, what needs to be collected, and the primary Sri Lankan data sources.

### Master Data Inventory Table

| # | Variable Domain | Specific Metrics | Granularity (Time / Spatial) | Status | Primary Official Source |
| :- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Historical Price Feeds** | Wholesale Min/Max/Avg, Paired Retail, Consumer Retail | Daily / Pettah, Dambulla, +10 DECs | **✅ Collected** *(300k+ rows)* | HARTI, CRAN, CBSL, DCS, Dambulla API |
| **2** | **Macro & Rupee Inflation** | Headline CCPI YoY/MoM, Food YoY/MoM, Core YoY, USD/LKR rate | Daily, Weekly, Monthly, Yearly / National | **✅ Collected** *(797 rows: 2015–2026)* | CBSL & DCS Bulletins |
| **3** | **Macro Rolling Forecast** | 365-day forward projected CCPI, Food YoY, Core, USD/LKR | Daily & Monthly / Next 365 Days | **✅ Active** *(377 rows)* | CBSL FIT Model / NAMIS Engine |
| **4** | **Market Daily Inflow Volume** | Daily vegetable arrival tonnage (Metric Tons / Bags / Crates) | Daily / By Economic Centre | **📋 Needs Collection** | Dambulla DEC Portal, HARTI Market Division |
| **5** | **External Trade (Import/Export)** | Potato, B-Onion, Chili import metric tons, CIF values, Border Tariffs (SCL) | Monthly & Weekly / Colombo Port | **📋 Needs Collection** | CBSL External Trade, Sri Lanka Customs, Trade Ministry |
| **6** | **Population & Demographics** | Total population, rural/urban migration, age distribution | Annual & Projections / District-level | **📋 Needs Collection** | Dept. of Census & Statistics (DCS) Census |
| **7** | **Consumer Purchasing Power** | Real Wage Rate Index (Agricultural, Informal), Per Capita Income | Monthly & Quarterly / National & Provincial | **📋 Needs Collection** | CBSL Economic Indicators, DCS HIES |
| **8** | **Hyper-Local Weather & Climate** | Daily Rainfall (mm), Max/Min Temp (°C), Humidity, Soil Moisture | Daily & Monthly / GN Division & 46 Agro-Ecological Zones | **📋 Needs Collection** | Dept. of Meteorology, NASA POWER, ERA5, Open-Meteo |
| **9** | **Seasonal Climate Outlook** | Monsoon onset anomalies (SW/NE Monsoon), flood/drought risk | 1-Year Forward / Agro-Ecological Zone | **📋 Needs Collection** | Dept. of Meteorology Climate Center, ECMWF SEAS5 |
| **10**| **Agronomic Growth Cycles** | Crop maturity duration (days from planting to harvest), yield/acre | Constant & Variety-specific / Crop-level | **⭐ Forgotten Variable** | Dept. of Agriculture (DOA) Horticultural Center |
| **11**| **Cultivated Extent (Acreage)** | Target hectares sown in Yala & Maha, mid-season progress | Monthly & Seasonal / District & Agrarian Service Centre | **⭐ Forgotten Variable** | HARTI & DOA Seasonal Crop Forecast Bulletins |
| **12**| **Cost of Cultivation (Inputs)** | Seeds/tubers, fertilizer (Urea/MOP), agrochemicals, labor man-days | Seasonal / District & Agrarian Division | **⭐ Forgotten Variable** | Dept. of Agriculture Socio-Economic Division (AgEc) |
| **13**| **Transport & Logistics Energy** | Auto Diesel price per liter (LKR), freight trucking rate per km/ton | Daily & Weekly / Major Inter-district transit corridors | **⭐ Forgotten Variable** | CPC / LIOC Fuel Gazettes, All-Island Truckers Association |
| **14**| **Cultural & Religious Shocks** | Festive consumption spikes (New Year, Vesak Dansal, Ramadan, Weddings) | Calendar Dates & Auspicious Periods | **⭐ Forgotten Variable** | Government Gazettes, Buddhist & Hindu Lunar Calendars |
| **15**| **Post-Harvest Loss & Decay** | Perishability decay rates, shelf-life (days without cold chain) | Crop-specific / Storage Condition | **⭐ Forgotten Variable** | National Institute of Post Harvest Management (NIPHM) |

---

## 🔍 3. Deep Dive into "Forgotten Variables" (Critical for Accurate Predictions)

To achieve reliable price and harvest predictions, price cannot be modeled by weather and inflation alone. The following variables represent the missing links in agricultural economics:

### A. Agronomic Growth Duration & Maturity Bands ($D_{\text{maturity}}$)
Farmers cannot harvest on command; crops follow strict biological timelines:
* **Radish / Leafy Greens**: 35 – 45 days.
* **Bush Beans / Snake Gourd**: 55 – 65 days.
* **Tomato / Green Chili**: 70 – 85 days (multiple picking flushes over 3–4 weeks).
* **Carrot / Leeks / Beetroot**: 90 – 105 days.
* **Cabbage (Kandy / Upcountry)**: 75 – 90 days.
* **Big Onion / Potato**: 90 – 120 days.

> **Decision Engine Implication**: If the model predicts that **Tomato prices will hit a record peak of Rs. 650/kg on December 15th** (due to Christmas tourism & wedding surges), the engine automatically calculates:  
> **Planting Window = September 20 – October 1 (75–85 days prior)**.

### B. Cultivated Extent & Sowing Progress (The Supply Glut Precursor)
* When vegetable prices spike today, farmers across Welimada, Nuwara Eliya, and Jaffna all rush to plant the *same* crop simultaneously (**The "Cobweb Theorem" / Pig Cycle**).
* Result: 90 days later, the market experiences a devastating supply glut, and prices crash to Rs. 20/kg.
* **The Variable**: Tracking **Hectares Sown by Agrarian Service Centre (ASC)** from the Department of Agriculture's *Pre-Maha* and *Pre-Yala Crop Forecasts* allows the model to warn farmers:  
  * *"Warning: Over 4,200 Ha of Cabbage already sown in Badulla district. High probability of price collapse in 60 days. Plant Beans instead."*

### C. Cost of Cultivation (Production Feasibility & Breakeven Price)
A peak price is meaningless if production costs exceed revenue:
* **Labor**: Sri Lankan agricultural wages average Rs. 2,500 – 3,500 per man-day.
* **Fertilizer**: Chemical fertilizer (Urea 50kg bag price) vs. organic inputs.
* **Breakeven Formula**:
  $$\text{Breakeven Price (Rs/kg)} = \frac{\text{Total Cultivation Cost per Acre}}{\text{Expected Yield in kg per Acre}}$$
* The engine only recommends planting if:
  $$\mathbb{E}(P_{\text{wholesale}}) \ge 1.40 \times \text{Breakeven Price} \quad \text{(Targeting a minimum 40\% profit margin)}$$

### D. Special Commodity Levy (SCL) & Import Tariffs
* For crops with high import substitutability (**Big Onion, Potato, Dried Chili**), price is driven by government gazettes:
* When local harvest arrives in August (Dambulla big onion harvest), the government typically raises the SCL tax from Rs. 10/kg to Rs. 50/kg to block Indian/Pakistani imports.
* When local supplies dry up in January, the government cuts the tariff to Rs. 10/kg, causing market prices to stabilize or drop.
* Tracking gazetted SCL rates provides immediate predictability for tuber and bulb crops.

### E. Cultural, Religious & Tourism Demand Calendars
Sri Lanka experiences recurring seasonal consumption surges:
1. **Mid-April (Sinhala & Tamil New Year)**: Nationwide consumer demand spikes by +35% for all fresh produce.
2. **May (Vesak)**: 2–3 days of massive vegetarian food distribution (**Dansal**). Meat consumption plummets; vegetable wholesale demand reaches year-high peaks.
3. **June (Poson)**: North-Central (Anuradhapura) religious pilgrimage demand.
4. **December – January**: Peak international tourist arrivals in Western/Southern/Central regions + festive weddings.

---

## 🗺️ 4. Hyper-Local Microclimate Architecture: GN Division to DEC Flow

Sri Lanka has **46 Agro-Ecological Zones (AEZs)** across three elevation bands (Low, Mid, Upcountry) and three moisture zones (Wet, Intermediate, Dry):

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       HYPER-LOCAL PRODUCTION TO MARKET FLOW                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Production Zone: 14,022 GN Divisions / 550 ASCs]                          │
│   • Nuwara Eliya / Welimada (Upcountry Wet/Intermediate): Carrot, Leeks, Potato  │
│   • Dambulla / Matale (Dry/Intermediate Lowcountry): Big Onion, Tomato, Brinjal│
│   • Jaffna / Kilinochchi (Dry Lowcountry): Red Onion, Chili, Pumpkin       │
│                                │                                            │
│                                ▼                                            │
│  [Microclimate Impact Engine: ERA5 / NASA POWER / Dept. of Meteorology]     │
│   • Heavy Rainfall (>100mm/wk) ──▶ Fungal Blight, Delayed Harvest, Road Washouts│
│   • Drought (Rain <10mm/mo)    ──▶ Stunted Growth, Tubers Fail to Bulge    │
│   • Optimal Growing Window     ──▶ 100% Potential Yield Output             │
│                                │                                            │
│                                ▼                                            │
│  [Transport Logistics Corridor: Fuel Cost x Distance Matrix]                │
│   • Nuwara Eliya ──▶ Pettah DEC (175 km, 6 hrs)                            │
│   • Dambulla     ──▶ Peliyagoda / Kandy (160 km / 75 km)                   │
│                                │                                            │
│                                ▼                                            │
│  [Wholesale Arrival Price Formation at 12 Dedicated Economic Centres]       │
│   • Dambulla, Pettah, Peliyagoda, Kandy, Keppetipola, Meegoda, Norochcholai... │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ 5. Supabase Database Schema Architecture

To support this comprehensive intelligence engine, the database is extended with clean, relational, time-series tables:

```text
├── public.inflation_rates          (Macro indicators: 2015-Present) [ACTIVE]
├── public.inflation_forecasts      (Rolling 365-day prediction window) [ACTIVE]
├── public.market_inflow_volumes    (Daily arrival metric tons per vegetable & DEC)
├── public.external_trade_crops     (Monthly imports, exports, CIF value, SCL tax)
├── public.demographics_purchasing  (Population, Real Wage Index, district income)
├── public.weather_microclimate     (Daily rainfall, temp, moisture by GN/District)
├── public.crop_agronomic_profiles  (Maturity days, yield/acre, harvest window)
├── public.crop_cultivation_costs   (Labor cost, seed cost, fertilizer cost/acre)
└── public.harvest_recommendations  (Pre-computed optimal planting dates & profit)
```

### Proposed Schema Migration (Key Tables)

```sql
-- 1. Daily Market Inflow Volume (Metric Tons)
CREATE TABLE IF NOT EXISTS public.market_inflow_volumes (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    date DATE NOT NULL,
    market_id TEXT NOT NULL REFERENCES public.markets(id),
    vegetable_id TEXT NOT NULL REFERENCES public.vegetables(id),
    arrival_metric_tons NUMERIC NOT NULL,
    truck_arrivals_count INT,
    source TEXT NOT NULL DEFAULT 'dambulla_dec',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_market_inflow UNIQUE (date, market_id, vegetable_id)
);

-- 2. External Trade & Import Tariffs
CREATE TABLE IF NOT EXISTS public.external_trade_crops (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    year INT NOT NULL,
    month INT NOT NULL,
    commodity_slug TEXT NOT NULL,          -- 'big_onion', 'potato', 'dried_chili'
    import_volume_metric_tons NUMERIC NOT NULL,
    import_cif_price_lkr_kg NUMERIC,
    special_commodity_levy_lkr_kg NUMERIC, -- SCL Tax (Border Protection)
    export_volume_metric_tons NUMERIC DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'customs_cbsl',
    CONSTRAINT unique_trade_month UNIQUE (year, month, commodity_slug)
);

-- 3. Crop Agronomic Profiles (Growth Duration & Yield)
CREATE TABLE IF NOT EXISTS public.crop_agronomic_profiles (
    id TEXT PRIMARY KEY,                   -- matches vegetables.id (e.g. 'carrot')
    crop_name TEXT NOT NULL,
    min_growth_days INT NOT NULL,          -- e.g. 80 days
    max_growth_days INT NOT NULL,          -- e.g. 100 days
    avg_growth_days INT NOT NULL,          -- e.g. 90 days
    harvest_window_days INT NOT NULL,      -- e.g. 14 days
    typical_yield_kg_per_acre NUMERIC NOT NULL,
    water_requirement_level TEXT CHECK (water_requirement_level IN ('low', 'medium', 'high')),
    primary_cultivation_districts TEXT[]   -- e.g. {'nuwara_eliya', 'badulla'}
);

-- 4. Hyper-Local Weather (GN / District / ASC Level)
CREATE TABLE IF NOT EXISTS public.weather_microclimate (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    date DATE NOT NULL,
    district TEXT NOT NULL,                -- e.g. 'nuwara_eliya', 'matale', 'badulla'
    agrarian_service_centre TEXT,
    rainfall_mm NUMERIC NOT NULL,
    temp_max_celsius NUMERIC,
    temp_min_celsius NUMERIC,
    relative_humidity_pct NUMERIC,
    soil_moisture_index NUMERIC,
    source TEXT NOT NULL DEFAULT 'open_meteo_era5',
    CONSTRAINT unique_weather_day UNIQUE (date, district, agrarian_service_centre)
);

-- 5. Prescriptive Harvest & Planting Recommendations (The Output Table)
CREATE TABLE IF NOT EXISTS public.harvest_recommendations (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    generated_date DATE NOT NULL,
    vegetable_id TEXT NOT NULL REFERENCES public.vegetables(id),
    recommended_market_id TEXT NOT NULL REFERENCES public.markets(id),
    recommended_planting_date DATE NOT NULL,
    projected_harvest_date DATE NOT NULL,
    predicted_peak_price_lkr_kg NUMERIC NOT NULL,
    estimated_cost_per_kg NUMERIC NOT NULL,
    estimated_profit_margin_pct NUMERIC NOT NULL,
    confidence_score_pct NUMERIC NOT NULL,
    risk_factors TEXT[],                   -- e.g. {'heavy_monsoon_risk', 'import_scl_reduction_risk'}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_recommendation UNIQUE (generated_date, vegetable_id, recommended_market_id)
);
```

---

## 🚀 6. Step-by-Step Data Acquisition Roadmap

### Phase 1: Macro & Historical Foundations (COMPLETED ✅)
* Ingested 300,000+ historical price records (2015–2026) across 12 markets.
* Ingested 797 Sri Lanka inflation, currency, and annual macro time-series rows.
* Established daily auto-rolling 365-day forward inflation forecasting engine.

### Phase 2: Agronomic Profiles & Crop Growth Parameters (NEXT)
* Populate `public.crop_agronomic_profiles` with verified cultivation durations from the Department of Agriculture Horticultural Crop Manual:
  * Carrot (90 days), Tomato (75 days), Leeks (100 days), Green Chili (80 days), Beans (55 days), Cabbage (80 days), Big Onion (110 days), Potato (90 days).

### Phase 3: Market Daily Inflow Volume (Tonnage)
* **Target Sources**:
  1. **Dambulla DEC Digital Portal**: Daily vegetable quantity arrivals (kg/tons) per commodity.
  2. **HARTI Market Research Bulletins**: Daily supply arrival indices (Truckloads arriving at Pettah & Peliyagoda).

### Phase 4: External Trade & Import Tariffs (SCL)
* **Target Sources**:
  1. **CBSL External Trade Monthly Bulletins** (Category: Agricultural Imports - Food & Beverages).
  2. **Department of Agriculture National Food Balance Sheets**.
  3. **Ministry of Finance Gazettes** (Special Commodity Levy changes on Big Onion and Potato).

### Phase 5: Hyper-Local Weather Integration
* **Target Sources**:
  1. Open-Meteo Historical Weather API & ERA5 Reanalysis (0.25° grid resolution covering all 25 districts of Sri Lanka from 2015 to Present for free).
  2. ECMWF Seasonal Forecasts (1-Year forward precipitation and temperature anomaly forecasts).

### Phase 6: The "When-to-Plant" Prescriptive Model
* Combines:
  $$\text{Predicted Price}(t) \quad \times \quad \text{Maturity Window} \quad \times \quad \text{Seasonal Weather Risk} \quad \times \quad \text{Production Cost}$$
* Produces dynamic web dashboard cards for farmers:
  * *"Planting Beans on October 25th in Welimada will mature on December 20th to capture the Christmas/New Year Pettah market peak at Rs. 480/kg (+82% estimated profit margin)."*

---

## 📝 7. Summary Checklist for Contributors & Agents

Before executing data scrapers or ML models, verify compliance with:
- [x] Zero hardcoded API keys; all credentials loaded via `scripts/env_loader.py`.
- [x] All database operations use idempotent upserts (`on_conflict`).
- [x] Maximum batch size $\le 500$ rows per request to protect Supabase free-tier limits.
- [x] All dates formatted strictly as ISO 8601 (`YYYY-MM-DD`).
- [x] Continuous validation via `py -3 scripts/maintenance/audit_data_quality.py`.
