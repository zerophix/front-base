/**
 * 核心基础类型定义
 * 提供项目中所有类型的基础约束和工具类型
 */

/**
 * 严格的ID类型 - 只允许字符串，确保一致性
 */
export type ID = string;

/**
 * 时间戳类型 - 统一使用ISO字符串格式
 */
export type Timestamp = string;

/**
 * 严格的状态枚举
 */
export const Status = {
  ACTIVE: 'active',
  INACTIVE: 'inactive', 
  PENDING: 'pending',
  DELETED: 'deleted',
} as const;

export type StatusType = typeof Status[keyof typeof Status];

/**
 * 基础实体接口 - 所有数据实体的基础
 */
export interface BaseEntity {
  readonly id: ID;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly createdBy: ID;
  readonly updatedBy: ID;
  readonly status: StatusType;
  readonly version: number; // 乐观锁版本号
}

/**
 * 创建实体时的输入类型
 */
export type CreateEntityInput<T extends BaseEntity> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'version'
> & {
  readonly status?: StatusType; // 创建时状态可选，默认为 active
};

/**
 * 更新实体时的输入类型
 */
export type UpdateEntityInput<T extends BaseEntity> = Partial<
  Omit<T, 'id' | 'createdAt' | 'createdBy' | 'version'>
> & {
  readonly id: ID;
  readonly version: number; // 乐观锁必须提供版本号
};

/**
 * 分页参数 - 严格类型约束
 */
export interface PaginationParams {
  readonly page: number; // 从1开始
  readonly pageSize: number; // 每页大小，范围 1-100
}

/**
 * 分页响应
 */
export interface PaginationResponse<T> {
  readonly data: readonly T[];
  readonly pagination: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
  };
}

/**
 * 排序参数
 */
export interface SortParams {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
}

/**
 * 查询参数基础接口
 */
export interface BaseQueryParams {
  readonly pagination?: PaginationParams;
  readonly sort?: SortParams;
  readonly search?: string;
  readonly filters?: Record<string, unknown>;
}

/**
 * 选项类型 - 用于下拉框等
 */
export interface Option<T = string> {
  readonly label: string;
  readonly value: T;
  readonly disabled?: boolean;
  readonly description?: string;
}

/**
 * 错误类型
 */
export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: Timestamp;
  readonly traceId?: string;
}

/**
 * 操作结果类型
 */
export type Result<T, E = AppError> = 
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * 异步操作状态
 */
export const AsyncStatus = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type AsyncStatusType = typeof AsyncStatus[keyof typeof AsyncStatus];

/**
 * 异步状态包装器
 */
export interface AsyncState<T, E = AppError> {
  readonly status: AsyncStatusType;
  readonly data?: T;
  readonly error?: E;
  readonly lastUpdated?: Timestamp;
}

/**
 * 工具类型：深度只读
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 工具类型：非空类型
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * 工具类型：严格的键值对
 */
export type StrictRecord<K extends string | number | symbol, V> = {
  readonly [P in K]: V;
};

/**
 * 品牌类型 - 用于创建名义类型
 */
export type Brand<T, B> = T & { readonly __brand: B };

/**
 * 常用的品牌类型
 */
export type Email = Brand<string, 'Email'>;
export type PhoneNumber = Brand<string, 'PhoneNumber'>;
export type URL = Brand<string, 'URL'>;
export type FilePath = Brand<string, 'FilePath'>;

/**
 * 类型守卫工具
 */
export const isValidId = (value: unknown): value is ID => {
  return typeof value === 'string' && value.length > 0;
};

export const isValidStatus = (value: unknown): value is StatusType => {
  return typeof value === 'string' && Object.values(Status).includes(value as StatusType);
};

export const isValidTimestamp = (value: unknown): value is Timestamp => {
  return typeof value === 'string' && !isNaN(Date.parse(value));
};

/**
 * 分页参数验证
 */
export const isValidPaginationParams = (params: unknown): params is PaginationParams => {
  if (typeof params !== 'object' || params === null) return false;
  const p = params as Record<string, unknown>;
  return (
    typeof p.page === 'number' && 
    p.page >= 1 && 
    typeof p.pageSize === 'number' && 
    p.pageSize >= 1 && 
    p.pageSize <= 100
  );
};