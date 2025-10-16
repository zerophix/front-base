/**
 * 监督通知页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function SupervisionNoticePage() {
  const fields: FieldConfig[] = [
    { name: 'noticeTitle', label: '通知标题', type: 'text', required: true, span: 12 },
    { name: 'noticeDate', label: '通知日期', type: 'date', required: true, span: 12 },
    { name: 'targetDepartment', label: '目标部门', type: 'text', required: true, span: 12 },
    { name: 'noticeType', label: '通知类型', type: 'select', required: true, span: 12, options: [{ label: '例行监督', value: 'routine' }, { label: '专项监督', value: 'special' }, { label: '飞行检查', value: 'surprise' }] },
    { name: 'supervisionDate', label: '监督日期', type: 'date', required: true, span: 12 },
    { name: 'supervisor', label: '监督人', type: 'text', required: true, span: 12 },
    { name: 'noticeContent', label: '通知内容', type: 'textarea', required: true, span: 24, rows: 6 },
    { name: 'requirements', label: '要求事项', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
