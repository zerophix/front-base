/**
 * Route Validation test suite
 * 测试路由配置验证工具的各种功能
 */

import {
  validateRouteConfig,
  validateRoutes,
  validateModuleConsistency,
  formatValidationErrors,
  type ValidationError,
  type ValidationResult,
} from '../routeValidation';
import type { RouteConfig, ModuleType, RoutePath, RecordNumber } from '@/types/routes';

describe('Route Validation', () => {
  describe('validateRouteConfig', () => {
    it('should validate correct route configuration', () => {
      const validRoute: RouteConfig = {
        path: '/users/profile' as RoutePath,
        title: 'User Profile',
        module: 'personnel' as ModuleType,
        parent: '/users' as RoutePath,
        breadcrumbs: [
          { label: 'Users', href: '/users' as RoutePath },
          { label: 'Profile' }
        ],
      };

      const errors = validateRouteConfig(validRoute);
      expect(errors).toHaveLength(0);
    });

    it('should detect invalid path format', () => {
      const invalidRoute: RouteConfig = {
        path: 'invalid-path' as RoutePath,
        title: 'Invalid',
        module: 'personnel' as ModuleType,
        breadcrumbs: [{ label: 'Invalid' }],
      };

      const errors = validateRouteConfig(invalidRoute);
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'error',
          code: 'INVALID_PATH_FORMAT',
          message: expect.stringContaining('路径格式无效'),
        })
      );
    });

    it('should detect empty title', () => {
      const routeWithEmptyTitle: RouteConfig = {
        path: '/users' as RoutePath,
        title: '',
        module: 'personnel' as ModuleType,
        breadcrumbs: [{ label: 'Users' }],
      };

      const errors = validateRouteConfig(routeWithEmptyTitle);
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'error',
          code: 'EMPTY_TITLE',
          message: '路由标题不能为空',
        })
      );
    });

    it('should detect invalid module type', () => {
      const routeWithInvalidModule: RouteConfig = {
        path: '/users' as RoutePath,
        title: 'Users',
        module: 'invalid-module' as ModuleType,
        breadcrumbs: [{ label: 'Users' }],
      };

      const errors = validateRouteConfig(routeWithInvalidModule);
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'error',
          code: 'INVALID_MODULE',
          message: expect.stringContaining('无效的模块类型'),
        })
      );
    });

    it('should detect empty breadcrumbs', () => {
      const routeWithEmptyBreadcrumbs: RouteConfig = {
        path: '/users' as RoutePath,
        title: 'Users',
        module: 'personnel' as ModuleType,
        breadcrumbs: [],
      };

      const errors = validateRouteConfig(routeWithEmptyBreadcrumbs);
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'error',
          code: 'EMPTY_BREADCRUMBS',
          message: '面包屑不能为空',
        })
      );
    });

    it('should detect empty breadcrumb labels', () => {
      const routeWithEmptyBreadcrumbLabel: RouteConfig = {
        path: '/users' as RoutePath,
        title: 'Users',
        module: 'personnel' as ModuleType,
        breadcrumbs: [
          { label: 'Users' },
          { label: '' }, // Empty label
        ],
      };

      const errors = validateRouteConfig(routeWithEmptyBreadcrumbLabel);
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'error',
          code: 'EMPTY_BREADCRUMB_LABEL',
          message: expect.stringContaining('面包屑标签不能为空'),
        })
      );
    });

    it('should detect invalid breadcrumb href', () => {
      const routeWithInvalidBreadcrumbHref: RouteConfig = {
        path: '/users' as RoutePath,
        title: 'Users',
        module: 'personnel' as ModuleType,
        breadcrumbs: [
          { label: 'Users', href: 'invalid-href' as RoutePath },
        ],
      };

      const errors = validateRouteConfig(routeWithInvalidBreadcrumbHref);
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'error',
          code: 'INVALID_BREADCRUMB_HREF',
          message: expect.stringContaining('面包屑链接格式无效'),
        })
      );
    });

    it('should detect invalid record number', () => {
      const routeWithInvalidRecordNumber: RouteConfig = {
        path: '/users/profile' as RoutePath,
        title: 'User Profile',
        module: 'personnel' as ModuleType,
        parent: '/users' as RoutePath,
        breadcrumbs: [{ label: 'Profile' }],
        recordNumber: 'invalid-record' as RecordNumber,
      };

      const errors = validateRouteConfig(routeWithInvalidRecordNumber);
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'error',
          code: 'INVALID_RECORD_NUMBER',
          message: expect.stringContaining('记录编号格式无效'),
        })
      );
    });

    it('should detect invalid parent path', () => {
      const childRouteWithInvalidParent: RouteConfig = {
        path: '/users/profile' as RoutePath,
        title: 'Profile',
        module: 'personnel' as ModuleType,
        parent: 'invalid-parent' as RoutePath,
        breadcrumbs: [{ label: 'Profile' }],
      };

      const errors = validateRouteConfig(childRouteWithInvalidParent);
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'error',
          code: 'INVALID_PARENT_PATH',
          message: expect.stringContaining('父路径格式无效'),
        })
      );
    });

    it('should warn about path-parent mismatch', () => {
      const childRouteWithMismatchedParent: RouteConfig = {
        path: '/admin/settings' as RoutePath,
        title: 'Settings',
        module: 'personnel' as ModuleType,
        parent: '/users' as RoutePath,
        breadcrumbs: [{ label: 'Settings' }],
      };

      const errors = validateRouteConfig(childRouteWithMismatchedParent);
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'warning',
          code: 'PATH_PARENT_MISMATCH',
          message: expect.stringContaining('子路径应以父路径开头'),
        })
      );
    });
  });

  describe('validateRoutes', () => {
    it('should validate correct routes array', () => {
      const validRoutes: RouteConfig[] = [
        {
          path: '/users' as RoutePath,
          title: 'Users',
          module: 'personnel' as ModuleType,
          breadcrumbs: [{ label: 'Users' }],
        },
        {
          path: '/users/profile' as RoutePath,
          title: 'Profile',
          module: 'personnel' as ModuleType,
          parent: '/users' as RoutePath,
          breadcrumbs: [{ label: 'Profile' }],
        },
      ];

      const result = validateRoutes(validRoutes);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect duplicate paths', () => {
      const routesWithDuplicates: RouteConfig[] = [
        {
          path: '/users' as RoutePath,
          title: 'Users 1',
          module: 'personnel' as ModuleType,
          breadcrumbs: [{ label: 'Users 1' }],
        },
        {
          path: '/users' as RoutePath,
          title: 'Users 2',
          module: 'personnel' as ModuleType,
          breadcrumbs: [{ label: 'Users 2' }],
        },
      ];

      const result = validateRoutes(routesWithDuplicates);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'error',
          code: 'DUPLICATE_PATH',
          message: expect.stringContaining('路径重复'),
        })
      );
    });

    it('should detect missing parent routes', () => {
      const routesWithMissingParent: RouteConfig[] = [
        {
          path: '/users/profile' as RoutePath,
          title: 'Profile',
          module: 'personnel' as ModuleType,
          parent: '/users' as RoutePath,
          breadcrumbs: [{ label: 'Profile' }],
        },
      ];

      const result = validateRoutes(routesWithMissingParent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'error',
          code: 'MISSING_PARENT_ROUTE',
          message: expect.stringContaining('父路由不存在'),
        })
      );
    });

    it('should separate errors and warnings', () => {
      const routesWithErrorsAndWarnings: RouteConfig[] = [
        {
          path: 'invalid-path' as RoutePath, // Error
          title: 'Invalid',
          module: 'personnel' as ModuleType,
          breadcrumbs: [{ label: 'Invalid' }],
        },
        {
          path: '/admin/settings' as RoutePath,
          title: 'Settings',
          module: 'personnel' as ModuleType,
          parent: '/users' as RoutePath, // Warning: path-parent mismatch
          breadcrumbs: [{ label: 'Settings' }],
        },
      ];

      const result = validateRoutes(routesWithErrorsAndWarnings);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateModuleConsistency', () => {
    it('should validate consistent module structure', () => {
      const consistentRoutes: RouteConfig[] = [
        {
          path: '/personnel' as RoutePath,
          title: 'Personnel',
          module: 'personnel' as ModuleType,
          breadcrumbs: [{ label: 'Personnel' }],
        },
        {
          path: '/personnel/list' as RoutePath,
          title: 'Personnel List',
          module: 'personnel' as ModuleType,
          parent: '/personnel' as RoutePath,
          breadcrumbs: [{ label: 'List' }],
        },
      ];

      const errors = validateModuleConsistency(consistentRoutes);
      expect(errors).toHaveLength(0);
    });

    it('should detect missing module parent', () => {
      const routesWithoutParent: RouteConfig[] = [
        {
          path: '/personnel/list' as RoutePath,
          title: 'Personnel List',
          module: 'personnel' as ModuleType,
          parent: '/personnel' as RoutePath,
          breadcrumbs: [{ label: 'List' }],
        },
      ];

      const errors = validateModuleConsistency(routesWithoutParent);
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'error',
          code: 'MISSING_MODULE_PARENT',
          message: expect.stringContaining('缺少父路由'),
        })
      );
    });

    it('should detect multiple module parents', () => {
      const routesWithMultipleParents: RouteConfig[] = [
        {
          path: '/personnel' as RoutePath,
          title: 'Personnel 1',
          module: 'personnel' as ModuleType,
          breadcrumbs: [{ label: 'Personnel 1' }],
        },
        {
          path: '/personnel-alt' as RoutePath,
          title: 'Personnel 2',
          module: 'personnel' as ModuleType,
          breadcrumbs: [{ label: 'Personnel 2' }],
        },
      ];

      const errors = validateModuleConsistency(routesWithMultipleParents);
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'error',
          code: 'MULTIPLE_MODULE_PARENTS',
          message: expect.stringContaining('有多个父路由'),
        })
      );
    });

    it('should warn about inconsistent module paths', () => {
      const routesWithInconsistentPaths: RouteConfig[] = [
        {
          path: '/personnel' as RoutePath,
          title: 'Personnel',
          module: 'personnel' as ModuleType,
          breadcrumbs: [{ label: 'Personnel' }],
        },
        {
          path: '/admin/users' as RoutePath, // Inconsistent with personnel module
          title: 'Users',
          module: 'personnel' as ModuleType,
          parent: '/personnel' as RoutePath,
          breadcrumbs: [{ label: 'Users' }],
        },
      ];

      const errors = validateModuleConsistency(routesWithInconsistentPaths);
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'warning',
          code: 'INCONSISTENT_MODULE_PATH',
          message: expect.stringContaining('与模块'),
        })
      );
    });
  });

  describe('formatValidationErrors', () => {
    it('should format validation result with errors', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          {
            type: 'error',
            code: 'INVALID_PATH',
            message: 'Invalid path format',
            path: '/invalid',
            suggestion: 'Use valid path format',
          },
        ],
        warnings: [],
      };

      const formatted = formatValidationErrors(result);
      expect(formatted).toContain('❌ 错误:');
      expect(formatted).toContain('[INVALID_PATH] Invalid path format');
      expect(formatted).toContain('路径: /invalid');
      expect(formatted).toContain('建议: Use valid path format');
    });

    it('should format validation result with warnings', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [
          {
            type: 'warning',
            code: 'PATH_MISMATCH',
            message: 'Path mismatch detected',
            path: '/mismatch',
          },
        ],
      };

      const formatted = formatValidationErrors(result);
      expect(formatted).toContain('⚠️  警告:');
      expect(formatted).toContain('[PATH_MISMATCH] Path mismatch detected');
      expect(formatted).toContain('路径: /mismatch');
    });

    it('should format validation result with both errors and warnings', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          {
            type: 'error',
            code: 'ERROR_CODE',
            message: 'Error message',
          },
        ],
        warnings: [
          {
            type: 'warning',
            code: 'WARNING_CODE',
            message: 'Warning message',
          },
        ],
      };

      const formatted = formatValidationErrors(result);
      expect(formatted).toContain('❌ 错误:');
      expect(formatted).toContain('⚠️  警告:');
      expect(formatted).toContain('[ERROR_CODE] Error message');
      expect(formatted).toContain('[WARNING_CODE] Warning message');
    });

    it('should format successful validation result', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      const formatted = formatValidationErrors(result);
      expect(formatted).toContain('✅ 所有路由配置验证通过');
    });

    it('should handle errors without path or suggestion', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          {
            type: 'error',
            code: 'SIMPLE_ERROR',
            message: 'Simple error message',
          },
        ],
        warnings: [],
      };

      const formatted = formatValidationErrors(result);
      expect(formatted).toContain('[SIMPLE_ERROR] Simple error message');
      expect(formatted).not.toContain('路径:');
      expect(formatted).not.toContain('建议:');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty routes array', () => {
      const result = validateRoutes([]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle routes with null/undefined properties gracefully', () => {
      const routeWithNullProperties = {
        path: '/test' as RoutePath,
        title: null,
        module: 'personnel' as ModuleType,
        breadcrumbs: null,
      } as any;

      const errors = validateRouteConfig(routeWithNullProperties);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle module consistency with empty routes', () => {
      const errors = validateModuleConsistency([]);
      expect(errors).toHaveLength(0);
    });
  });
});