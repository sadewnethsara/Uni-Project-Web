"use client";

import { usePathname } from "next/navigation";
import FloatingChat from "./FloatingChat";

export default function ConditionalFloatingChat() {
  const pathname = usePathname();
  
  const hiddenPaths = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/about-us",
    "/contact",
    "/faq",
    "/privacy",
    "/support-desk",
    "/terms"
  ];

  if (hiddenPaths.includes(pathname)) {
    return null;
  }
  
  return <FloatingChat />;
}
