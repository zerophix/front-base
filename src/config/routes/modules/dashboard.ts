import type { RouteConfig } from '@/config/routes';
import { createChildRoutes } from '../utils';

export const dashboardRoutes: RouteConfig[] = createChildRoutes('project', [
  {
    path: 'management-overview',
    title: '管理概览',
    icon: 'BarChartOutlined',
  },
]);