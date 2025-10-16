/**
 * 培训计划页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function TrainingPlanPage() {

  const fields: FieldConfig[] = [
    { name: 'planName', label: '计划名称', type: 'text', required: true, span: 12 },
    { name: 'planYear', label: '计划年度', type: 'number', required: true, span: 12 },
    { name: 'trainingContent', label: '培训内容', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'plannedDate', label: '计划日期', type: 'date', required: true, span: 12 },
    { name: 'estimatedDuration', label: '预计学时', type: 'number', required: true, span: 12 },
    { name: 'instructor', label: '讲师', type: 'text', span: 12 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12,
      options: [
        { label: '计划中', value: 'planned' },
        { label: '进行中', value: 'ongoing' },
        { label: '已完成', value: 'completed' },
        { label: '已取消', value: 'cancelled' },
      ]
    },
    { name: 'actualDate', label: '实际培训日期', type: 'date', span: 12 },
    { name: 'completionRate', label: '完成率(%)', type: 'number', span: 12 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        console.log('提交:', values);
        // await personnelApi.trainingPlan.create(values);
        return true;
      }}
      onSave={async (values) => {
        console.log('暂存:', values);
        return true;
      }}
    />
  );
}
