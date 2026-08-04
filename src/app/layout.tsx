import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono, Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import Header from "@/components/Header";
import ConditionalFloatingChat from "@/components/ConditionalFloatingChat";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const rocGrotesk = localFont({
  src: [
    {
      path: "./fonts/roc-grotesk-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/roc-grotesk-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-roc-grotesk",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NAMIS - National Agricultural Market Information System",
  description: "Real-time agricultural commodity prices, trends, and market intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", spaceGrotesk.variable, geistMono.variable, rocGrotesk.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#fdf6e3]">
        <LanguageProvider>
          <AuthProvider>
            <Header />
            <ConditionalFloatingChat />
            <main className="flex-1 w-full max-w-8xl mx-auto">
              {children}
            </main>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}