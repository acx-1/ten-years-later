# 「十年后」网站部署实施文档

## 一、项目概述

**项目名称**：十年后 (Ten Years Later)  
**项目类型**：社交网络平台前端  
**版本**：v1.0  
**构建日期**：2026年  

### 项目简介
「十年后」是一个关于未来的匿名社交网络。用户可以分享关于未来与梦想的真实想法，探索其他人的梦想及背后的故事。本项目包含完整的登录页、用户仪表盘、探索发现、梦想管理和关于我们等5个核心页面。

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.0.0 | UI框架 |
| TypeScript | 5.7.0 | 类型系统 |
| Vite | 7.x | 构建工具 |
| Tailwind CSS | 4.x | 原子化CSS |
| GSAP | 3.12.0 | 动画引擎 |
| React Router | 7.x | 客户端路由 |

---

## 二、项目结构

```
app/
├── dist/                          # 生产构建输出（部署用）
│   ├── index.html                 # 入口HTML
│   ├── assets/                    # JS/CSS打包文件
│   │   ├── index-[hash].js        # 主JS
│   │   └── index-[hash].css       # 主CSS
│   └── images/                    # 静态图片资源
│       ├── bg-hero.jpg            # 首页背景图
│       ├── feature-record.jpg     # 功能插图-记录
│       ├── feature-save.jpg       # 功能插图-存录
│       ├── feature-search.jpg     # 功能插图-搜索
│       ├── feature-follow.jpg     # 功能插图-关注
│       ├── feature-dream.jpg      # 功能插图-梦想
│       ├── hero-dashboard.jpg     # 仪表盘页头图
│       ├── hero-explore.jpg       # 探索页头图
│       ├── hero-dreams.jpg        # 梦想页头图
│       └── team-about.jpg         # 关于页头图
│
├── src/
│   ├── components/                # 可复用组件
│   │   ├── Navbar.tsx             # 顶部导航栏
│   │   ├── Footer.tsx             # 页脚
│   │   ├── Logo.tsx               # 品牌Logo
│   │   ├── LoginForm.tsx          # 登录表单
│   │   ├── ContentPanel.tsx       # 内容面板
│   │   └── FeatureBubble.tsx      # 时间线气泡
│   ├── sections/                  # 页面区块
│   │   ├── HeroSection.tsx        # 首页英雄区
│   │   └── TimelineNav.tsx        # 底部时间线导航
│   ├── pages/                     # 页面组件
│   │   ├── Home.tsx               # 首页/登录
│   │   ├── Dashboard.tsx          # 我的空间
│   │   ├── Explore.tsx            # 探索
│   │   ├── Dreams.tsx             # 梦想管理
│   │   └── About.tsx              # 关于我们
│   ├── hooks/                     # 自定义Hooks
│   │   └── useImagePreloader.ts   # 图片预加载
│   ├── data/                      # 数据文件
│   │   └── content.ts             # 内容数据
│   ├── App.tsx                    # 根组件（路由配置）
│   ├── main.tsx                   # 入口文件
│   └── index.css                  # 全局样式
│
├── index.html                     # HTML模板
├── vite.config.ts                 # Vite配置
├── tailwind.config.js             # Tailwind配置
├── tsconfig.json                  # TypeScript配置
└── package.json                   # 依赖管理
```

---

## 三、部署前准备

### 3.1 环境要求

| 项目 | 最低版本 | 推荐版本 |
|------|----------|----------|
| Node.js | 18.0.0 | 20.x LTS |
| npm | 8.0.0 | 10.x |
| Git | 2.30.0 | 最新 |

### 3.2 验证环境

```bash
# 检查 Node.js 版本
node -v
# 输出应 >= v18.0.0

# 检查 npm 版本
npm -v
# 输出应 >= 8.0.0
```

---

## 四、部署方式

### 方式一：静态文件部署（推荐）

适用于：Nginx、Apache、CDN、对象存储（阿里云OSS/腾讯云COS/AWS S3）等静态托管服务。

#### 步骤 1：获取构建文件

项目 `dist/` 目录已包含完整构建输出，可直接用于部署。

若需重新构建：

```bash
# 1. 进入项目目录
cd app/

# 2. 安装依赖
npm install

# 3. 构建生产版本
npm run build

# 4. 构建输出位于 dist/ 目录
```

#### 步骤 2：部署到服务器

**Nginx 配置示例：**

```nginx
server {
    listen 80;
    server_name tenyears.example.com;
    root /var/www/thenyears/dist;
    index index.html;

    # 开启 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 单页应用路由回退
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

**Apache 配置示例（.htaccess）：**

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# 开启 gzip
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

---

### 方式二：Docker 容器部署

#### 步骤 1：创建 Dockerfile

```dockerfile
# 使用 Nginx 作为 Web 服务器
FROM nginx:alpine

# 复制构建输出到 Nginx 默认目录
COPY dist/ /usr/share/nginx/html/

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### 步骤 2：创建 nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 步骤 3：构建并运行

```bash
# 构建 Docker 镜像
docker build -t ten-years-later:latest .

# 运行容器
docker run -d -p 8080:80 --name ten-years ten-years-later:latest

# 访问 http://localhost:8080
```

---

### 方式三：云服务平台部署

#### Vercel（推荐，免费）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 在项目根目录执行
vercel --prod

# 3. 按提示完成配置
```

#### Netlify

```bash
# 1. 安装 Netlify CLI
npm i -g netlify-cli

# 2. 部署
cd dist/
netlify deploy --prod --dir=.
```

#### 阿里云 OSS

```bash
# 安装 aliyun-cli 后执行
aliyun oss cp -r dist/ oss://your-bucket-name/ --recursive
```

---

### 方式四：GitHub Pages 部署

```bash
# 1. 安装 gh-pages
npm install -D gh-pages

# 2. 在 package.json 中添加：
# "homepage": "https://yourname.github.io/repo-name",
# "scripts": {
#   "deploy": "gh-pages -d dist"
# }

# 3. 部署
npm run build
npm run deploy
```

---

## 五、开发环境搭建

### 5.1 首次启动

```bash
# 1. 解压项目
tar -xzf ten-years-later-project.tar.gz
cd ten-years-later/

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 浏览器访问 http://localhost:5173
```

### 5.2 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（热更新） |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | 运行 ESLint 检查 |

---

## 六、路由配置

本项目使用 React Router 客户端路由，部署时需要确保服务器端配置 SPA 回退。

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 登录首页 |
| `/dashboard` | Dashboard | 用户仪表盘 |
| `/explore` | Explore | 探索发现 |
| `/dreams` | Dreams | 梦想管理 |
| `/about` | About | 关于我们 |

**重要**：所有路由都应返回 `index.html`，由 React Router 处理客户端路由。

---

## 七、性能优化

### 7.1 已内置优化

- ✅ Vite 代码分割（Code Splitting）
- ✅ Tree Shaking 移除未使用代码
- ✅ CSS 压缩与合并
- ✅ JS 压缩与混淆
- ✅ 静态资源 Hash 指纹（长期缓存）
- ✅ 图片懒加载

### 7.2 可进一步优化

```bash
# 1. 启用 Brotli 压缩（Nginx）
brotli on;
brotli_types text/plain text/css application/javascript;

# 2. 配置 CDN（推荐阿里云 CDN / CloudFlare）
# 将静态资源上传至 CDN，修改 base 配置

# 3. 图片优化
# 使用 WebP 格式替换 JPEG
# 配置响应式图片
```

---

## 八、常见问题排查

### Q1: 刷新页面返回 404

**原因**：服务器未配置 SPA 路由回退  
**解决**：参考第四章 Nginx/Apache 配置中的 `try_files` 或 `RewriteRule`

### Q2: 图片加载失败

**原因**：图片路径配置不正确  
**解决**：
- 检查 `public/images/` 目录是否存在
- 确保图片文件在构建时被复制到 `dist/images/`
- 如使用子路径部署，修改 `vite.config.ts` 中的 `base` 配置

```typescript
// vite.config.ts
export default defineConfig({
  base: '/your-sub-path/',  // 如有子路径
  // ...
});
```

### Q3: 构建失败，提示类型错误

**解决**：
```bash
# 检查 TypeScript 类型
npx tsc --noEmit

# 修复类型错误后重新构建
npm run build
```

### Q4: 动画不流畅

**原因**：浏览器兼容性或硬件加速问题  
**解决**：
- 确保浏览器支持 `transform` 和 `opacity` 属性
- 检查是否开启了减少动画偏好（prefers-reduced-motion）

---

## 九、后续开发建议

### 9.1 后端集成

当前为纯前端静态网站，建议对接后端实现：

```
推荐后端技术栈：
- Node.js + Express + MongoDB
- Python + Django + PostgreSQL
- Java + Spring Boot + MySQL
```

### 9.2 功能扩展

| 优先级 | 功能 | 说明 |
|--------|------|------|
| P0 | 用户注册/登录 | 对接后端认证系统 |
| P0 | 数据库 | 用户数据、梦想、日志持久化 |
| P1 | 实时通知 | WebSocket 推送动态 |
| P1 | 图片上传 | 头像、日志配图 |
| P2 | 搜索功能 | 全文搜索 Elasticsearch |
| P2 | 推荐算法 | 个性化梦想推荐 |

### 9.3 安全性

- 启用 HTTPS
- 配置 CORS 策略
- 防止 XSS 攻击（输入过滤）
- CSRF 防护

---

## 十、联系与支持

- **项目源码**：基于 https://github.com/hytczhuliwei/Webs 重构
- **原始设计**：2014年「十年后」团队
- **技术栈文档**：
  - React: https://react.dev/
  - Vite: https://vitejs.dev/
  - Tailwind CSS: https://tailwindcss.com/
  - GSAP: https://greensock.com/gsap/

---

## 附录：快速检查清单

部署前请确认：

- [ ] Node.js 版本 >= 18
- [ ] `npm install` 执行成功
- [ ] `npm run build` 构建成功
- [ ] `dist/` 目录包含 `index.html` 和 `assets/`
- [ ] 服务器配置了 SPA 路由回退
- [ ] 静态资源缓存策略已配置
- [ ] HTTPS 证书已配置（生产环境）
- [ ] 域名 DNS 解析正确
