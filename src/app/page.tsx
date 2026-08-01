import Hero from "@/components/Hero";
import AppShowcase from "@/components/landing/AppShowcase";
import LandingNewsletter from "@/components/landing/LandingNewsletter";
import LandingFooter from "@/components/landing/LandingFooter";
import ScrollProgress from "@/components/landing/ScrollProgress";

export default function Home() {
  return (
    <div className="w-full">
      <ScrollProgress />
      <Hero />
      <AppShowcase />
      <LandingNewsletter />
      <LandingFooter />
    </div>
  );
}