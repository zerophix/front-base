/**
 * 新增设备页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function EquipmentNewPage() {
  const fields: FieldConfig[] = [
    { name: 'equipmentCode', label: '设备编号', type: 'text', required: true, span: 12 },
    { name: 'equipmentName', label: '设备名称', type: 'text', required: true, span: 12 },
    { name: 'model', label: '型号规格', type: 'text', required: true, span: 8 },
    { name: 'manufacturer', label: '生产厂家', type: 'text', required: true, span: 8 },
    { name: 'serialNo', label: '出厂编号', type: 'text', required: true, span: 8 },
    { name: 'purchaseDate', label: '购置日期', type: 'date', required: true, span: 12 },
    { name: 'purchasePrice', label: '购置价格', type: 'number', required: true, span: 12 },
    { name: 'department', label: '使用部门', type: 'text', required: true, span: 12 },
    { name: 'location', label: '存放位置', type: 'text', required: true, span: 12 },
    { name: 'category', label: '设备类别', type: 'text', required: true, span: 8 },
    { name: 'responsiblePerson', label: '责任人', type: 'text', required: true, span: 8 },
    { name: 'status', label: '设备状态', type: 'select', required: true, span: 8,
      options: [
        { label: '正常', value: 'normal' },
        { label: '使用中', value: 'inUse' },
        { label: '维护中', value: 'maintenance' },
        { label: '校准中', value: 'calibration' },
      ]
    },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 3 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        console.log('提交:', values);
        // await equipmentApi.create(values);
        return true;
      }}
      onSave={async (values) => {
        console.log('暂存:', values);
        return true;
      }}
    />
  );
}
