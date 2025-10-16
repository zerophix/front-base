import type { RouteConfig } from '@/config/routes';
import { createModuleRoute, createChildRoutes } from '../utils';

const moduleRoute = createModuleRoute('project', 'ProjectOutlined');

const childRoutes = createChildRoutes('project', [
  {
    path: 'new',
    title: '新建项目',
    icon: 'PlusSquareOutlined',
  },
  {
    path: 'station',
    title: '站点管理',
    recordNumber: 'SZD-PROJ-02-2021',
    icon: 'ClusterOutlined',
  },
  {
    path: 'task',
    title: '任务管理',
    recordNumber: 'SZD-PROJ-03-2021',
    icon: 'ScheduleOutlined',
  },
  {
    path: 'task-management',
    title: '项目任务管理',
    recordNumber: 'SZD-PROJ-TASK-01-2021',
    icon: 'ScheduleOutlined',
  },
  {
    path: 'contract-registration',
    title: '项目合同登记表',
    recordNumber: 'SZD-PROJ-CONTRACT-01-2021',
    icon: 'FileTextOutlined',
  },
  {
    path: 'subcontract-application',
    title: '分包申请表',
    recordNumber: 'SZD-PROJ-SUBCONTRACT-01-2021',
    icon: 'AuditOutlined',
  },
  {
    path: 'subcontract-technical-requirements',
    title: '分包项目技术要求表',
    recordNumber: 'SZD-PROJ-TECH-REQ-01-2021',
    icon: 'FileTextOutlined',
  },
  {
    path: 'subcontract-settlement',
    title: '分包结算清单',
    recordNumber: 'SZD-PROJ-SETTLEMENT-01-2021',
    icon: 'FileTextOutlined',
  },
  {
    path: 'subcontract-sample-list',
    title: '分包送样清单',
    recordNumber: 'SZDI-SY-JL-14-05-2022',
    icon: 'FileTextOutlined',
  },
]);

export const projectRoutes: RouteConfig[] = [moduleRoute, ...childRoutes];