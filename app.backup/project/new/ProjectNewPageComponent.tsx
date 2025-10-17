/**
 * 新建项目页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function ProjectNewPage() {
  const fields: FieldConfig[] = [
    { name: 'projectCode', label: '项目编号', type: 'text', required: true, span: 12 },
    { name: 'projectName', label: '项目名称', type: 'text', required: true, span: 12 },
    { name: 'projectType', label: '项目类型', type: 'text', required: true, span: 12 },
    { name: 'client', label: '客户', type: 'text', required: true, span: 12 },
    { name: 'startDate', label: '开始日期', type: 'date', required: true, span: 12 },
    { name: 'endDate', label: '结束日期', type: 'date', required: true, span: 12 },
    { name: 'projectManager', label: '项目经理', type: 'text', required: true, span: 12 },
    { name: 'budget', label: '预算', type: 'number', required: true, span: 12 },
    { name: 'description', label: '项目描述', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'objectives', label: '项目目标', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12, options: [{ label: '计划中', value: 'planning' }, { label: '进行中', value: 'ongoing' }, { label: '已完成', value: 'completed' }, { label: '已取消', value: 'cancelled' }] },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
