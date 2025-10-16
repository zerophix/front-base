/**
 * 路由配置工具函数
 * 减少重复代码，提供统一的路由创建方法
 */

import type { RouteConfig, BreadcrumbItem } from '@/config/routes';
import type { 
  ModuleType
} from '@/types/routes';
import type { IconName } from '@/config/icons';

/**
 * 模块标签映射
 */
const MODULE_LABELS: Record<ModuleType, string> = {
  equipment: '设备管理',
  quality: '质量管理',
  personnel: '人员管理',
  project: '项目管理',
  data: '基础管理',
  home: '首页',
  records: '记录管理',
} as const;

/**
 * 创建模块根路由
 */
export function createModuleRoute(
  module: ModuleType,
  icon?: IconName
): RouteConfig {
  const label = MODULE_LABELS[module];
  return {
    path: `/${module}`,
    title: label,
    module,
    breadcrumbs: [{ label }],
    icon,
  };
}

/**
 * 创建子路由
 */
export function createChildRoute(
  module: ModuleType,
  path: string,
  title: string,
  options: {
    recordNumber?: string;
    icon?: IconName;
    menuLabel?: string;
    permission?: string;
    customBreadcrumbs?: BreadcrumbItem[];
  } = {}
): RouteConfig {
  const moduleLabel = MODULE_LABELS[module];
  const parentPath = `/${module}`;
  
  // 确保路径是完整路径
  const fullPath = path.startsWith('/') ? path : `${parentPath}/${path}`;
  
  // 默认面包屑：模块 -> 当前页面
  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { label: moduleLabel, href: parentPath },
    { label: title },
  ];

  return {
    path: fullPath,
    title,
    module,
    breadcrumbs: options.customBreadcrumbs || defaultBreadcrumbs,
    parent: parentPath,
    recordNumber: options.recordNumber,
    icon: options.icon,
    menuLabel: options.menuLabel,
    permission: options.permission,
  };
}

/**
 * 批量创建子路由
 */
export function createChildRoutes(
  module: ModuleType,
  routes: Array<{
    path: string;
    title: string;
    recordNumber?: string;
    icon?: IconName;
    menuLabel?: string;
    permission?: string;
    customBreadcrumbs?: BreadcrumbItem[];
  }>
): RouteConfig[] {
  return routes.map(route => createChildRoute(module, route.path, route.title, route));
}