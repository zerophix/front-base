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

// 服务和状态管理类型
export * from './services';
export * from './store';

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

// 通用类型
export * from './common';

// 表单类型
export * from './form';

// API类型
export * from './api';

// 业务领域类型
export * from './personnel';
export * from './equipment';
export * from './quality';

