# ADR-0001: 页面元信息单一数据源策略

## 状态
已采用

## 背景

在大型前端项目中，页面元信息（如标题、面包屑、记录编号）经常出现"信息双源"问题：
- 路由配置中定义一次
- 页面组件中硬编码一次
- 导航组件中再定义一次

这导致：
1. **数据不一致** - 多处定义容易出现不同步
2. **维护困难** - 修改需要同时更新多个地方
3. **长期漂移** - 随着项目发展，各处定义逐渐偏离
4. **开发效率低** - 新增页面需要在多处添加配置

## 决策

采用**单一数据源**策略，所有页面元信息统一由 `src/config/routes.ts` 管理：

### 核心原则
1. **唯一定义** - 页面元信息（`title`/`breadcrumbs`/`recordNumber`）仅在路由配置中定义
2. **禁止硬编码** - 页面组件不得硬编码导航信息
3. **统一读取** - 通过 `useRouteMeta` + `usePageConfig` 将配置写入全局store
4. **模板渲染** - 模板组件（`BaseFormPage`/`StandardFormPage`）只读取全局store

### 实现机制
```typescript
// 1. 路由配置（唯一数据源）
export const routes: RouteConfig[] = [
  {
    path: '/equipment/maintenance-record',
    title: '设备维护记录',
    recordNumber: 'SZD-EQ-MAINT-02-2021',
    breadcrumbs: [
      { label: '设备管理', href: '/equipment' },
      { label: '设备维护记录' }
    ]
  }
];

// 2. 页面组件（读取配置）
export default function MaintenanceRecordPage() {
  useRouteMeta(); // 自动将路由配置写入store
  return <StandardFormPage fields={fields} />;
}

// 3. 模板组件（渲染配置）
export function BaseFormPage() {
  const { title, breadcrumbs } = usePageConfig(); // 从store读取
  return (
    <div>
      <Breadcrumb items={breadcrumbs} />
      <h1>{title}</h1>
      {children}
    </div>
  );
}
```

### 约束规则
1. **路由前缀约束** - 必须与模块一致：`/equipment`、`/quality`、`/personnel`、`/project`、`/data`
2. **面包屑约束** - 根项中文名必须匹配模块名，且若存在 `parent`，根项 `href === parent`
3. **记录编号约束** - 关键业务页面必须提供记录编号，格式为 `[A-Z0-9-]+` 且包含短横线

## 后果

### 积极后果
1. **数据一致性** - 消除信息双源问题
2. **维护简单** - 只需在一处修改配置
3. **开发高效** - 新增页面只需配置路由
4. **质量保证** - 通过测试确保配置完整性
5. **架构清晰** - 明确的数据流向和职责分工

### 消极后果
1. **学习成本** - 新开发者需要理解这套机制
2. **配置集中** - 路由配置文件可能变得较大
3. **灵活性限制** - 特殊页面可能需要额外处理

### 风险缓解
1. **文档完善** - 提供详细的开发指南
2. **模块化配置** - 按业务模块拆分路由配置
3. **逃生舱口** - 保留自定义页面的能力

## 替代方案

### 方案1：组件内硬编码
- **优点** - 简单直接，无需额外配置
- **缺点** - 信息分散，维护困难，容易不一致

### 方案2：Context传递
- **优点** - 组件间数据共享
- **缺点** - 仍需多处定义，Context嵌套复杂

### 方案3：GraphQL Schema
- **优点** - 类型安全，统一数据层
- **缺点** - 技术栈复杂度高，学习成本大

## 相关决策
- [ADR-0003: 配置驱动的表单系统](./ADR-0003-configuration-driven-forms.md)
- [ADR-0005: 状态管理策略](./ADR-0005-state-management-strategy.md)

## 实施检查

通过以下测试确保决策执行：
```typescript
// src/config/routes/__tests__/recordNumbers.test.ts
test('selected critical routes must provide a non-empty recordNumber', () => {
  // 确保关键路由配置了记录编号
});
```

## 更新历史
- 2024-01: 初始版本，确立单一数据源原则
- 2024-01: 添加路由前缀和面包屑约束规则