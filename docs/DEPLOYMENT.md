# 🚀 部署指南

本项目支持多种部署方式，推荐使用 **Vercel** 进行部署，提供最佳的 Next.js 支持和开发体验。

## 📋 目录

- [Vercel 部署（推荐）](#vercel-部署推荐)
- [GitHub Pages 部署](#github-pages-部署)
- [自定义服务器部署](#自定义服务器部署)
- [环境变量配置](#环境变量配置)
- [部署故障排除](#部署故障排除)

## 🌟 Vercel 部署（推荐）

### 为什么选择 Vercel？

- ✅ **零配置部署** - 自动检测 Next.js 项目
- ✅ **官方支持** - Next.js 官方推荐平台
- ✅ **免费额度** - 个人项目完全够用
- ✅ **全球 CDN** - 自动优化访问速度
- ✅ **自动 HTTPS** - 免费 SSL 证书
- ✅ **预览部署** - 每个 PR 自动生成预览链接

### 快速部署步骤

#### 方法一：通过 Vercel 控制台（最简单）

1. **访问 [Vercel](https://vercel.com)**
   ```
   https://vercel.com
   ```

2. **使用 GitHub 账号登录**

3. **导入项目**
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

4. **配置项目**
   - 项目名称：`front-base`（或自定义）
   - Framework Preset：`Next.js`（自动检测）
   - Root Directory：`./`（默认）

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成（通常 2-3 分钟）

#### 方法二：通过 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   # 在项目根目录执行
   vercel
   
   # 生产环境部署
   vercel --prod
   ```

### 自动化部署配置

项目已配置 GitHub Actions 自动部署，需要设置以下 Secrets：

1. **获取 Vercel Token**
   - 访问 [Vercel Settings](https://vercel.com/account/tokens)
   - 创建新的 Token
   - 复制 Token 值

2. **获取项目信息**
   ```bash
   # 在项目目录执行
   vercel link
   
   # 查看项目配置
   cat .vercel/project.json
   ```

3. **在 GitHub 设置 Secrets**
   - 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
   - 添加以下 Secrets：
     ```
     VERCEL_TOKEN=your-vercel-token
     VERCEL_ORG_ID=your-org-id
     VERCEL_PROJECT_ID=your-project-id
     ```

### 部署后访问

- **生产环境**：`https://your-project.vercel.app`
- **预览环境**：每个 PR 会自动生成预览链接

## 📄 GitHub Pages 部署

如果你更喜欢使用 GitHub Pages：

### 配置步骤

1. **修改 next.config.ts**
   ```typescript
   const nextConfig: NextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     }
   };
   ```

2. **创建 GitHub Actions 工作流**
   ```yaml
   # .github/workflows/pages.yml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [main]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'
         - run: npm ci
         - run: npm run build
         - uses: actions/deploy-pages@v4
           with:
             artifact_name: github-pages
             path: out/
   ```

3. **启用 GitHub Pages**
   - 仓库 Settings → Pages
   - Source: GitHub Actions

## 🖥️ 自定义服务器部署

### Docker 部署

1. **创建 Dockerfile**
   ```dockerfile
   FROM node:20-alpine AS base
   
   FROM base AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   FROM base AS builder
   WORKDIR /app
   COPY . .
   COPY --from=deps /app/node_modules ./node_modules
   RUN npm run build
   
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   
   EXPOSE 3000
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. **构建和运行**
   ```bash
   # 构建镜像
   docker build -t front-base .
   
   # 运行容器
   docker run -p 3000:3000 front-base
   ```

### PM2 部署

1. **安装 PM2**
   ```bash
   npm install -g pm2
   ```

2. **创建 ecosystem.config.js**
   ```javascript
   module.exports = {
     apps: [{
       name: 'front-base',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

3. **部署**
   ```bash
   npm run build
   pm2 start ecosystem.config.js
   ```

## 🔧 环境变量配置

### 开发环境

复制 `.env.example` 到 `.env.local`：
```bash
cp .env.example .env.local
```

### 生产环境

在部署平台设置以下环境变量：

| 变量名 | 描述 | 必需 |
|--------|------|------|
| `NODE_ENV` | 环境类型 | ✅ |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | ❌ |
| `NEXT_PUBLIC_API_BASE_URL` | API 基础 URL | ✅ |
| `JWT_SECRET` | JWT 密钥 | ✅ |
| `ENCRYPTION_KEY` | 加密密钥 | ✅ |

### Vercel 环境变量设置

1. 进入 Vercel 项目控制台
2. Settings → Environment Variables
3. 添加所需的环境变量
4. 重新部署项目

## 🔍 部署故障排除

### 常见问题

#### 1. 构建失败

**问题**：`npm run build` 失败
```bash
# 解决方案
npm ci                    # 重新安装依赖
npm run lint:fix         # 修复代码格式问题
npm run test             # 确保测试通过
npm run build            # 重新构建
```

#### 2. 环境变量未生效

**问题**：环境变量在生产环境中未生效
```bash
# 检查环境变量
echo $NODE_ENV

# Vercel 中检查
vercel env ls
```

#### 3. 静态资源 404

**问题**：图片或其他静态资源无法加载
```typescript
// next.config.ts
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : '',
};
```

#### 4. API 路由问题

**问题**：API 路由在部署后无法访问
- 确保 API 路由文件在 `app/api/` 目录下
- 检查路由文件命名是否正确（`route.ts`）
- 验证 HTTP 方法是否正确导出

### 性能优化

#### 1. 构建优化

```typescript
// next.config.ts
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
  },
};
```

#### 2. 图片优化

```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
};
```

## 📊 部署监控

### 性能监控

- **Vercel Analytics**：自动启用
- **Web Vitals**：内置支持
- **错误追踪**：集成 Sentry（可选）

### 日志查看

```bash
# Vercel 日志
vercel logs

# 本地日志
npm run dev
```

## 🔗 相关链接

- [Vercel 官方文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Docker 官方文档](https://docs.docker.com/)

---

## 📞 获取帮助

如果在部署过程中遇到问题：

1. 查看 [部署故障排除](#部署故障排除) 部分
2. 检查 GitHub Actions 日志
3. 查看 Vercel 部署日志
4. 参考官方文档

**快速部署命令**：
```bash
# 一键部署到 Vercel
npx vercel --prod

# 检查部署状态
npx vercel ls
```