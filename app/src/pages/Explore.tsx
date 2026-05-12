import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { trpc } from "@/providers/trpc";

const categories = ["全部", "创业", "旅行", "学习", "艺术", "健康", "科技", "生活"];

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const pageRef = useRef<HTMLDivElement>(null);

  const { data: feed } = trpc.explore.feed.useQuery();
  const { data: recentLogs } = trpc.explore.recentLogs.useQuery();
  const { data: stats } = trpc.explore.stats.useQuery();

  const filteredDreams = feed?.filter((d) =>
    activeCategory === "全部" || d.category === activeCategory
  ) || [];

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
              {filteredDreams.map((dream) => (
                <div key={dream.id} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 animate-in">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-[#1abc9c]/10 flex items-center justify-center text-[#1abc9c] font-bold text-xs">
                      {(dream.userName || "?")[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{dream.userName || "匿名"}</h3>
                      <span className="text-xs text-gray-400">{new Date(dream.createdAt).toLocaleDateString("zh-CN")}</span>
                    </div>
                    <span className="ml-auto px-2 py-0.5 bg-[#1abc9c]/10 text-[#1abc9c] text-xs rounded-full">{dream.category}</span>
                  </div>
                  <h4 className="font-medium text-gray-800">{dream.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{dream.description}</p>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${dream.progress}%`, backgroundColor: dream.color || "#1abc9c" }} />
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{dream.progress}%</span>
                </div>
              ))}
              {filteredDreams.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8">暂无数据</p>
              )}
            </div>
          </div>

          {/* Logs */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 animate-in">梦想动态</h2>
            <div className="space-y-4">
              {(recentLogs || []).map((log) => (
                <div key={log.id} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 animate-in">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#1abc9c]/10 flex items-center justify-center text-[#1abc9c] text-xs font-bold">
                      {(log.userName || "?")[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{log.userName || "匿名"}</h3>
                      <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleDateString("zh-CN")}</span>
                    </div>
                    <span className="ml-auto px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{log.dreamTitle}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{log.content}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {log.likes}
                    </span>
                  </div>
                </div>
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
