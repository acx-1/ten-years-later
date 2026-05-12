import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { LoginForm } from "@/components/LoginForm";
import { ContentPanel } from "@/components/ContentPanel";
import { loginPanel, storyPanels, featurePanels } from "@/data/content";

interface HeroSectionProps {
  activePanel: number;
  onPanelChange: (id: number) => void;
  isLoaded: boolean;
  isAuthenticated: boolean;
}

export function HeroSection({ activePanel, onPanelChange, isLoaded, isAuthenticated }: HeroSectionProps) {
  const [displayPanel, setDisplayPanel] = useState(activePanel);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const allPanels = [...storyPanels, loginPanel, ...featurePanels];
  const currentContent = allPanels.find((p) => p.id === displayPanel) || loginPanel;
  const isLoginPanel = displayPanel === 5;

  const transitionToPanel = useCallback(
    (newId: number) => {
      if (isTransitioning || newId === displayPanel) return;
      setIsTransitioning(true);

      const tl = gsap.timeline({
        onComplete: () => {
          setDisplayPanel(newId);
          setIsTransitioning(false);
          if (contentRef.current) {
            gsap.fromTo(
              contentRef.current,
              { opacity: 0, x: 60 },
              { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
            );
          }
        },
      });

      if (contentRef.current) {
        tl.to(contentRef.current, {
          opacity: 0,
          x: -60,
          duration: 0.35,
          ease: "power2.in",
        });
      } else {
        setDisplayPanel(newId);
        setIsTransitioning(false);
      }
    },
    [displayPanel, isTransitioning]
  );

  useEffect(() => {
    if (activePanel !== displayPanel && !isTransitioning) {
      transitionToPanel(activePanel);
    }
  }, [activePanel, displayPanel, isTransitioning, transitionToPanel]);

  useEffect(() => {
    if (isLoaded && heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }
  }, [isLoaded]);

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ opacity: isLoaded ? 1 : 0 }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/images/bg-hero.jpg)", transform: "scale(1.05)" }}
      />
      <div className="absolute inset-0 bg-black/15" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 flex items-center">
        {/* Left Column - Login Form (only when not authenticated) */}
        {!isAuthenticated && (
          <div className="flex-shrink-0 mr-12">
            <LoginForm />
          </div>
        )}

        {/* Right Column - Content */}
        <div className={`flex-1 relative h-[400px] ${isAuthenticated ? 'w-full' : ''}`}>
          {isLoginPanel ? (
            <div ref={contentRef} className="absolute inset-0 flex items-center">
              <div className={`${isAuthenticated ? 'max-w-2xl mx-auto text-center' : 'max-w-lg'}`}>
                <h1
                  className="text-[28px] font-semibold text-white mb-4 leading-tight"
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
                >
                  {isAuthenticated ? `欢迎回来！` : loginPanel.headline}
                </h1>
                <p
                  className="text-base text-white leading-relaxed mb-5"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
                >
                  {isAuthenticated
                    ? "继续记录你的梦想旅程，每一步都值得被记住。"
                    : loginPanel.description}
                </p>
                <div className="flex items-center gap-3 mb-5">
                  <button
                    onClick={() => onPanelChange(6)}
                    className="text-[#1abc9c] text-sm hover:underline cursor-pointer bg-transparent border-none"
                  >
                    {isAuthenticated ? "查看功能介绍" : "进站探索一下"}
                  </button>
                  <span className="text-white/70 text-sm">或者</span>
                  <svg className="w-3 h-3 text-[#1abc9c] animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {isAuthenticated ? (
                  <div className="flex gap-3 justify-center">
                    <Link
                      to="/dashboard"
                      className="px-5 py-2 bg-[#1abc9c] text-white rounded-lg text-sm hover:bg-[#16a085] transition-colors no-underline"
                    >
                      我的空间
                    </Link>
                    <Link
                      to="/dreams"
                      className="px-5 py-2 bg-white/90 text-gray-800 rounded-lg text-sm hover:bg-white transition-colors no-underline"
                    >
                      管理梦想
                    </Link>
                  </div>
                ) : (
                  <div className="relative w-[280px]">
                    <input
                      type="text"
                      placeholder="搜索你的梦想"
                      className="w-full h-10 pl-4 pr-10 text-sm bg-white/90 rounded border-none focus:outline-none focus:ring-2 focus:ring-[#1abc9c]/50"
                    />
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ) : currentContent.type !== "login" ? (
            <div ref={contentRef} key={displayPanel}>
              <ContentPanel content={currentContent} isActive={true} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
