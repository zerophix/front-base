/**
 * 标准物质登记页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function StdRegisterPage() {
  const fields: FieldConfig[] = [
    { name: 'substanceCode', label: '标准物质编号', type: 'text', required: true, span: 12 },
    { name: 'substanceName', label: '标准物质名称', type: 'text', required: true, span: 12 },
    { name: 'specification', label: '规格', type: 'text', required: true, span: 8 },
    { name: 'manufacturer', label: '生产厂家', type: 'text', required: true, span: 8 },
    { name: 'batchNo', label: '批号', type: 'text', required: true, span: 8 },
    { name: 'certificateNo', label: '证书编号', type: 'text', required: true, span: 12 },
    { name: 'purchaseDate', label: '购买日期', type: 'date', required: true, span: 6 },
    { name: 'expiryDate', label: '有效期至', type: 'date', required: true, span: 6 },
    { name: 'quantity', label: '数量', type: 'number', required: true, span: 6 },
    { name: 'unit', label: '单位', type: 'text', required: true, span: 6 },
    { name: 'storageCondition', label: '储存条件', type: 'text', required: true, span: 12 },
    { name: 'storageLocation', label: '储存位置', type: 'text', required: true, span: 12 },
    { name: 'responsiblePerson', label: '责任人', type: 'text', required: true, span: 12 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12,
      options: [
        { label: '正常', value: 'normal' },
        { label: '即将过期', value: 'expiring' },
        { label: '已过期', value: 'expired' },
        { label: '已用完', value: 'exhausted' },
      ]
    },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 3 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        console.log('提交:', values);
        // await qualityApi.standardSubstance.create(values);
        return true;
      }}
      onSave={async (values) => {
        console.log('暂存:', values);
        return true;
      }}
    />
  );
}
