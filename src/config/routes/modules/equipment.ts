import type { RouteConfig } from '@/config/routes';
import { createModuleRoute, createChildRoutes } from '@/config/routes/utils';

const moduleRoute = createModuleRoute('equipment', 'ToolOutlined');

const childRoutes = createChildRoutes('equipment', [
  {
    path: 'device',
    title: '仪器设备列表',
    recordNumber: 'SZD-EQ-LIST-01-2021',
    icon: 'HddOutlined',
  },
  {
    path: 'new',
    title: '新增设备登记',
    recordNumber: 'SZD-EQ-R-01-01-2021',
    icon: 'PlusSquareOutlined',
  },
  {
    path: 'calibration',
    title: '仪器设备检校记录表',
    recordNumber: 'SZD-ST-R-04-01-2021',
    icon: 'AuditOutlined',
  },
  {
    path: 'maintenance-record',
    title: '设备维护记录',
    recordNumber: 'SZD-EQ-MAINT-02-2021',
    icon: 'ToolOutlined',
  },
  {
    path: 'use-record',
    title: '设备使用记录',
    recordNumber: 'SZD-EQ-USE-02-2021',
    icon: 'FileTextOutlined',
  },
  {
    path: 'acceptance',
    title: '设备验收记录',
    recordNumber: 'SZD-EQ-ACPT-01-2021',
    icon: 'CheckCircleOutlined',
  },
  {
    path: 'borrow',
    title: '设备借用申请',
    recordNumber: 'SZD-EQ-BORROW-01-2021',
    icon: 'SwapOutlined',
  },
  {
    path: 'return',
    title: '设备归还登记',
    recordNumber: 'SZD-EQ-BORROW-02-2021',
    icon: 'RollbackOutlined',
  },
  {
    path: 'purchase-apply',
    title: '设备采购申请',
    recordNumber: 'SZD-EQ-PURCHASE-01-2021',
    icon: 'ShoppingCartOutlined',
  },
  {
    path: 'scrap-apply',
    title: '设备报废申请',
    recordNumber: 'SZD-EQ-SCRAP-01-2021',
    icon: 'DeleteOutlined',
  },
  {
    path: 'drift-plan',
    title: '设备漂移检查',
    recordNumber: 'SZD-EQ-DRIFT-01-2021',
    icon: 'RiseOutlined',
  },
  {
    path: 'function-plan',
    title: '设备功能确认',
    recordNumber: 'SZD-EQ-FUNC-01-2021',
    icon: 'SettingOutlined',
  },
  {
    path: 'function-record',
    title: '功能确认记录',
    recordNumber: 'SZD-EQ-FUNC-02-2021',
    icon: 'FileDoneOutlined',
  },
  {
    path: 'maintenance-plan',
    title: '设备维护计划',
    recordNumber: 'SZD-EQ-MAINT-01-2021',
    icon: 'CalendarOutlined',
  },
  {
    path: 'periodic-plan',
    title: '设备期间核查',
    recordNumber: 'SZD-EQ-PERIODIC-01-2021',
    icon: 'CalendarOutlined',
  },
  {
    path: 'periodic-implement',
    title: '期间核查实施',
    recordNumber: 'SZD-EQ-PERIODIC-03-2021',
    icon: 'PlayCircleOutlined',
  },
  {
    path: 'periodic-record',
    title: '期间核查记录',
    recordNumber: 'SZD-EQ-PERIODIC-02-2021',
    icon: 'ProfileOutlined',
  },
  {
    path: 'use-apply',
    title: '设备领用申请',
    recordNumber: 'SZD-EQ-USE-01-2021',
    icon: 'FileAddOutlined',
  },
  {
    path: 'calibration-record',
    title: '设备校准记录',
    recordNumber: 'SZD-EQ-CAL-01-2021',
    icon: 'AuditOutlined',
  },
]);

export const equipmentRoutes: RouteConfig[] = [moduleRoute, ...childRoutes];