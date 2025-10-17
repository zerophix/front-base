/**
 * 文件编制申请页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function DocComposeApplyPage() {
  const fields: FieldConfig[] = [
    { name: 'docName', label: '文件名称', type: 'text', required: true, span: 12 },
    { name: 'docType', label: '文件类型', type: 'select', required: true, span: 12, options: [{ label: '手册', value: 'manual' }, { label: '程序文件', value: 'procedure' }, { label: '作业指导书', value: 'instruction' }, { label: '记录表格', value: 'record' }, { label: '外来文件', value: 'external' }] },
    { name: 'applicant', label: '申请人', type: 'text', required: true, span: 12 },
    { name: 'applyDate', label: '申请日期', type: 'date', required: true, span: 12 },
    { name: 'applyDepartment', label: '申请部门', type: 'text', required: true, span: 12 },
    { name: 'reason', label: '申请原因', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'content', label: '主要内容', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'status', label: '审批状态', type: 'select', span: 12, options: [{ label: '待审批', value: 'pending' }, { label: '已批准', value: 'approved' }, { label: '已拒绝', value: 'rejected' }, { label: '编制中', value: 'composing' }] },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
