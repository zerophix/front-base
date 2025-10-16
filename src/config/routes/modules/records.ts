import type { RouteConfig } from '@/config/routes';
import { createModuleRoute, createChildRoutes } from '../utils';

const moduleRoute = createModuleRoute('records', 'FileTextOutlined');

const childRoutes = createChildRoutes('records', [
  {
    path: 'risk-control-form',
    title: '风险控制记录表',
    recordNumber: 'SZD-RISK-01-2024',
    icon: 'FileTextOutlined',
  },
]);

export const recordsRoutes: RouteConfig[] = [moduleRoute, ...childRoutes];