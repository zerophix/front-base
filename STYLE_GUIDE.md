# 样式系统治理指南

本指南定义项目样式的架构约定、令牌分层与使用规范，确保一致性、可维护性与可扩展性。

## 令牌分层

- 基础层（Base Tokens）：色板、字号、间距、圆角、行高、断点
  - 位置：`app/globals.css` 的 `:root` 中
  - 示例：`--color-primary`、`--font-size-md`、`--spacing-lg`、`--radius-sm`、`--line-height-base`

- 语义层（Semantic Tokens）：文本、背景、边框等语义映射
  - 示例：`--color-text`、`--color-bg`、`--color-border`
  - 提供旧名兼容别名：`--text-color`、`--bg-body`、`--border-color`

- 组件层（Component Tokens）：组件特化（表格/按钮/表单）
  - 示例：`--table-header-bg`、`--table-border-color`
  - 优先通过 Ant Design `ConfigProvider.theme` 配置组件令牌，CSS 仅做必要补充

## 命名规范

- 统一前缀：`--color-*`、`--font-size-*`、`--spacing-*`、`--radius-*`
- 行高与字体家族：`--line-height-base`、`--font-family-serif`、`--font-family-numeric`
- 避免硬编码：组件样式必须引用令牌，不直接写具体数值（极端例外需注释说明）

## 使用约定

- 全局默认来自 `app/globals.css`；页面/组件局部使用 CSS Modules，禁止页面级全局覆盖
- Antd 主题：统一在 `app/providers.tsx` 的 `ConfigProvider` 中维护，避免在 CSS 中大面积覆写 Antd 样式
- 布局变量：`--header-height` 仅在 `globals.css` 定义，不允许内联覆盖

## 响应式约定

- 断点令牌：`--breakpoint-xs/sm/md/lg/xl/xxl`
- 容器需具备：`min-width: 0`、必要时 `overflow-x: auto`
- 移动端：适配 `padding`/`gap`，避免过度缩放字体

## 工具类（建议）

- 轻量工具类放置 `src/styles/utilities.css`，仅限非侵入性：文本截断、最小宽度、居中容器、基础间距

## 文档维护

- 发生变量新增/改名时，更新本文件并在代码中以注释标注兼容别名的去除计划

---

## 架构约定（导航与页面元信息）

- 单一数据源：页面 `title`/`breadcrumbs`/`recordNumber` 仅在 `src/config/routes.ts` 定义。
- 页面约束：页面不得在组件内硬编码上述信息，必须通过 `useRouteMeta` + `usePageConfig` 设置到全局 store。
- 模板约束：`BaseFormPage`/`StandardFormPage` 不再接受导航相关 props，仅从全局 store渲染。
- 路由前缀：不同模块的 `path` 必须以其模块前缀开头（`/equipment`、`/quality`、`/personnel`、`/project`、`/data`）。
- 面包屑规则：根项与 `parent` 必须对应模块根；根项中文名为模块名（如“设备管理”）。
- 枚举集中：状态/结论等枚举统一在 `src/types` 集中维护，页面只引用。

参见 `docs/architecture/ADR-0001-single-source-page-metadata.md` 获取完整决策与迁移计划。