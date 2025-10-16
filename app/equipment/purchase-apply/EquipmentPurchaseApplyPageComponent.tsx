/**
 * 设备采购申请页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function EquipmentPurchaseApplyPage() {
  const fields: FieldConfig[] = [
    { name: 'equipmentName', label: '设备名称', type: 'text', required: true, span: 12 },
    { name: 'model', label: '型号规格', type: 'text', required: true, span: 12 },
    { name: 'manufacturer', label: '生产厂家', type: 'text', span: 12 },
    { name: 'quantity', label: '数量', type: 'number', required: true, span: 12 },
    { name: 'applicant', label: '申请人', type: 'text', required: true, span: 12 },
    { name: 'applyDate', label: '申请日期', type: 'date', required: true, span: 12 },
    { name: 'department', label: '申请部门', type: 'text', required: true, span: 12 },
    { name: 'estimatedPrice', label: '预计价格', type: 'number', required: true, span: 12 },
    { name: 'purpose', label: '采购目的', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'urgency', label: '紧急程度', type: 'select', required: true, span: 12,
      options: [
        { label: '一般', value: 'normal' },
        { label: '紧急', value: 'urgent' },
        { label: '特急', value: 'critical' },
      ]
    },
    { name: 'expectedDate', label: '期望到货日期', type: 'date', span: 12 },
    { name: 'status', label: '审批状态', type: 'select', span: 12,
      options: [
        { label: '待审批', value: 'pending' },
        { label: '已批准', value: 'approved' },
        { label: '已拒绝', value: 'rejected' },
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