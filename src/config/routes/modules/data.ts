import type { RouteConfig } from '@/config/routes';
import { createModuleRoute, createChildRoutes } from '@/config/routes/utils';

const moduleRoute = createModuleRoute('data', 'DatabaseOutlined');

const childRoutes = createChildRoutes('data', [
  {
    path: 'detection-objects',
    title: '检测对象管理',
    recordNumber: 'SZD-DATA-01-2021',
    icon: 'AppstoreOutlined',
  },
  {
    path: 'detection-params',
    title: '检测参数管理',
    recordNumber: 'SZD-DATA-02-2021',
    icon: 'SlidersOutlined',
  },
  {
    path: 'parameter-code',
    title: '参数编码管理',
    recordNumber: 'SZD-DATA-03-2021',
    icon: 'FieldNumberOutlined',
  },
  {
    path: 'statistics-analysis',
    title: '数据统计分析',
    recordNumber: 'SZD-DATA-STAT-01-2021',
    icon: 'BarChartOutlined',
  },
]);

export const dataRoutes: RouteConfig[] = [moduleRoute, ...childRoutes];