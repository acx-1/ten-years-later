import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { defaultDreams } from "@/data/content";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"timeline" | "logs" | "saved">("timeline");
  const [newDreamTitle, setNewDreamTitle] = useState("");
  const [newDreamDesc, setNewDreamDesc] = useState("");
  const [newLogContent, setNewLogContent] = useState("");
  const [selectedDreamId, setSelectedDreamId] = useState<number | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const { data: userDreams, refetch: refetchDreams } = trpc.dream.listByUser.useQuery(
    { userId: user?.id ?? 0, userType: "local" },
    { enabled: isAuthenticated && !!user }
  );

  const { data: userLogs, refetch: refetchLogs } = trpc.log.listByUser.useQuery(
    { userId: user?.id ?? 0 },
    { enabled: isAuthenticated && !!user }
  );

  const createDream = trpc.dream.create.useMutation({
    onSuccess: () => { refetchDreams(); setNewDreamTitle(""); setNewDreamDesc(""); },
  });

  const createLog = trpc.log.create.useMutation({
    onSuccess: () => { refetchLogs(); setNewLogContent(""); },
  });

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current.querySelectorAll(".animate-in"),
        { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" });
    }
  }, [activeTab]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-14">
          <div className="text-center">
            <p className="text-gray-500 mb-4">请先登录后查看你的空间</p>
            <Link to="/login" className="px-5 py-2 bg-[#1abc9c] text-white rounded-lg no-underline hover:bg-[#16a085]">
              去登录
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const dreams = userDreams || [];
  const logs = userLogs || [];

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="relative pt-14">
        <div className="h-48 bg-gradient-to-r from-[#1abc9c] to-[#16a085] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src="/images/hero-dashboard.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 max-w-[1200px] mx-auto px-6 h-full flex items-center">
            <div className="flex items-center gap-4 animate-in">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.[0] || "?"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.name || "用户"}</h1>
                <p className="text-white/80 text-sm">@{user?.username} · 加入十年后</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 -mt-6 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in">
          {[
            { label: "梦想", value: dreams.length, icon: "⭐" },
            { label: "日志", value: logs.length, icon: "📝" },
            { label: "进度", value: `${dreams.length > 0 ? Math.round(dreams.reduce((a, d) => a + d.progress, 0) / dreams.length) : 0}%`, icon: "📊" },
            { label: "关注", value: "0", icon: "👥" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-[#1abc9c]">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-8">
        <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm w-fit animate-in">
          {([
            { key: "timeline", label: "梦想时间线" },
            { key: "logs", label: "我的日志" },
          ] as const).map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                activeTab === tab.key ? "bg-[#1abc9c] text-white" : "text-gray-600 hover:text-[#1abc9c] hover:bg-gray-50"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-6 pb-12">
        {activeTab === "timeline" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between animate-in">
              <h2 className="text-lg font-semibold text-gray-800">我的梦想</h2>
              {dreams.length === 0 && (
                <button onClick={() => {
                  defaultDreams.forEach((d, i) => {
                    setTimeout(() => {
                      createDream.mutate({
                        userId: user?.id || 0, userType: "local",
                        title: d.title, description: d.description,
                        category: d.category, deadline: d.deadline, color: d.color,
                      });
                    }, i * 200);
                  });
                }} className="px-4 py-2 bg-[#1abc9c] text-white text-sm rounded-lg hover:bg-[#16a085] cursor-pointer transition-colors">
                  初始化示例梦想
                </button>
              )}
            </div>

            {dreams.map((dream) => (
              <div key={dream.id} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 animate-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: dream.color || "#1abc9c" }}>
                      {dream.title[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{dream.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{dream.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{dream.category}</span>
                        <span className="text-xs text-gray-400">截止: {dream.deadline}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: dream.color || "#1abc9c" }}>
                    {dream.progress}%
                  </span>
                </div>
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${dream.progress}%`, backgroundColor: dream.color || "#1abc9c" }} />
                </div>
              </div>
            ))}

            {/* Add Dream Form */}
            <div className="bg-white rounded-lg p-5 shadow-sm animate-in">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">添加新梦想</h3>
              <div className="flex gap-3">
                <input type="text" value={newDreamTitle} onChange={(e) => setNewDreamTitle(e.target.value)}
                  placeholder="梦想名称" className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c]" />
                <input type="text" value={newDreamDesc} onChange={(e) => setNewDreamDesc(e.target.value)}
                  placeholder="描述" className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c]" />
                <button onClick={() => {
                  if (!newDreamTitle.trim() || !user) return;
                  createDream.mutate({ userId: user.id, userType: "local", title: newDreamTitle, description: newDreamDesc });
                }} disabled={createDream.isPending}
                  className="px-4 py-2 bg-[#1abc9c] text-white text-sm rounded-lg hover:bg-[#16a085] cursor-pointer transition-colors disabled:opacity-50">
                  {createDream.isPending ? "..." : "添加"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 animate-in">最近日志</h2>

            {logs.map((log) => (
              <div key={log.id} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 animate-in">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-[#1abc9c]">梦想 #{log.dreamId}</span>
                  <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleDateString("zh-CN")}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{log.content}</p>
                <div className="mt-3 flex items-center gap-4">
                  <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#e74c3c] transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {log.likes}
                  </button>
                </div>
              </div>
            ))}

            {/* Quick Log */}
            <div className="bg-white rounded-lg p-5 shadow-sm animate-in">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">快速记录</h3>
              <div className="flex gap-3">
                <select value={selectedDreamId || ""} onChange={(e) => setSelectedDreamId(Number(e.target.value))}
                  className="h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c]">
                  <option value="">选择梦想</option>
                  {dreams.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
                <input type="text" value={newLogContent} onChange={(e) => setNewLogContent(e.target.value)}
                  placeholder="今天有什么进展？" className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c]" />
                <button onClick={() => {
                  if (!newLogContent.trim() || !selectedDreamId || !user) return;
                  createLog.mutate({ dreamId: selectedDreamId, userId: user.id, userType: "local", content: newLogContent });
                }} disabled={createLog.isPending}
                  className="px-4 py-2 bg-[#1abc9c] text-white text-sm rounded-lg hover:bg-[#16a085] cursor-pointer transition-colors disabled:opacity-50">
                  {createLog.isPending ? "..." : "发布"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
