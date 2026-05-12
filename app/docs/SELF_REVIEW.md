# 「十年后」项目自查报告

> 评审角色：产品经理 × 架构师  
> 评审日期：2026-05  
> 版本：v1.0

---

## 一、执行摘要

本项目是对 2014 年作品「十年后」的现代全栈重构。技术选型先进（React 19 + tRPC + Drizzle），功能骨架完整，**但在权限安全、API 设计、性能优化方面存在严重问题**，需要立即修复后才能投入生产使用。

| 维度 | 评级 | 核心风险 |
|------|------|----------|
| 产品功能 | ⭐⭐⭐☆☆ | 社交功能缺失，部分"半功能"体验不闭环 |
| 代码质量 | ⭐⭐⭐☆☆ | 类型安全好，但组件过长，重复代码多 |
| 架构安全 | ⭐⭐☆☆☆ | **所有 API 无权限校验**，任何人可操作任意数据 |
| 性能优化 | ⭐⭐☆☆☆ | N+1 查询，无分页，无缓存策略 |
| 可维护性 | ⭐⭐⭐⭐☆ | 技术栈现代，目录结构清晰 |

**一句话结论**：这是一个「技术展示不错，但生产安全不达标」的项目。

---

## 二、产品经理视角（PM Review）

### 2.1 产品定位分析

**原作「十年后」的产品形态**：匿名社交网络  
**当前实现的产品形态**：个人梦想管理工具 + 公开内容浏览

**偏差**：
- 原作核心是「社交」——匿名分享、探索他人、互动交流
- 当前实现核心是「个人管理」——自己创建梦想、自己记录日志
- 社交功能（关注/评论/互动）几乎为零，产品形态从「社交网络」退化为「个人工具」

### 2.2 功能审计

#### ✅ 做得好的

| 功能 | 评价 |
|------|------|
| 时间线导航 | 产品亮点，12月份 + 功能气泡的交互设计有特色 |
| 故事面板滑动 | 原作精神保留得好，5个创业故事 + 5个功能介绍的切换动画流畅 |
| 全屏背景首页 | 视觉冲击力强，登录表单 + 介绍的左右布局清晰 |
| 响应式适配 | 移动端导航折叠、布局适配到位 |
| 视觉统一 | 青绿色主题贯穿始终，品牌感强 |

#### ⚠️ 半功能（有但体验不完整）

| 功能 | 问题 | 严重程度 |
|------|------|----------|
| 点赞 | 前端只有显示，没有可点击的点赞按钮 | 中 |
| 关注数 | Dashboard 显示"0"，且作为静态值硬编码 | 低 |
| 用户资料 | 只能看名字，不能修改昵称/头像/简介 | 中 |
| 梦想颜色 | 可选但 Explore 页不显示，价值未释放 | 低 |

#### ❌ 缺失的核心功能

| 功能 | 重要性 | 说明 |
|------|--------|------|
| 评论系统 | 高 | 原作社交属性的核心，对他人日志进行评论互动 |
| 关注/粉丝 | 高 | 建立用户间的社交关系 |
| 用户主页 | 高 | 查看某个用户的所有公开梦想 |
| 通知系统 | 中 | 有人点赞/评论/关注时的提醒 |
| 梦想公开/私密切换 | 中 | 控制分享范围，这是隐私基础功能 |
| 操作反馈（Toast） | 中 | 创建/删除/更新后没有任何视觉反馈 |
| 加载状态 | 中 | API 请求时缺少骨架屏或 Loading 指示 |

### 2.3 用户体验问题（UX）

**问题 1：权限校验缺失导致的产品逻辑混乱**

当前任何人可以：
- 删除任何人的梦想（只需知道 dream id）
- 修改任何人的梦想进度
- 给任何人的梦想写日志

这意味着一个恶意用户可以：清空全站数据、篡改他人进度、在所有梦想下 spam 日志。

**问题 2：Dashboard 页面「快速记录」的 dreamId 选择器**

- 首次进入时 `selectedDreamId` 为 `null`
- 用户输入日志内容后点击「发布」，没有任何反应（因为 `!selectedDreamId` 阻止了提交）
- 用户不知道为什么不成功，没有错误提示

**修复建议**：
```typescript
// 默认选中第一个梦想
const [selectedDreamId, setSelectedDreamId] = useState<number | null>(dreams[0]?.id ?? null);
// 或者在发布按钮 disabled 时给出 Tooltip 提示
```

**问题 3：Explore 页的梦想数据分类筛选混乱**

搜索模式下（`isSearching = true`）和浏览模式下（`isSearching = false`）使用两套渲染逻辑，代码重复且搜索结果不支持分类筛选。

**问题 4：日志显示「梦想 #{id}」而不是梦想名称**

Dashboard 日志卡片显示 `梦想 #3`，用户不知道这是哪个梦想。应该显示梦想标题。

**修复建议**：后端 `listByUser` 接口做 JOIN 查询返回梦想标题，或前端做数据关联。

### 2.4 数据与隐私

| 问题 | 风险 |
|------|------|
| 所有梦想默认 `isPublic = 1` | 用户创建的梦想自动公开，无隐私控制 |
| 无梦想所有者校验 | 任何人可删改他人梦想 |
| 日志无所有者校验 | 任何人可在他人梦想下写日志 |
| Explore 展示所有用户数据 | 用户数据被默认暴露 |

---

## 三、架构师视角（Architect Review）

### 3.1 安全审计 🔴

#### 致命问题：零权限校验

**所有 API 路由都使用 `publicQuery`**，没有任何认证中间件保护。

```typescript
// api/dream-router.ts
delete: publicQuery  // ❌ 任何人可调用
update: publicQuery  // ❌ 任何人可调用
updateProgress: publicQuery  // ❌ 任何人可调用

// api/log-router.ts
create: publicQuery  // ❌ 任何人可调用
delete: publicQuery  // ❌ 任何人可调用
like: publicQuery    // ❌ 任何人可调用
```

**攻击示例**：
```bash
# 删除 id=1 的梦想（不需要登录）
curl -X POST http://localhost:3000/api/trpc/dream.delete \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'

# 给 id=1 的梦想写日志（伪造 userId）
curl -X POST http://localhost:3000/api/trpc/log.create \
  -H "Content-Type: application/json" \
  -d '{"dreamId": 1, "userId": 999, "content": "spam"}'
```

**修复方案**：引入 `authedQuery` + 资源所有权校验

```typescript
// api/middleware.ts 已有 authedQuery，但未被使用

// 修复后的 dream-router.ts
delete: authedQuery
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input, ctx }) => {
    const db = getDb();
    // 校验：只能删除自己的梦想
    const dream = await db.select().from(dreams).where(eq(dreams.id, input.id)).limit(1);
    if (dream.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
    if (dream[0].userId !== ctx.unifiedUser!.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "只能删除自己的梦想" });
    }
    await db.delete(dreamLogs).where(eq(dreamLogs.dreamId, input.id));
    await db.delete(dreams).where(eq(dreams.id, input.id));
    return { success: true };
  }),
```

#### 高风险：用户传入 userId

```typescript
// log-router.ts
create: publicQuery.input(z.object({
  dreamId: z.number(),
  userId: z.number(),  // ❌ 用户可传入任意 userId
  ...
}))
```

日志的 `userId` 应该来自认证上下文（`ctx.unifiedUser.id`），而不是用户输入。

#### 中风险：zod 验证不足

```typescript
// local-auth-router.ts
username: z.string().min(3).max(50)
// 缺少：字符集限制（当前可传入空格、特殊字符）
// 缺少：用户名格式校验（建议只允许字母、数字、下划线）

password: z.string().min(6).max(100)
// 缺少：密码强度校验（建议至少包含字母+数字）
```

#### 低风险：JWT Token 无刷新机制

Token 固定 30 天有效期，没有 Refresh Token 机制。用户 30 天后必须重新登录。

### 3.2 性能审计 🟡

#### N+1 查询问题

```typescript
// explore-router.ts - feed
const enriched = await Promise.all(
  allDreams.map(async (dream) => {
    let userName = "匿名用户";
    if (dream.userType === "local") {
      const users = await db  // ❌ 每行数据都发一次查询
        .select()
        .from(localUsers)
        .where(sql`${localUsers.id} = ${dream.userId}`)
        .limit(1);
      ...
    }
    return { ...dream, userName };
  })
);
```

20 条梦想数据 = 1 次主查询 + 20 次用户查询 = **21 次数据库往返**。

**修复方案**：使用 JOIN 一次查询

```typescript
// 使用 Drizzle 的关系查询
const result = await db
  .select({
    id: dreams.id,
    title: dreams.title,
    userName: localUsers.displayName,
  })
  .from(dreams)
  .leftJoin(localUsers, eq(dreams.userId, localUsers.id))
  .where(eq(dreams.isPublic, 1))
  .orderBy(desc(dreams.createdAt))
  .limit(20);
```

#### 无分页

所有 `list` 接口都是全量返回（或 `LIMIT 20`），数据量大时会内存溢出。

#### 无数据库索引

```typescript
// schema.ts - dreams 表
userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
// ❌ 缺少索引：按 userId 查询梦想时全表扫描

// schema.ts - dreamLogs 表
dreamId: bigint("dream_id", { mode: "number", unsigned: true }).notNull(),
// ❌ 缺少索引：级联删除时 dreamId 查询慢
```

**需要添加的索引**：
```sql
CREATE INDEX idx_dreams_user_id ON dreams(user_id);
CREATE INDEX idx_dreams_is_public ON dreams(is_public);
CREATE INDEX idx_dream_logs_dream_id ON dream_logs(dream_id);
CREATE INDEX idx_dream_logs_user_id ON dream_logs(user_id);
```

#### 前端 QueryClient 配置缺失

```typescript
// trpc.tsx
const queryClient = new QueryClient();  // ❌ 使用默认配置
```

缺少：
- `defaultOptions.queries.staleTime`（默认 0，每次 mount 都请求）
- `defaultOptions.queries.gcTime`（默认 5 分钟）
- `defaultOptions.queries.retry`（默认 3 次重试）

### 3.3 代码质量审计

#### 好的方面

| 方面 | 评价 |
|------|------|
| 类型安全 | tRPC + Drizzle 实现端到端类型安全，前后端共享 schema |
| 目录结构 | 按职责分层（api/、db/、src/pages/、src/components/）清晰 |
| 组件拆分 | Logo、Navbar、Footer、LoginForm 等可复用组件拆分合理 |
| 环境变量 | `.env` 不提交，`.env.example` 提供模板 |
| 错误处理 | tRPC 统一错误返回，前端有错误状态展示 |

#### 需要改进的方面

**1. 组件过长**

| 文件 | 行数 | 问题 |
|------|------|------|
| `Dashboard.tsx` | 260 | 一个页面组件做了太多事：统计、梦想列表、日志列表、表单、空状态 |
| `Dreams.tsx` | 280+ | 包含列表、添加表单、编辑表单、进度更新、删除确认、统计面板 |
| `Explore.tsx` | 200+ | 搜索模式/浏览模式两套渲染逻辑重复 |

**建议**：将子功能拆分为独立组件

**2. 重复代码**

梦想卡片 UI 在 Dashboard、Dreams、Explore 三个页面重复出现，应该抽象为 `<DreamCard>` 组件。

**3. 魔法数字**

```typescript
// Dashboard.tsx
dreams.slice(0, 3)  // 为什么是 3？
// Explore.tsx
.limit(20)  // 多处重复
// local-auth-router.ts
.setExpirationTime("30d")  // Token 过期时间散落各处
```

**4. 注释残留**

```typescript
// Dashboard.tsx 第 10 行
// need Link from react-router  // ❌ 开发注释应删除
```

**5. useAuth Hook 不统一**

```typescript
// useAuth.ts 只查询 localAuth.me
// 但 context.ts 支持 OAuth + local 两种认证
// 结果：OAuth 登录用户无法被 useAuth 识别
```

### 3.4 架构可扩展性

#### 好的方面

- tRPC Router 的模块化设计便于新增业务领域
- Drizzle ORM 的关系查询支持未来的复杂 JOIN
- OAuth 认证体系预留了扩展接口

#### 潜在问题

- `userType` 枚举（"oauth" | "local"）在 dreams 和 logs 表中重复存储，增加维护成本
- `isPublic` 使用 `int` 类型（应该是 `boolean` 或 `tinyint(1)`）
- `bigserial` 主键在分库分表时可能成为瓶颈（但当前规模不需要担心）

---

## 四、问题优先级矩阵

### 🔴 紧急（本周必须修）

| # | 问题 | 影响 | 修复工作量 |
|---|------|------|-----------|
| 1 | **所有 API 无权限校验** | 安全：任何人可操作任意数据 | 大 |
| 2 | **用户可伪造 userId** | 安全：日志/梦想可伪造成他人创建 | 中 |
| 3 | **N+1 查询** | 性能：20条数据21次数据库往返 | 中 |

### 🟡 重要（本月内修）

| # | 问题 | 影响 | 修复工作量 |
|---|------|------|-----------|
| 4 | **无数据库索引** | 性能：数据量增大后查询变慢 | 小 |
| 5 | **无分页** | 性能：LIMIT 20 无法扩展 | 中 |
| 6 | **Dashboard 默认 dreamId 为空** | UX：写日志不提示原因直接失败 | 小 |
| 7 | **日志显示「梦想 #id」而非名称** | UX：用户看不懂 | 小 |
| 8 | **组件过长（260+行）** | 维护：可读性差 | 中 |
| 9 | **梦想卡片 UI 三处重复** | 维护：一改要改三处 | 中 |
| 10 | **QueryClient 默认配置** | 性能：无意义的重复请求 | 小 |

### 🟢 优化（后续迭代）

| # | 问题 | 影响 | 修复工作量 |
|---|------|------|-----------|
| 11 | JWT 无 Refresh Token | UX：30天后必须重新登录 | 中 |
| 12 | 用户名/密码缺少格式校验 | 安全：可传入空格等特殊字符 | 小 |
| 13 | 魔法数字硬编码 | 维护：3、20、30d 等散落各处 | 小 |
| 14 | 开发注释残留 | 质量："need Link from react-router" | 极小 |
| 15 | useAuth 不支持 OAuth | 功能：OAuth 用户状态无法获取 | 小 |

---

## 五、修复建议详情

### 🔴 修复 1：API 权限校验（最紧急）

**目标**：所有修改操作必须验证用户身份 + 资源所有权

**修改文件**：
- `api/dream-router.ts`：delete、update、updateProgress
- `api/log-router.ts`：create、delete

**方案**：

```typescript
// 1. middleware.ts - 已有 authedQuery，直接复用

// 2. dream-router.ts - delete 改为 authedQuery + 所有权校验
delete: authedQuery
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input, ctx }) => {
    const db = getDb();
    const userId = ctx.unifiedUser!.id;
    
    const dream = await db
      .select()
      .from(dreams)
      .where(eq(dreams.id, input.id))
      .limit(1);
    
    if (dream.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND", message: "梦想不存在" });
    }
    if (dream[0].userId !== userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "只能删除自己的梦想" });
    }
    
    await db.delete(dreamLogs).where(eq(dreamLogs.dreamId, input.id));
    await db.delete(dreams).where(eq(dreams.id, input.id));
    return { success: true };
  }),
```

**注意**：`authedQuery` 使用 `ctx.user` 而非 `ctx.unifiedUser`，需要统一。

### 🔴 修复 2：userId 从认证上下文获取

**目标**：API 不再接受用户传入的 userId

**修改示例**：

```typescript
// log-router.ts - create
// 之前
input: z.object({ dreamId: z.number(), userId: z.number(), ... })

// 之后
input: z.object({ dreamId: z.number(), content: z.string().min(1) })
// userId 从 ctx.unifiedUser.id 获取
```

### 🔴 修复 3：N+1 查询优化

**目标**：explore.feed 和 explore.recentLogs 使用 JOIN 一次查询

```typescript
// explore-router.ts - feed
const result = await db
  .select({
    id: dreams.id,
    title: dreams.title,
    description: dreams.description,
    category: dreams.category,
    progress: dreams.progress,
    color: dreams.color,
    createdAt: dreams.createdAt,
    userName: localUsers.displayName,
  })
  .from(dreams)
  .leftJoin(localUsers, eq(dreams.userId, localUsers.id))
  .where(eq(dreams.isPublic, 1))
  .orderBy(desc(dreams.createdAt))
  .limit(20);
```

### 🟡 修复 4：Dashboard 默认 dreamId

```typescript
// Dashboard.tsx
// 之前
const [selectedDreamId, setSelectedDreamId] = useState<number | null>(null);

// 之后（使用 lazy initializer）
const [selectedDreamId, setSelectedDreamId] = useState<number | null>(() => {
  return dreams[0]?.id ?? null;
});
```

### 🟡 修复 5：提取 DreamCard 组件

```typescript
// components/DreamCard.tsx
interface DreamCardProps {
  dream: Dream;
  variant: "compact" | "full";  // compact for Dashboard, full for Dreams
  onClick?: () => void;
}

export function DreamCard({ dream, variant, onClick }: DreamCardProps) {
  // 统一的卡片渲染逻辑
}
```

---

## 六、总结

### 项目现状

这是一个「技术展示优先于生产安全」的项目。技术选型先进、UI 设计精美、基础功能骨架完整，**但所有 API 端点都是完全开放的，没有任何权限校验，这意味着任何人可以通过简单的 HTTP 请求删除全站数据**。

### 投产前必须完成

1. **所有 API 添加权限校验**（工作量：1-2 天）
2. **userId 从认证上下文获取**（工作量：0.5 天）
3. **N+1 查询优化**（工作量：0.5 天）

### 建议的后续迭代

| 迭代 | 主题 | 功能 |
|------|------|------|
| v1.1 | 安全加固 | 权限校验 + 输入校验 + 密码强度 |
| v1.2 | 体验优化 | Toast 反馈 + Loading 状态 + 分页 |
| v1.3 | 社交功能 | 评论 + 用户主页 + 关注 |
| v1.4 | 性能优化 | 缓存策略 + CDN + 图片优化 |

**项目有潜力，但当前状态不能直接上线。**
