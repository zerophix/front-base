# 🧪 Front-Base LIMS

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.22-0170FE?logo=antdesign&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)

**现代化实验室信息管理系统前端解决方案**

[🚀 快速开始](#-快速开始) • [📖 文档](#-项目结构) • [🛠️ 开发指南](#-开发指南) • [🤝 贡献](#-贡献指南)

</div>

---

## 📋 项目概述

Front-Base LIMS 是一个基于 **Next.js 15** + **React 19** + **TypeScript** 构建的现代化实验室信息管理系统前端项目。采用企业级架构设计，提供完整的实验室管理解决方案。

### ✨ 核心特性

- 🎯 **61个业务页面** - 覆盖完整的实验室管理流程
- 🏗️ **企业级架构** - 模块化设计，高度可维护
- 🔒 **安全优先** - 内置安全防护和权限管理
- ⚡ **性能优化** - 92.1%的性能优化率，极致用户体验
- 🎨 **现代UI** - 基于Ant Design 5的精美界面
- 📱 **响应式设计** - 完美适配各种设备
- 🧪 **测试覆盖** - 完整的单元测试和集成测试
- 🔄 **实时更新** - 支持数据实时同步

## 🛠️ 技术栈

### 核心框架
- **[Next.js 15](https://nextjs.org/)** - 全栈React框架，支持App Router
- **[React 19](https://react.dev/)** - 最新版本React，支持并发特性
- **[TypeScript 5](https://www.typescriptlang.org/)** - 类型安全的JavaScript超集

### UI & 样式
- **[Ant Design 5](https://ant.design/)** - 企业级UI设计语言和组件库
- **CSS Modules** - 模块化CSS解决方案
- **响应式设计** - 移动端优先的设计理念

### 状态管理 & 数据
- **[Zustand](https://zustand-demo.pmnd.rs/)** - 轻量级状态管理库
- **React Query** - 服务端状态管理
- **Axios** - HTTP客户端

### 开发工具
- **[Turbopack](https://turbo.build/pack)** - 极速构建工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Husky** - Git hooks管理
- **Jest** - 单元测试框架

### 性能优化
- **代码分割** - 动态导入和懒加载
- **图片优化** - Next.js Image组件
- **缓存策略** - 多层缓存机制
- **Bundle分析** - 包大小监控

## 📁 项目结构

```
front-base/
├── 📁 app/                     # Next.js App Router 页面
│   ├── 👥 personnel/          # 人员管理模块 (8个页面)
│   ├── 🔧 equipment/          # 设备管理模块 (15个页面)
│   ├── 📋 quality/            # 质量管理模块 (20个页面)
│   ├── 📊 project/            # 项目管理模块 (4个页面)
│   ├── 📈 data/               # 数据管理模块 (5个页面)
│   ├── 🏠 home/               # 首页模块
│   ├── 📊 dashboard/          # 仪表板
│   ├── 🔐 api/                # API路由
│   └── 📄 layout.tsx          # 根布局组件
│
├── 📁 src/                     # 核心源代码
│   ├── 🧩 components/         # 可复用组件库
│   │   ├── common/           # 通用业务组件
│   │   ├── layouts/          # 布局组件
│   │   └── templates/        # 页面模板组件
│   ├── 🎣 hooks/              # 自定义React Hooks
│   │   ├── useApiRequest.ts  # API请求Hook
│   │   ├── useFormSubmit.ts  # 表单提交Hook
│   │   ├── usePageConfig.ts  # 页面配置Hook
│   │   └── useTableData.ts   # 表格数据Hook
│   ├── 🌐 services/           # API服务层
│   │   └── api/              # 模块化API接口
│   ├── 🗄️ store/              # 状态管理
│   │   ├── index.ts          # Store入口
│   │   └── modules/          # 模块化Store
│   ├── 📝 types/              # TypeScript类型定义
│   ├── 🎨 styles/             # 全局样式文件
│   ├── ⚙️ config/             # 配置文件
│   │   ├── routes.ts         # 路由配置 (单一数据源)
│   │   └── security.ts       # 安全配置
│   ├── 🛠️ utils/              # 工具函数库
│   └── 🧪 __tests__/          # 测试文件
│
├── 📁 docs/                    # 项目文档
│   ├── architecture/         # 架构决策记录 (ADR)
│   └── FORM_GUIDELINES.md    # 表单开发指南
│
├── 📁 public/                  # 静态资源
├── 📁 scripts/                 # 构建和部署脚本
└── 📁 tmp/                     # 临时文件和报告
    ├── performance-report.json
    ├── bundle-analysis-report.json
    └── optimization-summary.md
```

### 🏗️ 架构亮点

- **📋 单一数据源** - 页面元信息统一由 `routes.ts` 管理
- **🔄 模块化设计** - 按业务领域划分的清晰模块结构  
- **🎯 组件复用** - 高度抽象的模板组件，减少重复代码
- **🧪 测试驱动** - 完整的单元测试和集成测试覆盖
- **📊 性能监控** - 内置性能分析和优化工具

## 架构设计

### 架构治理总则

为避免“信息双源”和长期漂移，项目对页面元信息与导航采用单一数据源策略：

- 页面元信息（`title`/`breadcrumbs`/`recordNumber`）仅由 `src/config/routes.ts` 提供。
- 页面不得硬编码导航信息；通过 `useRouteMeta + usePageConfig` 设置到全局 store。
- 模板组件（`BaseFormPage`/`StandardFormPage`）渲染时只读取全局 store 中的页面配置。
- 路由前缀必须与模块一致：`/equipment`、`/quality`、`/personnel`、`/project`、`/data`。
- 面包屑根项中文名必须匹配模块名，且若存在 `parent`，根项 `href === parent`。

详情参见：`docs/architecture/ADR-0001-single-source-page-metadata.md`。

### 分层架构

```
┌─────────────────────────────────────┐
│  业务页面层 (61个页面)              │
│  - 简单表单页 (StandardFormPage)   │
│  - 复杂页面 (自定义组合)            │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  组件层                              │
│  - EditableTable (可编辑表格)       │
│  - FormActions (表单按钮)           │
│  - FormPageContainer (页面容器)    │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  逻辑层 (Hooks)                      │
│  - useTableData (表格数据管理)      │
│  - useFormSubmit (表单提交)         │
│  - usePageConfig (页面配置)         │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  服务层                              │
│  - API Client (Axios封装)           │
│  - 模块化API (personnel/equipment)  │
└─────────────────────────────────────┘
```

### 核心组件

#### 1. BaseFormPage（基础页面骨架，单一数据源）
```tsx
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { FieldGroup, FormActions } from '@/components/common';
import { useRouteMeta, usePageConfig } from '@/hooks';

export default function ExamplePage() {
  // 从路由配置派生页面元信息，并写入全局 store（单一数据源）
  const meta = useRouteMeta();
  usePageConfig(meta);

  const fields = [
    { name: 'field1', label: '字段1', type: 'text', required: true },
    { name: 'field2', label: '字段2', type: 'select' },
  ];

  async function handleSubmit(values: any) {
    // TODO: 接入服务层 API
    return true;
  }

  return (
    <BaseFormPage onFinish={handleSubmit}>
      <FieldGroup fields={fields} />
      <FormActions onSubmit={handleSubmit} />
    </BaseFormPage>
  );
}
```

#### 2. EditableTable（可编辑表格）
```tsx
// 适用于需要内嵌表格的复杂页面
const table = useTableData({ createDefaultRow: ... });

<EditableTable
  dataSource={table.dataSource}
  onChange={table.setDataSource}
  config={...}
/>
```

## 🚀 快速开始

### 📋 环境要求

- **Node.js** >= 18.17.0
- **npm** >= 9.0.0 或 **yarn** >= 1.22.0
- **Git** >= 2.30.0

### 📦 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/SJNeking/front-base.git
   cd front-base
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或使用 yarn
   yarn install
   ```

3. **环境配置**
   ```bash
   # 复制环境变量文件
   cp .env.example .env.local
   
   # 编辑环境变量
   vim .env.local
   ```

### 🛠️ 开发模式

```bash
# 启动开发服务器
npm run dev

# 或使用 Turbopack (更快的构建)
npm run dev:turbo
```

🌐 **本地访问**: http://localhost:3004

### 🏗️ 生产构建

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 或者导出静态文件
npm run export
```

### 🧪 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行端到端测试
npm run test:e2e
```

### 📊 性能分析

```bash
# 分析包大小
npm run analyze

# 性能测试
npm run perf:test
```

## 🛠️ 开发指南

### 📝 代码规范

#### 命名约定
- **文件名**: 使用 kebab-case (如: `user-profile.tsx`)
- **组件名**: 使用 PascalCase (如: `UserProfile`)
- **变量/函数**: 使用 camelCase (如: `getUserData`)
- **常量**: 使用 UPPER_SNAKE_CASE (如: `API_BASE_URL`)

#### 目录结构规范
```bash
src/components/
├── common/           # 通用组件 (Button, Input, Modal等)
├── layouts/          # 布局组件 (Header, Sidebar, Footer等)
└── templates/        # 页面模板 (BaseFormPage, StandardFormPage等)
```

#### TypeScript 规范
- 所有组件必须定义 Props 接口
- 使用严格的类型检查
- 优先使用 `interface` 而非 `type`
- 导出类型定义到 `src/types/` 目录

### 🎯 新增页面开发

#### 1. 遵循"单一数据源"规范

```tsx
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { useRouteMeta, usePageConfig } from '@/hooks';

export default function NewPage() {
  // 从路由配置获取页面元信息
  const meta = useRouteMeta();
  usePageConfig(meta);

  // 页面业务逻辑
  const handleSubmit = async (values: any) => {
    // API调用
  };

  return (
    <BaseFormPage onFinish={handleSubmit}>
      {/* 页面内容 */}
    </BaseFormPage>
  );
}
```

#### 2. 路由配置
在 `src/config/routes.ts` 中添加路由配置：

```typescript
{
  path: '/module/new-page',
  title: '新页面',
  breadcrumbs: [
    { title: '模块名', href: '/module' },
    { title: '新页面' }
  ],
  recordNumber: 'REC-001'
}
```

### 🧩 组件开发

#### 通用组件示例
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  children,
  onClick
}) => {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      disabled={loading}
      onClick={onClick}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};
```

### 🎣 Hooks 开发

#### 自定义Hook示例
```tsx
export const useApiRequest = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<T>(url);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { data, loading, error, refetch: fetchData };
};
```

### 🧪 测试规范

#### 单元测试
```tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### 🎨 样式规范

#### CSS Modules
```css
/* Button.module.css */
.button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary {
  background-color: #1890ff;
  color: white;
}

.secondary {
  background-color: #f5f5f5;
  color: #333;
}
```

## 项目特点

- ✅ 61个业务页面，统一架构设计
- ✅ 模块化组件，高度可复用
- ✅ TypeScript 类型安全
- ✅ Hooks 逻辑复用
- ✅ API 服务层封装
- ✅ 统一的表单处理流程
- ✅ 响应式布局设计
 - ✅ 架构治理测试（路由前缀/面包屑一致性、中间件重写）

## 测试与质量保障

运行所有测试：
```bash
npm test
```

包含以下治理性测试：
- `routes integrity`：基础路由唯一性与形状校验。
- `modulePathPrefix`：路由路径与模块前缀一致性校验。
- `breadcrumbsParent`：面包屑根项与 `parent` 一致性校验。
- `middlewareRewrite`：旧质量模块设备路径自动重写为设备模块新路径。

## 路由与导航规范

- 路由集中配置在 `src/config/routes.ts` 与 `src/config/routes/modules/*`。
- 页面元信息来自路由配置；页面通过 `useRouteMeta + usePageConfig` 将信息写入全局 store。
- 页面模板只读取 store 中的配置进行渲染。
- 中间件（`src/middleware.ts`）针对历史路径提供 308 重定向：`/quality/equipment-*` → `/equipment/*`。

## 🚀 部署指南

### 📦 Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### ☁️ Vercel 部署

1. 连接GitHub仓库到Vercel
2. 设置环境变量
3. 自动部署

### 🔧 Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下步骤：

### 📝 贡献流程

1. **Fork 项目**
   ```bash
   # Fork 到你的GitHub账户
   # 然后克隆到本地
   git clone https://github.com/your-username/front-base.git
   ```

2. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   ```

4. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **创建 Pull Request**

### 📋 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式化
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

### 🔍 代码审查

- 确保所有测试通过
- 遵循项目代码规范
- 添加必要的文档
- 保持向后兼容性

## 📚 相关文档

- [📖 架构决策记录 (ADR)](./docs/architecture/)
- [📝 表单开发指南](./docs/FORM_GUIDELINES.md)
- [🔒 安全指南](./SECURITY_GUIDE.md)
- [🎨 样式指南](./STYLE_GUIDE.md)

## 🐛 问题反馈

如果你发现了bug或有功能建议，请：

1. 查看 [Issues](https://github.com/SJNeking/front-base/issues) 是否已存在相关问题
2. 如果没有，请创建新的Issue
3. 提供详细的问题描述和复现步骤

## 📞 联系我们

- **项目维护者**: SJNeking
- **邮箱**: lvshaomeng806@gmail.com
- **GitHub**: https://github.com/SJNeking/front-base

## 📄 许可证

本项目采用 [MIT License](./LICENSE) 开源协议。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个Star！**

Made with ❤️ by [SJNeking](https://github.com/SJNeking)

</div>

