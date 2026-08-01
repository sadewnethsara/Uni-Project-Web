export type MarketType = "dambulla" | "kappetipola" | null;
export type SaveStatus = "idle" | "saving" | "saved";
export type SectionId = "general" | "notifications" | "ui" | "data" | "security";

export type AdminRole = "super" | "market" | "viewer";

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
}

export interface AdminRecord extends AdminAccount {
  role: AdminRole;
  marketId?: string;
  createdAt: string;
  isActive: boolean;
}

export interface AdminFormState {
  email: string;
  name: string;
  role: AdminRole;
  marketId: string;
}
