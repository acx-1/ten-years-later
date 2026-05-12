import { useEffect, useRef } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { trpc } from "@/providers/trpc";

const teamStory = [
  { date: "2014-03", title: "从这里开始", author: "@Xing的家", content: "提出「让人们分享未来梦想」的想法。我们已经浪费了太多时间关注琐碎的事情。但是我们可以随时选择自己的人生：创造全新的事物。", highlight: true },
  { date: "2014-04", title: "你想成为一个什么样的人", author: "@枫林", content: "深夜工作，提出了第一个名字「十日后」。每个人只有一次二十三岁，我们不想等待未来的到来。", highlight: false },
  { date: "2014-05", title: "你在和我开玩笑吗", author: "@枫林", content: "首次技术启动会议，但是两个技术人员直接消失。这不重要。重要的是，十年后，那次会议现场的所有人会变成什么样？", highlight: false },
  { date: "2014-06", title: "我是希尔瑞斯", author: "@枫林", content: "更大的团队聚齐了见面。生活不该是浪费时间于自己不热爱的事物。这次，我们要做一件不一样的事。", highlight: false },
  { date: "2014-08", title: "冒险一次", author: "@北京西路", content: "杀不死我的只能使我更强，在一个新地方继续原先的旅程。多少个梦想才能击败现实？冒险一次。", highlight: true },
];

const values = [
  { title: "真实", description: "在这里，你可以匿名分享最真实的想法，不用担心被评判。" },
  { title: "连接", description: "找到和你有相似梦想的人，互相鼓励，共同成长。" },
  { title: "成长", description: "记录每一步进步，见证自己从梦想到现实的过程。" },
  { title: "未来", description: "不为过去遗憾，不为现在焦虑，只为未来努力。" },
];

export default function About() {
  const { data: stats } = trpc.explore.stats.useQuery();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current.querySelectorAll(".animate-in"),
        { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" });
    }
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-14">
        <div className="relative h-64 bg-gradient-to-r from-[#1abc9c] to-[#16a085] overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src="/images/team-about.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 max-w-[1200px] mx-auto px-6 h-full flex flex-col justify-center items-center text-center">
            <h1 className="text-4xl font-bold text-white mb-3 animate-in">关于我们</h1>
            <p className="text-white/80 max-w-lg animate-in">
              十年后是一个关于未来的匿名社交网络。在这里，你可以自由地分享关于未来与梦想的真实想法。
            </p>
            {stats && (
              <div className="flex gap-8 mt-6 animate-in">
                <div className="text-center"><div className="text-2xl font-bold text-white">{stats.totalUsers}</div><div className="text-xs text-white/70">用户</div></div>
                <div className="text-center"><div className="text-2xl font-bold text-white">{stats.totalDreams}</div><div className="text-xs text-white/70">梦想</div></div>
                <div className="text-center"><div className="text-2xl font-bold text-white">{stats.totalLogs}</div><div className="text-xs text-white/70">日志</div></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto animate-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">我们的使命</h2>
          <p className="text-gray-600 leading-relaxed">
            我们相信，每个人心中都有对未来的憧憬和梦想。但太多时候，这些梦想被日常的琐碎所淹没。
            「十年后」存在的意义，就是创造一个空间，让你敢于 dream out loud，找到同路人，一起走向那个十年后的自己。
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-10 animate-in">我们的价值观</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 text-center animate-in">
                <div className="w-12 h-12 mx-auto mb-4 bg-[#1abc9c]/10 rounded-xl flex items-center justify-center text-[#1abc9c]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-10 animate-in">我们的故事</h2>
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 md:-translate-x-px" />
          {teamStory.map((story, index) => (
            <div key={story.date} className={`relative flex items-start mb-8 last:mb-0 animate-in ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
              <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-[#1abc9c] rounded-full border-2 border-white shadow md:-translate-x-1.5 z-10" />
              <div className={`ml-10 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
                <div className={`rounded-xl p-5 ${story.highlight ? "bg-[#1abc9c]/5 border border-[#1abc9c]/20" : "bg-white border border-gray-100"} shadow-sm`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#1abc9c] font-medium">{story.date}</span>
                    <span className="text-xs text-gray-400">{story.author}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{story.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{story.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-10 animate-in">你可以做什么</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "记录日志和想法", description: "基于每个「梦想」随时记录瞬间的想法，或者通过撰写日志记录更丰富深刻的思考。", image: "/images/feature-record.jpg" },
              { title: "存录站内外资料", description: "将站内资料以及站外资料存录到自己的盒子里，并通过文件夹功能进行分类整理。", image: "/images/feature-save.jpg" },
              { title: "搜索感兴趣的主题", description: "输入关于各「梦想」主题的关键词，搜索到相关的梦想、资料和「十年后」用户。", image: "/images/feature-search.jpg" },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-in">
                <img src={feature.image} alt={feature.title} className="w-full h-40 object-cover" />
                <div className="p-5">
                  <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center animate-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">准备好开始了吗？</h2>
          <p className="text-gray-600 mb-6">十年后，你会成为怎样的人？从今天开始记录你的答案。</p>
          <Link to="/login" className="inline-block px-8 py-3 bg-[#1abc9c] text-white rounded-lg font-medium hover:bg-[#16a085] transition-colors no-underline shadow-lg">
            立即开始
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
