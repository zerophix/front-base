/**
 * 设备报废申请页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function EquipmentScrapApplyPage() {
  const fields: FieldConfig[] = [
    { name: 'equipmentId', label: '设备名称', type: 'select', required: true, span: 12 },
    { name: 'equipmentName', label: '设备名称（文本）', type: 'text', required: true, span: 12 },
    { name: 'applicant', label: '申请人', type: 'text', required: true, span: 12 },
    { name: 'applyDate', label: '申请日期', type: 'date', required: true, span: 12 },
    { name: 'reason', label: '报废原因', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'purchaseDate', label: '购置日期', type: 'date', required: true, span: 12 },
    { name: 'originalValue', label: '原值', type: 'number', required: true, span: 12 },
    { name: 'currentValue', label: '现值', type: 'number', required: true, span: 12 },
    { name: 'status', label: '状态', type: 'select', span: 12,
      options: [
        { label: '待审批', value: 'pending' },
        { label: '已批准', value: 'approved' },
        { label: '已拒绝', value: 'rejected' },
        { label: '已完成', value: 'completed' },
      ]
    },
    { name: 'disposalMethod', label: '处置方式', type: 'text', span: 24 },
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