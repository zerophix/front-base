/**
 * 设备维护记录页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function EquipmentMaintenanceRecordPage() {
  const fields: FieldConfig[] = [
    { name: 'equipmentId', label: '设备名称', type: 'select', required: true, span: 12 },
    { name: 'equipmentName', label: '设备名称（文本）', type: 'text', required: true, span: 12 },
    { name: 'maintenanceType', label: '维护类型', type: 'select', required: true, span: 12,
      options: [
        { label: '日常维护', value: 'daily' },
        { label: '定期维护', value: 'periodic' },
        { label: '预防性维护', value: 'preventive' },
        { label: '维修', value: 'repair' },
      ]
    },
    { name: 'maintenanceDate', label: '维护日期', type: 'date', required: true, span: 12 },
    { name: 'maintainer', label: '维护人', type: 'text', required: true, span: 12 },
    { name: 'maintenanceContent', label: '维护内容', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'cost', label: '费用', type: 'number', span: 12 },
    { name: 'result', label: '结果', type: 'select', required: true, span: 12,
      options: [
        { label: '正常', value: 'normal' },
        { label: '异常', value: 'abnormal' },
        { label: '需要维修', value: 'needRepair' },
      ]
    },
    { name: 'nextMaintenanceDate', label: '下次维护日期', type: 'date', span: 12 },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        console.log('提交:', values);
        return true;
      }}
      onSave={async (values) => {
        console.log('暂存:', values);
        return true;
      }}
    />
  );
}