/**
 * 设备期间核查记录页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function EquipmentPeriodicRecordPage() {
  const fields: FieldConfig[] = [
    { name: 'planId', label: '核查计划', type: 'select', required: true, span: 12 },
    { name: 'equipmentId', label: '设备名称', type: 'select', required: true, span: 12 },
    { name: 'checkDate', label: '核查日期', type: 'date', required: true, span: 12 },
    { name: 'checker', label: '核查人', type: 'text', required: true, span: 12 },
    { name: 'checkMethod', label: '核查方法', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'checkResult', label: '核查结果', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'conclusion', label: '结论', type: 'select', required: true, span: 12, options: [{ label: '符合', value: 'pass' }, { label: '不符合', value: 'fail' }] },
    { name: 'nextCheckDate', label: '下次核查日期', type: 'date', span: 12 },
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