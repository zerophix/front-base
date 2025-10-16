import type { RouteConfig } from '@/config/routes';
import { createModuleRoute } from '../utils';

export const homeRoutes: RouteConfig[] = [
  createModuleRoute('home', 'AppstoreOutlined'),
];