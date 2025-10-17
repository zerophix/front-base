/**
 * 设备归还记录页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function EquipmentReturnPage() {
  const fields: FieldConfig[] = [
    { name: 'borrowId', label: '借用记录', type: 'select', required: true, span: 12 },
    { name: 'equipmentName', label: '设备名称', type: 'text', required: true, span: 12 },
    { name: 'actualReturnDate', label: '实际归还日期', type: 'date', required: true, span: 12 },
    { name: 'returnPerson', label: '归还人', type: 'text', required: true, span: 12 },
    { name: 'receiver', label: '接收人', type: 'text', required: true, span: 12 },
    { name: 'equipmentCondition', label: '设备状况', type: 'select', required: true, span: 12,
      options: [
        { label: '正常', value: 'normal' },
        { label: '损坏', value: 'damaged' },
        { label: '故障', value: 'faulty' },
      ]
    },
    { name: 'checkResult', label: '检查结果', type: 'textarea', required: true, span: 24, rows: 3 },
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