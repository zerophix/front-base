import { routes } from '@/config/routes';

describe('breadcrumbs and parent consistency', () => {
  const moduleLabel: Record<string, string> = {
    equipment: '设备管理',
    quality: '质量管理',
    personnel: '人员管理',
    project: '项目管理',
    data: '基础管理',
    home: '首页',
    records: '记录管理',
  };

  test('first breadcrumb matches module label and href equals parent when present', () => {
    for (const r of routes) {
      const root = r.breadcrumbs[0];
      expect(root).toBeDefined();
      expect(root.label).toBe(moduleLabel[r.module]);
      if (r.parent) {
        expect(root.href).toBe(r.parent);
      }
    }
  });
});