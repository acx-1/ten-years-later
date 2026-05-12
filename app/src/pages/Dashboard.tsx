import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import gsap from "gsap";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DreamCard } from "@/components/DreamCard";
import { CommentList } from "@/components/CommentList";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { defaultDreams } from "@/data/content";

interface LogWithDreamTitle {
  id: number;
  dreamId: number;
  content: string;
  likes: number;
  createdAt: Date;
  dreamTitle: string;
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "logs">("overview");
  const [newLogContent, setNewLogContent] = useState("");
  const [selectedDreamId, setSelectedDreamId] = useState<number | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const { data: userDreams, refetch: refetchDreams } = trpc.dream.listByUser.useQuery(
    undefined,
    { enabled: isAuthenticated && !!user }
  );

  const { data: userLogs, refetch: refetchLogs } = trpc.log.listByUser.useQuery(
    undefined,
    { enabled: isAuthenticated && !!user }
  );

  const utils = trpc.useUtils();

  const createLog = trpc.log.create.useMutation({
    onSuccess: () => {
      toast.success("日志发布成功");
      refetchLogs();
      setNewLogContent("");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteLog = trpc.log.delete.useMutation({
    onSuccess: () => {
      toast.success("日志已删除");
      refetchLogs();
    },
    onError: (err) => toast.error(err.message),
  });

  const createDream = trpc.dream.create.useMutation({
    onSuccess: () => refetchDreams(),
  });

  const toggleLike = trpc.like.toggle.useMutation({
    onSuccess: () => {
      refetchLogs();
      utils.like.check.invalidate();
    },
  });

  // Set default selected dream when dreams load
  useEffect(() => {
    if (userDreams && userDreams.length > 0 && selectedDreamId === null) {
      setSelectedDreamId(userDreams[0].id);
    }
  }, [userDreams, selectedDreamId]);

  // Animation
  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current.querySelectorAll(".animate-in"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
      );
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
  const logs = (userLogs || []) as LogWithDreamTitle[];

  const selectedDream = dreams.find((d) => d.id === selectedDreamId);

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Banner */}
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

      {/* Stats */}
      <div className="max-w-[1200px] mx-auto px-6 -mt-6 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in">
          {[
            { label: "梦想", value: dreams.length },
            { label: "日志", value: logs.length },
            { label: "进度", value: `${dreams.length > 0 ? Math.round(dreams.reduce((a, d) => a + d.progress, 0) / dreams.length) : 0}%` },
            { label: "已完成", value: dreams.filter((d) => d.progress === 100).length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-[#1abc9c]">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-[1200px] mx-auto px-6 mt-8">
        <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm w-fit animate-in">
          {([
            { key: "overview", label: "概览" },
            { key: "logs", label: "我的日志" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#1abc9c] text-white"
                  : "text-gray-600 hover:text-[#1abc9c] hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 mt-6 pb-12">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between animate-in">
              <h2 className="text-lg font-semibold text-gray-800">最近活跃</h2>
              <Link to="/dreams" className="text-sm text-[#1abc9c] hover:text-[#16a085] no-underline">
                管理全部梦想 →
              </Link>
            </div>

            {dreams.length === 0 && (
              <div className="bg-white rounded-lg p-8 shadow-sm text-center animate-in">
                <p className="text-gray-400 mb-4">还没有梦想，创建你的第一个吧</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      defaultDreams.slice(0, 2).forEach((d, i) => {
                        setTimeout(() => {
                          createDream.mutate({
                            title: d.title,
                            description: d.description,
                            category: d.category,
                            deadline: d.deadline,
                            color: d.color,
                          });
                        }, i * 200);
                      });
                      toast.success("示例梦想已创建");
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    初始化示例
                  </button>
                  <Link to="/dreams" className="px-4 py-2 bg-[#1abc9c] text-white text-sm rounded-lg hover:bg-[#16a085] no-underline">
                    去创建
                  </Link>
                </div>
              </div>
            )}

            {dreams.slice(0, 3).map((dream) => (
              <div key={dream.id} className="animate-in">
                <DreamCard dream={dream} variant="compact" />
              </div>
            ))}

            {/* Quick Stats */}
            {dreams.length > 0 && (
              <div className="grid grid-cols-3 gap-3 animate-in">
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <div className="text-lg font-bold text-[#1abc9c]">{dreams.length}</div>
                  <div className="text-xs text-gray-400">梦想</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <div className="text-lg font-bold text-[#3498db]">
                    {Math.round(dreams.reduce((a, d) => a + d.progress, 0) / dreams.length)}%
                  </div>
                  <div className="text-xs text-gray-400">平均进度</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <div className="text-lg font-bold text-[#2ecc71]">
                    {dreams.filter((d) => d.progress === 100).length}
                  </div>
                  <div className="text-xs text-gray-400">已完成</div>
                </div>
              </div>
            )}

            {/* Quick Log */}
            {dreams.length > 0 && (
              <div className="bg-white rounded-lg p-5 shadow-sm animate-in">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">快速记录</h3>
                {/* Dream selector */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">选择梦想</label>
                  <select
                    value={selectedDreamId ?? ""}
                    onChange={(e) => setSelectedDreamId(Number(e.target.value))}
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c] bg-white"
                  >
                    {dreams.map((dream) => (
                      <option key={dream.id} value={dream.id}>
                        {dream.title} ({dream.progress}%)
                      </option>
                    ))}
                  </select>
                </div>
                {selectedDreamId ? (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newLogContent}
                      onChange={(e) => setNewLogContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newLogContent.trim() && selectedDreamId) {
                          createLog.mutate({ dreamId: selectedDreamId, content: newLogContent });
                        }
                      }}
                      placeholder={`记录到 "${selectedDream?.title || "梦想"}"... 按回车快速发布`}
                      className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c]"
                    />
                    <button
                      onClick={() => {
                        if (newLogContent.trim() && selectedDreamId) {
                          createLog.mutate({ dreamId: selectedDreamId, content: newLogContent });
                        }
                      }}
                      disabled={createLog.isPending || !newLogContent.trim()}
                      className="px-4 py-2 bg-[#1abc9c] text-white text-sm rounded-lg hover:bg-[#16a085] cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {createLog.isPending ? "..." : "发布"}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    先<Link to="/dreams" className="text-[#1abc9c] no-underline">创建一个梦想</Link>才能记录日志
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 animate-in">最近日志</h2>

            {logs.map((log) => (
              <div key={log.id} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 animate-in">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-[#1abc9c]/10 text-[#1abc9c] text-xs rounded-full">
                    {log.dreamTitle}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{log.content}</p>
                <div className="mt-3 flex items-center gap-4">
                  <LikeButton logId={log.id} likes={log.likes} />
                  <button
                    onClick={() => {
                      if (confirm("确定要删除这条日志吗？")) {
                        deleteLog.mutate({ id: log.id });
                      }
                    }}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    删除
                  </button>
                </div>
                <CommentList logId={log.id} />
              </div>
            ))}

            {logs.length === 0 && (
              <div className="bg-white rounded-lg p-8 shadow-sm text-center animate-in">
                <p className="text-gray-400">还没有日志，开始记录吧</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// Like button component with optimistic UI
function LikeButton({ logId, likes }: { logId: number; likes: number }) {
  const { isAuthenticated } = useAuth();
  const { data: likeStatus } = trpc.like.check.useQuery(
    { logId },
    { enabled: isAuthenticated }
  );
  const utils = trpc.useUtils();

  const toggleLike = trpc.like.toggle.useMutation({
    onSuccess: () => {
      utils.like.check.invalidate({ logId });
      utils.log.listByUser.invalidate();
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
