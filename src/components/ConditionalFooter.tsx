"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

/** Footer only on non-landing pages. Landing page has custom LandingFooter component. */
export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <Footer />;
}
