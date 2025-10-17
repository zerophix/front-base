/**
 * 设备验收记录页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function EquipmentAcceptancePage() {
  const fields: FieldConfig[] = [
    { name: 'equipmentName', label: '设备名称', type: 'text', required: true, span: 12 },
    { name: 'model', label: '型号规格', type: 'text', required: true, span: 12 },
    { name: 'manufacturer', label: '生产厂家', type: 'text', required: true, span: 12 },
    { name: 'serialNo', label: '出厂编号', type: 'text', required: true, span: 12 },
    { name: 'supplier', label: '供应商', type: 'text', required: true, span: 12 },
    { name: 'purchaseDate', label: '购置日期', type: 'date', required: true, span: 12 },
    { name: 'acceptanceDate', label: '验收日期', type: 'date', required: true, span: 12 },
    { name: 'acceptanceResult', label: '验收结果', type: 'select', required: true, span: 12,
      options: [
        { label: '合格', value: 'passed' },
        { label: '不合格', value: 'failed' },
        { label: '条件通过', value: 'conditional' },
      ]
    },
    { name: 'problem', label: '发现的问题', type: 'textarea', span: 24, rows: 3 },
    { name: 'solution', label: '解决方案', type: 'textarea', span: 24, rows: 3 },
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