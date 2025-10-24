/**
 * 路由类型保护工具
 * 提供运行时路由配置类型检查和验证
 */

import type { RouteConfig, ModuleType, BreadcrumbItem } from '@/types/routes';
import { createError, globalErrorHandler } from '@/utils/errorHandler';

/**
 * 路由配置验证结果
 */
export interface RouteValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 验证路由路径格式
 */
export function validateRoutePath(path: string): RouteValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 基本格式检查
  if (!path) {
    errors.push('路径不能为空');
  } else if (!path.startsWith('/')) {
    errors.push('路径必须以 "/" 开头');
  } else if (path.length === 1) {
    warnings.push('根路径应该避免直接使用');
  } else if (path.endsWith('/') && path.length > 1) {
    warnings.push('路径不应以 "/" 结尾');
  }

  // 字符检查
  if (path && !/^[a-zA-Z0-9\-_/]+$/.test(path)) {
    errors.push('路径只能包含字母、数字、连字符和下划线');
  }

  // 长度检查
  if (path && path.length > 100) {
    warnings.push('路径过长，建议控制在100字符以内');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 验证模块类型
 */
export function validateModule(module: string): RouteValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const validModules: readonly ModuleType[] = [
    'personnel', 'equipment', 'quality', 'project', 'data', 'home', 'records'
  ];

  if (!module) {
    errors.push('模块类型不能为空');
  } else if (!validModules.includes(module as ModuleType)) {
    errors.push(`无效的模块类型: ${module}，有效值: ${validModules.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 验证面包屑配置
 */
export function validateBreadcrumbs(breadcrumbs: readonly BreadcrumbItem[] | BreadcrumbItem[]): RouteValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(breadcrumbs)) {
    errors.push('面包屑必须是数组');
    return { isValid: false, errors, warnings };
  }

  if (breadcrumbs.length === 0) {
    errors.push('面包屑不能为空');
  }

  breadcrumbs.forEach((item, index) => {
    if (!item.label || typeof item.label !== 'string') {
      errors.push(`面包屑第${index + 1}项缺少有效的label`);
    }

    if (item.href && typeof item.href !== 'string') {
      errors.push(`面包屑第${index + 1}项的href必须是字符串`);
    }

    if (item.href && !item.href.startsWith('/')) {
      warnings.push(`面包屑第${index + 1}项的href建议使用绝对路径`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 验证记录编号格式
 */
export function validateRecordNumber(recordNumber?: string): RouteValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (recordNumber) {
    const pattern = /^SZD-[A-Z]+-[A-Z]+-[0-9]+-[0-9]+-[0-9]{4}$/;
    if (!pattern.test(recordNumber)) {
      errors.push(`记录编号格式不正确: ${recordNumber}，应符合格式: SZD-XXX-XXX-X-X-XXXX`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 验证单个路由配置
 */
export function validateRouteConfig(route: RouteConfig): RouteValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // 验证路径
  const pathResult = validateRoutePath(route.path);
  allErrors.push(...pathResult.errors);
  allWarnings.push(...pathResult.warnings);

  // 验证标题
  if (!route.title || typeof route.title !== 'string') {
    allErrors.push('标题不能为空且必须是字符串');
  } else if (route.title.length > 50) {
    allWarnings.push('标题过长，建议控制在50字符以内');
  }

  // 验证模块
  const moduleResult = validateModule(route.module);
  allErrors.push(...moduleResult.errors);
  allWarnings.push(...moduleResult.warnings);

  // 验证面包屑
  const breadcrumbsResult = validateBreadcrumbs(route.breadcrumbs);
  allErrors.push(...breadcrumbsResult.errors);
  allWarnings.push(...breadcrumbsResult.warnings);

  // 验证记录编号
  const recordNumberResult = validateRecordNumber(route.recordNumber);
  allErrors.push(...recordNumberResult.errors);
  allWarnings.push(...recordNumberResult.warnings);

  // 验证父路由关系
  if (route.parent) {
    const parentPathResult = validateRoutePath(route.parent);
    if (!parentPathResult.isValid) {
      allErrors.push(`父路由路径格式不正确: ${route.parent}`);
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * 类型守卫：检查是否为有效的路由配置
 */
export function isValidRouteConfig(obj: any): obj is RouteConfig {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const result = validateRouteConfig(obj);
  return result.isValid;
}

/**
 * 类型守卫：检查是否为父路由
 */
export function isParentRoute(route: RouteConfig): boolean {
  return !route.parent;
}

/**
 * 类型守卫：检查是否为子路由
 */
export function isChildRoute(route: RouteConfig): boolean {
  return !!route.parent;
}

/**
 * 安全获取路由配置
 */
export function safeGetRoute(routes: RouteConfig[], path: string): RouteConfig | null {
  try {
    const route = routes.find(r => r.path === path);
    if (route && isValidRouteConfig(route)) {
      return route;
    }
    return null;
  } catch (error) {
    globalErrorHandler.handle(
      createError.validation(`获取路由配置失败: ${path}`, 'path', path),
      { originalError: error }
    );
    return null;
  }
}

/**
 * 安全获取模块路由
 */
export function safeGetModuleRoutes(routes: RouteConfig[], module: ModuleType): RouteConfig[] {
  try {
    const moduleResult = validateModule(module);
    if (!moduleResult.isValid) {
      throw createError.validation(`无效的模块类型: ${module}`);
    }

    return routes.filter(route => {
      if (route.module === module && isValidRouteConfig(route)) {
        return true;
      }
      return false;
    });
  } catch (error) {
    globalErrorHandler.handle(error, { module });
    return [];
  }
}

/**
 * 安全获取子路由
 */
export function safeGetChildRoutes(routes: RouteConfig[], parentPath: string): RouteConfig[] {
  try {
    const pathResult = validateRoutePath(parentPath);
    if (!pathResult.isValid) {
      throw createError.validation(`无效的父路由路径: ${parentPath}`);
    }

    return routes.filter(route => {
      if (route.parent === parentPath && isValidRouteConfig(route)) {
        return true;
      }
      return false;
    });
  } catch (error) {
    globalErrorHandler.handle(error, { parentPath });
    return [];
  }
}

/**
 * 路由配置断言函数
 */
export function assertValidRoute(route: any, context?: string): asserts route is RouteConfig {
  const result = validateRouteConfig(route);
  if (!result.isValid) {
    const contextMsg = context ? ` (${context})` : '';
    throw createError.validation(
      `路由配置验证失败${contextMsg}: ${result.errors.join(', ')}`,
      'route',
      route
    );
  }
}

/**
 * 批量验证路由配置
 */
export function validateRoutes(routes: RouteConfig[]): {
  validRoutes: RouteConfig[];
  invalidRoutes: Array<{ route: any; errors: string[] }>;
  warnings: string[];
} {
  const validRoutes: RouteConfig[] = [];
  const invalidRoutes: Array<{ route: any; errors: string[] }> = [];
  const allWarnings: string[] = [];

  routes.forEach((route, index) => {
    try {
      const result = validateRouteConfig(route);
      
      if (result.isValid) {
        validRoutes.push(route);
        allWarnings.push(...result.warnings.map(w => `路由${index}: ${w}`));
      } else {
        invalidRoutes.push({
          route,
          errors: result.errors,
        });
      }
    } catch (error) {
      invalidRoutes.push({
        route,
        errors: [`验证过程中发生错误: ${error instanceof Error ? error.message : String(error)}`],
      });
    }
  });

  return {
    validRoutes,
    invalidRoutes,
    warnings: allWarnings,
  };
}