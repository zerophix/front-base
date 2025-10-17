/**
 * Route Guards test suite
 * 测试路由类型保护工具的各种功能
 */

import {
  validateRoutePath,
  validateModule,
  validateBreadcrumbs,
  validateRecordNumber,
  validateRouteConfig,
  isValidRouteConfig,
  isParentRoute,
  isChildRoute,
  safeGetRoute,
  safeGetModuleRoutes,
  safeGetChildRoutes,
  assertValidRoute,
  validateRoutes,
  type RouteValidationResult,
} from '../routeGuards';
import type { RouteConfig, ModuleType, BreadcrumbItem, RoutePath, RecordNumber } from '@/types/routes';

// Mock errorHandler
jest.mock('../errorHandler', () => ({
  createError: {
    validation: jest.fn((message, field, value) => new Error(message)),
    network: jest.fn((message, url, method) => new Error(message)),
    business: jest.fn((message, code, context) => new Error(message)),
    auth: jest.fn((message) => new Error(message)),
    forbidden: jest.fn((message) => new Error(message)),
    notFound: jest.fn((message) => new Error(message)),
    server: jest.fn((message) => new Error(message)),
  },
  globalErrorHandler: {
    handle: jest.fn(),
  },
}));

describe('Route Guards', () => {
  describe('validateRoutePath', () => {
    it('should validate correct paths', () => {
      const result = validateRoutePath('/users/profile');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty paths', () => {
      const result = validateRoutePath('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('路径不能为空');
    });

    it('should reject paths not starting with /', () => {
      const result = validateRoutePath('users/profile');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('路径必须以 "/" 开头');
    });

    it('should warn about root path usage', () => {
      const result = validateRoutePath('/');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('根路径应该避免直接使用');
    });

    it('should warn about trailing slashes', () => {
      const result = validateRoutePath('/users/');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('路径不应以 "/" 结尾');
    });

    it('should reject paths with invalid characters', () => {
      const result = validateRoutePath('/users/profile@#$');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('路径只能包含字母、数字、连字符和下划线');
    });

    it('should warn about long paths', () => {
      const longPath = '/' + 'a'.repeat(100);
      const result = validateRoutePath(longPath);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('路径过长，建议控制在100字符以内');
    });

    it('should accept paths with valid characters', () => {
      const result = validateRoutePath('/users-profile_123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateModule', () => {
    it('should validate correct module names', () => {
      const result = validateModule('user');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty module names', () => {
      const result = validateModule('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('模块名不能为空');
    });

    it('should reject module names with invalid characters', () => {
      const result = validateModule('user@module');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('模块名只能包含字母、数字和下划线');
    });

    it('should warn about long module names', () => {
      const longModule = 'a'.repeat(51);
      const result = validateModule(longModule);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('模块名过长，建议控制在50字符以内');
    });

    it('should accept module names with underscores and numbers', () => {
      const result = validateModule('user_module_123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateBreadcrumbs', () => {
    it('should validate correct breadcrumbs', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Home', href: '/' as RoutePath },
        { label: 'Users', href: '/users' as RoutePath },
      ];
      const result = validateBreadcrumbs(breadcrumbs);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty breadcrumbs array', () => {
      const result = validateBreadcrumbs([]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('面包屑不能为空');
    });

    it('should reject breadcrumbs with empty titles', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { label: '', href: '/' as RoutePath },
      ];
      const result = validateBreadcrumbs(breadcrumbs);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('面包屑项目 0: 标题不能为空');
    });

    it('should reject breadcrumbs with invalid paths', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Home', href: 'invalid-path' as any },
      ];
      const result = validateBreadcrumbs(breadcrumbs);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('面包屑项目 0: 路径必须以 "/" 开头');
    });

    it('should warn about too many breadcrumb levels', () => {
      const breadcrumbs: BreadcrumbItem[] = Array.from({ length: 6 }, (_, i) => ({
        label: `Level ${i}`,
        href: `/level${i}` as RoutePath,
      }));
      const result = validateBreadcrumbs(breadcrumbs);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('面包屑层级过深，建议控制在5级以内');
    });

    it('should handle readonly breadcrumbs array', () => {
      const breadcrumbs: readonly BreadcrumbItem[] = [
        { label: 'Home', href: '/' as RoutePath },
      ];
      const result = validateBreadcrumbs(breadcrumbs);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateRecordNumber', () => {
    it('should validate correct record numbers', () => {
      const result = validateRecordNumber('SZD-ABC-DEF-1-2-1234');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept undefined record numbers', () => {
      const result = validateRecordNumber(undefined);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-numeric record numbers', () => {
      const result = validateRecordNumber('abc123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('记录编号格式不正确: abc123，应符合格式: SZD-XXX-XXX-X-X-XXXX');
    });

    it('should reject empty record numbers', () => {
      const result = validateRecordNumber('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('记录编号不能为空字符串');
    });

    it('should accept valid record number format', () => {
      const result = validateRecordNumber('SZD-ABC-DEF-1-2-1234');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateRouteConfig', () => {
    const validRoute: RouteConfig = {
      path: '/users' as RoutePath,
      title: 'Users',
      module: 'personnel' as ModuleType,
      breadcrumbs: [{ label: 'Users', href: '/users' as RoutePath }],
    };

    it('should validate correct route config', () => {
      const result = validateRouteConfig(validRoute);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate route with record number', () => {
      const routeWithRecord: RouteConfig = {
        ...validRoute,
        parent: '/parent' as RoutePath,
        recordNumber: 'SZD-ABC-DEF-1-2-1234' as RecordNumber,
      };
      const result = validateRouteConfig(routeWithRecord);
      expect(result.isValid).toBe(true);
    });

    it('should accumulate errors from all validations', () => {
      const invalidRoute: any = {
        path: 'invalid-path',
        title: 'Invalid',
        module: 'invalid-module',
        breadcrumbs: [],
        recordNumber: 'abc',
      };
      const result = validateRouteConfig(invalidRoute);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should accumulate warnings from all validations', () => {
      const routeWithWarnings: any = {
        path: '/' + 'a'.repeat(100),
        title: 'Long Path',
        module: 'a'.repeat(51),
        breadcrumbs: Array.from({ length: 6 }, (_, i) => ({
          label: `Level ${i}`,
          href: `/level${i}` as RoutePath,
        })),
      };
      const result = validateRouteConfig(routeWithWarnings);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Type Guards', () => {
    describe('isValidRouteConfig', () => {
      it('should return true for valid route config', () => {
        const validRoute = {
          path: '/users' as RoutePath,
          title: 'Users',
          module: 'personnel' as ModuleType,
          breadcrumbs: [{ label: 'Users', href: '/users' as RoutePath }],
        };
        expect(isValidRouteConfig(validRoute)).toBe(true);
      });

      it('should return false for invalid route config', () => {
        const invalidRoute = {
          path: 123,
          module: 'personnel',
        };
        expect(isValidRouteConfig(invalidRoute)).toBe(false);
      });

      it('should return false for null or undefined', () => {
        expect(isValidRouteConfig(null)).toBe(false);
        expect(isValidRouteConfig(undefined)).toBe(false);
      });
    });

    describe('isParentRoute', () => {
      it('should identify parent routes', () => {
        const parentRoute: RouteConfig = {
          path: '/users' as RoutePath,
          title: 'Users',
          module: 'personnel' as ModuleType,
          breadcrumbs: [{ label: 'Users', href: '/users' as RoutePath }],
        };
        expect(isParentRoute(parentRoute)).toBe(true);
      });

      it('should identify non-parent routes', () => {
        const childRoute: RouteConfig = {
          path: '/users/profile' as RoutePath,
          title: 'Profile',
          module: 'personnel' as ModuleType,
          parent: '/users' as RoutePath,
          breadcrumbs: [{ label: 'Profile', href: '/users/profile' as RoutePath }],
        };
        expect(isParentRoute(childRoute)).toBe(false);
      });
    });

    describe('isChildRoute', () => {
      it('should identify child routes', () => {
        const childRoute: RouteConfig = {
          path: '/users/profile' as RoutePath,
          title: 'Profile',
          module: 'personnel' as ModuleType,
          parent: '/users' as RoutePath,
          breadcrumbs: [{ label: 'Profile', href: '/users/profile' as RoutePath }],
        };
        expect(isChildRoute(childRoute)).toBe(true);
      });

      it('should identify non-parent routes', () => {
        const parentRoute: RouteConfig = {
          path: '/users' as RoutePath,
          title: 'Users',
          module: 'personnel' as ModuleType,
          breadcrumbs: [{ label: 'Users', href: '/users' as RoutePath }],
        };
        expect(isChildRoute(parentRoute)).toBe(false);
      });
    });
  });

  describe('Safe Route Operations', () => {
    const routes: RouteConfig[] = [
      {
        path: '/users' as RoutePath,
        title: 'Users',
        module: 'personnel' as ModuleType,
        breadcrumbs: [{ label: 'Users', href: '/users' as RoutePath }],
      },
      {
        path: '/users/profile' as RoutePath,
        title: 'Profile',
        module: 'personnel' as ModuleType,
        parent: '/users' as RoutePath,
        breadcrumbs: [{ label: 'Profile', href: '/users/profile' as RoutePath }],
      },
      {
        path: '/admin' as RoutePath,
        title: 'Admin',
        module: 'data' as ModuleType,
        breadcrumbs: [{ label: 'Admin', href: '/admin' as RoutePath }],
      },
    ];

    describe('safeGetRoute', () => {
      it('should find existing route', () => {
        const route = safeGetRoute(routes, '/users');
        expect(route).not.toBeNull();
        expect(route?.path).toBe('/users');
      });

      it('should return null for non-existing route', () => {
        const route = safeGetRoute(routes, '/nonexistent');
        expect(route).toBeNull();
      });

      it('should handle empty routes array', () => {
        const route = safeGetRoute([], '/users');
        expect(route).toBeNull();
      });

      it('should handle invalid routes array gracefully', () => {
        const invalidRoutes = [null, undefined, { invalid: 'route' }] as any;
        const route = safeGetRoute(invalidRoutes, '/users');
        expect(route).toBeNull();
      });
    });

    describe('safeGetModuleRoutes', () => {
      it('should find routes by module', () => {
        const userRoutes = safeGetModuleRoutes(routes, 'personnel' as ModuleType);
        expect(userRoutes).toHaveLength(2);
        expect(userRoutes.every(route => route.module === 'personnel')).toBe(true);
      });

      it('should return empty array for non-existing module', () => {
        const nonExistentRoutes = safeGetModuleRoutes(routes, 'nonexistent' as ModuleType);
        expect(nonExistentRoutes).toHaveLength(0);
      });

      it('should handle empty routes array', () => {
        const moduleRoutes = safeGetModuleRoutes([], 'user' as ModuleType);
        expect(moduleRoutes).toHaveLength(0);
      });

      it('should handle invalid routes array gracefully', () => {
        const invalidRoutes = [null, undefined, { invalid: 'route' }] as any;
        const moduleRoutes = safeGetModuleRoutes(invalidRoutes, 'user' as ModuleType);
        expect(moduleRoutes).toHaveLength(0);
      });
    });

    describe('safeGetChildRoutes', () => {
      it('should find child routes', () => {
        const childRoutes = safeGetChildRoutes(routes, '/users');
        expect(childRoutes).toHaveLength(1);
        expect(childRoutes[0].path).toBe('/users/profile');
      });

      it('should return empty array for routes without children', () => {
        const childRoutes = safeGetChildRoutes(routes, '/admin');
        expect(childRoutes).toHaveLength(0);
      });

      it('should handle empty routes array', () => {
        const childRoutes = safeGetChildRoutes([], '/users');
        expect(childRoutes).toHaveLength(0);
      });

      it('should handle invalid routes array gracefully', () => {
        const invalidRoutes = [null, undefined, { invalid: 'route' }] as any;
        const childRoutes = safeGetChildRoutes(invalidRoutes, '/users');
        expect(childRoutes).toHaveLength(0);
      });
    });
  });

  describe('assertValidRoute', () => {
    it('should not throw for valid route', () => {
      const validRoute: RouteConfig = {
        path: '/personnel',
        title: 'Personnel Management',
        module: 'personnel' as ModuleType,
        breadcrumbs: [{ label: 'Personnel', href: '/personnel' }],
      };
      expect(() => assertValidRoute(validRoute)).not.toThrow();
    });

    it('should throw for invalid route', () => {
      const invalidRoute = { invalid: 'route' };
      expect(() => assertValidRoute(invalidRoute)).toThrow();
    });

    it('should include context in error message', () => {
      const invalidRoute = { invalid: 'route' };
      expect(() => assertValidRoute(invalidRoute, 'test context')).toThrow();
    });
  });

  describe('validateRoutes', () => {
    it('should separate valid and invalid routes', () => {
      const mixedRoutes: any[] = [
        {
          path: '/users' as RoutePath,
          title: 'Users',
          module: 'personnel' as ModuleType,
          breadcrumbs: [{ label: 'Users', href: '/users' as RoutePath }],
        },
        {
          path: 'invalid-path',
          title: 'Invalid',
          module: 'invalid-module',
          breadcrumbs: [],
        },
        {
          path: '/admin' as RoutePath,
          title: 'Admin',
          module: 'data' as ModuleType,
          breadcrumbs: [{ label: 'Admin', href: '/admin' as RoutePath }],
        },
      ];

      const result = validateRoutes(mixedRoutes);
      expect(result.validRoutes).toHaveLength(2);
      expect(result.invalidRoutes).toHaveLength(1);
      expect(result.invalidRoutes[0].errors.length).toBeGreaterThan(0);
    });

    it('should handle empty routes array', () => {
      const result = validateRoutes([]);
      expect(result.validRoutes).toHaveLength(0);
      expect(result.invalidRoutes).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should collect warnings from all routes', () => {
      const routesWithWarnings: any[] = [
        {
          path: '/' + 'a'.repeat(100),
          title: 'Users',
          module: 'personnel' as ModuleType,
          breadcrumbs: [{ label: 'Users', href: '/users' as RoutePath }],
        },
      ];

      const result = validateRoutes(routesWithWarnings);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(() => validateRoutePath(null as any)).not.toThrow();
      expect(() => validateModule(undefined as any)).not.toThrow();
      expect(() => validateBreadcrumbs(null as any)).not.toThrow();
    });

    it('should handle special characters in paths', () => {
      const result = validateRoutePath('/users-profile_123');
      expect(result.isValid).toBe(true);
    });

    it('should handle very long inputs', () => {
      const longPath = '/' + 'a'.repeat(1000);
      const result = validateRoutePath(longPath);
      expect(result).toBeDefined();
    });

    it('should handle empty objects and arrays', () => {
      expect(() => safeGetRoute([], '')).not.toThrow();
      expect(() => safeGetModuleRoutes([], '' as ModuleType)).not.toThrow();
      expect(() => safeGetChildRoutes([], '')).not.toThrow();
    });
  });
});