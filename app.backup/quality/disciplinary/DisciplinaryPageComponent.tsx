/**
 * 纪律处分页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function DisciplinaryPage() {
  const fields: FieldConfig[] = [
    { name: 'caseNo', label: '案件编号', type: 'text', required: true, span: 12 },
    { name: 'caseDate', label: '案件日期', type: 'date', required: true, span: 12 },
    { name: 'personnelId', label: '当事人', type: 'select', required: true, span: 12 },
    { name: 'department', label: '所属部门', type: 'text', required: true, span: 12 },
    { name: 'violationType', label: '违纪类型', type: 'select', required: true, span: 12, options: [{ label: '违反工作纪律', value: 'work' }, { label: '违反操作规程', value: 'operation' }, { label: '违反保密规定', value: 'confidentiality' }, { label: '其他', value: 'other' }] },
    { name: 'violationDescription', label: '违纪情况', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'evidence', label: '证据材料', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'penaltyType', label: '处分类型', type: 'select', required: true, span: 12, options: [{ label: '警告', value: 'warning' }, { label: '记过', value: 'demerit' }, { label: '降级', value: 'demotion' }, { label: '开除', value: 'dismissal' }] },
    { name: 'penaltyDescription', label: '处分说明', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'effectiveDate', label: '生效日期', type: 'date', required: true, span: 12 },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
