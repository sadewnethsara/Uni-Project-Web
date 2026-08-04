import { DataLoader } from "@/components/ui/DataLoader";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fdf6e3] dark:bg-[#12161c] p-4">
      <DataLoader
        label="Loading NAMIS Market System..."
        sublabel="Gathering agricultural market intelligence & real-time commodity data"
        minHeight="min-h-[320px]"
      />
    </div>
  );
}
