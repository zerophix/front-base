/**
 * 文件受控清单页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function DocControlledListPage() {
  const fields: FieldConfig[] = [
    { name: 'docCode', label: '文件编号', type: 'text', required: true, span: 12 },
    { name: 'docName', label: '文件名称', type: 'text', required: true, span: 12 },
    { name: 'docType', label: '文件类型', type: 'select', required: true, span: 12, options: [{ label: '手册', value: 'manual' }, { label: '程序文件', value: 'procedure' }, { label: '作业指导书', value: 'instruction' }, { label: '记录表格', value: 'record' }, { label: '外来文件', value: 'external' }] },
    { name: 'version', label: '版本号', type: 'text', required: true, span: 12 },
    { name: 'issueDate', label: '发布日期', type: 'date', required: true, span: 12 },
    { name: 'effectiveDate', label: '生效日期', type: 'date', required: true, span: 12 },
    { name: 'department', label: '归口部门', type: 'text', required: true, span: 12 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12, options: [{ label: '草稿', value: 'draft' }, { label: '审核中', value: 'reviewing' }, { label: '有效', value: 'effective' }, { label: '作废', value: 'obsolete' }] },
    { name: 'replacedDoc', label: '替代文件', type: 'text', span: 24 },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
