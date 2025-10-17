/**
 * 设备借用申请页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function EquipmentBorrowPage() {
  const fields: FieldConfig[] = [
    { name: 'equipmentId', label: '设备名称', type: 'select', required: true, span: 12 },
    { name: 'equipmentName', label: '设备名称（文本）', type: 'text', required: true, span: 12 },
    { name: 'borrower', label: '借用人', type: 'text', required: true, span: 12 },
    { name: 'borrowDepartment', label: '借用部门', type: 'text', required: true, span: 12 },
    { name: 'borrowDate', label: '借用日期', type: 'date', required: true, span: 12 },
    { name: 'expectedReturnDate', label: '预计归还日期', type: 'date', required: true, span: 12 },
    { name: 'purpose', label: '借用目的', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'status', label: '状态', type: 'select', span: 12,
      options: [
        { label: '待审批', value: 'pending' },
        { label: '已批准', value: 'approved' },
        { label: '已拒绝', value: 'rejected' },
        { label: '已归还', value: 'returned' },
      ]
    },
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