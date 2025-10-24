# ADR-0003: 配置驱动的表单系统

## 状态
已采用

## 背景

企业级应用中表单是最常见的交互组件，传统的表单开发面临以下问题：

1. **重复开发** - 每个表单都需要重新编写布局、验证、提交逻辑
2. **一致性差** - 不同开发者实现的表单样式和交互不统一
3. **维护困难** - 表单逻辑分散在各个组件中，难以统一修改
4. **扩展性差** - 新增字段类型或验证规则需要修改多处代码
5. **业务耦合** - 表单UI逻辑与业务逻辑混合，难以复用

## 决策

采用**配置驱动的表单系统**，通过声明式配置生成表单，实现UI与业务逻辑分离：

### 核心架构

```
表单配置 (JSON Schema)
    ↓
表单引擎 (FormEngine)
    ↓
表单组件 (StandardFormPage/BaseFormPage)
    ↓
字段组件 (FieldComponents)
```

### 设计原则

1. **配置驱动** - 表单结构、验证、布局完全由配置决定
2. **组件复用** - 提供标准化的表单模板组件
3. **类型安全** - 完整的TypeScript类型支持
4. **扩展性** - 支持自定义字段类型和验证器
5. **一致性** - 统一的表单样式和交互模式

### 实现机制

#### 1. 表单配置接口
```typescript
interface FormFieldConfig {
  name: string;
  label: string;
  type: 'input' | 'select' | 'date' | 'textarea' | 'number' | 'custom';
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  dependencies?: FieldDependency[];
}

interface FormConfig {
  fields: FormFieldConfig[];
  layout?: 'horizontal' | 'vertical' | 'inline';
  submitText?: string;
  resetText?: string;
  onSubmit: (values: any) => Promise<void>;
}
```

#### 2. 标准表单模板
```typescript
// StandardFormPage - 完整的页面模板
export function StandardFormPage({ fields, onSubmit }: FormConfig) {
  const { title, breadcrumbs, recordNumber } = usePageConfig();
  
  return (
    <BaseFormPage>
      <FormEngine 
        fields={fields}
        onSubmit={onSubmit}
        layout="horizontal"
      />
    </BaseFormPage>
  );
}

// BaseFormPage - 基础页面布局
export function BaseFormPage({ children }: { children: React.ReactNode }) {
  const { title, breadcrumbs, recordNumber } = usePageConfig();
  
  return (
    <div className="form-page">
      <Breadcrumb items={breadcrumbs} />
      <div className="form-header">
        <h1>{title}</h1>
        {recordNumber && <span className="record-number">{recordNumber}</span>}
      </div>
      <div className="form-content">
        {children}
      </div>
    </div>
  );
}
```

#### 3. 表单引擎
```typescript
export function FormEngine({ fields, onSubmit, layout = 'horizontal' }: FormEngineProps) {
  const [form] = Form.useForm();
  
  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);
      message.success('提交成功');
    } catch (error) {
      message.error('提交失败');
    }
  };
  
  return (
    <Form
      form={form}
      layout={layout}
      onFinish={handleSubmit}
      className="standard-form"
    >
      {fields.map(field => (
        <FormField key={field.name} config={field} />
      ))}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
        <Button onClick={() => form.resetFields()}>
          重置
        </Button>
      </Form.Item>
    </Form>
  );
}
```

#### 4. 字段组件
```typescript
export function FormField({ config }: { config: FormFieldConfig }) {
  const renderField = () => {
    switch (config.type) {
      case 'input':
        return <Input placeholder={config.placeholder} />;
      case 'select':
        return <Select options={config.options} />;
      case 'date':
        return <DatePicker />;
      case 'textarea':
        return <TextArea rows={4} />;
      case 'number':
        return <InputNumber />;
      default:
        return <Input />;
    }
  };
  
  return (
    <Form.Item
      name={config.name}
      label={config.label}
      rules={config.validation}
      required={config.required}
    >
      {renderField()}
    </Form.Item>
  );
}
```

### 使用示例

```typescript
// 设备维护记录表单
const maintenanceFields: FormFieldConfig[] = [
  {
    name: 'equipmentId',
    label: '设备编号',
    type: 'select',
    required: true,
    options: equipmentOptions
  },
  {
    name: 'maintenanceDate',
    label: '维护日期',
    type: 'date',
    required: true
  },
  {
    name: 'description',
    label: '维护内容',
    type: 'textarea',
    required: true
  }
];

export default function MaintenanceRecordPage() {
  useRouteMeta(); // 自动配置页面元信息
  
  const handleSubmit = async (values: any) => {
    await equipmentApi.createMaintenanceRecord(values);
  };
  
  return (
    <StandardFormPage 
      fields={maintenanceFields}
      onSubmit={handleSubmit}
    />
  );
}
```

## 后果

### 积极后果

1. **开发效率** - 新表单只需配置字段，无需重复开发
2. **一致性** - 所有表单使用统一的样式和交互
3. **维护性** - 表单逻辑集中管理，易于统一修改
4. **扩展性** - 新字段类型和验证规则易于添加
5. **类型安全** - 完整的TypeScript支持
6. **测试友好** - 表单逻辑可以独立测试

### 消极后果

1. **学习成本** - 开发者需要学习配置语法
2. **灵活性限制** - 特殊表单可能需要额外处理
3. **配置复杂度** - 复杂表单的配置可能变得冗长

### 风险缓解

1. **文档完善** - 提供详细的表单配置指南
2. **示例丰富** - 为常见场景提供配置模板
3. **逃生舱口** - 保留自定义表单组件的能力
4. **渐进采用** - 新表单优先使用，旧表单逐步迁移

## 替代方案

### 方案1：传统表单开发
- **优点** - 灵活性高，学习成本低
- **缺点** - 重复开发，一致性差

### 方案2：第三方表单库
- **优点** - 功能丰富，社区支持
- **缺点** - 依赖外部库，定制困难

### 方案3：低代码平台
- **优点** - 可视化配置，非技术人员可用
- **缺点** - 技术栈复杂，学习成本高

## 相关决策
- [ADR-0001: 页面元信息单一数据源](./ADR-0001-single-source-page-metadata.md) - 页面配置集成
- [ADR-0005: 状态管理策略](./ADR-0005-state-management-strategy.md) - 表单状态管理

## 实施指南

### 表单开发流程
1. 分析业务需求，确定字段类型
2. 编写表单配置
3. 实现提交逻辑
4. 配置路由元信息
5. 编写测试用例

### 扩展指南
```typescript
// 自定义字段类型
interface CustomFieldConfig extends FormFieldConfig {
  type: 'custom';
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

// 自定义验证器
const customValidator = (rule: any, value: any) => {
  // 验证逻辑
};
```

## 更新历史
- 2024-01: 初始版本，确立配置驱动表单架构
- 2024-01: 添加自定义字段和验证器支持