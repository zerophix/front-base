/**
 * 项目任务页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function ProjectTaskPage() {
  const fields: FieldConfig[] = [
    { name: 'taskCode', label: '任务编号', type: 'text', required: true, span: 12 },
    { name: 'taskName', label: '任务名称', type: 'text', required: true, span: 12 },
    { name: 'projectId', label: '所属项目', type: 'select', required: true, span: 12 },
    { name: 'taskType', label: '任务类型', type: 'text', required: true, span: 12 },
    { name: 'assignee', label: '负责人', type: 'text', required: true, span: 12 },
    { name: 'startDate', label: '开始日期', type: 'date', required: true, span: 12 },
    { name: 'endDate', label: '结束日期', type: 'date', required: true, span: 12 },
    { name: 'priority', label: '优先级', type: 'select', required: true, span: 12, options: [{ label: '低', value: 'low' }, { label: '中', value: 'medium' }, { label: '高', value: 'high' }, { label: '紧急', value: 'urgent' }] },
    { name: 'description', label: '任务描述', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'deliverables', label: '交付物', type: 'textarea', span: 24, rows: 3 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12, options: [{ label: '待开始', value: 'pending' }, { label: '进行中', value: 'ongoing' }, { label: '已完成', value: 'completed' }, { label: '已取消', value: 'cancelled' }] },
    { name: 'progress', label: '进度(%)', type: 'number', span: 12 },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
