# 样式重构实施计划

## 概述

基于样式架构分析报告，本计划将分三个阶段系统性地解决项目中的样式耦合性和FOUC问题，确保项目达到生产就绪标准。

## 阶段一：紧急修复 (1-2天)

### 1.1 FOUC 问题修复 (优先级：紧急)

#### 问题描述
页面刷新时出现无样式内容闪烁，影响用户体验。

#### 解决方案
1. **增强 AntdRegistry 样式提取**
2. **优化关键样式内联**
3. **改进样式加载顺序**

#### 具体实施

**步骤1: 修复 AntdRegistry.tsx**
```typescript
// src/app/AntdRegistry.tsx
"use client";

import React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs';

export default function AntdRegistry({ children }: { children: React.ReactNode }) {
  const cache = createCache();
  
  useServerInsertedHTML(() => {
    const styles = extractStyle(cache, true);
    return (
      <style 
        id="antd-css-in-js" 
        dangerouslySetInnerHTML={{ __html: styles }} 
      />
    );
  });

  return (
    <StyleProvider cache={cache} hashPriority="high">
      {children}
    </StyleProvider>
  );
}
```

**步骤2: 优化 layout.tsx 样式加载**
```typescript
// src/app/layout.tsx
import './globals.css'; // 确保全局样式优先加载

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 预加载关键字体 */}
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="" />
        {/* 内联关键CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            .loading-skeleton { background: #f0f0f0; animation: pulse 1.5s ease-in-out infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          `
        }} />
      </head>
      <body>
        <AntdRegistry>
          <AntdProvider>
            {children}
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
```

### 1.2 关键组件样式修复

#### 修复 SidebarSearch 硬编码颜色
**文件**: `src/components/layouts/Sidebar/navigation/SidebarSearch.module.css`

**修复前** (17个硬编码颜色):
```css
.searchContainer {
  background-color: #f8f9fa;
}
.searchInput {
  color: #666;
  background-color: #f5f5f5;
}
```

**修复后**:
```css
.searchContainer {
  background-color: var(--color-bg-muted);
}
.searchInput {
  color: var(--color-text-secondary);
  background-color: var(--color-bg-subtle);
}
```

## 阶段二：系统性重构 (3-4天)

### 2.1 硬编码颜色迁移

#### 创建颜色迁移脚本
```bash
# scripts/migrate-colors.js
const fs = require('fs');
const path = require('path');

const colorMappings = {
  '#1890ff': 'var(--color-primary)',
  '#f5f5f5': 'var(--color-bg-muted)',
  '#666': 'var(--color-text-secondary)',
  '#333': 'var(--color-text)',
  // ... 更多映射
};

function migrateColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  Object.entries(colorMappings).forEach(([hardcoded, variable]) => {
    content = content.replace(new RegExp(hardcoded, 'g'), variable);
  });
  
  fs.writeFileSync(filePath, content);
}
```

#### 扩展颜色令牌
```css
/* src/app/globals.css - 新增颜色变量 */
:root {
  /* 现有变量... */
  
  /* 新增语义化颜色 */
  --color-bg-subtle: #f8f9fa;
  --color-bg-elevated: #ffffff;
  --color-border-light: #f0f0f0;
  --color-border-medium: #d9d9d9;
  
  /* 状态颜色扩展 */
  --color-success-light: #f6ffed;
  --color-warning-light: #fff7e6;
  --color-error-light: #fff2f0;
  
  /* 交互状态 */
  --color-hover-bg: rgba(0, 0, 0, 0.04);
  --color-active-bg: rgba(0, 0, 0, 0.06);
}
```

### 2.2 尺寸标准化

#### 扩展尺寸常量
```typescript
// src/utils/constants/dimensions.ts
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,  // 新增
  xxxxl: 64  // 新增
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 16
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32
};
```

#### 创建样式工具函数
```typescript
// src/utils/styles/helpers.ts
import { SPACING, BORDER_RADIUS, FONT_SIZES } from '@/utils/constants/dimensions';

export const spacing = (size: keyof typeof SPACING) => `${SPACING[size]}px`;
export const borderRadius = (size: keyof typeof BORDER_RADIUS) => `${BORDER_RADIUS[size]}px`;
export const fontSize = (size: keyof typeof FONT_SIZES) => `${FONT_SIZES[size]}px`;

// 使用示例
// style={{ margin: spacing('lg'), borderRadius: borderRadius('md') }}
```

### 2.3 组件样式重构

#### 重构 PerformanceDashboard
**文件**: `src/components/performance/PerformanceDashboard.tsx`

**修复前** (15个硬编码值):
```tsx
<WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
<div style={{ padding: '24px' }}>
```

**修复后**:
```tsx
import { spacing } from '@/utils/styles/helpers';
import styles from './PerformanceDashboard.module.css';

<WarningOutlined className={styles.warningIcon} />
<div className={styles.container}>
```

```css
/* PerformanceDashboard.module.css */
.warningIcon {
  color: var(--color-warning);
  margin-right: var(--spacing-sm);
}

.container {
  padding: var(--spacing-xl);
}
```

## 阶段三：架构优化 (2-3天)

### 3.1 样式架构重组

#### 新的目录结构
```
src/styles/
├── tokens/
│   ├── colors.css          # 颜色令牌
│   ├── spacing.css         # 间距令牌
│   ├── typography.css      # 字体令牌
│   └── index.css          # 令牌汇总
├── base/
│   ├── reset.css          # 样式重置
│   ├── typography.css     # 基础字体
│   └── layout.css         # 基础布局
├── components/
│   ├── buttons.css        # 按钮组件样式
│   ├── forms.css          # 表单组件样式
│   └── navigation.css     # 导航组件样式
├── utilities/
│   ├── spacing.css        # 间距工具类
│   ├── colors.css         # 颜色工具类
│   └── responsive.css     # 响应式工具类
└── globals.css            # 全局样式入口
```

### 3.2 样式检查工具

#### Stylelint 配置
```javascript
// stylelint.config.js
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-css-modules'
  ],
  rules: {
    // 禁止硬编码颜色
    'color-no-hex': true,
    'color-named': 'never',
    
    // 强制使用 CSS 变量
    'custom-property-pattern': '^--[a-z][a-z0-9]*(-[a-z0-9]+)*$',
    
    // 禁止硬编码尺寸
    'declaration-property-value-disallowed-list': {
      '/^(margin|padding|width|height|font-size)$/': [
        '/^\\d+px$/'  // 禁止直接使用像素值
      ]
    },
    
    // CSS Modules 命名规范
    'selector-class-pattern': '^[a-z][a-zA-Z0-9]*$'
  }
};
```

#### 自动化检查脚本
```json
// package.json
{
  "scripts": {
    "lint:styles": "stylelint 'src/**/*.{css,scss,module.css}'",
    "lint:styles:fix": "stylelint 'src/**/*.{css,scss,module.css}' --fix",
    "migrate:colors": "node scripts/migrate-colors.js",
    "migrate:spacing": "node scripts/migrate-spacing.js",
    "check:hardcoded": "node scripts/check-hardcoded-values.js"
  }
}
```

### 3.3 TypeScript 类型安全

#### 样式令牌类型定义
```typescript
// src/types/styles.ts
export type ColorToken = 
  | 'primary' | 'primary-hover' | 'primary-active'
  | 'text' | 'text-secondary' | 'text-tertiary'
  | 'bg' | 'bg-muted' | 'bg-highlight'
  | 'success' | 'warning' | 'error' | 'info';

export type SpacingToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type BorderRadiusToken = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

// 样式工具函数类型安全版本
export const getColor = (token: ColorToken): string => `var(--color-${token})`;
export const getSpacing = (token: SpacingToken): string => `var(--spacing-${token})`;
```

## 实施时间表

| 阶段 | 任务 | 开始时间 | 完成时间 | 负责人 |
|------|------|----------|----------|--------|
| 1 | FOUC 修复 | Day 1 AM | Day 1 PM | 前端负责人 |
| 1 | 关键组件修复 | Day 1 PM | Day 2 AM | 前端开发 |
| 2 | 颜色迁移脚本 | Day 2 AM | Day 2 PM | 前端开发 |
| 2 | 硬编码颜色迁移 | Day 3 AM | Day 4 PM | 团队协作 |
| 2 | 尺寸标准化 | Day 4 PM | Day 5 AM | 前端开发 |
| 3 | 架构重组 | Day 5 AM | Day 6 PM | 前端负责人 |
| 3 | 工具配置 | Day 6 PM | Day 7 AM | DevOps |
| 3 | 测试验证 | Day 7 AM | Day 7 PM | QA + 前端 |

## 验收标准

### 技术指标
- [ ] 硬编码颜色值 ≤ 5个
- [ ] 硬编码尺寸值 ≤ 10个
- [ ] FOUC 持续时间 ≤ 100ms
- [ ] Stylelint 检查通过率 100%
- [ ] 样式包体积减少 ≥ 15%

### 功能验证
- [ ] 所有页面样式正常显示
- [ ] 主题切换功能正常
- [ ] 响应式布局正常
- [ ] 无样式回归问题

### 性能验证
- [ ] 首屏渲染时间无明显增加
- [ ] 样式加载时间优化
- [ ] 无内存泄漏

## 风险控制

### 回滚计划
1. **Git 分支策略**: 每个阶段创建独立分支
2. **备份机制**: 重要文件修改前创建备份
3. **渐进式部署**: 先在测试环境验证

### 测试策略
1. **视觉回归测试**: 使用 Percy 或 Chromatic
2. **自动化测试**: 更新现有 E2E 测试
3. **手动测试**: 关键页面人工验证

### 监控指标
1. **性能监控**: 首屏时间、样式加载时间
2. **错误监控**: 样式相关错误
3. **用户体验**: FOUC 发生频率

## 后续维护

### 开发规范
1. **代码审查**: 样式相关 PR 必须检查硬编码
2. **自动化检查**: CI/CD 集成样式检查
3. **培训计划**: 团队样式规范培训

### 持续改进
1. **定期审计**: 每月样式架构审计
2. **性能优化**: 持续优化样式性能
3. **工具升级**: 跟进最新的样式工具

## 总结

本重构计划将系统性地解决项目中的样式问题，确保：
1. **消除耦合性**: 通过标准化令牌和工具函数
2. **修复 FOUC**: 通过优化样式加载机制
3. **提升维护性**: 通过规范化的架构和工具
4. **保证质量**: 通过自动化检查和测试

预计完成后，项目将达到生产就绪的样式架构标准。