/**
 * 监督登记页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function SupervisionRegisterPage() {
  const fields: FieldConfig[] = [
    { name: 'registerNo', label: '登记编号', type: 'text', required: true, span: 12 },
    { name: 'registerDate', label: '登记日期', type: 'date', required: true, span: 12 },
    { name: 'supervisionType', label: '监督类型', type: 'select', required: true, span: 12, options: [{ label: '例行监督', value: 'routine' }, { label: '专项监督', value: 'special' }, { label: '飞行检查', value: 'surprise' }] },
    { name: 'supervisedDepartment', label: '被监督部门', type: 'text', required: true, span: 12 },
    { name: 'supervisor', label: '监督人', type: 'text', required: true, span: 12 },
    { name: 'supervisionDate', label: '监督日期', type: 'date', required: true, span: 12 },
    { name: 'supervisionContent', label: '监督内容', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'result', label: '监督结果', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12, options: [{ label: '已登记', value: 'registered' }, { label: '处理中', value: 'processing' }, { label: '已完成', value: 'completed' }] },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
