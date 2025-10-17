/**
 * 标准物质接收页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function StdReceivePage() {

  const fields: FieldConfig[] = [
    { name: 'substanceName', label: '标准物质名称', type: 'text', required: true, span: 12 },
    { name: 'specification', label: '规格', type: 'text', required: true, span: 12 },
    { name: 'manufacturer', label: '生产厂家', type: 'text', required: true, span: 12 },
    { name: 'batchNo', label: '批号', type: 'text', required: true, span: 12 },
    { name: 'receiveDate', label: '接收日期', type: 'date', required: true, span: 12 },
    { name: 'receiver', label: '接收人', type: 'text', required: true, span: 12 },
    { name: 'quantity', label: '数量', type: 'number', required: true, span: 8 },
    { name: 'unit', label: '单位', type: 'text', required: true, span: 8 },
    { name: 'supplier', label: '供应商', type: 'text', required: true, span: 8 },
    { name: 'certificateNo', label: '证书编号', type: 'text', required: true, span: 12 },
    { name: 'expiryDate', label: '有效期至', type: 'date', required: true, span: 12 },
    { name: 'checkResult', label: '验收结果', type: 'select', required: true, span: 12,
      options: [
        { label: '合格', value: 'pass' },
        { label: '不合格', value: 'fail' },
      ]
    },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 3 },
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
