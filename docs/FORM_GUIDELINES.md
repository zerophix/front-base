# 表单开发规范

本文档旨在沉淀和统一前端表单页面的开发规范，确保在新增和迭代各类表单功能时，能够保持代码风格的一致性、提升开发效率，并降低维护成本。所有表单相关的开发工作都应遵循此规范。

## 1. 核心原则

- **配置驱动 (Configuration-Driven)**：尽可能通过 JSON 结构化配置来定义表单的字段、布局和行为，减少重复的 JSX 代码。
- **组件复用 (Component Reuse)**：优先使用项目封装的通用表单组件和模板，避免重复造轮子。
- **单一数据源 (Single Source of Truth)**：页面元信息（如标题、面包屑）应由路由统一管理，表单状态由 Hooks 或状态管理库集中处理。

## 2. 页面骨架 (Page Skeleton)

所有表单页面都应基于标准模板进行构建，以保证统一的页面结构和交互体验。我们提供了两种核心的页面模板：`StandardFormPage` 和 `BaseFormPage`。

### 2.1 标准表单页面 (`StandardFormPage`)

`StandardFormPage` 是构建标准、配置驱动的表单页面的首选。它基于 `BaseFormPage`，并集成了 `FieldGroup`，允许你通过一个简单的 `fields` 配置数组快速生成完整的表单。

**何时使用:**
- 创建新的数据记录（例如，新增申请、登记）。
- 编辑现有的数据记录。
- 适用于大多数标准的 CRUD (Create, Read, Update, Delete) 场景。

**核心特性:**
- **配置驱动**: 通过 `fields: FieldConfig[]` 属性定义表单的所有字段。
- **自动布局**: 自动处理字段的排列、栅格布局和响应式设计。
- **元信息集成**: 自动从路由配置中获取并显示页面标题和面包屑。
- **内置提交按钮**: 包含“提交”和“暂存”等标准操作按钮。

**使用示例:**

```typescript
// app/quality/doc-compose-apply/page.tsx

'use client';

import { StandardFormPage } from '@/components/templates';
import { FieldConfig } from '@/types';

const fields: FieldConfig[] = [
  { name: 'docName', label: '文件名称', type: 'text', required: true, span: 8 },
  { name: 'docType', label: '文件类型', type: 'select', options: [...] },
  { name: 'applyReason', label: '申请原因', type: 'textarea', rows: 4, span: 24 },
];

export default function DocComposeApplyPage() {
  return <StandardFormPage fields={fields} />;
}
```

### 2.2 基础表单页面 (`BaseFormPage`)

当 `StandardFormPage` 的标准化配置无法满足复杂需求时，应使用 `BaseFormPage` 作为基础进行定制开发。它提供了页面的基本结构（页头、内容区、页脚），但将表单内容的实现完全交给开发者。

**何时使用:**
- 表单布局非常不规则，无法通过 `FieldGroup` 的栅格系统实现。
- 页面包含多个独立的表单。
- 需要实现非标准的、高度定制化的交互逻辑。

**核心特性:**
- **灵活的结构**: 只提供基础布局，内容区可以自由定制。
- **手动集成**: 需要手动引入 Ant Design 的 `<Form>` 组件和 `FieldGroup`（如果需要）。
- **两种模式**:
  1. **传入 `form` 实例**: `BaseFormPage` 会自动包裹 `<Form>` 组件。
  2. **不传入 `form` 实例**: 子组件需要自行管理 `<Form>` 的创建和状态。

**使用示例:**

```typescript
// app/quality/sample-verification/page.tsx

'use client';

import { Form } from 'antd';
import { BaseFormPage, FieldGroup } from '@/components/templates';
import { EditableTable } from '@/components/common';
import { FieldConfig } from '@/types';

const mainFields: FieldConfig[] = [
  // ... 主表单字段配置
];

export default function SampleVerificationPage() {
  const [form] = Form.useForm();

  return (
    <BaseFormPage form={form}>
      <FieldGroup fields={mainFields} />
      <EditableTable
        // ... 可编辑表格配置
      />
    </BaseFormPage>
  );
}
```

## 3. 路由与元信息 (Routing & Metadata)

为了保证页面元信息（如标题、面包屑）的单一数据源和全局一致性，所有页面的路由和元信息都必须在 `src/config/routes` 目录下进行集中配置。这遵循了我们在 [ADR-0001](architecture/ADR-0001-single-source-page-metadata.md) 中确立的设计决策。

**核心原则:**
- **集中管理**: 所有路由配置都应按模块划分，存放在 `src/config/routes/modules/` 目录下。
- **结构化定义**: 每个路由对象都应包含 `path`, `title`, 和 `breadcrumbs` 属性。
- **动态派生**: 页面组件通过 `useRouteMeta` Hook 来获取当前路由的元信息，而不是在组件内部硬编码。

**配置示例:**

在 `src/config/routes/modules/quality.ts` 文件中，我们为“样品检定记录与核查表”页面定义了如下路由配置：

```typescript
// src/config/routes/modules/quality.ts

import { RouteConfig } from '@/types';

export const qualityRoutes: RouteConfig[] = [
  // ... other routes
  {
    path: '/quality/sample-verification',
    title: '样品检定记录与核查表',
    breadcrumbs: [
      { label: '质量管理', href: '/quality' },
      { label: '样品检定记录与核查表' },
    ],
  },
  // ... other routes
];
```

**在页面组件中使用:**

页面组件（无论是 `StandardFormPage` 还是 `BaseFormPage`）会自动使用 `useRouteMeta` Hook 来消费这些元信息，无需开发者手动处理。

```typescript
// src/components/templates/BaseFormPage.tsx (简化示例)

import { useRouteMeta } from '@/hooks';
import { Breadcrumb } from '@/components/common';

export function BaseFormPage({ children }) {
  const { title, breadcrumbs } = useRouteMeta();

  return (
    <div>
      <Breadcrumb items={breadcrumbs} />
      <main>{children}</main>
    </div>
  );
}
```

通过这种方式，当我们需要修改页面标题或面包屑时，只需在路由配置文件中修改一次，所有引用的地方都会自动更新，极大地提高了可维护性。

## 4. 字段配置 (Field Configuration)

为了实现配置驱动的表单开发，我们定义了 `FieldConfig` 接口来标准化所有表单字段的配置。`StandardFormPage` 和 `FieldGroup` 组件都依赖此配置来动态渲染表单。

### 4.1 `FieldConfig` 接口定义

`FieldConfig` 接口定义在 `src/types/form.ts` 中，其核心属性如下：

```typescript
// src/types/form.ts (部分摘录)

export interface FieldConfig {
  name: string; // 字段名，对应表单数据对象的 key
  label: string; // 字段标签文本
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'multi-select'; // 字段类型
  span?: number; // 布局跨度，基于 24 栅格系统，默认为 8
  required?: boolean; // 是否为必填项
  placeholder?: string; // 输入框的占位提示文本
  options?: { label: string; value: any }[]; // `select` 或 `multi-select` 的选项
  rows?: number; // `textarea` 的行数
  rules?: any[]; // Ant Design 的自定义校验规则
}
```

### 4.2 使用 `FieldGroup` 渲染字段

`FieldGroup` 组件接收一个 `fields` 数组，并根据配置自动渲染出所有表单项，包括布局、标签、输入控件和校验逻辑。

**核心功能:**
- **自动布局**: 根据 `span` 属性将字段排列在响应式的栅格布局中。
- **类型映射**: 根据 `type` 属性渲染对应的 Ant Design 输入组件（如 `Input`, `Select`, `DatePicker` 等）。
- **统一校验**: 自动处理 `required` 属性，并支持传入 Ant Design 的 `rules` 进行复杂校验。

**配置示例:**

以下是一个在 `StandardFormPage` 中使用的 `fields` 配置示例，展示了不同类型的字段如何定义：

```typescript
// app/equipment/purchase-apply/page.tsx (示例)

import { FieldConfig } from '@/types';

const fields: FieldConfig[] = [
  {
    name: 'deviceName',
    label: '设备名称',
    type: 'text',
    required: true,
    span: 8,
  },
  {
    name: 'deviceType',
    label: '设备类型',
    type: 'select',
    required: true,
    span: 8,
    options: [
      { label: '分析仪器', value: 'analytical' },
      { label: '计量设备', value: 'metrology' },
    ],
  },
  {
    name: 'purchaseDate',
    label: '申购日期',
    type: 'date',
    required: true,
    span: 8,
  },
  {
    name: 'technicalSpec',
    label: '技术指标要求',
    type: 'textarea',
    rows: 4,
    span: 24, // 独占一行
  },
];
```

通过这种配置驱动的方式，开发者可以从繁琐的表单布局和组件实现中解放出来，专注于业务逻辑的定义。

## 5. 表单动作 (Form Actions)

为了统一处理表单的提交、API 请求、加载状态 (loading) 和成功/失败反馈，我们封装了 `useFormSubmit` Hook。所有表单的提交操作都应使用此 Hook。

### 5.1 `useFormSubmit` Hook API

`useFormSubmit` Hook 接收一个 API 请求函数作为参数，并返回一个包含 `loading` 状态和 `handleSubmit` 方法的对象。

**核心功能:**
- **自动管理加载状态**: 在 API 请求期间自动设置 `loading` 为 `true`，结束后设置为 `false`。
- **统一的成功提示**: 请求成功后，默认会显示一个全局的成功消息（“操作成功”），并可选择性地重定向到其他页面。
- **统一的错误处理**: 请求失败后，会自动捕获错误并显示错误信息。
- **防止重复提交**: 在请求完成前，`loading` 状态可以用于禁用提交按钮，防止用户重复点击。

**API 定义:**

```typescript
// src/hooks/useFormSubmit.ts (简化示例)

interface UseFormSubmitOptions {
  onSuccess?: (data: T) => void; // 自定义成功回调
  successMessage?: string; // 自定义成功提示信息
  redirectOnSuccess?: string; // 成功后重定向的路径
}

function useFormSubmit<T>(apiRequest: (formData: any) => Promise<T>, options?: UseFormSubmitOptions);
```

### 5.2 使用示例

在页面组件中，你可以这样使用 `useFormSubmit` 来处理表单提交：

```typescript
// app/project/new/page.tsx (示例)

'use client';

import { Form } from 'antd';
import { StandardFormPage } from '@/components/templates';
import { useFormSubmit } from '@/hooks';
import { api_createProject } from '@/services/api';
import { FieldConfig } from '@/types';

const fields: FieldConfig[] = [
  // ... 字段配置
];

export default function NewProjectPage() {
  const [form] = Form.useForm();
  const { loading, handleSubmit } = useFormSubmit(api_createProject, {
    redirectOnSuccess: '/project/list',
  });

  const onFinish = (values) => {
    // 在提交前可以对数据进行转换
    const formattedValues = { ...values, createTime: new Date() };
    handleSubmit(formattedValues);
  };

  return (
    <StandardFormPage
      form={form}
      fields={fields}
      onFinish={onFinish}
      submitButtonProps={{ loading }}
    />
  );
}
```

通过将表单的 `onFinish` 事件与 `handleSubmit` 方法连接，我们可以轻松地实现一个健壮、用户体验一致的表单提交流程。

## 6. 可编辑表格 (Editable Tables)

对于需要动态增、删、改行的明细表单（如“样品检定记录”中的参数列表），我们提供了 `EditableTable` 组件和 `useTableData` Hook 来简化开发。

### 6.1 `useTableData` Hook

`useTableData` 是一个专门用于管理可编辑表格状态的 Hook。它封装了表格数据的增、删、改、查等所有常用逻辑。

**核心功能:**
- **状态管理**: 维护 `dataSource` 状态，并提供一系列更新函数。
- **行操作**: 提供 `handleAdd`, `handleDelete`, `handleUpdate` 等方法来操作单行数据。
- **批量操作**: 支持 `handleBatchAdd`, `handleBatchDelete` 等批量操作。
- **行创建**: 通过 `createDefaultRow` 选项，可以方便地定义新增行的初始数据结构。
- **行数限制**: 支持通过 `minRows` 和 `maxRows` 限制表格的行数。

**API 概览:**

```typescript
// src/hooks/useTableData.ts (简化示例)

function useTableData(options: {
  initialData?: T[];
  createDefaultRow: () => T;
  minRows?: number;
  maxRows?: number;
});

// 返回值包括：
// dataSource, setDataSource, handleAdd, handleDelete, ...
```

### 6.2 `EditableTable` 组件

`EditableTable` 组件负责渲染可编辑的表格 UI。它接收 `useTableData` 返回的 `dataSource` 和一系列配置，动态生成一个功能完善的可编辑表格。

**核心特性:**
- **配置驱动**: 通过 `config: IEditableTableConfig` 属性来定义表格的列、字段类型和操作。
- **多种字段类型**: 支持在表格中直接编辑文本、数字、下拉框、日期等多种类型的字段（通过 `FieldType` 枚举定义）。
- **内置操作**: 自动渲染“新增一行”、“删除”和“批量导入”等常用操作按钮。

**配置示例:**

在“样品检定记录与核查表”页面中，我们这样使用 `useTableData` 和 `EditableTable`：

```typescript
// app/quality/sample-verification/page.tsx (简化示例)

'use client';

import { BaseFormPage } from '@/components/templates';
import { EditableTable } from '@/components/common';
import { useTableData } from '@/hooks';
import { IEditableTableConfig, FieldType } from '@/types';

// 1. 定义表格配置
const tableConfig: IEditableTableConfig = {
  columns: [
    { title: '参数', dataIndex: 'param', fieldType: FieldType.Select, options: [...] },
    { title: '检测数据A', dataIndex: 'dataA', fieldType: FieldType.Number },
    { title: '检测数据B', dataIndex: 'dataB', fieldType: FieldType.Number },
  ],
  canAdd: true,
  canDelete: true,
  canBatchImport: true,
};

// 2. 定义默认行数据
const createDefaultRow = () => ({
  id: Date.now(),
  param: null,
  dataA: 0,
  dataB: 0,
});

export default function SampleVerificationPage() {
  // 3. 使用 useTableData Hook
  const { dataSource, handleAdd, handleDelete, handleFieldChange } = useTableData({
    createDefaultRow,
    initialData: [],
  });

  return (
    <BaseFormPage>
      {/* ... 其他表单内容 ... */}

      {/* 4. 渲染 EditableTable 组件 */}
      <EditableTable
        config={tableConfig}
        dataSource={dataSource}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onFieldChange={handleFieldChange}
      />
    </BaseFormPage>
  );
}
```

通过 `useTableData` 和 `EditableTable` 的组合，我们可以用一种声明式、可复用的方式高效地构建复杂的可编辑表格功能。

## 7. 命名与路径约定 (Naming & Path Conventions)

遵循统一的命名和目录结构约定，可以让我们快速定位到相关代码，提高项目的可维护性。

- **页面组件**: 存放在 `app/` 目录下，路径与 URL 对应。例如，`/equipment/purchase-apply` 页面的组件路径为 `app/equipment/purchase-apply/page.tsx`。
- **路由配置**: 存放在 `src/config/routes/modules/` 目录下，按业务模块划分。例如，`equipment` 模块的路由配置在 `src/config/routes/modules/equipment.ts` 中。
- **API Service**: 存放在 `src/services/api/` 目录下，同样按业务模块划分。例如，`equipment` 模块的 API 请求函数在 `src/services/api/equipment.ts` 中。
- **类型定义**: 存放在 `src/types/` 目录下，按业务模块或通用性划分。例如，`equipment` 模块的类型定义在 `src/types/equipment.ts` 中。

## 8. 视觉与文案 (Visual & Copywriting)

统一的视觉和文案规范是保证产品专业性和用户体验的基础。

- **布局**: 
  - 严格遵循 Ant Design 的 24 栅格系统。
  - 标准表单字段的 `span` 默认为 `8`，即每行最多 3 个字段。
  - 对于需要更多空间的字段（如 `textarea`）或逻辑上需要独占一行的字段，`span` 应设置为 `24`。
- **文案**: 
  - **标签 (Label)**: 应清晰、简洁、准确地描述字段内容，通常为 2-4 个汉字。
  - **占位符 (Placeholder)**: 应提供明确的输入引导，通常以“请输入”、“请选择”开头。
  - **提示信息**: 校验失败或操作反馈的提示信息应清晰、友好，让用户明确知道问题所在或操作结果。
- **交互**: 
  - **必填项**: 所有必填字段必须在 `FieldConfig` 中设置 `required: true`，这会自动在标签旁显示红色星号。
  - **加载状态**: 所有会触发 API 请求的操作（如提交、保存）都必须有明确的加载状态（如按钮 loading），以防止用户重复操作并提供即时反馈。
  - **禁用状态**: 在不满足前置条件时，应禁用相关操作按钮（如，在数据未变化时禁用“保存”按钮）。

## 9. 完整示例

下面是一个虚构的“能力验证比对结果评价表”页面 (`/quality/proficiency-test`) 的完整实现，它综合运用了上述所有规范，可以作为新表单页面的最佳实践参考。

### 9.1 路由配置

```typescript
// src/config/routes/modules/quality.ts

export const qualityRoutes: RouteConfig[] = [
  // ...
  {
    path: '/quality/proficiency-test',
    title: '能力验证比对结果评价表',
    breadcrumbs: [
      { label: '质量管理', href: '/quality' },
      { label: '能力验证比对结果评价表' },
    ],
  },
  // ...
];
```

### 9.2 类型定义

```typescript
// src/types/quality.ts

export interface ProficiencyTestRecord {
  id?: string;
  recordNumber: string;
  detectionProject: string;
  participatingInstitution: string;
  participants: string[];
  dateRange: [string, string];
  evaluationOpinion: string;
  details: ProficiencyTestDetail[];
}

export interface ProficiencyTestDetail {
  id: number;
  parameter: string;
  dataA: number;
  dataB: number;
  error: number;
  evaluation: string;
}
```

### 9.3 API Service

```typescript
// src/services/api/quality.ts

import { ProficiencyTestRecord } from '@/types';

export async function api_createProficiencyTest(record: ProficiencyTestRecord) {
  // 模拟 API 请求
  console.log('Submitting proficiency test record:', record);
  return new Promise(resolve => setTimeout(() => resolve({ success: true, data: { id: 'new-record-id' } }), 1000));
}
```

### 9.4 页面组件

```typescript
// app/quality/proficiency-test/page.tsx

'use client';

import { Form } from 'antd';
import { BaseFormPage, FieldGroup } from '@/components/templates';
import { EditableTable } from '@/components/common';
import { useFormSubmit, useTableData } from '@/hooks';
import { api_createProficiencyTest } from '@/services/api';
import { FieldConfig, IEditableTableConfig, FieldType, ProficiencyTestDetail } from '@/types';

// 主表单字段配置
const mainFields: FieldConfig[] = [
  { name: 'recordNumber', label: '记录编号', type: 'text', required: true, span: 8 },
  { name: 'detectionProject', label: '检测项目', type: 'select', required: true, span: 8, options: [...] },
  { name: 'participatingInstitution', label: '参与机构', type: 'select', required: true, span: 8, options: [...] },
  { name: 'participants', label: '本单位参加人员', type: 'multi-select', required: true, span: 8, options: [...] },
  { name: 'dateRange', label: '时间', type: 'date-range', required: true, span: 8 },
  { name: 'evaluationOpinion', label: '综合评价意见', type: 'textarea', rows: 4, span: 24 },
];

// 可编辑表格配置
const tableConfig: IEditableTableConfig = {
  columns: [
    { title: '参数', dataIndex: 'parameter', fieldType: FieldType.Select, options: [...] },
    { title: '检测数据A', dataIndex: 'dataA', fieldType: FieldType.Number },
    { title: '检测数据B', dataIndex: 'dataB', fieldType: FieldType.Number },
    { title: '误差', dataIndex: 'error', fieldType: FieldType.Number },
    { title: '单项评价', dataIndex: 'evaluation', fieldType: FieldType.Text },
  ],
  canAdd: true,
  canDelete: true,
};

// 默认行数据
const createDefaultRow = (): ProficiencyTestDetail => ({
  id: Date.now(),
  parameter: ' ',
  dataA: 0,
  dataB: 0,
  error: 0,
  evaluation: ' ',
});

export default function ProficiencyTestPage() {
  const [form] = Form.useForm();
  const { loading, handleSubmit } = useFormSubmit(api_createProficiencyTest, {
    successMessage: '评价表提交成功！',
    redirectOnSuccess: '/quality',
  });

  const { dataSource, ...tableActions } = useTableData<ProficiencyTestDetail>({
    createDefaultRow,
  });

  const onFinish = (values) => {
    const finalValues = { ...values, details: dataSource };
    handleSubmit(finalValues);
  };

  return (
    <BaseFormPage form={form} onFinish={onFinish} submitButtonProps={{ loading }}>
      <FieldGroup fields={mainFields} />
      <EditableTable
        config={tableConfig}
        dataSource={dataSource}
        onAdd={tableActions.handleAdd}
        onDelete={tableActions.handleDelete}
        onFieldChange={tableActions.handleFieldChange}
      />
    </BaseFormPage>
  );
}
```