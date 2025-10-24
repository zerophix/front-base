# ADR-0005: 状态管理策略

## 状态
已采用

## 背景

现代前端应用的状态管理面临以下挑战：

1. **状态分散** - 组件状态、服务器状态、UI状态混合管理
2. **数据同步** - 多个组件间的状态同步困难
3. **缓存策略** - API数据缓存和失效策略复杂
4. **类型安全** - 状态类型定义和类型推导困难
5. **开发体验** - 状态调试和时间旅行困难
6. **性能优化** - 不必要的重渲染和内存泄漏

## 决策

采用**分层状态管理策略**，根据状态特性选择合适的管理方案：

### 状态分层架构

```
┌─────────────────────────────────────────┐
│           UI状态层                       │
│  • 组件内部状态 (useState)               │
│  • 表单状态 (useForm)                   │
│  • 临时UI状态                           │
├─────────────────────────────────────────┤
│           应用状态层                      │
│  • 全局配置 (Zustand)                   │
│  • 用户会话 (Zustand)                   │
│  • 页面元信息 (Zustand)                 │
├─────────────────────────────────────────┤
│           服务器状态层                    │
│  • API数据缓存 (TanStack Query)         │
│  • 实时数据 (WebSocket)                 │
│  • 离线数据同步                          │
└─────────────────────────────────────────┘
```

### 核心设计原则

1. **状态就近原则** - 状态尽可能靠近使用它的组件
2. **单一数据源** - 每个状态只有一个权威来源
3. **不可变更新** - 使用不可变数据结构
4. **类型安全** - 完整的TypeScript类型支持
5. **可预测性** - 状态变化可预测和可调试

### 实现方案

#### 1. UI状态管理 (React内置)
```typescript
// 组件内部状态
function FormComponent() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 表单状态
  const [form] = Form.useForm();
  
  return (
    <Form form={form} loading={loading}>
      {/* 表单内容 */}
    </Form>
  );
}

// 自定义Hook封装复杂UI状态
function useFormState() {
  const [state, setState] = useState({
    loading: false,
    errors: {},
    touched: {}
  });
  
  const setLoading = (loading: boolean) => 
    setState(prev => ({ ...prev, loading }));
    
  const setError = (field: string, error: string) =>
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error }
    }));
    
  return { state, setLoading, setError };
}
```

#### 2. 应用状态管理 (Zustand)
```typescript
// src/stores/appStore.ts
interface AppState {
  // 用户会话
  user: User | null;
  isAuthenticated: boolean;
  
  // 页面配置
  pageConfig: PageConfig | null;
  
  // 全局UI状态
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  
  // Actions
  setUser: (user: User | null) => void;
  setPageConfig: (config: PageConfig) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  user: null,
  isAuthenticated: false,
  pageConfig: null,
  sidebarCollapsed: false,
  theme: 'light',
  
  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setPageConfig: (pageConfig) => set({ pageConfig }),
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  setTheme: (theme) => set({ theme })
}));

// 状态选择器
export const useUser = () => useAppStore((state) => state.user);
export const usePageConfig = () => useAppStore((state) => state.pageConfig);
export const useTheme = () => useAppStore((state) => state.theme);
```

#### 3. 服务器状态管理 (TanStack Query)
```typescript
// src/hooks/api/useEquipment.ts
export function useEquipmentList(params?: EquipmentQueryParams) {
  return useQuery({
    queryKey: ['equipment', 'list', params],
    queryFn: () => equipmentApi.list(params),
    staleTime: 5 * 60 * 1000, // 5分钟
    cacheTime: 10 * 60 * 1000, // 10分钟
    refetchOnWindowFocus: false
  });
}

export function useEquipmentById(id: string) {
  return useQuery({
    queryKey: ['equipment', 'detail', id],
    queryFn: () => equipmentApi.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000 // 2分钟
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: equipmentApi.create,
    onSuccess: () => {
      // 失效相关查询
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      message.success('创建成功');
    },
    onError: (error) => {
      message.error('创建失败');
    }
  });
}

// 乐观更新
export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: equipmentApi.update,
    onMutate: async (newData) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ 
        queryKey: ['equipment', 'detail', newData.id] 
      });
      
      // 获取当前数据
      const previousData = queryClient.getQueryData([
        'equipment', 'detail', newData.id
      ]);
      
      // 乐观更新
      queryClient.setQueryData(
        ['equipment', 'detail', newData.id],
        newData
      );
      
      return { previousData };
    },
    onError: (err, newData, context) => {
      // 回滚
      if (context?.previousData) {
        queryClient.setQueryData(
          ['equipment', 'detail', newData.id],
          context.previousData
        );
      }
    },
    onSettled: () => {
      // 重新获取数据
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    }
  });
}
```

#### 4. 状态持久化
```typescript
// src/stores/persistedStore.ts
import { persist } from 'zustand/middleware';

interface PersistedState {
  theme: 'light' | 'dark';
  language: string;
  sidebarCollapsed: boolean;
}

export const usePersistedStore = create<PersistedState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'zh-CN',
      sidebarCollapsed: false,
      
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      }))
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed
      })
    }
  )
);
```

#### 5. 状态组合和派生
```typescript
// 组合多个状态源
export function usePageData(pageId: string) {
  const { data: pageConfig } = useQuery({
    queryKey: ['page-config', pageId],
    queryFn: () => getPageConfig(pageId)
  });
  
  const user = useUser();
  const theme = useTheme();
  
  // 派生状态
  const canEdit = useMemo(() => {
    return user?.permissions.includes('edit') && 
           pageConfig?.editable !== false;
  }, [user, pageConfig]);
  
  const pageTitle = useMemo(() => {
    return pageConfig?.title || 'Default Title';
  }, [pageConfig]);
  
  return {
    pageConfig,
    user,
    theme,
    canEdit,
    pageTitle
  };
}
```

### 状态管理最佳实践

#### 1. 状态选择指南
```typescript
// 决策树
const stateManagementGuide = {
  // 组件内部状态
  useState: [
    '表单输入状态',
    '模态框显示状态',
    '临时UI状态',
    '组件内部计算状态'
  ],
  
  // 全局应用状态
  zustand: [
    '用户认证状态',
    '全局配置',
    '页面元信息',
    '跨组件共享状态'
  ],
  
  // 服务器状态
  tanstackQuery: [
    'API数据缓存',
    '服务器数据同步',
    '分页数据',
    '实时数据更新'
  ]
};
```

#### 2. 性能优化策略
```typescript
// 状态选择器优化
const useOptimizedSelector = () => {
  // 使用浅比较避免不必要的重渲染
  const { user, theme } = useAppStore(
    useShallow((state) => ({ 
      user: state.user, 
      theme: state.theme 
    }))
  );
  
  return { user, theme };
};

// 查询优化
const useOptimizedQuery = () => {
  return useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    select: (data) => data.items, // 只选择需要的数据
    structuralSharing: false, // 禁用结构共享以提高性能
  });
};
```

## 后果

### 积极后果

1. **清晰的职责分工** - 不同类型的状态有明确的管理方案
2. **优秀的开发体验** - 类型安全、调试友好
3. **高性能** - 精确的重渲染控制和缓存策略
4. **可维护性** - 状态逻辑集中管理，易于测试
5. **扩展性** - 可以根据需要添加新的状态管理方案

### 消极后果

1. **学习成本** - 开发者需要学习多个状态管理库
2. **复杂度** - 状态管理方案的选择和配置
3. **包大小** - 多个状态管理库增加包大小

### 风险缓解

1. **文档完善** - 提供状态管理选择指南
2. **代码示例** - 为每种场景提供最佳实践示例
3. **渐进采用** - 可以逐步迁移到新的状态管理方案

## 替代方案

### 方案1：Redux Toolkit
- **优点** - 成熟稳定，生态丰富
- **缺点** - 样板代码多，学习曲线陡峭

### 方案2：Recoil
- **优点** - 原子化状态，细粒度更新
- **缺点** - 实验性质，生态不够成熟

### 方案3：Valtio
- **优点** - 基于Proxy，使用简单
- **缺点** - 性能特性不够明确

## 相关决策
- [ADR-0003: 配置驱动的表单系统](./ADR-0003-configuration-driven-forms.md) - 表单状态管理
- [ADR-0004: 安全架构设计](./ADR-0004-security-architecture.md) - 安全状态管理

## 实施指南

### 状态管理检查清单
- [ ] 确定状态类型（UI/应用/服务器）
- [ ] 选择合适的管理方案
- [ ] 实现类型安全的状态定义
- [ ] 添加必要的持久化
- [ ] 编写状态相关测试
- [ ] 优化性能和内存使用

### 迁移策略
1. 新功能优先使用新的状态管理方案
2. 逐步重构现有状态管理代码
3. 保持向后兼容性
4. 监控性能指标

## 更新历史
- 2024-01: 初始版本，确立分层状态管理策略
- 2024-01: 添加性能优化和最佳实践指南