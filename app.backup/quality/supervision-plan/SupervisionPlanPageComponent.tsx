/**
 * 监督计划页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function SupervisionPlanPage() {
  const fields: FieldConfig[] = [
    { name: 'planName', label: '计划名称', type: 'text', required: true, span: 12 },
    { name: 'planYear', label: '计划年度', type: 'number', required: true, span: 12 },
    { name: 'supervisionType', label: '监督类型', type: 'text', required: true, span: 12 },
    { name: 'plannedDate', label: '计划日期', type: 'date', required: true, span: 12 },
    { name: 'supervisor', label: '监督人', type: 'text', required: true, span: 12 },
    { name: 'supervisionScope', label: '监督范围', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'supervisionContent', label: '监督内容', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12, options: [{ label: '计划中', value: 'planned' }, { label: '进行中', value: 'ongoing' }, { label: '已完成', value: 'completed' }] },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
