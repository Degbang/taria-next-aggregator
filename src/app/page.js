import { HomeHero } from "@/components/HomeHero";
import { QuickAccess } from "@/components/QuickAccess";

export default function Home() {
  return (
    <div className="home-page">
      <HomeHero />
      <QuickAccess />
    </div>
  );
}
