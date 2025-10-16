import { routes } from '@/config/routes';
import { IconMap, getIcon } from '@/config/icons';

describe('route icons consistency', () => {
  test('all route icons exist in IconMap', () => {
    const iconKeys = new Set(Object.keys(IconMap));
    for (const r of routes) {
      if (!r.icon) continue;
      expect(iconKeys.has(r.icon)).toBe(true);
    }
  });

  test('getIcon returns a component for every configured icon', () => {
    for (const r of routes) {
      if (!r.icon) continue;
      const node = getIcon(r.icon);
      expect(node).toBeDefined();
    }
  });
});