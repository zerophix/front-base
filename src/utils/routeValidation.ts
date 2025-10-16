/**
 * 路由配置运行时验证工具
 * 提供配置验证和错误检测功能
 */

import type { 
  RouteConfig, 
  ModuleType
} from '@/types/routes';
import { 
  isValidRoutePath, 
  isValidRecordNumber, 
  isValidModule,
  isParentRoute,
  isChildRoute 
} from '@/types/routes';

/**
 * 验证错误类型
 */
export interface ValidationError {
  readonly type: 'error' | 'warning';
  readonly code: string;
  readonly message: string;
  readonly path?: string;
  readonly suggestion?: string;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly ValidationError[];
}

/**
 * 验证单个路由配置
 */
export function validateRouteConfig(route: RouteConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  // 验证路径格式
  if (!isValidRoutePath(route.path)) {
    errors.push({
      type: 'error',
      code: 'INVALID_PATH_FORMAT',
      message: `路径格式无效: ${route.path}`,
      path: route.path,
      suggestion: '路径必须以 "/" 开头且长度大于1'
    });
  }

  // 验证标题
  if (!route.title || route.title.trim().length === 0) {
    errors.push({
      type: 'error',
      code: 'EMPTY_TITLE',
      message: '路由标题不能为空',
      path: route.path
    });
  }

  // 验证模块类型
  if (!isValidModule(route.module)) {
    errors.push({
      type: 'error',
      code: 'INVALID_MODULE',
      message: `无效的模块类型: ${route.module}`,
      path: route.path,
      suggestion: '模块类型必须是预定义的值之一'
    });
  }

  // 验证面包屑
  if (!route.breadcrumbs || route.breadcrumbs.length === 0) {
    errors.push({
      type: 'error',
      code: 'EMPTY_BREADCRUMBS',
      message: '面包屑不能为空',
      path: route.path
    });
  } else {
    route.breadcrumbs.forEach((breadcrumb, index) => {
      if (!breadcrumb.label || breadcrumb.label.trim().length === 0) {
        errors.push({
          type: 'error',
          code: 'EMPTY_BREADCRUMB_LABEL',
          message: `面包屑标签不能为空 (索引: ${index})`,
          path: route.path
        });
      }
      
      if (breadcrumb.href && !isValidRoutePath(breadcrumb.href)) {
        errors.push({
          type: 'error',
          code: 'INVALID_BREADCRUMB_HREF',
          message: `面包屑链接格式无效: ${breadcrumb.href} (索引: ${index})`,
          path: route.path
        });
      }
    });
  }

  // 验证记录编号（如果存在）
  if ('recordNumber' in route && route.recordNumber && !isValidRecordNumber(route.recordNumber)) {
    errors.push({
      type: 'error',
      code: 'INVALID_RECORD_NUMBER',
      message: `记录编号格式无效: ${route.recordNumber}`,
      path: route.path,
      suggestion: '记录编号格式应为: SZD-XX-XX-XX-XX-YYYY'
    });
  }

  // 验证父子关系
  if (isChildRoute(route)) {
    if (!isValidRoutePath(route.parent)) {
      errors.push({
        type: 'error',
        code: 'INVALID_PARENT_PATH',
        message: `父路径格式无效: ${route.parent}`,
        path: route.path
      });
    }

    // 检查路径是否以父路径开头
    if (!route.path.startsWith(route.parent + '/')) {
      errors.push({
        type: 'warning',
        code: 'PATH_PARENT_MISMATCH',
        message: `子路径应以父路径开头: ${route.path} 不以 ${route.parent}/ 开头`,
        path: route.path
      });
    }
  }

  return errors;
}

/**
 * 验证路由配置数组
 */
export function validateRoutes(routes: readonly RouteConfig[]): ValidationResult {
  const allErrors: ValidationError[] = [];
  const pathSet = new Set<string>();
  const parentPaths = new Set<string>();

  // 收集所有父路径
  routes.forEach(route => {
    if (isParentRoute(route)) {
      parentPaths.add(route.path);
    }
  });

  routes.forEach(route => {
    // 验证单个路由
    const routeErrors = validateRouteConfig(route);
    allErrors.push(...routeErrors);

    // 检查路径重复
    if (pathSet.has(route.path)) {
      allErrors.push({
        type: 'error',
        code: 'DUPLICATE_PATH',
        message: `路径重复: ${route.path}`,
        path: route.path
      });
    } else {
      pathSet.add(route.path);
    }

    // 检查子路由的父路径是否存在
    if (isChildRoute(route) && !parentPaths.has(route.parent)) {
      allErrors.push({
        type: 'error',
        code: 'MISSING_PARENT_ROUTE',
        message: `父路由不存在: ${route.parent}`,
        path: route.path,
        suggestion: `确保存在路径为 ${route.parent} 的父路由`
      });
    }
  });

  const errors = allErrors.filter(e => e.type === 'error');
  const warnings = allErrors.filter(e => e.type === 'warning');

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 验证模块路由的一致性
 */
export function validateModuleConsistency(routes: readonly RouteConfig[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const moduleGroups = new Map<ModuleType, RouteConfig[]>();

  // 按模块分组
  routes.forEach(route => {
    if (!moduleGroups.has(route.module)) {
      moduleGroups.set(route.module, []);
    }
    moduleGroups.get(route.module)!.push(route);
  });

  // 检查每个模块的一致性
  moduleGroups.forEach((moduleRoutes, module) => {
    const parentRoutes = moduleRoutes.filter(isParentRoute);
    const childRoutes = moduleRoutes.filter(isChildRoute);

    // 每个模块应该有且仅有一个父路由
    if (parentRoutes.length === 0) {
      errors.push({
        type: 'error',
        code: 'MISSING_MODULE_PARENT',
        message: `模块 ${module} 缺少父路由`,
        suggestion: `添加路径为 /${module} 的父路由`
      });
    } else if (parentRoutes.length > 1) {
      errors.push({
        type: 'error',
        code: 'MULTIPLE_MODULE_PARENTS',
        message: `模块 ${module} 有多个父路由`,
        suggestion: '每个模块应该只有一个父路由'
      });
    }

    // 检查子路由的路径前缀
    const expectedPrefix = `/${module}/`;
    childRoutes.forEach(route => {
      if (!route.path.startsWith(expectedPrefix)) {
        errors.push({
          type: 'warning',
          code: 'INCONSISTENT_MODULE_PATH',
          message: `路径 ${route.path} 与模块 ${module} 不一致`,
          path: route.path,
          suggestion: `路径应以 ${expectedPrefix} 开头`
        });
      }
    });
  });

  return errors;
}

/**
 * 格式化验证错误信息
 */
export function formatValidationErrors(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.errors.length > 0) {
    lines.push('❌ 错误:');
    result.errors.forEach(error => {
      lines.push(`  • [${error.code}] ${error.message}`);
      if (error.path) {
        lines.push(`    路径: ${error.path}`);
      }
      if (error.suggestion) {
        lines.push(`    建议: ${error.suggestion}`);
      }
    });
  }

  if (result.warnings.length > 0) {
    lines.push('⚠️  警告:');
    result.warnings.forEach(warning => {
      lines.push(`  • [${warning.code}] ${warning.message}`);
      if (warning.path) {
        lines.push(`    路径: ${warning.path}`);
      }
      if (warning.suggestion) {
        lines.push(`    建议: ${warning.suggestion}`);
      }
    });
  }

  if (result.isValid && result.warnings.length === 0) {
    lines.push('✅ 所有路由配置验证通过');
  }

  return lines.join('\n');
}