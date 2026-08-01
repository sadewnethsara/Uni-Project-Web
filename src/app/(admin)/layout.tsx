import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono, Geist } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/contexts/AuthContext";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const rocGrotesk = localFont({
  src: [
    {
      path: "../fonts/roc-grotesk-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/roc-grotesk-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-roc-grotesk",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin - Agri",
  description: "Admin Panel for Agri",
};

export default function AdminLayout({
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
      <body suppressHydrationWarning className="min-h-screen bg-[#fdf6e3]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
