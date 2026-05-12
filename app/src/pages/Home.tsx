import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/sections/HeroSection";
import { TimelineNav } from "@/sections/TimelineNav";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { useAuth } from "@/hooks/useAuth";

const bubbleRoutes: Record<number, string> = {
  6: "/dashboard",
  7: "/dashboard",
  8: "/explore",
  9: "/explore",
  10: "/dreams",
};

export default function Home() {
  const [activePanel, setActivePanel] = useState(5);
  const isLoaded = useImagePreloader("/images/bg-hero.jpg");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handlePanelChange = useCallback((id: number) => {
    if (id >= 6 && isAuthenticated && bubbleRoutes[id]) {
      navigate(bubbleRoutes[id]);
      return;
    }
    setActivePanel(id);
  }, [isAuthenticated, navigate]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-900">
      <Navbar />

      <div className="relative min-h-screen">
        <HeroSection
          activePanel={activePanel}
          onPanelChange={handlePanelChange}
          isLoaded={isLoaded}
          isAuthenticated={isAuthenticated}
        />

        <TimelineNav
          activePanel={activePanel}
          onPanelChange={handlePanelChange}
          isLoaded={isLoaded}
        />
      </div>

      {/* Quick access buttons for logged in users */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
          <Link
            to="/dreams"
            className="w-12 h-12 bg-[#1abc9c] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#16a085] transition-colors no-underline"
            title="管理梦想"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
