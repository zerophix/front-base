/**
 * 设备维护计划页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function EquipmentMaintenancePlanPage() {
  const fields: FieldConfig[] = [
    { name: 'planName', label: '计划名称', type: 'text', required: true, span: 12 },
    { name: 'maintenanceType', label: '维护类型', type: 'select', required: true, span: 12,
      options: [
        { label: '日常维护', value: 'daily' },
        { label: '定期维护', value: 'periodic' },
        { label: '预防性维护', value: 'preventive' },
        { label: '维修', value: 'repair' },
      ]
    },
    { name: 'plannedDate', label: '计划日期', type: 'date', required: true, span: 12 },
    { name: 'cycle', label: '维护周期', type: 'text', required: true, span: 12 },
    { name: 'responsiblePerson', label: '责任人', type: 'text', required: true, span: 12 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12,
      options: [
        { label: '待执行', value: 'pending' },
        { label: '执行中', value: 'ongoing' },
        { label: '已完成', value: 'completed' },
        { label: '已逾期', value: 'overdue' },
      ]
    },
    { name: 'maintenanceItems', label: '维护项目', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'actualDate', label: '实际日期', type: 'date', span: 12 },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => { console.log('提交:', values); return true; }}
      onSave={async (values) => { console.log('暂存:', values); return true; }}
    />
  );
}