export interface StoryContent {
  type: "story";
  id: number;
  title: string;
  username: string;
  description: string;
}

export interface FeatureContent {
  type: "feature";
  id: number;
  title: string;
  description: string;
  image: string;
}

export type PanelContent = StoryContent | FeatureContent;

export const storyPanels: StoryContent[] = [
  {
    type: "story",
    id: 0,
    title: "从这里开始",
    username: "@Xing的家",
    description: "提出「让人们分享未来梦想」的想法。我们已经浪费了太多时间关注琐碎的事情。但是我们可以随时选择自己的人生：创造全新的事物。",
  },
  {
    type: "story",
    id: 1,
    title: "你想成为一个什么样的人",
    username: "@枫林",
    description: "深夜工作，提出了第一个名字「十日后」。每个人只有一次二十三岁，我们不想等待未来的到来。",
  },
  {
    type: "story",
    id: 2,
    title: "你在和我开玩笑吗",
    username: "@枫林",
    description: "首次技术启动会议，但是两个技术人员直接消失。这不重要。重要的是，十年后，那次会议现场的所有人会变成什么样？",
  },
  {
    type: "story",
    id: 3,
    title: "我是希尔瑞斯",
    username: "@枫林",
    description: "更大的团队聚齐了见面。生活不该是浪费时间于自己不热爱的事物。这次，我们要做一件不一样的事。",
  },
  {
    type: "story",
    id: 4,
    title: "冒险一次",
    username: "@北京西路",
    description: "杀不死我的只能使我更强，在一个新地方继续原先的旅程。多少个梦想才能击败现实？冒险一次。",
  },
];

export const featurePanels: FeatureContent[] = [
  {
    type: "feature",
    id: 6,
    title: "「记录」日志和想法",
    description: "你可以基于每个「梦想」随时记录瞬间的想法，或者通过撰写日志记录更丰富深刻的思考。",
    image: "/images/feature-record.jpg",
  },
  {
    type: "feature",
    id: 7,
    title: "「存录」站内外资料",
    description: "你可以将站内的资料（别人发表的日志）以及站外的资料（任何你感兴趣的网页）存录到自己的盒子里，并通过方便的文件夹功能对资料进行分类整理。",
    image: "/images/feature-save.jpg",
  },
  {
    type: "feature",
    id: 8,
    title: "「搜索」感兴趣的主题",
    description: "你可以在搜索框中输入关于各个「梦想」主题或领域的关键词，并搜索到相关的最有价值的梦想、资料、以及「十年后」用户。",
    image: "/images/feature-search.jpg",
  },
  {
    type: "feature",
    id: 9,
    title: "「关注」有想法的人并与之互动",
    description: "你也可以在「十年后」关注任何有想法、有趣的人！他们可以来自你从推荐功能「概率」看到的各种有趣动态，也可以来自你主动的搜索动作。",
    image: "/images/feature-follow.jpg",
  },
  {
    type: "feature",
    id: 10,
    title: "添加「梦想」",
    description: "点击时间轴左边的十字图标即可添加梦想，我们叫「梦想」。只需填入该「梦想」的名称，对该「梦想」的描述，以及预期的实现时间，就可成功创建。",
    image: "/images/feature-dream.jpg",
  },
];

export const loginPanel = {
  type: "login" as const,
  id: 5,
  headline: "十年后，你会成为怎样的人？",
  description: "「十年后」是一个关于未来的匿名社交网络。在这里，你可以自由地分享关于未来与梦想的真实想法，并探索其他人的梦想，以及背后的故事。",
};

export interface BubbleItem {
  id: number;
  text: string;
  state: "completed" | "current";
  position: { left: string; top: string };
}

export const timelineBubbles: BubbleItem[] = [
  { id: 0, text: "从这里开始", state: "completed", position: { left: "2%", top: "60px" } },
  { id: 1, text: "你想成为什么样的人", state: "completed", position: { left: "8%", top: "20px" } },
  { id: 2, text: "你在和我开玩笑吗", state: "completed", position: { left: "14%", top: "80px" } },
  { id: 3, text: "我是希尔瑞斯", state: "completed", position: { left: "20%", top: "35px" } },
  { id: 4, text: "冒险一次", state: "completed", position: { left: "26%", top: "90px" } },
  { id: 5, text: "今天你加入我们", state: "current", position: { left: "48%", top: "55px" } },
  { id: 6, text: "「记录」日志和想法", state: "current", position: { left: "54%", top: "10px" } },
  { id: 7, text: "「存录」站内外资料", state: "current", position: { left: "60%", top: "95px" } },
  { id: 8, text: "「搜索」感兴趣的主题", state: "current", position: { left: "72%", top: "40px" } },
  { id: 9, text: "「关注」有想法的人", state: "current", position: { left: "78%", top: "85px" } },
  { id: 10, text: "添加「梦想」", state: "current", position: { left: "88%", top: "15px" } },
];

export const months = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];

// Default dreams for new users
export const defaultDreams = [
  { title: "成为一名作家", description: "出版自己的第一部小说", category: "艺术", deadline: "2025-12", color: "#1abc9c" },
  { title: "环游世界", description: "去至少30个国家旅行", category: "旅行", deadline: "2028-06", color: "#3498db" },
  { title: "学会弹吉他", description: "能独立演奏完整曲目", category: "学习", deadline: "2025-08", color: "#e74c3c" },
  { title: "创业", description: "创办一家科技公司", category: "创业", deadline: "2030-01", color: "#f1c40f" },
];
