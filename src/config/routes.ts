/**
 * 路由配置文件
 * 单一数据源：定义所有路由、菜单、权限、面包屑
 * 
 * 设计原则：
 * - 配置驱动：从配置生成路由和菜单
 * - 单一职责：一处配置，多处使用
 * - 类型安全：完整的 TypeScript 类型定义
 */
import { projectRoutes } from './routes/modules/project';
import { personnelRoutes } from './routes/modules/personnel';
import { qualityRoutes } from './routes/modules/quality';
import { dataRoutes } from './routes/modules/data';
import { equipmentRoutes } from './routes/modules/equipment';
import { dashboardRoutes } from './routes/modules/dashboard';
import { homeRoutes } from './routes/modules/home';
import { recordsRoutes } from './routes/modules/records';
import { contractRoutes } from './routes/modules/contract';
import type { IconName } from '@/config/icons';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface RouteConfig {
  /**
   * 路由路径
   */
  path: string;
  
  /**
   * 页面标题
   */
  title: string;
  
  /**
   * 模块分类
   */
  module: 'personnel' | 'equipment' | 'quality' | 'project' | 'data' | 'home' | 'records';
  
  /**
   * 面包屑
   */
  breadcrumbs: BreadcrumbItem[];
  
  /**
   * 记录编号（可选）
   */
  recordNumber?: string;
  
  /**
   * 权限标识（可选）
   */
  permission?: string;
  
  /**
   * 菜单显示名称（默认使用 title）
   */
  menuLabel?: string;
  
  /**
   * 父级路径（用于菜单分组）
   */
  parent?: string;

  /**
   * 菜单图标（可选，使用 Ant Design 图标名称）
   */
  icon?: IconName;
}

/**
 * 路由配置表
 * 所有页面的配置集中在这里
 */
export const routes: RouteConfig[] = [
  // 首页
  ...homeRoutes,
  
  // 基础管理
  ...dataRoutes,
  
  // 项目管理
  ...projectRoutes,
  
  // 人员管理
  ...personnelRoutes,
  
  // 设备管理
  ...equipmentRoutes,
  
  // 质量管理
  ...qualityRoutes,
  
  // 合同管理
  ...contractRoutes,
  
  // 仪表板
  ...dashboardRoutes,
  
  // 记录管理
  ...recordsRoutes,
];

/**
 * 根据路径获取路由配置
 */
export function getRouteConfig(path: string): RouteConfig | undefined {
  return routes.find(route => route.path === path);
}

/**
 * 根据模块获取所有路由
 */
export function getRoutesByModule(module: RouteConfig['module']): RouteConfig[] {
  return routes.filter(route => route.module === module);
}

/**
 * 获取所有父级路由（用于生成菜单）
 */
export function getParentRoutes(): RouteConfig[] {
  return routes.filter(route => !route.parent);
}

/**
 * 获取某个父级下的子路由
 */
export function getChildRoutes(parentPath: string): RouteConfig[] {
  return routes.filter(route => route.parent === parentPath);
}

/**
 * 按模块分组导出（为后续模块化拆分做准备）
 */
export const routesByModule = {
  personnel: routes.filter((r) => r.module === 'personnel'),
  equipment: routes.filter((r) => r.module === 'equipment'),
  quality: routes.filter((r) => r.module === 'quality'),
  project: routes.filter((r) => r.module === 'project'),
  data: routes.filter((r) => r.module === 'data'),
  home: routes.filter((r) => r.module === 'home'),
  records: routes.filter((r) => r.module === 'records'),
} as const;

