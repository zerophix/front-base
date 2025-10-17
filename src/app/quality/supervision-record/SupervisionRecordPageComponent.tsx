/**
 * 监督记录页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function SupervisionRecordPage() {
  const fields: FieldConfig[] = [
    { name: 'planId', label: '监督计划', type: 'select', required: true, span: 12 },
    { name: 'supervisionDate', label: '监督日期', type: 'date', required: true, span: 12 },
    { name: 'supervisor', label: '监督人', type: 'text', required: true, span: 12 },
    { name: 'supervisedDepartment', label: '被监督部门', type: 'text', required: true, span: 12 },
    { name: 'supervisionContent', label: '监督内容', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'findings', label: '发现问题', type: 'textarea', span: 24, rows: 3 },
    { name: 'suggestion', label: '改进建议', type: 'textarea', span: 24, rows: 3 },
    { name: 'conclusion', label: '结论', type: 'select', required: true, span: 12, options: [{ label: '符合', value: 'pass' }, { label: '不符合', value: 'fail' }] },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
