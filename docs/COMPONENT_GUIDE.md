# 组件使用指南和最佳实践

本文档提供了项目中所有核心组件的使用指南、最佳实践和示例代码。

## 📋 目录

- [模板组件](#模板组件)
  - [BaseFormPage](#baseformpage)
  - [StandardFormPage](#standardformpage)
  - [ModuleHomePage](#modulehomepage)
- [通用组件](#通用组件)
  - [FieldGroup](#fieldgroup)
  - [EditableTable](#editabletable)
  - [FormActions](#formactions)
  - [SearchSelect](#searchselect)
  - [UserSelect](#userselect)
- [布局组件](#布局组件)
  - [MainLayout](#mainlayout)
  - [FormPageContainer](#formpagecontainer)
  - [PageContainer](#pagecontainer)
- [性能组件](#性能组件)
  - [PerformanceDashboard](#performancedashboard)
- [最佳实践](#最佳实践)

---

## 模板组件

### BaseFormPage

基础表单页面模板，提供统一的页面结构和表单处理逻辑。

#### 基本用法

```tsx
import React from 'react';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { FieldGroup, FormActions } from '@/components/common';
import { useRouteMeta, usePageConfig } from '@/hooks';

export default function ExamplePage() {
  // 从路由配置获取页面元信息（单一数据源）
  const meta = useRouteMeta();
  usePageConfig(meta);

  const fields = [
    { name: 'name', label: '名称', type: 'text', required: true },
    { name: 'type', label: '类型', type: 'select', options: [
      { label: '类型A', value: 'A' },
      { label: '类型B', value: 'B' }
    ]},
    { name: 'description', label: '描述', type: 'textarea' }
  ];

  const handleSubmit = async (values: any) => {
    try {
      // API调用
      console.log('提交数据:', values);
      return true;
    } catch (error) {
      console.error('提交失败:', error);
      return false;
    }
  };

  return (
    <BaseFormPage onFinish={handleSubmit}>
      <FieldGroup fields={fields} />
      <FormActions onSubmit={handleSubmit} />
    </BaseFormPage>
  );
}
```

#### 高级用法 - 自定义布局

```tsx
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { Row, Col, Card } from 'antd';

export default function AdvancedFormPage() {
  const meta = useRouteMeta();
  usePageConfig(meta);

  return (
    <BaseFormPage onFinish={handleSubmit}>
      <Row gutter={24}>
        <Col span={12}>
          <Card title="基本信息">
            <FieldGroup fields={basicFields} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="详细信息">
            <FieldGroup fields={detailFields} />
          </Card>
        </Col>
      </Row>
      <FormActions onSubmit={handleSubmit} />
    </BaseFormPage>
  );
}
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| onFinish | `(values: any) => Promise<boolean>` | - | 表单提交处理函数 |
| initialValues | `Record<string, any>` | `{}` | 表单初始值 |
| loading | `boolean` | `false` | 加载状态 |
| children | `ReactNode` | - | 表单内容 |

---

### StandardFormPage

标准表单页面模板，基于BaseFormPage，提供更多预设功能。

#### 基本用法

```tsx
import { StandardFormPage } from '@/components/templates/StandardFormPage';

export default function StandardPage() {
  const meta = useRouteMeta();
  usePageConfig(meta);

  const config = {
    fields: [
      { name: 'title', label: '标题', type: 'text', required: true },
      { name: 'status', label: '状态', type: 'select', options: statusOptions },
      { name: 'date', label: '日期', type: 'date' }
    ],
    submitText: '保存',
    resetText: '重置'
  };

  return (
    <StandardFormPage
      config={config}
      onSubmit={handleSubmit}
      onReset={handleReset}
    />
  );
}
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| config | `FormConfig` | - | 表单配置对象 |
| onSubmit | `(values: any) => Promise<boolean>` | - | 提交处理函数 |
| onReset | `() => void` | - | 重置处理函数 |
| initialValues | `Record<string, any>` | `{}` | 初始值 |

---

### ModuleHomePage

模块首页模板，提供统一的模块导航和概览。

#### 基本用法

```tsx
import { ModuleHomePage } from '@/components/templates/ModuleHomePage';

export default function EquipmentHomePage() {
  const meta = useRouteMeta();
  usePageConfig(meta);

  const moduleConfig = {
    title: '设备管理',
    description: '设备全生命周期管理系统',
    sections: [
      {
        title: '设备档案',
        items: [
          { title: '设备台账', href: '/equipment/ledger', icon: 'database' },
          { title: '设备分类', href: '/equipment/category', icon: 'tags' }
        ]
      },
      {
        title: '维护管理',
        items: [
          { title: '维护计划', href: '/equipment/maintenance-plan', icon: 'calendar' },
          { title: '维护记录', href: '/equipment/maintenance-record', icon: 'tool' }
        ]
      }
    ]
  };

  return <ModuleHomePage config={moduleConfig} />;
}
```

---

## 通用组件

### FieldGroup

字段组组件，用于批量渲染表单字段。

#### 基本用法

```tsx
import { FieldGroup } from '@/components/common/FieldGroup';

const fields = [
  {
    name: 'username',
    label: '用户名',
    type: 'text',
    required: true,
    rules: [
      { required: true, message: '请输入用户名' },
      { min: 3, message: '用户名至少3个字符' }
    ]
  },
  {
    name: 'email',
    label: '邮箱',
    type: 'email',
    required: true
  },
  {
    name: 'role',
    label: '角色',
    type: 'select',
    options: [
      { label: '管理员', value: 'admin' },
      { label: '用户', value: 'user' }
    ]
  },
  {
    name: 'birthDate',
    label: '出生日期',
    type: 'date'
  },
  {
    name: 'description',
    label: '描述',
    type: 'textarea',
    rows: 4
  }
];

function UserForm() {
  return (
    <Form>
      <FieldGroup fields={fields} />
    </Form>
  );
}
```

#### 支持的字段类型

| 类型 | 说明 | 额外属性 |
|------|------|----------|
| `text` | 文本输入框 | `placeholder`, `maxLength` |
| `textarea` | 多行文本 | `rows`, `placeholder` |
| `number` | 数字输入 | `min`, `max`, `step` |
| `email` | 邮箱输入 | `placeholder` |
| `password` | 密码输入 | `placeholder` |
| `select` | 下拉选择 | `options`, `mode`, `allowClear` |
| `date` | 日期选择 | `format`, `showTime` |
| `dateRange` | 日期范围 | `format`, `showTime` |
| `checkbox` | 复选框 | `options` |
| `radio` | 单选框 | `options` |
| `switch` | 开关 | `checkedChildren`, `unCheckedChildren` |
| `upload` | 文件上传 | `accept`, `multiple`, `maxCount` |

#### 高级配置

```tsx
const advancedFields = [
  {
    name: 'category',
    label: '分类',
    type: 'select',
    options: [
      { label: '分类A', value: 'a' },
      { label: '分类B', value: 'b' }
    ],
    mode: 'multiple', // 多选
    allowClear: true,
    placeholder: '请选择分类'
  },
  {
    name: 'dateRange',
    label: '时间范围',
    type: 'dateRange',
    format: 'YYYY-MM-DD HH:mm:ss',
    showTime: true
  },
  {
    name: 'files',
    label: '附件',
    type: 'upload',
    accept: '.pdf,.doc,.docx',
    multiple: true,
    maxCount: 5
  }
];
```

---

### EditableTable

可编辑表格组件，支持行内编辑、添加、删除等操作。

#### 基本用法

```tsx
import { EditableTable } from '@/components/common/EditableTable';
import { useTableData } from '@/hooks';

function ProductTable() {
  const tableConfig = {
    columns: [
      {
        key: 'name',
        title: '产品名称',
        type: 'text',
        required: true,
        width: 200
      },
      {
        key: 'price',
        title: '价格',
        type: 'number',
        required: true,
        width: 120,
        min: 0,
        step: 0.01
      },
      {
        key: 'category',
        title: '分类',
        type: 'select',
        options: [
          { label: '电子产品', value: 'electronics' },
          { label: '服装', value: 'clothing' }
        ],
        width: 150
      },
      {
        key: 'inStock',
        title: '有库存',
        type: 'switch',
        width: 100
      }
    ],
    rowKey: 'id',
    showAddButton: true,
    showDeleteButton: true,
    addButtonText: '添加产品'
  };

  const createDefaultRow = () => ({
    id: Date.now().toString(),
    name: '',
    price: 0,
    category: '',
    inStock: true
  });

  const table = useTableData({ createDefaultRow });

  return (
    <EditableTable
      dataSource={table.dataSource}
      onChange={table.setDataSource}
      config={tableConfig}
    />
  );
}
```

#### 高级功能

```tsx
// 带验证的可编辑表格
const advancedTableConfig = {
  columns: [
    {
      key: 'code',
      title: '编码',
      type: 'text',
      required: true,
      rules: [
        { pattern: /^[A-Z]{2}\d{4}$/, message: '编码格式：两个大写字母+四位数字' }
      ]
    },
    {
      key: 'quantity',
      title: '数量',
      type: 'number',
      required: true,
      min: 1,
      max: 9999
    }
  ],
  // 自定义验证
  validateRow: (row) => {
    if (row.quantity > 100 && !row.approved) {
      return '数量超过100需要审批';
    }
    return null;
  },
  // 行操作按钮
  actions: [
    {
      text: '复制',
      onClick: (record, index) => {
        // 复制行逻辑
      }
    }
  ]
};
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| dataSource | `Array<any>` | `[]` | 表格数据 |
| onChange | `(data: Array<any>) => void` | - | 数据变更回调 |
| config | `IEditableTableConfig` | - | 表格配置 |
| loading | `boolean` | `false` | 加载状态 |

---

### FormActions

表单操作按钮组件，提供统一的表单按钮样式和行为。

#### 基本用法

```tsx
import { FormActions } from '@/components/common/FormActions';

function MyForm() {
  const handleSubmit = async (values) => {
    // 提交逻辑
  };

  const handleReset = () => {
    // 重置逻辑
  };

  return (
    <Form>
      {/* 表单字段 */}
      <FormActions
        onSubmit={handleSubmit}
        onReset={handleReset}
        submitText="保存"
        resetText="重置"
        loading={false}
      />
    </Form>
  );
}
```

#### 自定义按钮

```tsx
<FormActions
  onSubmit={handleSubmit}
  submitText="提交审核"
  resetText="清空"
  extraActions={[
    <Button key="draft" onClick={saveDraft}>
      保存草稿
    </Button>,
    <Button key="preview" onClick={preview}>
      预览
    </Button>
  ]}
/>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| onSubmit | `(values: any) => Promise<boolean>` | - | 提交处理函数 |
| onReset | `() => void` | - | 重置处理函数 |
| submitText | `string` | `'提交'` | 提交按钮文本 |
| resetText | `string` | `'重置'` | 重置按钮文本 |
| loading | `boolean` | `false` | 提交加载状态 |
| extraActions | `ReactNode[]` | `[]` | 额外操作按钮 |

---

### SearchSelect

搜索选择组件，支持远程搜索和本地过滤。

#### 基本用法

```tsx
import { SearchSelect } from '@/components/common/SearchSelect';

function UserSelector() {
  const [users, setUsers] = useState([]);

  const searchUsers = async (keyword: string) => {
    const response = await fetch(`/api/users/search?q=${keyword}`);
    const data = await response.json();
    setUsers(data.map(user => ({
      label: user.name,
      value: user.id
    })));
  };

  return (
    <SearchSelect
      placeholder="搜索用户"
      options={users}
      onSearch={searchUsers}
      onChange={(value) => console.log('选中:', value)}
    />
  );
}
```

#### 本地过滤模式

```tsx
const localOptions = [
  { label: '张三', value: '1' },
  { label: '李四', value: '2' },
  { label: '王五', value: '3' }
];

<SearchSelect
  options={localOptions}
  filterOption={(input, option) =>
    option.label.toLowerCase().includes(input.toLowerCase())
  }
  placeholder="搜索本地选项"
/>
```

---

### UserSelect

用户选择组件，专门用于选择系统用户。

#### 基本用法

```tsx
import { UserSelect } from '@/components/common/UserSelect';

function AssigneeSelector() {
  return (
    <UserSelect
      placeholder="选择负责人"
      onChange={(userId) => console.log('选中用户:', userId)}
      mode="single" // 或 "multiple"
    />
  );
}
```

#### 多选模式

```tsx
<UserSelect
  mode="multiple"
  placeholder="选择团队成员"
  maxTagCount={3}
  onChange={(userIds) => console.log('选中用户列表:', userIds)}
/>
```

---

## 布局组件

### MainLayout

主布局组件，提供应用的整体布局结构。

#### 基本用法

```tsx
import { MainLayout } from '@/components/layouts/MainLayout';

export default function RootLayout({ children }) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
```

#### 自定义配置

```tsx
<MainLayout
  sidebarCollapsed={false}
  showBreadcrumb={true}
  headerHeight={64}
  sidebarWidth={256}
>
  {children}
</MainLayout>
```

---

### FormPageContainer

表单页面容器，为表单页面提供统一的布局和样式。

#### 基本用法

```tsx
import { FormPageContainer } from '@/components/layouts/FormPageContainer';

function MyFormPage() {
  return (
    <FormPageContainer title="用户信息">
      <Form>
        {/* 表单内容 */}
      </Form>
    </FormPageContainer>
  );
}
```

---

### PageContainer

通用页面容器，提供页面级别的布局和功能。

#### 基本用法

```tsx
import { PageContainer } from '@/components/layouts/PageContainer';

function ListPage() {
  return (
    <PageContainer
      title="用户列表"
      extra={[
        <Button key="add" type="primary">
          添加用户
        </Button>
      ]}
    >
      {/* 页面内容 */}
    </PageContainer>
  );
}
```

---

## 性能组件

### PerformanceDashboard

性能监控仪表板组件，展示应用性能数据。

#### 基本用法

```tsx
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';

function PerformancePage() {
  return (
    <div>
      <h1>性能监控</h1>
      <PerformanceDashboard />
    </div>
  );
}
```

---

## 最佳实践

### 1. 组件设计原则

#### 单一职责原则
每个组件应该只负责一个功能：

```tsx
// ✅ 好的做法 - 单一职责
function UserAvatar({ user, size }) {
  return (
    <img 
      src={user.avatar} 
      alt={user.name}
      style={{ width: size, height: size }}
    />
  );
}

// ❌ 不好的做法 - 职责过多
function UserCard({ user, onEdit, onDelete, showActions }) {
  // 这个组件做了太多事情
}
```

#### 组合优于继承
使用组合模式构建复杂组件：

```tsx
// ✅ 好的做法 - 组合模式
function UserProfile({ user }) {
  return (
    <Card>
      <UserAvatar user={user} size={64} />
      <UserInfo user={user} />
      <UserActions user={user} />
    </Card>
  );
}
```

### 2. Props 设计

#### 明确的接口定义
```tsx
interface ButtonProps {
  readonly type?: 'primary' | 'secondary' | 'danger';
  readonly size?: 'small' | 'medium' | 'large';
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
  readonly children: ReactNode;
}

function Button({ type = 'primary', size = 'medium', ...props }: ButtonProps) {
  // 实现
}
```

#### 合理的默认值
```tsx
// ✅ 提供合理的默认值
function Pagination({ 
  current = 1, 
  pageSize = 10, 
  total = 0,
  showSizeChanger = true 
}) {
  // 实现
}
```

### 3. 状态管理

#### 状态提升
将共享状态提升到最近的公共父组件：

```tsx
// ✅ 状态提升到父组件
function UserList() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  return (
    <div>
      <UserTable 
        users={users} 
        selectedUsers={selectedUsers}
        onSelectionChange={setSelectedUsers}
      />
      <UserActions selectedUsers={selectedUsers} />
    </div>
  );
}
```

#### 使用自定义Hooks
将复杂逻辑抽取到自定义Hooks：

```tsx
// 自定义Hook
function useUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, fetchUsers };
}

// 组件中使用
function UserListPage() {
  const { users, loading, fetchUsers } = useUserList();
  
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      {loading ? <Spin /> : <UserTable users={users} />}
    </div>
  );
}
```

### 4. 性能优化

#### 使用React.memo
对于纯展示组件使用memo优化：

```tsx
const UserCard = React.memo(function UserCard({ user }) {
  return (
    <Card>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </Card>
  );
});
```

#### 合理使用useCallback和useMemo
```tsx
function UserList({ users, onUserSelect }) {
  // 缓存过滤后的用户列表
  const filteredUsers = useMemo(() => {
    return users.filter(user => user.active);
  }, [users]);

  // 缓存事件处理函数
  const handleUserClick = useCallback((user) => {
    onUserSelect(user.id);
  }, [onUserSelect]);

  return (
    <div>
      {filteredUsers.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          onClick={handleUserClick}
        />
      ))}
    </div>
  );
}
```

### 5. 错误处理

#### 使用ErrorBoundary
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <UserList />
    </ErrorBoundary>
  );
}
```

#### 组件内错误处理
```tsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await api.getUser(userId);
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  if (loading) return <Spin />;
  if (error) return <Alert type="error" message={error} />;
  if (!user) return <Empty description="用户不存在" />;

  return <UserCard user={user} />;
}
```

### 6. 测试

#### 组件测试示例
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 7. 可访问性

#### 语义化HTML
```tsx
// ✅ 使用语义化标签
function ArticleCard({ article }) {
  return (
    <article>
      <header>
        <h2>{article.title}</h2>
        <time dateTime={article.publishDate}>
          {formatDate(article.publishDate)}
        </time>
      </header>
      <main>
        <p>{article.summary}</p>
      </main>
    </article>
  );
}
```

#### ARIA属性
```tsx
function SearchInput({ onSearch }) {
  return (
    <div role="search">
      <label htmlFor="search-input">搜索</label>
      <input
        id="search-input"
        type="text"
        aria-label="搜索内容"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
```

---

## 总结

本指南涵盖了项目中所有核心组件的使用方法和最佳实践。遵循这些指南可以：

1. **提高开发效率** - 统一的组件接口和使用模式
2. **保证代码质量** - 明确的设计原则和最佳实践
3. **增强可维护性** - 清晰的组件职责和合理的抽象
4. **优化用户体验** - 性能优化和可访问性考虑

在开发新功能时，请优先使用现有组件，如需扩展功能，请遵循本指南的设计原则。