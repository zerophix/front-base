/**
 * 路由相关的严格类型定义
 * 提供更好的类型安全性和编译时检查
 */

import type { IconName } from '@/config/icons';

/**
 * 模块类型 - 使用联合类型确保类型安全
 */
export type ModuleType = 'personnel' | 'equipment' | 'quality' | 'project' | 'data' | 'home' | 'records';

/**
 * 路径模式 - 确保路径格式正确
 */
export type RoutePath = `/${string}`;

/**
 * 记录编号格式 - 严格的记录编号格式验证
 */
export type RecordNumber = `SZD-${string}-${string}-${string}-${string}-${number}`;

/**
 * 面包屑项目
 */
export interface BreadcrumbItem {
  readonly label: string;
  readonly href?: RoutePath;
}

/**
 * 基础路由配置接口
 */
export interface BaseRouteConfig {
  readonly path: RoutePath;
  readonly title: string;
  readonly module: ModuleType;
  readonly breadcrumbs: readonly BreadcrumbItem[];
  readonly icon?: IconName;
  readonly menuLabel?: string;
  readonly permission?: string;
}

/**
 * 父路由配置 - 模块根路由
 */
export interface ParentRouteConfig extends BaseRouteConfig {
  readonly parent?: never; // 父路由不应该有 parent 属性
  readonly recordNumber?: never; // 父路由通常不需要记录编号
}

/**
 * 子路由配置 - 具体功能页面
 */
export interface ChildRouteConfig extends BaseRouteConfig {
  readonly parent: RoutePath;
  readonly recordNumber?: RecordNumber;
}

/**
 * 路由配置联合类型
 */
export type RouteConfig = ParentRouteConfig | ChildRouteConfig;

/**
 * 路由创建选项
 */
export interface RouteCreateOptions {
  readonly recordNumber?: RecordNumber;
  readonly icon?: IconName;
  readonly menuLabel?: string;
  readonly permission?: string;
  readonly customBreadcrumbs?: readonly BreadcrumbItem[];
}

/**
 * 模块路由映射类型
 */
export type ModuleRouteMap = {
  readonly [K in ModuleType]: readonly RouteConfig[];
};

/**
 * 路径到路由的映射类型
 */
export type PathRouteMap = {
  readonly [path: RoutePath]: RouteConfig;
};

/**
 * 类型守卫：检查是否为父路由
 */
export function isParentRoute(route: RouteConfig): route is ParentRouteConfig {
  return !('parent' in route) || route.parent === undefined;
}

/**
 * 类型守卫：检查是否为子路由
 */
export function isChildRoute(route: RouteConfig): route is ChildRouteConfig {
  return 'parent' in route && route.parent !== undefined;
}

/**
 * 类型守卫：检查路径格式
 */
export function isValidRoutePath(path: string): path is RoutePath {
  return path.startsWith('/') && path.length > 1;
}

/**
 * 类型守卫：检查记录编号格式
 */
export function isValidRecordNumber(recordNumber: string): recordNumber is RecordNumber {
  const pattern = /^SZD-[A-Z]+-[A-Z]+-[0-9]+-[0-9]+-[0-9]{4}$/;
  return pattern.test(recordNumber);
}

/**
 * 类型守卫：检查模块类型
 */
export function isValidModule(module: string): module is ModuleType {
  const validModules: readonly ModuleType[] = ['personnel', 'equipment', 'quality', 'project', 'data', 'home', 'records'];
  return validModules.includes(module as ModuleType);
}