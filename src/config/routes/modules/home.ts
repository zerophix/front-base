import type { RouteConfig } from '@/config/routes';
import { createModuleRoute } from '@/config/routes/utils';

export const homeRoutes: RouteConfig[] = [
  createModuleRoute('home', 'AppstoreOutlined'),
];