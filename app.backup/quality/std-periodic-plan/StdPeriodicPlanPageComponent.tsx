/**
 * 标准物质期间核查计划页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function StdPeriodicPlanPage() {
  const fields: FieldConfig[] = [
    { name: 'planName', label: '计划名称', type: 'text', required: true, span: 12 },
    { name: 'planYear', label: '计划年度', type: 'number', required: true, span: 12 },
    { name: 'substanceId', label: '标准物质', type: 'select', required: true, span: 12 },
    { name: 'checkCycle', label: '核查周期', type: 'text', required: true, span: 12 },
    { name: 'plannedDate', label: '计划日期', type: 'date', required: true, span: 12 },
    { name: 'responsiblePerson', label: '责任人', type: 'text', required: true, span: 12 },
    { name: 'checkMethod', label: '核查方法', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'acceptanceCriteria', label: '验收准则', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12,
      options: [
        { label: '计划中', value: 'planned' },
        { label: '进行中', value: 'ongoing' },
        { label: '已完成', value: 'completed' },
      ]
    },
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
