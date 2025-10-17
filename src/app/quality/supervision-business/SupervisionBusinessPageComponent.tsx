/**
 * 监督业务页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function SupervisionBusinessPage() {
  const fields: FieldConfig[] = [
    { name: 'businessNo', label: '业务编号', type: 'text', required: true, span: 12 },
    { name: 'businessDate', label: '业务日期', type: 'date', required: true, span: 12 },
    { name: 'businessType', label: '业务类型', type: 'text', required: true, span: 12 },
    { name: 'department', label: '部门', type: 'text', required: true, span: 12 },
    { name: 'businessContent', label: '业务内容', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'supervisor', label: '监督人', type: 'text', required: true, span: 12 },
    { name: 'supervisionOpinion', label: '监督意见', type: 'textarea', span: 24, rows: 3 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12, options: [{ label: '进行中', value: 'ongoing' }, { label: '已完成', value: 'completed' }, { label: '已关闭', value: 'closed' }] },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
