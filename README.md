# Front-Base LIMS 项目

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.22-blue?logo=antdesign)

## 项目概述

实验室信息管理系统（LIMS）前端项目，基于 Next.js 15 + React 19 + TypeScript 构建。

### 技术栈

- **框架**: Next.js 15 (App Router)
- **UI库**: React 19 + Ant Design 5
- **语言**: TypeScript 5
- **状态管理**: Zustand
- **样式**: CSS Modules
- **构建工具**: Turbopack

## 项目结构

```
front-base/
├── app/                        # Next.js 页面路由
│   ├── personnel/             # 人员管理模块
│   ├── equipment/             # 设备管理模块
│   ├── quality/               # 质量管理模块
│   ├── project/               # 项目管理模块
│   ├── data/                  # 数据管理模块
│   └── layout.tsx             # 根布局
│
├── src/                       # 源代码
│   ├── components/            # 组件库
│   │   ├── common/           # 通用组件
│   │   ├── layouts/          # 布局组件
│   │   └── templates/        # 页面模板
│   ├── hooks/                # 自定义Hooks
│   ├── services/             # API服务层
│   ├── store/                # 状态管理
│   ├── types/                # TypeScript类型定义
│   └── styles/               # 全局样式
│
└── public/                   # 静态资源

新增：

- `docs/architecture/`        # 架构决策记录（ADR）与治理文档
- `src/config/routes/__tests__/` # 路由治理测试（前缀/面包屑一致性）
- `src/__tests__/`            # 中间件重写测试
```

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

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

本地预览：开发服务启动后访问 `http://localhost:3004/`（具体端口以控制台输出为准）。

### 生产构建
```bash
npm run build
npm start
```

## 开发规范

### 新增页面

遵循“单一数据源”规范：

- 在页面顶部通过 `useRouteMeta + usePageConfig` 统一设置页面标题、面包屑与记录编号。
- 页面内只专注业务字段与交互，不直接传递导航配置到模板组件。

示例见上文 BaseFormPage 使用方式。

复杂页面：除字段外可组合表格与自定义逻辑，仍保持页面元信息从路由配置派生。

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

## License

MIT

日志记录
- Ant Design Menu组件的一个已知问题： 10 8 当Menu处于 inlineCollapsed 状态时， paddingInline 的计算使用了 fontSizeLG 而不是 collapsedIconSize ，导致图标无法正确居中。

