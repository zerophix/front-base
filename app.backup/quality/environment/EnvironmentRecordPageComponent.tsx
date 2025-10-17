/**
 * 环境条件记录页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function EnvironmentRecordPage() {
  const fields: FieldConfig[] = [
    { name: 'recordDate', label: '记录日期', type: 'date', required: true, span: 12 },
    { name: 'recordTime', label: '记录时间', type: 'text', required: true, span: 12 },
    { name: 'location', label: '监测位置', type: 'text', required: true, span: 12 },
    { name: 'temperature', label: '温度(℃)', type: 'number', required: true, span: 6 },
    { name: 'humidity', label: '湿度(%)', type: 'number', required: true, span: 6 },
    { name: 'pressure', label: '气压(kPa)', type: 'number', span: 12 },
    { name: 'otherConditions', label: '其他环境条件', type: 'textarea', span: 24, rows: 2 },
    { name: 'recorder', label: '记录人', type: 'text', required: true, span: 12 },
    { name: 'meetRequirement', label: '是否符合要求', type: 'select', required: true, span: 12,
      options: [
        { label: '符合', value: true },
        { label: '不符合', value: false },
      ]
    },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        console.log('提交:', values);
        // await qualityApi.environment.create(values);
        return true;
      }}
      onSave={async (values) => {
        console.log('暂存:', values);
        return true;
      }}
    />
  );
}
