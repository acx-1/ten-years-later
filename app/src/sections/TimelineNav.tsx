import { useEffect, useRef } from "react";
import gsap from "gsap";
import { FeatureBubble } from "@/components/FeatureBubble";
import { timelineBubbles, months } from "@/data/content";

interface TimelineNavProps {
  activePanel: number;
  onPanelChange: (id: number) => void;
  isLoaded: boolean;
}

export function TimelineNav({ activePanel, onPanelChange, isLoaded }: TimelineNavProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progress = ((activePanel + 1) / 11) * 100;

  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, { width: `${progress}%`, duration: 0.5, ease: "power2.out" });
    }
  }, [progress]);

  useEffect(() => {
    if (isLoaded && timelineRef.current) {
      const bubbles = timelineRef.current.querySelectorAll(".timeline-bubble");
      gsap.fromTo(bubbles, { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.3 });
    }
  }, [isLoaded]);

  return (
    <div ref={timelineRef} className="absolute bottom-0 left-0 right-0 h-[180px] z-20">
      <div className="absolute top-[70px] left-0 right-0 h-[2px] bg-white/30">
        <div ref={progressRef} className="h-full bg-white/80" style={{ width: "0%" }} />
      </div>

      <div className="absolute top-[62px] w-4 h-4 rounded-full bg-white shadow-lg transition-all duration-500 z-30"
        style={{ left: `calc(${progress}% - 8px)`, boxShadow: "0 0 8px rgba(26, 188, 156, 0.5)" }} />

      <div className="absolute top-[85px] left-0 right-0 flex justify-between px-8">
        {months.map((month, index) => (
          <div key={month} className={`text-xs transition-colors duration-300 ${index <= (activePanel / 11) * 11 ? "text-white" : "text-white/50"}`}>
            {month}
          </div>
        ))}
      </div>

      <div className="absolute top-0 left-0 right-0 h-[120px] mx-8">
        {timelineBubbles.map((bubble) => (
          <div key={bubble.id} className="timeline-bubble">
            <FeatureBubble bubble={bubble} isActive={bubble.id === activePanel} onClick={onPanelChange} />
          </div>
        ))}
      </div>

      <div className="absolute top-[54px] left-1/2 -translate-x-1/2">
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-white/60" />
      </div>
    </div>
  );
}
