# 样式管理指南

本文档定义了项目中样式管理的最佳实践，以确保代码的一致性和可维护性。

## 颜色管理

### 使用CSS变量
所有颜色值应通过CSS变量定义，避免在代码中使用硬编码的颜色值（如 `#ffffff` 或 `rgb(255, 255, 255)`）。

```css
/* 正确 */
color: var(--color-primary);

/* 错误 */
color: #1890ff;
```

### 颜色变量定义
颜色变量在 `src/app/globals.css` 中定义，按用途分类：

1. **主色调** - 品牌色和主要交互色
2. **文本色** - 各层级文本颜色
3. **背景色** - 各层级背景颜色
4. **边框色** - 各种边框颜色
5. **功能性颜色** - 成功、警告、错误等状态色
6. **语义化颜色** - 特定用途的颜色变量

## 尺寸管理

### 使用尺寸常量
所有尺寸值（如像素值）应通过常量定义，避免在代码中使用硬编码的尺寸值。

```typescript
// 正确
import { SPACING } from '@/utils/constants/dimensions';
style={{ margin: `${SPACING.lg}px` }}

// 错误
style={{ margin: '16px' }}
```

### 尺寸常量定义
尺寸常量在 `src/utils/constants/dimensions.ts` 中定义，包括：

1. **间距值** - SPACING 对象包含各种间距常量
2. **尺寸值** - SIZES 对象包含组件尺寸常量
3. **层级值** - Z_INDEX 对象包含层级常量

## 主题配置

### Ant Design 主题
Ant Design 的主题配置应使用CSS变量，避免硬编码值：

```typescript
// 正确
token: {
  colorPrimary: 'var(--color-primary)',
}

// 错误
token: {
  colorPrimary: '#1890ff',
}
```

## 内联样式规范

### 避免内联样式
尽量避免使用内联样式，优先使用CSS类：

```css
/* styles.module.css */
.container {
  margin: var(--spacing-lg);
  color: var(--color-text);
}
```

```tsx
// 正确
import styles from './styles.module.css';
<div className={styles.container} />

// 错误
<div style={{ margin: '16px', color: '#333' }} />
```

### 必要时使用内联样式
在必须使用内联样式的情况下，应使用CSS变量或常量：

```tsx
// 正确
import { SPACING } from '@/utils/constants/dimensions';
<div style={{ margin: `${SPACING.lg}px` }} />

// 可接受（使用CSS变量）
<div style={{ color: 'var(--color-primary)' }} />

// 错误
<div style={{ margin: '16px', color: '#1890ff' }} />
```

## 响应式设计

### 使用CSS媒体查询
响应式设计应使用CSS媒体查询，避免在JS中硬编码断点值：

```css
/* 正确 */
@media (max-width: var(--breakpoint-md)) {
  .container {
    padding: var(--spacing-md);
  }
}
```

```tsx
/* 错误 */
<div style={{ padding: window.innerWidth < 768 ? '8px' : '16px' }} />
```

## 代码检查

### ESLint规则
项目配置了ESLint规则来检测硬编码的颜色值：

1. 禁止在内联样式中使用硬编码颜色值
2. 推荐使用CSS变量替代硬编码值

### Stylelint规则
项目配置了Stylelint规则来确保CSS代码质量：

1. 检查CSS属性的使用
2. 确保一致的代码风格

## 最佳实践总结

1. **颜色管理** - 始终使用CSS变量
2. **尺寸管理** - 始终使用常量
3. **避免内联样式** - 优先使用CSS类
4. **响应式设计** - 使用CSS媒体查询
5. **代码检查** - 利用ESLint和Stylelint工具
6. **文档化** - 保持文档更新，确保团队成员了解规范

通过遵循这些规范，我们可以确保项目样式的一致性、可维护性和可扩展性。