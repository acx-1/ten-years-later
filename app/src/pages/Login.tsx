import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";

function Logo() {
  return (
    <div className="flex items-center">
      <div className="grid grid-cols-2 gap-[2px] mr-2">
        <div className="w-2 h-2 rounded-full bg-[#e74c3c]" />
        <div className="w-2 h-2 rounded-full bg-[#f1c40f]" />
        <div className="w-2 h-2 rounded-full bg-[#2ecc71]" />
        <div className="w-2 h-2 rounded-full bg-[#3498db]" />
      </div>
      <span className="text-[#1abc9c] text-xl font-bold">十年后</span>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  const utils = trpc.useUtils();

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/dashboard");
    },
    onError: (err) => setError(err.message),
  });

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/dashboard");
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isRegister) {
      if (password.length < 6) {
        setError("密码至少6位");
        return;
      }
      registerMutation.mutate({
        username,
        password,
        displayName: displayName || username,
      });
    } else {
      loginMutation.mutate({ username, password });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative"
      style={{
        background: "linear-gradient(135deg, #1abc9c 0%, #16a085 50%, #0e6655 100%)",
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="no-underline">
            <Logo />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-xl font-bold text-gray-800 text-center mb-1">
            {isRegister ? "创建账户" : "欢迎回来"}
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            {isRegister ? "加入十年后，记录你的梦想" : "登录后继续追逐梦想"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">昵称</label>
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="怎么称呼你"
                  className="h-11"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">用户名</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
                className="h-11"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">密码</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                className="h-11"
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-[#1abc9c] hover:bg-[#16a085] text-white font-medium"
            >
              {isPending ? "处理中..." : isRegister ? "注册" : "登录"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-sm text-[#1abc9c] hover:text-[#16a085] transition-colors cursor-pointer bg-transparent border-none"
            >
              {isRegister ? "已有账户？去登录" : "没有账户？去注册"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors no-underline"
            >
              先逛逛，不登录
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/50 text-xs mt-6">
          十年后 · 一个关于未来的社交网络
        </p>
      </div>
    </div>
  );
}
