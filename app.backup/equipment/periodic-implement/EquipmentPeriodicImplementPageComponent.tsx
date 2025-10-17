/**
 * 设备期间核查实施页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function EquipmentPeriodicImplementPage() {
  const fields: FieldConfig[] = [
    { name: 'planId', label: '核查计划', type: 'select', required: true, span: 12 },
    { name: 'equipmentId', label: '设备名称', type: 'select', required: true, span: 12 },
    { name: 'implementDate', label: '实施日期', type: 'date', required: true, span: 12 },
    { name: 'implementer', label: '实施人', type: 'text', required: true, span: 12 },
    { name: 'implementContent', label: '实施内容', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'result', label: '实施结果', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12, options: [{ label: '进行中', value: 'ongoing' }, { label: '已完成', value: 'completed' }] },
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