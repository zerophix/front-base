import type { RouteConfig } from '@/config/routes';

export const contractRoutes: RouteConfig[] = [
  {
    path: '/quality/contract-change-application',
    title: '合同变更申请',
    module: 'quality',
    breadcrumbs: [
      { label: '质量管理', href: '/quality' },
      { label: '合同变更申请' },
    ],
    recordNumber: 'SZD-ST-JL-13-03-2022',
    parent: '/quality',
    icon: 'FileTextOutlined',
  },
];