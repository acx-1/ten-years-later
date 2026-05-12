import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import gsap from "gsap";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DreamCard } from "@/components/DreamCard";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export default function Dreams() {
  const { user, isAuthenticated } = useAuth();
  const [selectedDream, setSelectedDream] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("学习");
  const [newDeadline, setNewDeadline] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().slice(0, 7);
  });
  const [newColor, setNewColor] = useState("#1abc9c");
  const [editingDream, setEditingDream] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("学习");
  const [editDeadline, setEditDeadline] = useState("");
  const pageRef = useRef<HTMLDivElement>(null);

  const { data: userDreams, refetch } = trpc.dream.listByUser.useQuery(
    undefined,
    { enabled: isAuthenticated && !!user }
  );

  const createDream = trpc.dream.create.useMutation({
    onSuccess: () => {
      toast.success("梦想创建成功");
      refetch();
      setShowAddForm(false);
      setNewTitle("");
      setNewDesc("");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateProgress = trpc.dream.updateProgress.useMutation({
    onSuccess: () => {
      toast.success("进度已更新");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateDream = trpc.dream.update.useMutation({
    onSuccess: () => {
      toast.success("梦想已更新");
      refetch();
      setEditingDream(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteDream = trpc.dream.delete.useMutation({
    onSuccess: () => {
      toast.success("梦想已删除");
      refetch();
      setSelectedDream(null);
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current.querySelectorAll(".animate-in"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" }
      );
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-14">
          <div className="text-center">
            <p className="text-gray-500 mb-4">请先登录后管理你的梦想</p>
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
  const avgProgress = dreams.length > 0
    ? Math.round(dreams.reduce((a, d) => a + d.progress, 0) / dreams.length)
    : 0;

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="pt-14">
        <div className="relative h-48 bg-gradient-to-r from-[#1abc9c] to-[#2ecc71] overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <img src="/images/hero-dreams.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
            <div className="animate-in">
              <h1 className="text-3xl font-bold text-white mb-2">我的梦想</h1>
              <p className="text-white/80">记录每一个值得追寻的目标</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-5 py-2.5 bg-white text-[#1abc9c] rounded-lg font-medium text-sm hover:bg-white/90 transition-colors shadow-lg cursor-pointer animate-in"
            >
              {showAddForm ? "取消" : "+ 添加梦想"}
            </button>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="max-w-[1200px] mx-auto px-6 mt-4 animate-in">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">新梦想</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">梦想名称 *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="给梦想起个名字"
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">分类</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c] bg-white"
                >
                  {["创业", "旅行", "学习", "艺术", "健康", "科技", "生活"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">描述</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="描述一下这个梦想..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c] resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">预期实现时间</label>
                <input
                  type="month"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">颜色</label>
                <div className="flex gap-2">
                  {["#1abc9c", "#3498db", "#e74c3c", "#f1c40f", "#9b59b6", "#2ecc71"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform ${newColor === c ? "scale-125 ring-2 ring-gray-300" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer bg-transparent border-none"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!newTitle.trim() || !user) return;
                  createDream.mutate({
                    title: newTitle,
                    description: newDesc,
                    category: newCategory,
                    deadline: newDeadline,
                    color: newColor,
                  });
                }}
                disabled={createDream.isPending || !newTitle.trim()}
                className="px-5 py-2 bg-[#1abc9c] text-white text-sm rounded-lg hover:bg-[#16a085] transition-colors cursor-pointer disabled:opacity-50"
              >
                {createDream.isPending ? "创建中..." : "创建梦想"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-6 mt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dreams List */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 animate-in">全部梦想 ({dreams.length})</h2>
            <div className="space-y-4">
              {dreams.map((dream) => (
                <div key={dream.id} className="animate-in">
                  <DreamCard
                    dream={dream}
                    onClick={() => setSelectedDream(selectedDream === dream.id ? null : dream.id)}
                  >
                    {selectedDream === dream.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {/* Actions */}
                        <div className="flex gap-2 mb-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingDream(dream.id);
                              setEditTitle(dream.title);
                              setEditDesc(dream.description || "");
                              setEditCategory(dream.category || "学习");
                              setEditDeadline(dream.deadline || "");
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#1abc9c]/10 text-[#1abc9c] rounded-full hover:bg-[#1abc9c]/20 cursor-pointer transition-colors border-none"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            编辑
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("确定要删除这个梦想吗？关联的日志也会被删除。")) {
                                deleteDream.mutate({ id: dream.id });
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-500 rounded-full hover:bg-red-100 cursor-pointer transition-colors border-none"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            删除
                          </button>
                        </div>

                        {/* Edit Form */}
                        {editingDream === dream.id && (
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c]"
                              placeholder="梦想名称"
                            />
                            <textarea
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c] resize-none"
                              rows={2}
                              placeholder="描述"
                            />
                            <div className="flex gap-2">
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c] bg-white"
                              >
                                {["创业", "旅行", "学习", "艺术", "健康", "科技", "生活"].map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                              <input
                                type="month"
                                value={editDeadline}
                                onChange={(e) => setEditDeadline(e.target.value)}
                                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c]"
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingDream(null)}
                                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 cursor-pointer bg-transparent border-none"
                              >
                                取消
                              </button>
                              <button
                                onClick={() => {
                                  if (!editTitle.trim()) return;
                                  updateDream.mutate({
                                    id: dream.id,
                                    title: editTitle,
                                    description: editDesc,
                                    category: editCategory,
                                    deadline: editDeadline,
                                  });
                                }}
                                disabled={updateDream.isPending}
                                className="px-4 py-1.5 text-xs bg-[#1abc9c] text-white rounded-lg hover:bg-[#16a085] cursor-pointer disabled:opacity-50"
                              >
                                {updateDream.isPending ? "保存中..." : "保存"}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Progress */}
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">更新进度</h4>
                        <div className="flex gap-2">
                          {[0, 25, 50, 75, 100].map((p) => (
                            <button
                              key={p}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProgress.mutate({ id: dream.id, progress: p });
                              }}
                              className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-colors ${
                                dream.progress >= p ? "bg-[#1abc9c] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {p}%
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </DreamCard>
                </div>
              ))}

              {dreams.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">还没有梦想，去添加一个吧</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-5 py-2 bg-[#1abc9c] text-white rounded-lg cursor-pointer hover:bg-[#16a085]"
                  >
                    添加梦想
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-5 shadow-sm animate-in">
              <h3 className="font-semibold text-gray-800 mb-4">统计概览</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">总梦想数</span>
                  <span className="text-lg font-bold text-[#1abc9c]">{dreams.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">平均进度</span>
                  <span className="text-lg font-bold text-[#3498db]">{avgProgress}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">已完成</span>
                  <span className="text-lg font-bold text-[#2ecc71]">{dreams.filter((d) => d.progress === 100).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">进行中</span>
                  <span className="text-lg font-bold text-[#f1c40f]">{dreams.filter((d) => d.progress < 100).length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm mt-4 animate-in">
              <h3 className="font-semibold text-gray-800 mb-3">快捷入口</h3>
              <div className="space-y-2">
                <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1abc9c] transition-colors no-underline">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  我的仪表盘
                </Link>
                <Link to="/explore" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1abc9c] transition-colors no-underline">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  探索他人梦想
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
