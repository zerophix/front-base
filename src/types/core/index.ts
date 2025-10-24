/**
 * 核心类型系统统一导出
 * 提供严格、一致的类型定义
 */

// 基础类型
export type {
  ID,
  Timestamp,
  StatusType,
  BaseEntity,
  CreateEntityInput,
  UpdateEntityInput,
  PaginationParams,
  PaginationResponse,
  SortParams,
  BaseQueryParams,
  Option,
  AppError,
  Result,
  AsyncStatusType,
  AsyncState,
  DeepReadonly,
  NonNullable,
  StrictRecord,
  Brand,
  Email,
  PhoneNumber,
  URL,
  FilePath,
} from './base';

export {
  Status,
  AsyncStatus,
  isValidId,
  isValidStatus,
  isValidTimestamp,
  isValidPaginationParams,
} from './base';

// API 类型
export type {
  HttpMethod,
  ApiStatusCode,
  ApiResponse,
  ApiErrorResponse,
  RequestConfig,
  ApiClientConfig,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  CrudApi,
  ApprovalApi,
  FileUploadApi,
  ImportExportApi,
  ApiCache,
  ApiClient,
  ApprovalRecord,
  UploadOptions,
  FileInfo,
  ExportResult,
  ImportOptions,
  ImportResult,
  ImportError,
} from './api';

// 状态管理类型
export type {
  ThemeType,
  UIState,
  UIActions,
  UIStore,
  User,
  UserState,
  UserActions,
  UserStore,
  BreadcrumbItem,
  PageState,
  PageActions,
  PageStore,
  RouteMeta,
  AppState,
  AppActions,
  AppStore,
  Notification,
  NotificationState,
  NotificationActions,
  NotificationStore,
  PersistConfig,
  StoreMiddleware,
  AsyncOperationState,
  AsyncOperationManager,
  FormState as StoreFormState,
  FormActions as StoreFormActions,
  FormStore,
  ListState,
  ListActions,
  ListStore,
  StoreFactory,
  StoreSelector,
  StoreSubscriber,
} from './state';

export {
  Theme,
  NotificationType,
} from './state';

// 表单类型
export type {
  FormModeType,
  FieldTypeType,
  FieldValidationRule,
  BaseFieldConfig,
  TextFieldConfig,
  NumberFieldConfig,
  SelectFieldConfig,
  DateFieldConfig,
  UploadFieldConfig,
  CustomFieldConfig,
  FieldConfig,
  CustomFieldProps,
  FormLayout,
  FormGroup,
  FormConfig,
  FormValues,
  FormErrors,
  FormTouched,
  FormState,
  FormSubmitResult,
  FormCallbacks,
  FormActions,
  FormHookResult,
  EditableRow,
  EditableColumnConfig,
  EditableTableConfig,
  EditableTableState,
  EditableTableActions,
  FieldDependency,
  ValidationContext,
  AsyncValidator,
  FieldState,
  FormContext,
} from './form';

export {
  FormMode,
  FieldType,
} from './form';

// 组件类型
export type {
  ComponentSizeType,
  ComponentVariantType,
  BaseComponentProps,
  InteractiveComponentProps,
  TableColumn,
  TableRowAction,
  TableConfig,
  TableSelectionConfig,
  TableExpandableConfig,
  PaginationConfig,
  SearchConfig,
  FilterConfig,
  FilterFieldConfig,
  BreadcrumbItem as ComponentBreadcrumbItem,
  BreadcrumbConfig,
  PageHeaderConfig,
  SidebarMenuItem,
  SidebarConfig,
  ModalConfig,
  DrawerConfig,
  NotificationConfig,
  LoadingConfig,
  EmptyConfig,
  ErrorBoundaryState,
  ErrorBoundaryConfig,
  FormPageConfig,
  ListPageConfig,
  DetailPageConfig,
  DetailFieldConfig,
  ComponentState,
  ComponentActions,
  HOCConfig,
  ComponentFactoryConfig,
  ComponentRegistry,
  ThemeConfig,
  ResponsiveConfig,
  GridConfig,
  GridColConfig,
} from './component';

export {
  ComponentSize,
  ComponentVariant,
} from './component';

// 导入类型守卫函数和类型
import type { 
  ID, 
  StatusType, 
  Timestamp, 
  Result, 
  AppError, 
  AsyncState 
} from './base';
import { 
  isValidId, 
  isValidStatus, 
  isValidTimestamp, 
  isValidPaginationParams,
  Status,
  AsyncStatus
} from './base';

// 类型工具函数
export const TypeUtils = {
  // 基础类型检查
  isValidId,
  isValidStatus,
  isValidTimestamp,
  isValidPaginationParams,
  
  // 类型断言
  assertID: (value: unknown): asserts value is ID => {
    if (!isValidId(value)) {
      throw new Error(`Invalid ID: ${value}`);
    }
  },
  
  assertStatus: (value: unknown): asserts value is StatusType => {
    if (!isValidStatus(value)) {
      throw new Error(`Invalid status: ${value}`);
    }
  },
  
  assertTimestamp: (value: unknown): asserts value is Timestamp => {
    if (!isValidTimestamp(value)) {
      throw new Error(`Invalid timestamp: ${value}`);
    }
  },
  
  // 类型转换
  toID: (value: string | number): ID => {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim() as ID;
    }
    if (typeof value === 'number' && value > 0) {
      return String(value) as ID;
    }
    throw new Error(`Cannot convert to ID: ${value}`);
  },
  
  toTimestamp: (value: string | number | Date): Timestamp => {
    if (value instanceof Date) {
      return value.toISOString() as Timestamp;
    }
    if (typeof value === 'number') {
      return new Date(value).toISOString() as Timestamp;
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString() as Timestamp;
      }
    }
    throw new Error(`Cannot convert to Timestamp: ${value}`);
  },
  
  // 结果类型构造器
  success: <T>(data: T): Result<T> => ({ success: true, data }),
  error: (error: AppError): Result<never> => ({ success: false, error }),
  
  // 异步状态构造器
  idle: (): AsyncState<never> => ({ status: AsyncStatus.IDLE }),
  loading: (): AsyncState<never> => ({ status: AsyncStatus.LOADING }),
  succeeded: <T>(data: T): AsyncState<T> => ({ status: AsyncStatus.SUCCESS, data }),
  failed: (error: AppError): AsyncState<never> => ({ status: AsyncStatus.ERROR, error }),
} as const;

// 常用类型别名
export type AnyRecord = Record<string, unknown>;
export type AnyFunction = (...args: unknown[]) => unknown;
export type AnyAsyncFunction = (...args: unknown[]) => Promise<unknown>;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// 实用类型
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ValueOf<T> = T[keyof T];
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K];
};

// 函数类型工具
export type Parameters<T extends AnyFunction> = T extends (...args: infer P) => unknown ? P : never;
export type ReturnType<T extends AnyFunction> = T extends (...args: unknown[]) => infer R ? R : unknown;
export type AsyncReturnType<T extends AnyAsyncFunction> = T extends (...args: unknown[]) => Promise<infer R> ? R : unknown;

// 条件类型工具
export type If<C extends boolean, T, F> = C extends true ? T : F;
export type Not<C extends boolean> = C extends true ? false : true;
export type And<A extends boolean, B extends boolean> = A extends true ? B : false;
export type Or<A extends boolean, B extends boolean> = A extends true ? true : B;

// 字符串类型工具
export type Capitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S;
export type Uncapitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Lowercase<F>}${R}` : S;

// 数组类型工具
export type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never;
export type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer R] ? R : never;
export type Length<T extends readonly unknown[]> = T['length'];

// 对象类型工具
export type Paths<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? K | `${K}.${Paths<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

export type PathValue<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PathValue<T[K], R>
    : never
  : P extends keyof T
  ? T[P]
  : never;