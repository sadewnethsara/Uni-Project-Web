import { MARKET_COMMODITIES } from "@/lib/marketPageData";

export interface MarketDetail {
    name: string;
    price: number;
    change: number;
    trend: "up" | "down" | "stable";
    history: { date: string; price: number }[];
    description?: string;
    image?: string;
    category?: string;
}

export interface SidebarItem {
    id: string;
    name: string;
    price: number;
    trend: "up" | "down" | "stable";
    change: number;
    image: string;
}

// Global market details fallback metadata
export const VEGETABLE_DATA: Record<string, MarketDetail> = {
    dambulla: { name: "Dambulla Dedicated Economic Center", price: 180, change: 5.4, trend: "up", history: [{ date: "Today", price: 180 }, { date: "Yesterday", price: 171 }, { date: "2 days ago", price: 165 }] },
    manning: { name: "Manning Market (Colombo)", price: 310, change: 4.1, trend: "up", history: [{ date: "Today", price: 310 }, { date: "Yesterday", price: 298 }, { date: "2 days ago", price: 292 }] },
    minuwangoda: { name: "Minuwangoda Dedicated Economic Center", price: 240, change: -2.1, trend: "down", history: [{ date: "Today", price: 240 }, { date: "Yesterday", price: 245 }, { date: "2 days ago", price: 250 }] },
    keppetipola: { name: "Keppetipola Dedicated Economic Center", price: 195, change: 3.8, trend: "up", history: [{ date: "Today", price: 195 }, { date: "Yesterday", price: 188 }, { date: "2 days ago", price: 190 }] },
    meegoda: { name: "Meegoda Dedicated Economic Center", price: 265, change: 1.2, trend: "up", history: [{ date: "Today", price: 265 }, { date: "Yesterday", price: 262 }, { date: "2 days ago", price: 268 }] },
    welisara: { name: "Welisara Dedicated Economic Center", price: 230, change: -4.5, trend: "down", history: [{ date: "Today", price: 230 }, { date: "Yesterday", price: 241 }, { date: "2 days ago", price: 238 }] },
    thambuttegama: { name: "Thambuttegama Dedicated Economic Center", price: 160, change: 0.0, trend: "stable", history: [{ date: "Today", price: 160 }, { date: "Yesterday", price: 160 }, { date: "2 days ago", price: 158 }] },
    narahenpita: { name: "Narahenpita Dedicated Economic Center", price: 290, change: 6.2, trend: "up", history: [{ date: "Today", price: 290 }, { date: "Yesterday", price: 273 }, { date: "2 days ago", price: 270 }] },
    embilipitiya: { name: "Embilipitiya Dedicated Economic Center", price: 210, change: -1.8, trend: "down", history: [{ date: "Today", price: 210 }, { date: "Yesterday", price: 214 }, { date: "2 days ago", price: 208 }] },
    "nuwara-eliya": { name: "Nuwara Eliya Economic Center", price: 205, change: 2.5, trend: "up", history: [{ date: "Today", price: 205 }, { date: "Yesterday", price: 200 }, { date: "2 days ago", price: 195 }] },
};

// Rich commodity metadata for analyze page footnotes
export const COMMODITY_DETAILS: Record<string, MarketDetail> = Object.fromEntries(
    MARKET_COMMODITIES.map((c, i) => [
        c.id,
        {
            name: c.name,
            price: 200 + (i % 5) * 25,
            change: ((i % 3) - 1) * 4.2,
            trend: (["up", "down", "stable"] as const)[i % 3],
            description: c.description,
            image: c.image,
            category: c.category,
            history: [
                { date: "Selected day", price: 200 + (i % 5) * 25 },
                { date: "Yesterday", price: 195 + (i % 5) * 22 },
                { date: "Last year", price: 170 + (i % 5) * 18 },
            ],
        },
    ])
);

// Sidebar / chat name lookup — synced with market board commodities
export const SIDEBAR_ITEMS: SidebarItem[] = MARKET_COMMODITIES.map((c, i) => ({
    id: c.id,
    name: c.name,
    price: 200 + (i % 5) * 25,
    trend: (["up", "down", "stable"] as const)[i % 3],
    change: Math.abs(((i % 3) - 1) * 4.2),
    image: c.image,
}));
