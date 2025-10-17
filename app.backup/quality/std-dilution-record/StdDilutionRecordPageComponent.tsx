/**
 * 标准物质稀释记录页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function StdDilutionRecordPage() {
  const fields: FieldConfig[] = [
    { name: 'substanceId', label: '标准物质', type: 'select', required: true, span: 12 },
    { name: 'substanceName', label: '标准物质名称', type: 'text', required: true, span: 12 },
    { name: 'originalConcentration', label: '原始浓度', type: 'text', required: true, span: 8 },
    { name: 'targetConcentration', label: '目标浓度', type: 'text', required: true, span: 8 },
    { name: 'dilutionRatio', label: '稀释比例', type: 'text', required: true, span: 8 },
    { name: 'dilutionDate', label: '稀释日期', type: 'date', required: true, span: 12 },
    { name: 'operator', label: '操作人', type: 'text', required: true, span: 12 },
    { name: 'solvent', label: '溶剂', type: 'text', required: true, span: 12 },
    { name: 'preparedVolume', label: '配制体积', type: 'number', required: true, span: 12 },
    { name: 'storageCondition', label: '储存条件', type: 'text', required: true, span: 12 },
    { name: 'expiryDate', label: '有效期至', type: 'date', required: true, span: 12 },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 3 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        console.log('提交:', values);
        // await qualityApi.standardSubstance.dilutionRecord.create(values);
        return true;
      }}
      onSave={async (values) => {
        console.log('暂存:', values);
        return true;
      }}
    />
  );
}
