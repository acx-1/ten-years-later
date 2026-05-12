import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-white/70 py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="grid grid-cols-2 gap-[2px] mr-3">
                <div className="w-2 h-2 rounded-full bg-[#e74c3c]" />
                <div className="w-2 h-2 rounded-full bg-[#f1c40f]" />
                <div className="w-2 h-2 rounded-full bg-[#2ecc71]" />
                <div className="w-2 h-2 rounded-full bg-[#3498db]" />
              </div>
              <span className="text-white text-lg font-bold">十年后</span>
            </div>
            <p className="text-sm leading-relaxed">
              一个关于未来的匿名社交网络。在这里，你可以自由地分享关于未来与梦想的真实想法。
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">导航</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-[#1abc9c] transition-colors no-underline text-white/70">首页</Link></li>
              <li><Link to="/explore" className="text-sm hover:text-[#1abc9c] transition-colors no-underline text-white/70">探索一下</Link></li>
              <li><Link to="/dashboard" className="text-sm hover:text-[#1abc9c] transition-colors no-underline text-white/70">我的空间</Link></li>
              <li><Link to="/dreams" className="text-sm hover:text-[#1abc9c] transition-colors no-underline text-white/70">梦想</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">功能</h4>
            <ul className="space-y-2">
              <li><span className="text-sm">记录日志和想法</span></li>
              <li><span className="text-sm">存录站内外资料</span></li>
              <li><span className="text-sm">搜索感兴趣的主题</span></li>
              <li><span className="text-sm">关注有想法的人</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">关于</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm hover:text-[#1abc9c] transition-colors no-underline text-white/70">关于我们</Link></li>
              <li><span className="text-sm text-white/30 cursor-default" title="即将上线">使用条款</span></li>
              <li><span className="text-sm text-white/30 cursor-default" title="即将上线">隐私政策</span></li>
              <li><span className="text-sm text-white/30 cursor-default" title="即将上线">联系我们</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-white/50">
            &copy; 十年后 (Ten Years Later). 保留所有权利。
          </p>
        </div>
      </div>
    </footer>
  );
}
