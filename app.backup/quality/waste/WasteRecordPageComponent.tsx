/**
 * 废弃物处理记录页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function WasteRecordPage() {
  const fields: FieldConfig[] = [
    { name: 'wasteType', label: '废弃物类型', type: 'text', required: true, span: 12 },
    { name: 'wasteSource', label: '来源', type: 'text', required: true, span: 12 },
    { name: 'quantity', label: '数量', type: 'number', required: true, span: 8 },
    { name: 'unit', label: '单位', type: 'text', required: true, span: 8 },
    { name: 'hazardLevel', label: '危险等级', type: 'select', span: 8,
      options: [
        { label: '低', value: 'low' },
        { label: '中', value: 'medium' },
        { label: '高', value: 'high' },
      ]
    },
    { name: 'generateDate', label: '产生日期', type: 'date', required: true, span: 12 },
    { name: 'disposalDate', label: '处理日期', type: 'date', span: 12 },
    { name: 'disposalMethod', label: '处理方式', type: 'text', required: true, span: 24 },
    { name: 'operator', label: '操作人', type: 'text', required: true, span: 12 },
    { name: 'supervisor', label: '监督人', type: 'text', span: 12 },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 3 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        console.log('提交:', values);
        // await qualityApi.waste.create(values);
        return true;
      }}
      onSave={async (values) => {
        console.log('暂存:', values);
        return true;
      }}
    />
  );
}
