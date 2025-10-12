# Front-Base 项目

## 项目概述

这是一个基于 Next.js 14+ 的现代化前端项目，采用 App Router 架构，专注于 Schema Driven 的表单渲染系统。项目采用 TypeScript 开发，支持 SSR/SSG，并集成了完整的组件库和业务逻辑架构。

## 项目目录结构

```
front-base/
├── app/                        # Next.js App Router 根目录
│   ├── (main)/                 # 主路由组 (包含 page.tsx, layout.tsx)
│   │   ├── layout.tsx          # 主路由组布局组件
│   │   └── page.tsx            # 主路由组页面组件
│   ├── auth/                   # 认证相关路由
│   │   └── login/              # 登录页面路由
│   │       └── page.tsx        # 登录页面组件
│   ├── layout.tsx              # 根布局组件 (全局布局)
│   └── page.tsx                # 根页面组件 (首页)
│
├── src/                        # 核心业务逻辑和架构实现
│   ├── app/                    # 原始 App Router 目录 (保留用于样式)
│   │   ├── favicon.ico         # 网站图标
│   │   ├── globals.css         # 全局样式文件
│   │   ├── layout.tsx          # 原始布局组件 (备用)
│   │   ├── page.module.css     # 页面模块样式
│   │   └── page.tsx            # 原始页面组件 (备用)
│   
│   ├── assets/                 # 静态资源目录
│   │   └── .gitkeep            # 保持目录结构的占位文件
│   
│   ├── components/             # 组件库
│   │   ├── common/             # 原子UI组件 (Button, Icon, Modal等)
│   │   │   └── .gitkeep        # 保持目录结构的占位文件
│   │   ├── fields/             # Schema Driven 受控组件
│   │   │   └── ControlledTextField/  # 受控文本输入组件
│   │   │       ├── ControlledTextField.tsx      # 组件主文件
│   │   │       ├── ControlledTextField.types.ts # 类型定义
│   │   │       ├── ControlledTextField.styles.ts# 样式定义
│   │   │       └── ControlledTextField.hook.ts  # 自定义Hook
│   │   ├── layouts/            # 页面布局组件 (Header, Sidebar, LoginLayout)
│   │   │   └── .gitkeep        # 保持目录结构的占位文件
│   │   └── renderer/           # 核心渲染组件
│   │       └── FormRenderer.tsx# Schema解析器 (核心组件)
│   
│   ├── hooks/                  # 自定义Hooks
│   │   ├── form/               # 表单核心 Context 和 Hooks
│   │   │   ├── useFormContext.ts    # 表单上下文Hook
│   │   │   └── FormContext.types.ts # 表单上下文类型定义
│   │   └── rules/              # 规则引擎逻辑
│   │       └── useRuleEngine.ts     # 字段联动规则引擎Hook
│   
│   ├── services/               # 服务层
│   │   ├── api/                # 统一的API调用服务
│   │   │   └── .gitkeep        # 保持目录结构的占位文件
│   │   └── mapper/             # 数据映射服务
│   │       ├── useFormMapper.ts     # 表单数据映射Hook
│   │       └── fieldMappingSchema.ts# 字段映射Schema定义
│   
│   ├── lib/                    # 通用工具和配置
│   │   ├── Registry.tsx        # Styled-Components SSR 配置
│   │   └── theme.ts            # 主题配置 (AntD Pro Style)
│   
│   ├── schemas/                # 核心配置数据 (JSON Schema)
│   │   ├── UserLoginForm.json  # 用户登录表单Schema
│   │   └── ProjectCreation.json# 项目创建表单Schema
│   
│   └── types/                  # 核心类型定义
│       └── schema.ts           # IFormSchema, IFieldConfig 等核心类型
│
├── public/                     # 静态资源目录
│   ├── file.svg               # 文件图标
│   ├── globe.svg              # 地球图标
│   ├── next.svg               # Next.js 图标
│   ├── vercel.svg             # Vercel 图标
│   └── window.svg             # 窗口图标
│
├── node_modules/               # 依赖包目录
├── package.json                # 项目依赖配置
├── package-lock.json          # 依赖锁定文件
├── next.config.ts             # Next.js 配置文件
├── tsconfig.json              # TypeScript 配置文件
├── eslint.config.mjs          # ESLint 配置文件
├── next-env.d.ts              # Next.js 类型声明文件
└── README.md                  # 项目说明文档
```

## 核心架构说明

### 1. App Router 架构
- **根布局** (`app/layout.tsx`): 全局布局，包含 HTML 结构和字体配置
- **主路由组** (`app/(main)/`): 主要业务页面路由组
- **认证路由** (`app/auth/`): 用户认证相关页面

### 2. Schema Driven 表单系统
- **FormRenderer**: 核心渲染组件，解析 JSON Schema 并渲染表单
- **ControlledTextField**: 受控文本输入组件，支持验证和联动
- **useFormContext**: 表单状态管理 Hook
- **useRuleEngine**: 字段联动规则引擎

### 3. 组件化架构
- **原子组件** (`components/common/`): 基础UI组件
- **业务组件** (`components/fields/`): 表单字段组件
- **布局组件** (`components/layouts/`): 页面布局组件

### 4. 服务层架构
- **API服务** (`services/api/`): 统一的数据请求服务
- **映射服务** (`services/mapper/`): 数据转换和映射逻辑

## 开发日志

### 阶段一: 项目初始化 (已完成)

#### 任务清单:
- [x] **清空项目主页内容**
  - 移除 Next.js 默认的欢迎页面内容
  - 清空所有示例代码和链接
  - 保留基本的页面结构

- [x] **调整背景颜色为白色**
  - 修改 `globals.css` 中的背景色配置
  - 确保暗色模式下也使用白色背景
  - 统一主题色彩方案

- [x] **构建完整项目目录结构**
  - 创建 App Router 目录结构 (`app/`, `app/(main)/`, `app/auth/`)
  - 创建核心业务逻辑目录 (`src/components/`, `src/hooks/`, `src/services/`)
  - 创建配置和类型定义目录 (`src/lib/`, `src/schemas/`, `src/types/`)
  - 所有文件创建为空文件，准备后续开发

### 阶段二: 路由和布局修复 (已完成)

#### 任务清单:
- [x] **修复布局组件错误**
  - 解决 "The default export is not a React Component" 错误
  - 创建正确的根布局组件 (`app/layout.tsx`)
  - 创建主路由组布局组件 (`app/(main)/layout.tsx`)
  - 确保所有布局文件包含完整的 React 组件结构

- [x] **修复CSS导入路径错误**
  - 解决 "Module not found: Can't resolve './src/app/globals.css'" 错误
  - 修正根布局的CSS导入路径 (`../src/app/globals.css`)
  - 修正主路由组布局的CSS导入路径 (`../../src/app/globals.css`)
  - 确保样式文件正确加载

- [x] **创建根页面组件**
  - 创建根页面组件 (`app/page.tsx`)
  - 创建主路由组页面组件 (`app/(main)/page.tsx`)
  - 创建认证页面组件 (`app/auth/login/page.tsx`)

### 阶段三: 项目文档化 (进行中)

#### 任务清单:
- [x] **分析项目结构**
  - 扫描并记录完整的目录结构
  - 识别所有文件和目录的用途
  - 整理项目架构信息

- [x] **创建综合README文档**
  - 编写项目概述和架构说明
  - 详细说明每个目录和文件的作用
  - 记录完整的开发日志和任务清单
  - 提供清晰的开发指南

### 下一阶段计划

#### 待完成任务:
- [ ] **实现Schema Driven表单系统**
  - 开发 FormRenderer 核心组件
  - 实现 ControlledTextField 受控组件
  - 创建表单上下文和状态管理

- [ ] **开发规则引擎**
  - 实现 useRuleEngine Hook
  - 支持字段联动和条件显示
  - 创建规则配置系统

- [ ] **完善组件库**
  - 开发原子UI组件
  - 实现布局组件
  - 创建主题配置系统

- [ ] **集成API服务**
  - 实现统一的数据请求服务
  - 开发数据映射和转换逻辑
  - 创建错误处理和加载状态管理

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **样式**: CSS Modules + Styled-Components
- **状态管理**: React Context + Custom Hooks
- **表单处理**: Schema Driven + Controlled Components
- **代码质量**: ESLint + TypeScript Strict Mode

## 开发指南

### 启动项目
```bash
npm install
npm run dev
```

### 项目结构说明
- 所有业务逻辑放在 `src/` 目录下
- 路由配置在 `app/` 目录下
- 静态资源放在 `public/` 目录下
- 配置文件在项目根目录

### 开发规范
- 使用 TypeScript 严格模式
- 遵循 React 函数组件和 Hooks 模式
- 采用 Schema Driven 开发模式
- 保持组件的单一职责原则

---

*最后更新: 2024年12月*