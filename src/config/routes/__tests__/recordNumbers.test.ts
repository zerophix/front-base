import { routes } from '@/config/routes';

/**
 * 记录编号治理测试
 * 目标：确保关键业务页面在路由层配置了记录编号（recordNumber），避免页面散落硬编码
 * 说明：只校验精选的关键路径，作为治理红线。其他非记录类页面不强制。
 */

describe('route record numbers governance', () => {
  // 需要强制提供记录编号的关键路由（精选集）
  const requiredPaths = [
    // 质量管理
    '/quality/std-register',
    '/quality/std-periodic-record',
    '/quality/environment',
    '/quality/std-usage-record',
    '/quality/std-receive',
    '/quality/std-periodic-plan',
    '/quality/visitor-register',
    // 设备管理
    '/equipment/maintenance-record',
    '/equipment/function-record',
    '/equipment/periodic-record',
    '/equipment/maintenance-plan',
    '/equipment/periodic-implement',
    '/equipment/use-record',
    '/equipment/acceptance',
    '/equipment/borrow',
    // 人员管理
    '/personnel/training',
    '/personnel/training-record',
    '/personnel/change',
  ];

  const byPath = new Map(routes.map((r) => [r.path, r] as const));

  test('selected critical routes must provide a non-empty recordNumber', () => {
    for (const p of requiredPaths) {
      const route = byPath.get(p);
      expect(route).toBeDefined();
      expect(route && typeof route.recordNumber).toBe('string');
      expect(route && route.recordNumber && route.recordNumber.length).toBeGreaterThan(8);
      // 轻量形状校验：由大写字母/数字/短横线组成，且至少含一个短横线
      const pattern = /^[A-Z0-9-]+$/;
      expect(pattern.test(route!.recordNumber!)).toBe(true);
      expect(route!.recordNumber!.includes('-')).toBe(true);
    }
  });
});