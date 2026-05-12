# 「十年后」产品经理评审报告

> 评审日期：2026年5月  
> 评审人：产品经理  
> 版本：v1.0

---

## 一、评审结论

**整体评分：72/100**（可用，但多处体验和功能需要优化）

| 维度 | 评分 | 说明 |
|------|------|------|
| 核心功能完整性 | 65/100 | 基础 CRUD 齐全，缺编辑、删除确认、社交互动 |
| 用户体验 (UX) | 70/100 | 视觉精美，但有多个"假功能"和体验断点 |
| 信息架构 (IA) | 75/100 | 导航清晰，但页面间功能有重叠 |
| 数据完整性 | 68/100 | 缺少级联删除、防刷、分页 |
| 产品愿景匹配度 | 80/100 | 原作精神保留较好，时间线导航有亮点 |

---

## 二、P0 级问题（必须修复，阻塞发布）

### 2.1 首页搜索框是"假功能" ❌

**位置**：`HeroSection.tsx` 第 150 行

**现状**：
```tsx
<input type="text" placeholder="搜索你的梦想" className="..." />
```

**问题**：纯静态输入框，无 onChange、无提交、无路由跳转。用户输入后没有任何反应。

**建议修复**：
```tsx
// 方案 A：最小改动 - 跳转到探索页
const [searchQuery, setSearchQuery] = useState("");
const navigate = useNavigate();

const handleSearch = (e: React.KeyboardEvent) => {
  if (e.key === "Enter" && searchQuery.trim()) {
    navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
  }
};

<input
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  onKeyDown={handleSearch}
  placeholder="搜索你的梦想，按回车开始"
/>
```

**优先级**：P0  
**影响**：用户首次接触的核心功能之一，假功能严重损害信任感。

---

### 2.2 Explore 页面的搜索接口使用字符串拼接（SQL 注入风险）

**位置**：`api/explore-router.ts` 第 46-47 行

**现状**：
```typescript
.where(sql`(${dreams.title} LIKE ${`%${input.query}%`} ...)`)
```

**分析**：虽然 Drizzle ORM 的参数绑定可以防止注入，但使用 `sql` 模板标签拼接 LIKE 模式不够规范。当前实现是安全的（参数化绑定），但代码风格不佳，后续容易误改成不安全的写法。

**建议**：
```typescript
import { like } from "drizzle-orm";

.where(
  or(
    like(dreams.title, `%${input.query}%`),
    like(dreams.description, `%${input.query}%`)
  )
)
```

**优先级**：P0（代码质量）

---

### 2.3 删除梦想缺少确认对话框

**位置**：`Dreams.tsx`

**现状**：`dream.delete` 接口存在，但前端没有删除按钮。

**问题**：即使加上删除按钮，直接调用 delete 没有二次确认，用户可能误删。

**建议修复**：前端添加删除按钮 + 确认弹窗：
```tsx
<button onClick={() => {
  if (confirm('确定要删除这个梦想吗？关联的日志也会被删除。')) {
    deleteDream.mutate({ id: dream.id });
  }
}}>删除</button>
```

**同时**：后端需要级联删除关联的 dream_logs。

**优先级**：P0（数据安全）

---

## 三、P1 级问题（应该修复，影响体验）

### 3.1 梦想缺少编辑功能

**现状**：可以创建、更新进度、删除，但不能修改标题/描述/分类/截止时间。

**用户场景**：用户创建了"学习日语"，后来想改成"学习日语到 N2 级"，目前只能删除重建，丢失进度。

**建议**：在 Dreams 页面每个梦想卡片上添加「编辑」按钮，展开编辑表单。

---

### 3.2 Dashboard 和 Dreams 页面功能重叠，用户困惑

**现状**：
- `/dashboard`：梦想列表 + 日志列表 + 快速记录
- `/dreams`：梦想列表 + 进度更新 + 添加梦想

**问题**：两个页面都有梦想列表，但操作不同：
- Dashboard 只能看进度，不能更新进度
- Dreams 能更新进度，也能添加新梦想
- Dashboard 有日志，Dreams 没有

**建议**：明确页面定位

| 页面 | 定位 | 功能 |
|------|------|------|
| `/dashboard` | **个人工作台** | 汇总视图：统计卡片 + 最近日志 + 快捷操作 |
| `/dreams` | **梦想管理** | 完整的梦想 CRUD + 进度管理 |

**具体改动**：
- Dashboard 的梦想列表去掉，改为「最近活跃的 3 个梦想」快捷卡片
- Dashboard 保留日志记录功能（这是核心场景：写今日进展）
- Dreams 页面保留完整的梦想管理

---

### 3.3 About 页面 CTA 未区分登录状态

**位置**：`About.tsx` 第 135 行

**现状**：
```tsx
<Link to="/login">立即开始</Link>
```

**问题**：已登录用户点击后跳到登录页，体验断裂。

**修复**：
```tsx
{isAuthenticated ? (
  <Link to="/dashboard">开始记录</Link>
) : (
  <Link to="/login">立即开始</Link>
)}
```

---

### 3.4 Explore 页面搜索有 API 但无 UI

**现状**：`explore.search` tRPC 端点存在，但 Explore 页面没有搜索输入框。

**修复**：在分类标签上方添加搜索框：
```tsx
<div className="flex gap-3 mb-6">
  <input
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && searchDreams()}
    placeholder="搜索梦想..."
  />
  <button onClick={searchDreams}>搜索</button>
</div>
```

---

### 3.5 日志缺少删除功能

**现状**：可以创建日志，但不能删除。用户写错了无法修正。

**修复**：在每条日志上添加删除按钮（带确认）。

---

### 3.6 首页「搜索你的梦想」输入框是假功能

**位置**：`HeroSection.tsx`

**现状**：`<input placeholder="搜索你的梦想" />` 没有任何事件处理。

**修复建议**：要么：
- **方案 A**：绑定回车事件，跳转到 Explore 页面并传递搜索参数
- **方案 B**：直接去掉搜索框，避免假功能

**推荐方案 A**，因为这是原作设计的一部分，也是用户自然的操作路径。

---

### 3.7 Footer 链接是死链接

**位置**：`Footer.tsx`

**现状**：「使用条款」「隐私政策」「联系我们」是纯 `<span>`，不可点击。

**修复建议**：
- 短期：改为 `<span className="cursor-default opacity-50">`（明确表示不可用）
- 长期：创建对应的静态页面

---

### 3.8 时间线导航只切换面板，未和实际功能关联

**现状**：点击时间线气泡（如「「记录」日志和想法」）只切换首页的内容面板展示。

**用户预期**：点击功能相关的气泡，应该跳转到对应的功能页面。

**修复**：点击气泡时，如果是功能类气泡（id >= 6），导航到对应页面：
```typescript
const bubbleRoutes: Record<number, string> = {
  6: '/dashboard',  // 记录日志
  7: '/dashboard',  // 存录资料
  8: '/explore',    // 搜索主题
  9: '/explore',    // 关注互动
  10: '/dreams',    // 添加梦想
};
```

已在 `Home.tsx` 中部分实现，但 Home 和 Login 面板（id <= 5）没有处理。

---

## 四、P2 级问题（可以优化，锦上添花）

### 4.1 缺少数据分页

**现状**：`explore.feed`、`explore.recentLogs` 都是 `LIMIT 20`，前端没有分页加载。

**影响**：数据量小的时候没问题，超过 20 条后用户看不到旧数据。

**建议**：使用 React Query 的 `useInfiniteQuery` 实现无限滚动。

---

### 4.2 点赞没有防刷机制

**现状**：`log.like` 只是 `likes + 1`，用户可以无限点击。

**建议**：
- 短期：前端记录已点赞状态，禁止重复点击
- 长期：后端记录用户-日志点赞关系，防刷

---

### 4.3 缺少用户个人资料页

**现状**：用户只能看到名字，不能修改昵称、简介、邮箱。

**建议**：添加 `/profile` 页面，支持修改个人资料。

---

### 4.4 JWT Secret 有硬编码 fallback

**位置**：`api/local-auth-router.ts` 第 13 行

```typescript
const JWT_SECRET = new TextEncoder().encode(
  process.env.APP_SECRET || "ten-years-later-secret-key-2024"
);
```

**风险**：如果用户忘记设置 `APP_SECRET`，使用硬编码密钥，安全性大幅降低。

**修复**：没有设置 `APP_SECRET` 时直接报错，拒绝启动：
```typescript
const secret = process.env.APP_SECRET;
if (!secret) {
  throw new Error("APP_SECRET is required. Set it in .env file.");
}
const JWT_SECRET = new TextEncoder().encode(secret);
```

---

### 4.5 登录成功使用 window.location.reload()

**位置**：`LoginForm.tsx` 和 `Login.tsx`

**现状**：
```typescript
onSuccess: () => { window.location.reload(); }
```

**问题**：整页刷新，体验差，状态丢失。

**修复**：使用 React Query 的 invalidate + 路由导航：
```typescript
onSuccess: () => {
  utils.invalidate();
  navigate("/dashboard");
}
```

---

### 4.6 探索页面分类筛选是前端过滤

**现状**：`filteredDreams = feed?.filter(...)` 在前端过滤。

**问题**：如果后端返回 20 条，但某分类只有 1 条，用户看到的是 1 条。

**修复**：分类筛选改为后端查询，或在 API 中添加 `category` 参数。

---

## 五、功能矩阵：承诺 vs 实现

| 功能 | 原作提及 | 本版实现 | 状态 |
|------|----------|----------|------|
| 用户注册/登录 | - | ✅ 完整 | 已完成 |
| 梦想创建 | ✅ | ✅ 完整 | 已完成 |
| 梦想编辑 | - | ❌ 缺失 | **P1** |
| 梦想删除 | - | ⚠️ API有，前端无 | **P0** |
| 进度追踪 | ✅ | ✅ 完整 | 已完成 |
| 日志记录 | ✅ | ✅ 完整 | 已完成 |
| 日志删除 | - | ❌ 缺失 | **P1** |
| 日志点赞 | - | ⚠️ 后端有，前端无按钮 | **P1** |
| 探索发现 | ✅ | ✅ 基础实现 | 已完成 |
| 搜索功能 | ✅ | ⚠️ API有，UI无 | **P1** |
| 关注用户 | ✅ | ❌ 缺失 | P2 |
| 存录资料 | ✅ | ❌ 缺失 | P2 |
| 个人资料 | - | ❌ 缺失 | P2 |
| 消息通知 | - | ❌ 缺失 | P2 |

---

## 六、推荐优先级排序

### 第一阶段（本周内）：修复假功能和安全隐患

1. [ ] 首页搜索框绑定跳转（P0）
2. [ ] 梦想删除按钮 + 确认弹窗 + 级联删除（P0）
3. [ ] 修复 explore 搜索 API 代码风格（P0）
4. [ ] About 页面 CTA 区分登录状态（P1）
5. [ ] Footer 死链接处理（P1）

### 第二阶段（下周）：功能补全

6. [ ] 梦想编辑功能（P1）
7. [ ] 日志删除功能（P1）
8. [ ] Explore 页面搜索 UI（P1）
9. [ ] Dashboard/Dreams 页面职责清晰化（P1）
10. [ ] 登录后路由跳转优化（P2）

### 第三阶段（后续迭代）：体验增强

11. [ ] 数据分页/无限滚动（P2）
12. [ ] 用户个人资料页（P2）
13. [ ] 点赞防刷 + 前端状态（P2）
14. [ ] 时间线气泡点击跳转对应页面（P2）
15. [ ] 存录/关注功能（P2，大功能）

---

## 七、产品长期建议

### 7.1 数据埋点

需要添加以下关键事件追踪：

| 事件 | 用途 |
|------|------|
| 注册完成 | 衡量转化漏斗 |
| 梦想创建 | 核心功能使用率 |
| 日志撰写 | 核心功能使用率 |
| 进度更新 | 用户活跃度 |
| 页面停留时长 | 内容质量评估 |

### 7.2 社交功能优先级

原作是「社交网络」，当前版本更接近「个人梦想管理工具」。社交功能优先级：

1. **公开/私密梦想切换** — 让用户控制分享范围
2. **用户主页** — 查看他人的梦想和日志
3. **关注/粉丝** — 建立社交关系
4. **评论** — 在他人日志下评论
5. **通知** — 互动消息推送

### 7.3 留存策略

| 策略 | 实现 |
|------|------|
| 邮件提醒 | 截止日前提醒 |
| 周报推送 | 本周进展汇总 |
| 成就系统 | 连续记录天数徽章 |
| 社区精选 | 每周精选梦想展示 |
