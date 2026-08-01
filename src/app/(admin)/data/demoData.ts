import type { Admin, Category, Item, MarketCenter } from "@/lib/types";

export const ADMIN_DEMO_DATA = {
  admins: [
    {
      id: "adm-01",
      name: "System Admin",
      email: "admin@agri.lk",
      role: "super" as const,
      marketId: undefined,
      createdAt: "2024-01-01T00:00:00.000Z",
      isActive: true,
    },
    {
      id: "adm-02",
      name: "Dambulla Officer",
      email: "dambulla@agri.lk",
      role: "market" as const,
      marketId: "dambulla",
      createdAt: "2024-01-02T00:00:00.000Z",
      isActive: true,
    },
    {
      id: "adm-03",
      name: "Kappetipola Officer",
      email: "kappetipola@agri.lk",
      role: "market" as const,
      marketId: "kappetipola",
      createdAt: "2024-01-03T00:00:00.000Z",
      isActive: true,
    },
  ] as Admin[],
  categories: [
    { id: "cat-01", name: "Vegetables", nameSi: "එළවළු", emoji: "🥬" },
    { id: "cat-02", name: "Fruits", nameSi: "පළතුරු", emoji: "🍎" },
    { id: "cat-03", name: "Spices", nameSi: "කරුණු", emoji: "🌶️" },
  ] as Category[],
  items: [
    { id: "item-01", categoryId: "cat-01", name: "Carrots", nameSi: "කැරට්", emoji: "🥕", unit: "kg", minPrice: 150, maxPrice: 220 },
    { id: "item-02", categoryId: "cat-01", name: "Tomatoes", nameSi: "ටමැටෝ", emoji: "🍅", unit: "kg", minPrice: 180, maxPrice: 260 },
    { id: "item-03", categoryId: "cat-02", name: "Bananas", nameSi: "මොණරා", emoji: "🍌", unit: "bunch", minPrice: 60, maxPrice: 120 },
    { id: "item-04", categoryId: "cat-03", name: "Chili", nameSi: "මිරිස්", emoji: "🌶️", unit: "kg", minPrice: 300, maxPrice: 450 },
  ] as Item[],
  markets: [
    { id: "mkt-01", name: "Dambulla Economic Centre", nameSi: "දඹුල්ල ආර්ථික මධ්‍යස්ථානය", district: "Matale", emoji: "🏛️" },
    { id: "mkt-02", name: "Kappetipola Economic Centre", nameSi: "කටපේටිපොල ආර්ථික මධ්‍යස්ථානය", district: "Matale", emoji: "🌿" },
  ] as MarketCenter[],
};

export const ADMIN_SECTION_CONTENT = {
  admins: {
    title: "Admin Management",
    subtitle: "Manage admin accounts, access roles, and market assignments",
    countLabel: "Total Admins",
  },
  categories: {
    title: "Category Management",
    subtitle: "Add, edit, or organize produce categories",
    countLabel: "Total Categories",
  },
  items: {
    title: "Item Management",
    subtitle: "Manage produce items, measurement units, and price ranges",
    countLabel: "Items",
  },
  markets: {
    title: "Market Centers",
    subtitle: "Manage economic and trading centers across Sri Lanka",
    countLabel: "Total Centers",
  },
  settings: {
    title: "System Settings",
    subtitle: "Configure behavior, notifications, and system preferences",
  },
} as const;
