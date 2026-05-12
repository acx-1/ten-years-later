# 「十年后」(Ten Years Later) 产品需求说明文档 (PRD)

**版本**：v1.0  
**日期**：2026年  
**状态**：已完成开发  

---

## 目录

1. [产品概述](#1-产品概述)
2. [用户角色](#2-用户角色)
3. [功能需求](#3-功能需求)
4. [非功能需求](#4-非功能需求)
5. [数据库设计](#5-数据库设计)
6. [接口规范](#6-接口规范)
7. [界面原型](#7-界面原型)
8. [项目里程碑](#8-项目里程碑)

---

## 1. 产品概述

### 1.1 产品背景

「十年后」是一个关于未来的匿名社交网络。用户可以在这里自由地分享关于未来与梦想的真实想法，探索其他人的梦想以及背后的故事。

### 1.2 产品愿景

创造一个安全、温暖的空间，让每个人都能勇敢地描绘自己的未来，找到同路人，一起走向十年后的自己。

### 1.3 核心功能

| 功能模块 | 描述 |
|----------|------|
| 用户认证 | 用户名密码注册/登录 |
| 梦想管理 | 创建、追踪、管理个人梦想 |
| 日志记录 | 基于梦想撰写进展日志 |
| 探索发现 | 浏览他人的梦想和动态 |
| 时间线导航 | 以月份为刻度的交互式导航 |
| 故事面板 | 展示团队创业历程的内容面板 |

### 1.4 目标用户

- 年龄：18-35 岁
- 特征：对未来有憧憬、喜欢记录生活、寻求志同道合的人
- 场景：规划人生目标、追踪个人成长、分享心路历程

---

## 2. 用户角色

### 2.1 角色定义

| 角色 | 标识 | 权限 |
|------|------|------|
| 访客 | `guest` | 浏览首页、查看关于页面、查看探索页面 |
| 注册用户 | `user` | 访客所有权限 + 创建梦想、写日志、管理个人空间 |
| 管理员 | `admin` | 用户所有权限 + 管理用户和内容 |

### 2.2 用户状态流转

```
访客 ──[注册]──▶ 注册用户 ──[登录]──▶ 已登录用户
  │                                 │
  │                                 │
  └──[浏览首页/关于/探索]           └──[创建梦想/写日志/管理个人空间]
```

---

## 3. 功能需求

### 3.1 用户认证模块 (Auth)

#### 3.1.1 用户注册

| 项目 | 说明 |
|------|------|
| **功能ID** | AUTH-001 |
| **功能名称** | 用户注册 |
| **优先级** | P0 |
| **前置条件** | 用户处于未登录状态 |
| **触发方式** | 点击"注册"按钮 |

**输入项：**

| 字段 | 类型 | 必填 | 规则 |
|------|------|------|------|
| 用户名 | string | 是 | 3-50字符，仅支持字母、数字、下划线 |
| 密码 | string | 是 | 6-100字符 |
| 昵称 | string | 否 | 1-255字符，默认使用用户名 |

**处理流程：**
1. 用户填写注册表单
2. 前端进行基础格式验证
3. 提交到后端 `localAuth.register`
4. 后端检查用户名是否已存在
5. 使用 bcrypt 对密码进行哈希 (12轮 salt)
6. 生成 JWT Token
7. 设置 HTTP-Only Secure Cookie
8. 返回用户信息

**异常处理：**

| 异常场景 | 处理方式 |
|----------|----------|
| 用户名已存在 | 返回 409 错误码，提示"用户名已被使用" |
| 用户名格式不符 | 返回 400 错误码 |
| 密码长度不足 | 前端拦截，提示"密码至少6位" |

**输出项：**
- 成功：用户信息 + 自动登录
- 失败：错误提示

---

#### 3.1.2 用户登录

| 项目 | 说明 |
|------|------|
| **功能ID** | AUTH-002 |
| **功能名称** | 用户登录 |
| **优先级** | P0 |
| **前置条件** | 用户处于未登录状态 |
| **触发方式** | 点击"登录"按钮 |

**输入项：**

| 字段 | 类型 | 必填 |
|------|------|------|
| 用户名 | string | 是 |
| 密码 | string | 是 |

**处理流程：**
1. 用户填写登录表单
2. 提交到后端 `localAuth.login`
3. 后端查询用户信息
4. 使用 bcrypt.compare 验证密码
5. 生成 JWT Token (30天有效期)
6. 设置 HTTP-Only Secure Cookie
7. 返回用户信息

**异常处理：**

| 异常场景 | 处理方式 |
|----------|----------|
| 用户名不存在 | 返回 401，提示"用户名或密码错误" |
| 密码错误 | 返回 401，提示"用户名或密码错误" |

**安全说明：**
- 不区分用户名不存在和密码错误的提示（防止用户名枚举攻击）
- 使用 bcrypt 的 12 轮 salt，哈希耗时约 250ms

---

#### 3.1.3 获取当前用户

| 项目 | 说明 |
|------|------|
| **功能ID** | AUTH-003 |
| **功能名称** | 获取当前登录用户 |
| **优先级** | P0 |

**处理流程：**
1. 从 HTTP Cookie 中读取 `kimi_sid`
2. 验证 JWT Token 签名和过期时间
3. 查询数据库获取用户最新信息
4. 返回用户信息

**输出项：**

```typescript
{
  id: number;
  username: string;
  name: string;
  email: string | null;
  bio: string | null;
  role: "user" | "admin";
  createdAt: Date;
}
```

---

#### 3.1.4 退出登录

| 项目 | 说明 |
|------|------|
| **功能ID** | AUTH-004 |
| **功能名称** | 退出登录 |
| **优先级** | P0 |

**处理流程：**
1. 清除 HTTP Cookie (设置 maxAge=0)
2. 刷新页面

---

### 3.2 梦想管理模块 (Dream)

#### 3.2.1 创建梦想

| 项目 | 说明 |
|------|------|
| **功能ID** | DREAM-001 |
| **功能名称** | 创建梦想 |
| **优先级** | P0 |
| **前置条件** | 用户已登录 |

**输入项：**

| 字段 | 类型 | 必填 | 默认值 |
|------|------|------|--------|
| 梦想名称 | string | 是 | - |
| 描述 | string | 否 | - |
| 分类 | enum | 否 | "学习" |
| 预期实现时间 | string (YYYY-MM) | 否 | - |
| 颜色 | string | 否 | "#1abc9c" |

**分类选项：** 创业、旅行、学习、艺术、健康、科技、生活

---

#### 3.2.2 查看梦想列表

| 项目 | 说明 |
|------|------|
| **功能ID** | DREAM-002 |
| **功能名称** | 查看用户的梦想列表 |
| **优先级** | P0 |
| **前置条件** | 用户已登录 |

**排序规则：** 按创建时间倒序

---

#### 3.2.3 更新梦想进度

| 项目 | 说明 |
|------|------|
| **功能ID** | DREAM-003 |
| **功能名称** | 更新梦想进度 |
| **优先级** | P1 |
| **前置条件** | 梦想存在且属于当前用户 |

**输入项：**

| 字段 | 类型 | 范围 |
|------|------|------|
| 进度 | number | 0-100 |

---

#### 3.2.4 删除梦想

| 项目 | 说明 |
|------|------|
| **功能ID** | DREAM-004 |
| **功能名称** | 删除梦想 |
| **优先级** | P1 |
| **前置条件** | 梦想存在且属于当前用户 |

---

### 3.3 日志模块 (Log)

#### 3.3.1 创建日志

| 项目 | 说明 |
|------|------|
| **功能ID** | LOG-001 |
| **功能名称** | 为梦想撰写日志 |
| **优先级** | P0 |
| **前置条件** | 用户已登录，梦想存在 |

**输入项：**

| 字段 | 类型 | 必填 |
|------|------|------|
| 梦想ID | number | 是 |
| 内容 | string | 是 |

---

#### 3.3.2 查看日志列表

| 项目 | 说明 |
|------|------|
| **功能ID** | LOG-002 |
| **功能名称** | 查看日志 |
| **优先级** | P0 |

**筛选条件：**
- 按用户筛选
- 按梦想筛选

**排序规则：** 按创建时间倒序

---

#### 3.3.3 点赞日志

| 项目 | 说明 |
|------|------|
| **功能ID** | LOG-003 |
| **功能名称** | 点赞日志 |
| **优先级** | P1 |

---

### 3.4 探索模块 (Explore)

#### 3.4.1 梦想动态流

| 项目 | 说明 |
|------|------|
| **功能ID** | EXPLORE-001 |
| **功能名称** | 获取公开梦想动态 |
| **优先级** | P0 |

**展示内容：**
- 梦想标题
- 梦想描述
- 分类
- 进度
- 创建者昵称
- 创建时间

**分页：** 默认返回 20 条

---

#### 3.4.2 最新日志

| 项目 | 说明 |
|------|------|
| **功能ID** | EXPLORE-002 |
| **功能名称** | 获取最新日志动态 |
| **优先级** | P0 |

**展示内容：**
- 日志内容
- 关联梦想名称
- 创建者昵称
- 点赞数
- 创建时间

---

#### 3.4.3 搜索

| 项目 | 说明 |
|------|------|
| **功能ID** | EXPLORE-003 |
| **功能名称** | 搜索梦想 |
| **优先级** | P1 |

**搜索范围：** 梦想标题、描述

---

#### 3.4.4 统计数据

| 项目 | 说明 |
|------|------|
| **功能ID** | EXPLORE-004 |
| **功能名称** | 获取平台统计数据 |
| **优先级** | P2 |

**返回数据：**
- 总用户数
- 总梦想数
- 总日志数

---

### 3.5 首页与时间线模块 (Home)

#### 3.5.1 首页展示

| 项目 | 说明 |
|------|------|
| **功能ID** | HOME-001 |
| **功能名称** | 首页展示 |
| **优先级** | P0 |

**内容区域：**
- 左侧：登录/注册表单（未登录时）/ 快捷入口（已登录时）
- 右侧：动态内容面板（故事/功能介绍）
- 底部：月份时间线 + 功能气泡

---

#### 3.5.2 时间线导航

| 项目 | 说明 |
|------|------|
| **功能ID** | HOME-002 |
| **功能名称** | 月份时间线导航 |
| **优先级** | P1 |

**交互说明：**
- 水平时间线，12个月份刻度
- 上方排列功能/故事气泡
- 点击气泡切换上方内容面板
- 进度条指示当前位置
- 当前月份指示器

---

#### 3.5.3 内容面板切换

| 项目 | 说明 |
|------|------|
| **功能ID** | HOME-003 |
| **功能名称** | 内容面板滑动切换 |
| **优先级** | P1 |

**面板类型：**

| ID | 类型 | 内容 |
|----|------|------|
| 0-4 | 故事面板 | 团队创业故事 |
| 5 | 登录面板 | 网站介绍 + CTA |
| 6-10 | 功能面板 | 产品功能介绍 |

**动画效果：**
- 当前面板向左滑出 + 淡出
- 新面板从右滑入 + 淡入
- 持续时间：500ms
- 缓动函数：power2.inOut

---

## 4. 非功能需求

### 4.1 安全需求

| ID | 需求项 | 实现方式 | 优先级 |
|----|--------|----------|--------|
| SEC-001 | 密码安全存储 | bcryptjs 哈希 (12轮 salt) | P0 |
| SEC-002 | 会话安全 | HTTP-Only Secure SameSite Cookie | P0 |
| SEC-003 | 防 SQL 注入 | Drizzle ORM 参数化查询 | P0 |
| SEC-004 | 输入验证 | Zod Schema 运行时校验 | P0 |
| SEC-005 | 防用户名枚举 | 登录错误信息统一化 | P0 |
| SEC-006 | JWT 安全 | 签名验证 + 过期检查 + 密钥轮换 | P0 |
| SEC-007 | HTTPS 传输 | 全站 HTTPS 加密 | P0 |

### 4.2 性能需求

| ID | 需求项 | 目标值 |
|----|--------|--------|
| PERF-001 | 首屏加载时间 | < 3 秒 |
| PERF-002 | API 响应时间 | < 200ms (P95) |
| PERF-003 | 数据库查询时间 | < 50ms |
| PERF-004 | 并发用户数 | 支持 100+ 并发 |

### 4.3 可用性需求

| ID | 需求项 | 说明 |
|----|--------|------|
| UX-001 | 响应式设计 | 支持桌面端、平板、手机 |
| UX-002 | 无障碍访问 | 表单支持键盘导航 |
| UX-003 | 加载状态 | API 请求显示加载指示器 |
| UX-004 | 错误提示 | 友好的中文错误信息 |
| UX-005 | 动画流畅 | 60fps 动画效果 |

### 4.4 兼容性需求

| ID | 需求项 | 支持范围 |
|----|--------|----------|
| COMP-001 | 浏览器 | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| COMP-002 | Node.js | 18+ |

---

## 5. 数据库设计

### 5.1 用户表 (local_users)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | serial | PK | 自增主键 |
| username | varchar(50) | NOT NULL, UNIQUE | 用户名 |
| display_name | varchar(255) | NULL | 显示昵称 |
| password_hash | varchar(255) | NOT NULL | bcrypt 密码哈希 |
| email | varchar(320) | NULL | 邮箱 |
| bio | text | NULL | 个人简介 |
| role | enum("user","admin") | DEFAULT "user" | 角色 |
| created_at | timestamp | DEFAULT NOW() | 创建时间 |
| updated_at | timestamp | DEFAULT NOW() | 更新时间 |

### 5.2 梦想表 (dreams)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | serial | PK | 自增主键 |
| user_id | bigint unsigned | NOT NULL | 用户ID |
| user_type | enum("oauth","local") | DEFAULT "local" | 用户类型 |
| title | varchar(255) | NOT NULL | 梦想标题 |
| description | text | NULL | 描述 |
| category | varchar(50) | NULL | 分类 |
| deadline | varchar(20) | NULL | 预期时间 |
| progress | int | DEFAULT 0 | 进度 (0-100) |
| color | varchar(20) | DEFAULT "#1abc9c" | 颜色 |
| is_public | int | DEFAULT 1 | 是否公开 |
| created_at | timestamp | DEFAULT NOW() | 创建时间 |
| updated_at | timestamp | DEFAULT NOW() | 更新时间 |

### 5.3 日志表 (dream_logs)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | serial | PK | 自增主键 |
| dream_id | bigint unsigned | NOT NULL | 梦想ID |
| user_id | bigint unsigned | NOT NULL | 用户ID |
| user_type | enum("oauth","local") | DEFAULT "local" | 用户类型 |
| content | text | NOT NULL | 日志内容 |
| likes | int | DEFAULT 0 | 点赞数 |
| created_at | timestamp | DEFAULT NOW() | 创建时间 |

---

## 6. 接口规范

### 6.1 请求/响应格式

所有 API 通过 tRPC 调用，使用 JSON 格式，类型安全。

**错误响应格式：**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "用户名或密码错误"
  }
}
```

### 6.2 认证接口

#### 注册
```
Endpoint: localAuth.register
Method: mutation
Input: { username: string, password: string, displayName?: string }
Output: { success: true, user: { id, username, name } }
```

#### 登录
```
Endpoint: localAuth.login
Method: mutation
Input: { username: string, password: string }
Output: { success: true, user: { id, username, name } }
Cookie: Set-Cookie: kimi_sid=<jwt_token>; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000
```

#### 获取当前用户
```
Endpoint: localAuth.me
Method: query
Input: 无 (从 Cookie 读取 Token)
Output: { id, username, name, email, bio, role, createdAt } | null
```

#### 退出登录
```
Endpoint: localAuth.logout
Method: mutation
Input: 无
Output: { success: true }
Cookie: Set-Cookie: kimi_sid=; Max-Age=0
```

### 6.3 梦想接口

#### 创建梦想
```
Endpoint: dream.create
Method: mutation
Input: { userId, userType?, title, description?, category?, deadline?, color? }
Output: { id: number, success: true }
```

#### 按用户列出梦想
```
Endpoint: dream.listByUser
Method: query
Input: { userId: number, userType?: "oauth" | "local" }
Output: Dream[]
```

#### 更新进度
```
Endpoint: dream.updateProgress
Method: mutation
Input: { id: number, progress: number (0-100) }
Output: { success: true }
```

### 6.4 日志接口

#### 创建日志
```
Endpoint: log.create
Method: mutation
Input: { dreamId, userId, userType?, content: string }
Output: { id: number, success: true }
```

#### 按用户列出日志
```
Endpoint: log.listByUser
Method: query
Input: { userId: number }
Output: DreamLog[]
```

### 6.5 探索接口

#### 梦想动态流
```
Endpoint: explore.feed
Method: query
Input: 无
Output: Array<{ ...dream, userName: string }>
```

#### 最新日志
```
Endpoint: explore.recentLogs
Method: query
Input: 无
Output: Array<{ ...log, userName: string, dreamTitle: string }>
```

#### 统计数据
```
Endpoint: explore.stats
Method: query
Input: 无
Output: { totalDreams: number, totalLogs: number, totalUsers: number }
```

---

## 7. 界面原型

### 7.1 页面清单

| 页面 | 路径 | 是否需要登录 | 说明 |
|------|------|-------------|------|
| 首页 | `/` | 否 | 全屏背景 + 登录表单 + 时间线 |
| 登录/注册 | `/login` | 否 | 独立登录注册页面 |
| 我的空间 | `/dashboard` | 是 | 用户仪表盘 |
| 探索 | `/explore` | 否 | 发现他人梦想 |
| 梦想管理 | `/dreams` | 是 | 管理个人梦想 |
| 关于我们 | `/about` | 否 | 介绍页面 |
| 404 | `*` | 否 | 未找到页面 |

### 7.2 导航结构

```
十年后 (Logo)
├── 首页         /          [所有人]
├── 我的         /dashboard  [需登录]
├── 探索一下     /explore    [所有人]
├── 梦想         /dreams     [需登录]
├── 关于我们     /about      [所有人]
└── 登录/退出               [根据状态]
```

### 7.3 响应式断点

| 断点 | 范围 | 说明 |
|------|------|------|
| sm | < 640px | 移动端，单列布局 |
| md | 640px - 1023px | 平板，双列布局 |
| lg | >= 1024px | 桌面端，完整布局 |

---

## 8. 项目里程碑

### 里程碑 1：基础架构 (已完成)

- [x] 初始化前端项目 (React + Vite + Tailwind)
- [x] 初始化后端项目 (Hono + tRPC + Drizzle)
- [x] 配置数据库连接
- [x] 创建数据库表结构
- [x] 配置类型安全

### 里程碑 2：认证系统 (已完成)

- [x] 用户注册功能
- [x] 用户登录功能
- [x] 密码安全哈希 (bcrypt)
- [x] JWT 会话管理
- [x] 登出功能
- [x] 认证状态 Hook

### 里程碑 3：核心业务 (已完成)

- [x] 首页设计与实现
- [x] 时间线导航组件
- [x] 内容面板切换动画
- [x] 梦想 CRUD 功能
- [x] 日志创建/查看功能
- [x] 探索发现页面

### 里程碑 4：用户空间 (已完成)

- [x] 用户仪表盘
- [x] 梦想时间线展示
- [x] 日志记录功能
- [x] 进度追踪
- [x] 统计数据展示

### 里程碑 5：完善与优化 (已完成)

- [x] 关于我们页面
- [x] 响应式适配
- [x] 动画效果优化
- [x] 图片资源生成
- [x] 类型检查通过
- [x] 生产构建成功

---

## 附录

### A. 技术依赖清单

```json
{
  "前端": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0",
    "typescript": "^5.7.0",
    "vite": "^7.0.0",
    "tailwindcss": "^4.0.0",
    "gsap": "^3.12.0",
    "@trpc/react-query": "^11.0.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "后端": {
    "hono": "^4.0.0",
    "@trpc/server": "^11.0.0",
    "drizzle-orm": "^0.30.0",
    "mysql2": "^3.9.0",
    "bcryptjs": "^2.4.3",
    "jose": "^5.0.0",
    "zod": "^3.22.0",
    "superjson": "^2.0.0"
  }
}
```

### B. 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | MySQL 连接字符串 | `mysql://user:pass@host:port/db` |
| `APP_ID` | 应用ID | `19e17b96-...` |
| `APP_SECRET` | 应用密钥 (JWT签名用) | `Mytrsh5SIq...` |
| `VITE_APP_ID` | 前端应用ID | 同 APP_ID |
| `VITE_KIMI_AUTH_URL` | 认证服务地址 | `https://auth.kimi.com` |

### C. 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run check` | TypeScript 类型检查 |
| `npm run db:push` | 推送数据库 schema |
| `npm start` | 启动生产服务器 |
