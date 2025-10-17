/**
 * 设备功能检查记录页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function EquipmentFunctionRecordPage() {
  const fields: FieldConfig[] = [
    { name: 'planId', label: '检查计划', type: 'select', required: true, span: 12 },
    { name: 'equipmentId', label: '设备名称', type: 'select', required: true, span: 12 },
    { name: 'checkDate', label: '检查日期', type: 'date', required: true, span: 12 },
    { name: 'checker', label: '检查人', type: 'text', required: true, span: 12 },
    { name: 'checkItems', label: '检查项目', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'checkResult', label: '检查结果', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'conclusion', label: '结论', type: 'select', required: true, span: 12, options: [{ label: '合格', value: 'pass' }, { label: '不合格', value: 'fail' }] },
    { name: 'nextCheckDate', label: '下次检查日期', type: 'date', span: 12 },
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