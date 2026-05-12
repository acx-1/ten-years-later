import { forwardRef } from "react";
import type { PanelContent } from "@/data/content";

interface ContentPanelProps {
  content: PanelContent;
  isActive: boolean;
}

export const ContentPanel = forwardRef<HTMLDivElement, ContentPanelProps>(
  ({ content, isActive }, ref) => {
    if (content.type === "story") {
      return (
        <div ref={ref}
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="max-w-xl text-center px-8">
            <h1 className="text-[28px] font-semibold text-white mb-4" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
              {content.title}
            </h1>
            <h3 className="text-sm text-[#1abc9c] mb-4 font-medium">{content.username}</h3>
            <p className="text-sm text-white/90 leading-relaxed" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
              {content.description}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref}
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="max-w-4xl w-full flex items-center gap-12 px-8">
          <div className="flex-1">
            <h1 className="text-[28px] font-semibold text-white mb-4" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
              {content.title}
            </h1>
            <p className="text-base text-white/90 leading-relaxed" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
              {content.description}
            </p>
          </div>
          <div className="w-72 h-52 rounded-lg overflow-hidden shadow-xl flex-shrink-0">
            <img src={content.image} alt={content.title} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    );
  }
);

ContentPanel.displayName = "ContentPanel";
