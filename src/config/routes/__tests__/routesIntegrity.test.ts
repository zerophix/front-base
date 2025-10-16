import { routes } from '@/config/routes';
// 仅验证路由表本身的完整性，避免额外依赖导致测试不稳定

describe('routes integrity', () => {
  test('paths are unique', () => {
    const paths = routes.map((r) => r.path);
    const unique = new Set(paths);
    expect(unique.size).toBe(paths.length);
  });

  test('parent paths exist and modules match', () => {
    const byPath = new Map(routes.map((r) => [r.path, r] as const));
    for (const r of routes) {
      if (!r.parent) continue;
      const parent = byPath.get(r.parent);
      expect(parent).toBeDefined();
      expect(parent && parent.module).toBe(r.module);
    }
  });

  test('breadcrumbs exist and are well-formed', () => {
    for (const r of routes) {
      expect(Array.isArray(r.breadcrumbs)).toBe(true);
      expect(r.breadcrumbs.length).toBeGreaterThan(0);
      for (const b of r.breadcrumbs) {
        expect(typeof b.label).toBe('string');
        if (b.href) {
          expect(typeof b.href).toBe('string');
          expect(b.href.startsWith('/')).toBe(true);
        }
      }
    }
  });
});