"use client";

import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <main className="flex-1 w-full min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-4 pb-4 sm:pb-6 lg:pb-4">
      {children}
    </main>
  );
}
