# ADR-0002: 模块化API服务设计

## 状态
已采用

## 背景

随着业务模块的增加（人员管理、设备管理、质量管理等），API服务层面临以下挑战：

1. **代码重复** - 每个模块的CRUD操作基本相同
2. **类型安全** - 需要为每个API提供完整的TypeScript类型
3. **错误处理** - 需要统一的错误处理和响应格式
4. **扩展性** - 不同模块可能有特殊的业务方法
5. **维护成本** - 大量相似的API服务代码难以维护

## 决策

采用**分层的模块化API服务设计**，通过基类抽象通用功能，子类扩展特定业务：

### 架构层次

```
BaseApiService (抽象基类)
    ├── 通用CRUD操作
    ├── 统一错误处理
    ├── 类型安全保证
    └── 响应格式标准化
         │
         ├── PersonnelApiService (人员管理)
         ├── EquipmentApiService (设备管理)
         ├── QualityApiService (质量管理)
         └── ...其他业务模块
```

### 核心设计

#### 1. 基础服务类
```typescript
// src/services/api/base.ts
export abstract class BaseApiService<T, CreateData, UpdateData, QueryParams = BaseQueryParams> {
  protected baseUrl: string;
  
  // 标准CRUD操作
  async list(params?: QueryParams): Promise<Result<PaginationResponse<T>, ApiErrorResponse>>
  async getById(id: string): Promise<Result<T, ApiErrorResponse>>
  async create(data: CreateData): Promise<Result<T, ApiErrorResponse>>
  async update(data: UpdateData): Promise<Result<T, ApiErrorResponse>>
  async delete(id: string): Promise<Result<void, ApiErrorResponse>>
}
```

#### 2. 业务服务类
```typescript
// src/services/api/equipment.ts
class EquipmentApiService extends BaseApiService<IEquipment, Partial<IEquipment>, Partial<IEquipment> & { id: ID }, EquipmentQueryParams> {
  constructor() {
    super('/equipment');
  }
  
  // 扩展特定业务方法
  async getMaintenanceHistory(id: string): Promise<Result<IMaintenanceRecord[], ApiErrorResponse>> {
    return apiClient.get(`${this.baseUrl}/${id}/maintenance-history`);
  }
}
```

#### 3. 工厂函数
```typescript
// src/services/api/api.ts
export function createApiService<T, CreateData = Partial<T>, UpdateData = Partial<T> & { id: ID }, QueryParams = BaseQueryParams>(
  baseUrl: string
): BaseApiService<T, CreateData, UpdateData, QueryParams> {
  return new (class extends BaseApiService<T, CreateData, UpdateData, QueryParams> {
    constructor() {
      super(baseUrl);
    }
  })();
}
```

### 使用模式

#### 1. 简单模块（使用工厂函数）
```typescript
export const personnelApi = createApiService<IPersonnel>('/personnel');
```

#### 2. 复杂模块（继承扩展）
```typescript
export const equipmentApi = new EquipmentApiService();
```

#### 3. 组合API（业务聚合）
```typescript
export const qualityApi = {
  standardSubstance: new StandardSubstanceApiService(),
  environment: new EnvironmentRecordApiService(),
  nonconformity: new NonconformityApiService(),
  // ... 其他子模块
};
```

## 后果

### 积极后果

1. **代码复用** - 通用CRUD操作只需实现一次
2. **类型安全** - 完整的TypeScript泛型支持
3. **一致性** - 统一的API调用模式和错误处理
4. **扩展性** - 可以轻松添加特定业务方法
5. **维护性** - 基类修改自动影响所有子类
6. **测试友好** - 可以针对基类编写通用测试

### 消极后果

1. **学习曲线** - 开发者需要理解继承和泛型
2. **抽象复杂度** - 基类设计需要考虑所有使用场景
3. **调试难度** - 继承链可能增加调试复杂度

### 风险缓解

1. **文档完善** - 提供详细的API服务开发指南
2. **示例丰富** - 为每种使用模式提供示例
3. **渐进采用** - 新模块优先使用，旧模块逐步迁移

## 替代方案

### 方案1：每个模块独立实现
- **优点** - 简单直接，无继承复杂度
- **缺点** - 大量重复代码，维护成本高

### 方案2：纯函数式API
- **优点** - 函数式编程，无状态
- **缺点** - 缺乏封装，类型推导困难

### 方案3：装饰器模式
- **优点** - 灵活的功能组合
- **缺点** - TypeScript装饰器支持有限

## 相关决策
- [ADR-0004: 安全架构设计](./ADR-0004-security-architecture.md) - API安全拦截器
- [ADR-0005: 状态管理策略](./ADR-0005-state-management-strategy.md) - API数据缓存

## 实施指南

### 新增API服务步骤
1. 定义业务类型接口
2. 选择实现方式（工厂函数 vs 继承）
3. 实现特定业务方法
4. 编写单元测试
5. 更新API文档

### 代码质量检查
```typescript
// 确保所有API服务都有完整的类型定义
// 确保错误处理遵循统一模式
// 确保测试覆盖率达到要求
```

## 更新历史
- 2024-01: 初始版本，确立模块化API设计
- 2024-01: 添加工厂函数和组合API模式