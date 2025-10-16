import type { RouteConfig } from '@/config/routes';
import { createModuleRoute, createChildRoutes } from '../utils';

const moduleRoute = createModuleRoute('personnel', 'UserOutlined');

const childRoutes = createChildRoutes('personnel', [
  {
    path: 'list',
    title: '人员一览表',
    recordNumber: 'SZD-ST-R-03-01-2021',
    icon: 'TeamOutlined',
  },
  {
    path: 'registration',
    title: '人员基本情况',
    recordNumber: 'SZD-ST-R-02-02-2021',
    icon: 'IdcardOutlined',
  },
  {
    path: 'change',
    title: '人员档案变动',
    recordNumber: 'SZD-ST-R-02-03-2021',
    icon: 'SwapOutlined',
  },
  {
    path: 'training',
    title: '人员培训记录',
    recordNumber: 'SZD-ST-R-03-04-2021',
    icon: 'ReadOutlined',
  },
  {
    path: 'training-plan',
    title: '人员培训计划',
    recordNumber: 'SZD-ST-R-03-05-2021',
    icon: 'CalendarOutlined',
  },
  {
    path: 'training-record',
    title: '人员培训档案',
    recordNumber: 'SZD-ST-R-03-06-2021',
    icon: 'FileDoneOutlined',
  },
  {
    path: 'qualification',
    title: '人员资质记录',
    icon: 'SafetyCertificateOutlined',
  },
]);

export const personnelRoutes: RouteConfig[] = [moduleRoute, ...childRoutes];