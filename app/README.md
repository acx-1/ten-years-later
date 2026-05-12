# 十年后 (Ten Years Later)

> 现代全栈重构版 — 一个关于未来的社交网络

## 🌐 在线预览

[点击访问](https://your-deployment-url.com)

## 📖 项目背景

本项目是对 2014 年作品 **"十年后" (10years.me)** 的现代技术重构。

- **原作**: [hytczhuliwei/Webs](https://github.com/hytczhuliwei/Webs)
- **原作者**: [hytczhuliwei](https://github.com/hytczhuliwei)
- **原网站**: [在线预览](https://hytczhuliwei.github.io/staticPage/login/login.html)

> **声明**: 本项目是独立重新实现，不包含任何来自原仓库的代码文件。原作品版权归其作者所有。

### 原作 vs 重构

| 维度 | 原作 (2014) | 本重构 (2026)                           |
|------|-------------|--------------------------------------|
| 前端 | jQuery + 原生 CSS | React 19 + TypeScript + Tailwind CSS |
| 后端 | PHP + MySQL | Hono + tRPC + Drizzle ORM            |
| 构建工具 | 无 | Vite                                 |
| 认证 | Session | JWT + bcrypt                         |
| 类型安全 | 无 | 全链路 TypeScript                       |
| 功能 | 静态展示页 | 全栈应用 (注册/登录/梦想/日志/探索)                |

## 🏗 技术架构

### 前端

- **React 19** — UI 框架
- **TypeScript** — 类型系统
- **Vite** — 构建工具
- **Tailwind CSS** — 原子化 CSS
- **shadcn/ui** — 组件库
- **GSAP** — 动画引擎
- **React Router v7** — 客户端路由
- **tRPC + React Query** — 类型安全的 API 调用

### 后端

- **Hono** — 高性能 Web 框架
- **tRPC 11** — 端到端类型安全 API
- **Drizzle ORM** — 类型安全的 SQL 构建器
- **MySQL** — 关系型数据库
- **bcryptjs** — 密码哈希
- **jose** — JWT 签名验证
- **Zod** — 输入验证

## ✨ 功能特性

### 已完成功能

- [x] 用户注册/登录 (用户名 + 密码)
- [x] 密码安全存储 (bcrypt 12轮 salt)
- [x] JWT 会话管理 (HTTP-Only Secure Cookie)
- [x] 梦想创建/查看/管理
- [x] 梦想进度追踪 (0-100%)
- [x] 日志撰写与查看
- [x] 公开梦想动态流
- [x] 时间线导航 (12月份 + 功能气泡)
- [x] 故事/功能面板滑动切换
- [x] 响应式设计 (桌面/平板/手机)
- [x] 流畅的 GSAP 入场动画

### 页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 全屏背景 + 登录表单 + 时间线导航 |
| 登录/注册 | `/login` | 独立登录注册页面 |
| 我的空间 | `/dashboard` | 用户仪表盘、梦想列表、日志记录 |
| 探索 | `/explore` | 发现他人梦想、实时动态 |
| 梦想管理 | `/dreams` | 添加/管理梦想、进度追踪、统计 |
| 关于我们 | `/about` | 使命愿景、价值观、团队故事 |

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- MySQL 数据库

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/acx-1/ten-years-later.git
cd ten-years-later

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的数据库连接信息

# 4. 推送数据库 schema
npm run db:push

# 5. 启动开发服务器
npm run dev
```

### 环境变量配置

复制 `.env.example` 为 `.env`，按需修改以下变量：

```env
# 数据库连接
DATABASE_URL=mysql://user:password@host:port/ten_years_later

# 应用密钥 (JWT 签名用)
APP_SECRET=your-secret-key-here

# 前端应用 ID
VITE_APP_ID=your-app-id
```

> 注意: `.env` 文件包含敏感信息，**不要提交到 Git 仓库**。

## 📦 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器 (http://localhost:3000)

# 构建
npm run build        # 生产构建
npm run check        # TypeScript 类型检查

# 数据库
npm run db:push      # 推送 schema 到数据库
npm run db:generate  # 生成迁移文件
npm run db:migrate   # 执行迁移

# 生产
npm start            # 启动生产服务器
```

## 📁 项目结构

```
ten-years-later/
├── api/                 # 后端 API (Hono + tRPC)
│   ├── local-auth-router.ts  # 本地认证路由
│   ├── dream-router.ts       # 梦想路由
│   ├── log-router.ts         # 日志路由
│   ├── explore-router.ts     # 探索路由
│   └── ...
├── db/                  # 数据库 (Drizzle ORM)
│   └── schema.ts        # 表结构定义
├── src/                 # 前端源码 (React)
│   ├── pages/           # 页面组件
│   ├── components/      # 可复用组件
│   ├── sections/        # 页面区块
│   ├── hooks/           # 自定义 Hooks
│   └── ...
├── contracts/           # 前后端共享类型
├── public/images/       # 静态图片资源
├── .env                 # 环境变量 (不提交)
├── .env.example         # 环境变量模板
└── README.md
```

## 🔐 安全特性

| 特性 | 实现方式 |
|------|----------|
| 密码哈希 | bcryptjs (12轮 salt) |
| 会话管理 | JWT + HTTP-Only Secure Cookie |
| SQL 注入防护 | Drizzle ORM 参数化查询 |
| 输入验证 | Zod Schema 运行时校验 |
| 防用户名枚举 | 登录错误信息统一化 |

## 📄 文档

- [项目架构图](docs/ARCHITECTURE.md) — 完整的架构设计文档
- [需求说明文档](docs/REQUIREMENTS.md) — 产品需求 PRD
- [API 接口文档](docs/API.md) — 接口规范说明

## 🤝 致谢

- **灵感来源**: [hytczhuliwei](https://github.com/hytczhuliwei) 的 [Webs](https://github.com/hytczhuliwei/Webs) 项目
- 原作的设计理念和故事内容启发了本项目的重构

## 📜 许可证

[MIT](LICENSE)

**注意**: 本项目的设计灵感来源于 [hytczhuliwei/Webs](https://github.com/hytczhuliwei/Webs)。原作版权归其原作者所有。本项目的代码部分采用 MIT 许可证独立授权。
