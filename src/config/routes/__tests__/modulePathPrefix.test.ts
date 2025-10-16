import { routes } from '@/config/routes';

describe('module path prefix consistency', () => {
  const modulePrefix: Record<string, string> = {
    equipment: '/equipment',
    quality: '/quality',
    personnel: '/personnel',
    project: '/project',
    data: '/data',
    home: '/home',
    records: '/records',
  };

  test('all module routes start with their prefix', () => {
    for (const r of routes) {
      const prefix = modulePrefix[r.module];
      expect(prefix).toBeDefined();
      // allow exact module root path (e.g., '/equipment')
      const ok = r.path === prefix || r.path.startsWith(prefix + '/');
      expect(ok).toBe(true);
    }
  });
});