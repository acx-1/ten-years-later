import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";

export function LoginForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: () => { window.location.reload(); },
    onError: (err) => setError(err.message),
  });

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: () => { window.location.reload(); },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isRegister) {
      if (password.length < 6) { setError("密码至少6位"); return; }
      registerMutation.mutate({ username, password, displayName: username });
    } else {
      loginMutation.mutate({ username, password });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="rounded-lg p-8 w-[340px]" style={{ background: "rgba(255, 255, 255, 0.92)", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)" }}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text" value={username} onChange={(e) => setUsername(e.target.value)}
          placeholder="请输入用户名" required
          className="h-11 px-4 text-sm border border-[#dddddd] rounded focus:outline-none focus:border-[#1abc9c] transition-colors duration-200"
        />
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入密码" required
          className="h-11 px-4 text-sm border border-[#dddddd] rounded focus:outline-none focus:border-[#1abc9c] transition-colors duration-200"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={isPending}
          className="h-12 bg-[#1abc9c] text-white text-base font-semibold rounded hover:bg-[#16a085] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-50"
          style={{ boxShadow: "0 4px 12px rgba(26, 188, 156, 0.3)" }}>
          {isPending ? "处理中..." : isRegister ? "注册" : "登录"}
        </button>

        <button type="button" onClick={() => { setIsRegister(!isRegister); setError(""); }}
          className="text-[13px] text-[#1abc9c] text-center hover:underline hover:text-[#16a085] transition-all duration-200 cursor-pointer bg-transparent border-none">
          {isRegister ? "已有账户？去登录" : "没有账户？去注册"}
        </button>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <Link to="/login" className="text-xs text-gray-400 hover:text-gray-600 transition-colors no-underline">
          前往完整登录页面
        </Link>
      </div>
    </div>
  );
}
