/**
 * 类型定义统一导出
 * 提供项目所有类型的中央导出点
 */

// 路由类型（解决BreadcrumbItem命名冲突）
export type {
  ModuleType,
  RoutePath,
  RecordNumber,
  BreadcrumbItem as RouteBreadcrumbItem,
  BaseRouteConfig,
  ParentRouteConfig,
  ChildRouteConfig,
  RouteConfig,
  RouteCreateOptions,
  ModuleRouteMap,
  PathRouteMap,
} from './routes';

export {
  isParentRoute,
  isChildRoute,
  isValidRoutePath,
  isValidRecordNumber,
  isValidModule,
} from './routes';

// 服务类型
export * from './services';

// 侧边栏类型（解决BreadcrumbItem命名冲突）
export type {
  SidebarState,
  SidebarConfig,
  BaseMenuItem,
  LeafMenuItem,
  GroupMenuItem,
  MenuItem,
  MenuTree,
  SearchResult,
  SearchState,
  NavigationState,
  BreadcrumbItem as SidebarBreadcrumbItem,
  SidebarEvents,
  SidebarProps,
  MenuProps,
  SearchProps,
  ToggleProps,
  MenuItemKey,
  MenuItemPath,
  SearchScore,
  SidebarTheme,
  Breakpoint,
  SidebarMode,
  MenuOpenMode,
  SidebarPosition,
  SidebarTypes,
} from './sidebar';

export {
  isLeafMenuItem,
  isGroupMenuItem,
  hasChildren,
} from './sidebar';

// 核心类型系统 - 新的严格类型定义
export * as Core from './core';

// 业务类型定义（保持向后兼容）
export * from './personnel';
export * from './equipment';
export * from './quality';

// Legacy 类型（向后兼容）
export * as Legacy from './common';
export * as LegacyForm from './form';
export * as LegacySidebar from './sidebar';

// 常用类型的直接导出（从核心类型系统）
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
  FormModeType,
  FieldTypeType,
  FieldConfig,
  FormConfig,
  FormState,
  FormActions,
  TableColumn,
  TableRowAction,
  TableConfig,
  ComponentSizeType,
  ComponentVariantType,
  ApiResponse,
  ApiClient,
  UIState,
  UserState,
  PageState,
} from './core';

export {
  Status,
  AsyncStatus,
  FormMode,
  FieldType,
  ComponentSize,
  ComponentVariant,
  TypeUtils,
} from './core';

// 向后兼容的类型别名
import type { ApiResponse, PaginationResponse, BaseQueryParams } from './core';
export type IApiResponse<T = any> = ApiResponse<T>;
export type IPaginationResponse<T = any> = PaginationResponse<T>;
export type IPageQueryParams = BaseQueryParams;

// 类型迁移别名（向后兼容）
export type {
  // 从 common.ts 迁移到 core
  ID as LegacyID,
  IApiResponse as LegacyApiResponse,
  IPaginationParams as LegacyPaginationParams,
  IPaginationResponse as LegacyPaginationResponse,
  IBaseRecord as LegacyBaseRecord,
  IOption as LegacyOption,
} from './common';

export type {
  // 从 form.ts 迁移到 core
  FormMode as LegacyFormMode,
  IFieldConfig as LegacyFieldConfig,
  IFormConfig as LegacyFormConfig,
} from './form';

