import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";
import gsap from "gsap";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CommentList } from "@/components/CommentList";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

const categories = ["全部", "创业", "旅行", "学习", "艺术", "健康", "科技", "生活"];

function useQueryParam(key: string): string {
  const location = useLocation();
  return new URLSearchParams(location.search).get(key) || "";
}

export default function Explore() {
  const urlQuery = useQueryParam("q");
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const pageRef = useRef<HTMLDivElement>(null);

  const { data: feed } = trpc.explore.feed.useQuery();
  const { data: searchResults } = trpc.explore.search.useQuery(
    { query: searchQuery.trim() },
    { enabled: searchQuery.trim().length > 0 }
  );
  const { data: recentLogs } = trpc.explore.recentLogs.useQuery();
  const { data: stats } = trpc.explore.stats.useQuery();

  const isSearching = searchQuery.trim().length > 0;
  const feedList = feed || [];
  const searchList = searchResults || [];

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current.querySelectorAll(".animate-in"),
        { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" });
    }
  }, [activeCategory]);

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-14">
        <div className="relative h-56 bg-gradient-to-r from-[#16a085] to-[#1abc9c] overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <img src="/images/hero-explore.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 max-w-[1200px] mx-auto px-6 h-full flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-white mb-2 animate-in">探索梦想</h1>
            <p className="text-white/80 animate-in">发现他人的梦想，找到志同道合的人</p>
            {stats && (
              <div className="flex gap-6 mt-4 animate-in">
                <span className="text-white/80 text-sm">{stats.totalUsers} 用户</span>
                <span className="text-white/80 text-sm">{stats.totalDreams} 梦想</span>
                <span className="text-white/80 text-sm">{stats.totalLogs} 日志</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-6">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3 mb-6 animate-in">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                // Search is auto-triggered by React Query
              }
            }}
            placeholder="搜索梦想、用户或主题..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none"
            >
              清除
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-8 animate-in">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeCategory === cat ? "bg-[#1abc9c] text-white" : "bg-white text-gray-600 hover:bg-gray-100"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dreams */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 animate-in">最新梦想</h2>
            <div className="space-y-4">
              {isSearching
                ? searchList
                    .filter((d) => activeCategory === "全部" || d.category === activeCategory)
                    .map((dream) => (
                      <ExploreDreamCard key={dream.id} dream={dream} />
                    ))
                : feedList
                    .filter((d) => activeCategory === "全部" || d.category === activeCategory)
                    .map((dream) => (
                      <ExploreDreamCard key={dream.id} dream={dream} />
                    ))}
              {feedList.length === 0 && !isSearching && (
                <p className="text-gray-400 text-sm text-center py-8">暂无数据</p>
              )}
              {isSearching && searchList.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8">未找到匹配的梦想</p>
              )}
            </div>
          </div>

          {/* Logs */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 animate-in">梦想动态</h2>
            <div className="space-y-4">
              {(recentLogs || []).map((log) => (
                <ExploreLogCard key={log.id} log={log} />
              ))}
              {(!recentLogs || recentLogs.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-8">暂无动态</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12"><Footer /></div>
    </div>
  );
}

// Dream card with follow button
function ExploreDreamCard({ dream }: { dream: { id: number; title: string; description: string | null; category: string | null; progress: number; color: string | null; deadline: string | null; createdAt: Date; userName: string; userId?: number } }) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 animate-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-[#1abc9c]/10 flex items-center justify-center text-[#1abc9c] font-bold text-xs">
          {(dream.userName || "?")[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm truncate">{dream.userName || "匿名"}</h3>
          <span className="text-xs text-gray-400">{new Date(dream.createdAt).toLocaleDateString("zh-CN")}</span>
        </div>
        {dream.userId && <FollowButton userId={dream.userId} />}
        <span className="px-2 py-0.5 bg-[#1abc9c]/10 text-[#1abc9c] text-xs rounded-full flex-shrink-0">{dream.category}</span>
      </div>
      <h4 className="font-medium text-gray-800">{dream.title}</h4>
      <p className="text-sm text-gray-500 mt-1">{dream.description}</p>
      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${dream.progress}%`, backgroundColor: dream.color || "#1abc9c" }} />
      </div>
      <span className="text-xs text-gray-400 mt-1">{dream.progress}%</span>
    </div>
  );
}

// Log card with follow button
function ExploreLogCard({ log }: { log: { id: number; dreamId: number; userId: number; content: string; likes: number; createdAt: Date; userName: string; dreamTitle: string } }) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 animate-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-[#1abc9c]/10 flex items-center justify-center text-[#1abc9c] text-xs font-bold">
          {(log.userName || "?")[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm">{log.userName || "匿名"}</h3>
          <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleDateString("zh-CN")}</span>
        </div>
        <FollowButton userId={log.userId} />
        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{log.dreamTitle}</span>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">{log.content}</p>
      <div className="mt-3 flex items-center gap-4">
        <LikeButton logId={log.id} likes={log.likes} />
      </div>
      <CommentList logId={log.id} />
    </div>
  );
}

// Follow button component
function FollowButton({ userId }: { userId: number }) {
  const { isAuthenticated, user } = useAuth();
  const utils = trpc.useUtils();
  const isSelf = user?.id === userId;

  const { data: followStatus } = trpc.follow.check.useQuery(
    { userId },
    { enabled: isAuthenticated && !isSelf }
  );

  const toggleFollow = trpc.follow.toggle.useMutation({
    onSuccess: () => {
      utils.follow.check.invalidate({ userId });
      utils.follow.followersCount.invalidate({ userId });
      utils.follow.followingCount.invalidate({ userId: user?.id ?? 0 });
    },
    onError: (err) => toast.error(err.message),
  });

  if (!isAuthenticated || isSelf) return null;

  const isFollowing = followStatus?.following ?? false;

  return (
    <button
      onClick={() => toggleFollow.mutate({ userId })}
      disabled={toggleFollow.isPending}
      className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-colors border-none flex-shrink-0 ${
        isFollowing
          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
          : "bg-[#1abc9c] text-white hover:bg-[#16a085]"
      }`}
    >
      {toggleFollow.isPending ? "..." : isFollowing ? "已关注" : "+ 关注"}
    </button>
  );
}

// Like button component
function LikeButton({ logId, likes }: { logId: number; likes: number }) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: likeStatus } = trpc.like.check.useQuery(
    { logId },
    { enabled: isAuthenticated }
  );

  const toggleLike = trpc.like.toggle.useMutation({
    onSuccess: () => {
      utils.like.check.invalidate({ logId });
      utils.explore.recentLogs.invalidate();
    },
  });

  const isLiked = likeStatus?.liked ?? false;

  return (
    <button
      onClick={() => {
        if (!isAuthenticated) {
          toast.error("请先登录");
          return;
        }
        toggleLike.mutate({ logId });
      }}
      disabled={toggleLike.isPending}
      className={`flex items-center gap-1 text-xs transition-colors cursor-pointer bg-transparent border-none ${
        isLiked ? "text-[#e74c3c]" : "text-gray-400 hover:text-[#e74c3c]"
      }`}
    >
      <svg
        className="w-4 h-4"
        fill={isLiked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {likes}
    </button>
  );
}
