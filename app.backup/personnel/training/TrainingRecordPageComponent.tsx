/**
 * 培训记录页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function TrainingRecordPage() {
  const fields: FieldConfig[] = [
    { name: 'personnelId', label: '参训人员', type: 'select', required: true, span: 12 },
    { name: 'trainingName', label: '培训名称', type: 'text', required: true, span: 12 },
    { name: 'trainingType', label: '培训类型', type: 'text', required: true, span: 8 },
    { name: 'trainingDate', label: '培训日期', type: 'date', required: true, span: 8 },
    { name: 'duration', label: '学时', type: 'number', required: true, span: 8 },
    { name: 'instructor', label: '讲师', type: 'text', required: true, span: 12 },
    { name: 'score', label: '考核成绩', type: 'number', span: 6 },
    { name: 'passed', label: '是否通过', type: 'select', required: true, span: 6,
      options: [
        { label: '通过', value: true },
        { label: '未通过', value: false },
      ]
    },
    { name: 'certificateNo', label: '证书编号', type: 'text', span: 12 },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 3 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        console.log('提交:', values);
        // await personnelApi.training.create(values);
        return true;
      }}
      onSave={async (values) => {
        console.log('暂存:', values);
        return true;
      }}
    />
  );
}
