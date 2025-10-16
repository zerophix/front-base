/**
 * 人员变动记录页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function PersonnelChangePage() {
  const fields: FieldConfig[] = [
    { name: 'personnelId', label: '人员姓名', type: 'select', required: true, span: 8 },
    { name: 'changeType', label: '变动类型', type: 'select', required: true, span: 8,
      options: [
        { label: '调动', value: 'transfer' },
        { label: '晋升', value: 'promotion' },
        { label: '降职', value: 'demotion' },
        { label: '离职', value: 'resignation' },
        { label: '入职', value: 'entry' },
      ]
    },
    { name: 'changeDate', label: '变动日期', type: 'date', required: true, span: 8 },
    { name: 'fromDepartment', label: '原部门', type: 'text', span: 12 },
    { name: 'toDepartment', label: '新部门', type: 'text', span: 12 },
    { name: 'fromPosition', label: '原职位', type: 'text', span: 12 },
    { name: 'toPosition', label: '新职位', type: 'text', span: 12 },
    { name: 'reason', label: '变动原因', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'approver', label: '审批人', type: 'text', span: 12 },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        console.log('提交:', values);
        // await personnelApi.change.create(values);
        return true;
      }}
      onSave={async (values) => {
        console.log('暂存:', values);
        return true;
      }}
    />
  );
}
