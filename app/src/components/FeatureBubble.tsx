import type { BubbleItem } from "@/data/content";

interface FeatureBubbleProps {
  bubble: BubbleItem;
  isActive: boolean;
  onClick: (id: number) => void;
}

export function FeatureBubble({ bubble, isActive, onClick }: FeatureBubbleProps) {
  const isCompleted = bubble.state === "completed";

  return (
    <button onClick={() => onClick(bubble.id)}
      className={`absolute flex items-center gap-2 px-4 py-2 rounded-[20px] text-[13px] font-medium cursor-pointer transition-all duration-200 hover:scale-105 ${
        isCompleted ? "bg-[rgba(46,204,113,0.9)] text-white"
        : isActive ? "bg-[rgba(26,188,156,0.95)] text-white"
        : "bg-[rgba(255,255,255,0.85)] text-[#333]"
      }`}
      style={{ left: bubble.position.left, top: bubble.position.top, boxShadow: isActive ? "0 4px 16px rgba(26, 188, 156, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
      {isCompleted ? (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isActive ? "bg-white" : "bg-[#1abc9c]"}`} />
      )}
      <span className="whitespace-nowrap">{bubble.text}</span>
    </button>
  );
}
