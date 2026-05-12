import { Link } from "react-router";

interface Dream {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  deadline: string | null;
  progress: number;
  color: string | null;
}

interface DreamCardProps {
  dream: Dream;
  variant?: "compact" | "full";
  onClick?: () => void;
  children?: React.ReactNode;
}

export function DreamCard({ dream, variant = "full", onClick, children }: DreamCardProps) {
  const bgColor = dream.color || "#1abc9c";

  if (variant === "compact") {
    return (
      <Link
        to="/dreams"
        className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all no-underline"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ backgroundColor: bgColor }}
          >
            {dream.title[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-800 text-sm truncate">{dream.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400">{dream.progress}%</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${dream.progress}%`, backgroundColor: bgColor }}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-all ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: bgColor }}
          >
            {dream.title[0]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{dream.title}</h3>
            {dream.description && (
              <p className="text-sm text-gray-500 mt-0.5">{dream.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {dream.category && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {dream.category}
                </span>
              )}
              {dream.deadline && (
                <span className="text-xs text-gray-400">截止: {dream.deadline}</span>
              )}
            </div>
          </div>
        </div>
        <span className="text-lg font-bold flex-shrink-0" style={{ color: bgColor }}>
          {dream.progress}%
        </span>
      </div>
      <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${dream.progress}%`, backgroundColor: bgColor }}
        />
      </div>
      {children}
    </div>
  );
}
