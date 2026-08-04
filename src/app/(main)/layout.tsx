
import Header from "@/components/Header";
import ConditionalFooter from "@/components/ConditionalFooter";
import ConditionalFloatingChat from "@/components/ConditionalFloatingChat";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div suppressHydrationWarning className="min-h-full flex flex-col bg-[#fdf6e3]">
        <AuthProvider>
          <ConditionalFloatingChat />
          {/* Note: removed the class string 'suppressHydrationWarning' here since it is an attribute, not a class name */}
          <main className="flex-1 w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-4 pb-4 sm:pb-6 lg:pb-4">
            {children}
          </main>
        </AuthProvider>
      </div>
    </div>
  );
}