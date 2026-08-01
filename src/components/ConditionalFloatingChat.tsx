"use client";

import { usePathname } from "next/navigation";
import FloatingChat from "./FloatingChat";

export default function ConditionalFloatingChat() {
  const pathname = usePathname();
  
  // Hide floating chat on landing page only
  if (pathname === "/") {
    return null;
  }
  
  return <FloatingChat />;
}
