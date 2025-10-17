/**
 * 标准物质使用记录页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function StdUsageRecordPage() {
  const fields: FieldConfig[] = [
    { name: 'substanceId', label: '标准物质', type: 'select', required: true, span: 12 },
    { name: 'substanceName', label: '标准物质名称', type: 'text', required: true, span: 12 },
    { name: 'usageDate', label: '使用日期', type: 'date', required: true, span: 12 },
    { name: 'operator', label: '操作人', type: 'text', required: true, span: 12 },
    { name: 'project', label: '使用项目', type: 'text', required: true, span: 12 },
    { name: 'usageAmount', label: '使用量', type: 'number', required: true, span: 6 },
    { name: 'unit', label: '单位', type: 'text', required: true, span: 6 },
    { name: 'remainingAmount', label: '剩余量', type: 'number', required: true, span: 12 },
    { name: 'purpose', label: '使用目的', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        console.log('提交:', values);
        // await qualityApi.standardSubstance.usageRecord.create(values);
        return true;
      }}
      onSave={async (values) => {
        console.log('暂存:', values);
        return true;
      }}
    />
  );
}
