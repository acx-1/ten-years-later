import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { path: "/", label: "首页" },
  { path: "/dashboard", label: "我的", auth: true },
  { path: "/explore", label: "探索一下" },
  { path: "/dreams", label: "梦想", auth: true },
  { path: "/profile", label: "资料", auth: true },
  { path: "/about", label: "关于我们" },
];

export function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center"
      style={{
        background: "linear-gradient(180deg, rgba(26, 188, 156, 0.95) 0%, rgba(26, 188, 156, 0.85) 100%)",
      }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="no-underline">
          <Logo />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            if (item.auth && !isAuthenticated) return null;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 no-underline ${
                  location.pathname === item.path
                    ? "text-white bg-white/20"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {isAuthenticated ? (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
              <span className="text-white/90 text-sm">{user?.name}</span>
              <button
                onClick={logout}
                className="text-white/70 hover:text-white text-sm transition-colors cursor-pointer bg-transparent border-none"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-4 px-4 py-2 bg-white text-[#1abc9c] text-sm font-medium rounded-md hover:bg-white/90 transition-colors no-underline"
            >
              登录
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="absolute top-14 left-0 right-0 md:hidden py-2 px-4"
          style={{
            background: "linear-gradient(180deg, rgba(26, 188, 156, 0.95) 0%, rgba(22, 160, 133, 0.98) 100%)",
          }}
        >
          {navItems.map((item) => {
            if (item.auth && !isAuthenticated) return null;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 no-underline ${
                  location.pathname === item.path
                    ? "text-white bg-white/20"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {isAuthenticated ? (
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-white/90 hover:text-white cursor-pointer bg-transparent border-none"
            >
              退出登录 ({user?.name})
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-white/90 hover:text-white no-underline"
            >
              登录
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
