import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import gsap from "gsap";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

type TabKey = "profile" | "followers" | "following";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBio, setEditBio] = useState("");
  const pageRef = useRef<HTMLDivElement>(null);

  const { data: followers } = trpc.follow.followers.useQuery(
    { userId: user?.id ?? 0 },
    { enabled: isAuthenticated && !!user }
  );
  const { data: following } = trpc.follow.following.useQuery(
    { userId: user?.id ?? 0 },
    { enabled: isAuthenticated && !!user }
  );
  const { data: followersCount } = trpc.follow.followersCount.useQuery(
    { userId: user?.id ?? 0 },
    { enabled: isAuthenticated && !!user }
  );
  const { data: followingCount } = trpc.follow.followingCount.useQuery(
    { userId: user?.id ?? 0 },
    { enabled: isAuthenticated && !!user }
  );

  const utils = trpc.useUtils();
  const updateUser = trpc.user.update.useMutation({
    onSuccess: () => {
      toast.success("资料已更新");
      setIsEditing(false);
      utils.user.me.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (user) {
      setEditName(user.displayName || user.name || "");
      setEditEmail(user.email || "");
      setEditBio(user.bio || "");
    }
  }, [user]);

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
            <p className="text-gray-500 mb-4">请先登录后查看个人资料</p>
            <Link to="/login" className="px-5 py-2 bg-[#1abc9c] text-white rounded-lg no-underline hover:bg-[#16a085]">
              去登录
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "profile", label: "个人资料" },
    { key: "followers", label: `关注者 (${followersCount ?? 0})` },
    { key: "following", label: `关注中 (${followingCount ?? 0})` },
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="pt-14">
        <div className="relative h-48 bg-gradient-to-r from-[#1abc9c] to-[#16a085] overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <img src="/images/hero-dashboard.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 max-w-[1200px] mx-auto px-6 h-full flex items-center">
            <div className="flex items-center gap-4 animate-in">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-3xl font-bold">
                {(user?.name || "?")[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.name || "用户"}</h1>
                <p className="text-white/80 text-sm">@{user?.username}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-8 pb-12">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm w-fit mb-6 animate-in">
          {tabs.map((tab) => (
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

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg p-6 shadow-sm animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">个人资料</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-4 py-2 text-sm bg-[#1abc9c]/10 text-[#1abc9c] rounded-lg hover:bg-[#1abc9c]/20 cursor-pointer transition-colors border-none"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  编辑
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">显示名称</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c]"
                    placeholder="你的昵称"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">邮箱</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c]"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">个人简介</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c] resize-none"
                    placeholder="介绍一下自己..."
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(user?.displayName || user?.name || "");
                      setEditEmail(user?.email || "");
                      setEditBio(user?.bio || "");
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer bg-transparent border-none"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      if (!editName.trim()) {
                        toast.error("显示名称不能为空");
                        return;
                      }
                      updateUser.mutate({
                        displayName: editName.trim(),
                        email: editEmail.trim(),
                        bio: editBio.trim(),
                      });
                    }}
                    disabled={updateUser.isPending}
                    className="px-5 py-2 bg-[#1abc9c] text-white text-sm rounded-lg hover:bg-[#16a085] cursor-pointer disabled:opacity-50"
                  >
                    {updateUser.isPending ? "保存中..." : "保存"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500 w-24">用户名</span>
                  <span className="text-sm text-gray-800 font-medium">@{user?.username}</span>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500 w-24">显示名称</span>
                  <span className="text-sm text-gray-800">{user?.name || "未设置"}</span>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500 w-24">邮箱</span>
                  <span className="text-sm text-gray-800">{user?.email || "未设置"}</span>
                </div>
                <div className="flex items-start gap-3 py-3">
                  <span className="text-sm text-gray-500 w-24 flex-shrink-0">个人简介</span>
                  <span className="text-sm text-gray-800 whitespace-pre-wrap">{user?.bio || "还没有简介"}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Followers Tab */}
        {activeTab === "followers" && (
          <div className="bg-white rounded-lg p-6 shadow-sm animate-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              关注者 ({followersCount ?? 0})
            </h2>
            {followers && followers.length > 0 ? (
              <div className="space-y-3">
                {followers.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-[#1abc9c]/10 flex items-center justify-center text-[#1abc9c] font-bold text-sm">
                      {(f.name || f.username || "?")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{f.name || f.username}</p>
                      <p className="text-xs text-gray-400">@{f.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">还没有关注者</p>
            )}
          </div>
        )}

        {/* Following Tab */}
        {activeTab === "following" && (
          <div className="bg-white rounded-lg p-6 shadow-sm animate-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              关注中 ({followingCount ?? 0})
            </h2>
            {following && following.length > 0 ? (
              <div className="space-y-3">
                {following.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-[#1abc9c]/10 flex items-center justify-center text-[#1abc9c] font-bold text-sm">
                      {(f.name || f.username || "?")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{f.name || f.username}</p>
                      <p className="text-xs text-gray-400">@{f.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">还没有关注任何人</p>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
