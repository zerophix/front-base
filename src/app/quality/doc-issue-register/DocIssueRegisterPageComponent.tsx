/**
 * 文件发放(领用)登记表页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function DocIssueRegisterPage() {
  const fields: FieldConfig[] = [
    { name: 'docCode', label: '文件编号', type: 'text', required: true, span: 12 },
    { name: 'docName', label: '文件名称', type: 'text', required: true, span: 12 },
    { name: 'version', label: '版本号', type: 'text', required: true, span: 12 },
    { name: 'issueDate', label: '发放日期', type: 'date', required: true, span: 12 },
    { name: 'recipient', label: '领用人', type: 'text', required: true, span: 12 },
    { name: 'department', label: '领用部门', type: 'text', required: true, span: 12 },
    { name: 'issueType', label: '发放类型', type: 'select', required: true, span: 12,
      options: [
        { label: '新文件发放', value: 'new' },
        { label: '文件更新', value: 'update' },
        { label: '文件替换', value: 'replace' },
      ]
    },
    { name: 'quantity', label: '发放数量', type: 'number', required: true, span: 12 },
    { name: 'purpose', label: '使用目的', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        // TODO: 调用质量管理API：文件发放登记
        return true;
      }}
      onSave={async (values) => {
        // TODO: 调用质量管理API：文件发放暂存
        return true;
      }}
    />
  );
}