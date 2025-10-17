/**
 * 设备使用申请页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function EquipmentUseApplyPage() {
  const fields: FieldConfig[] = [
    { name: 'equipmentId', label: '设备名称', type: 'select', required: true, span: 12 },
    { name: 'operator', label: '使用人', type: 'text', required: true, span: 12 },
    { name: 'department', label: '使用部门', type: 'text', required: true, span: 12 },
    { name: 'startTime', label: '开始时间', type: 'date', required: true, span: 12 },
    { name: 'purpose', label: '使用目的', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'project', label: '关联项目', type: 'text', span: 12 },
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