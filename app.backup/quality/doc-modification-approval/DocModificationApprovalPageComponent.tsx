/**
 * 文件修改审批表页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function DocModificationApprovalPage() {
  const fields: FieldConfig[] = [
    { name: 'docCode', label: '文件编号', type: 'text', required: true, span: 12 },
    { name: 'docName', label: '文件名称', type: 'text', required: true, span: 12 },
    { name: 'currentVersion', label: '当前版本', type: 'text', required: true, span: 12 },
    { name: 'newVersion', label: '新版本', type: 'text', required: true, span: 12 },
    { name: 'modifier', label: '修改人', type: 'text', required: true, span: 12 },
    { name: 'modifyDate', label: '修改日期', type: 'date', required: true, span: 12 },
    { name: 'department', label: '所属部门', type: 'text', required: true, span: 12 },
    { name: 'modifyReason', label: '修改原因', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'modifyContent', label: '修改内容', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'impactAnalysis', label: '影响分析', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'reviewer', label: '审核人', type: 'text', required: true, span: 12 },
    { name: 'reviewDate', label: '审核日期', type: 'date', span: 12 },
    { name: 'reviewResult', label: '审核结果', type: 'select', span: 12,
      options: [
        { label: '通过', value: 'pass' },
        { label: '不通过', value: 'fail' },
        { label: '需修订', value: 'revise' },
      ]
    },
    { name: 'reviewComment', label: '审核意见', type: 'textarea', span: 24, rows: 3 },
    { name: 'approver', label: '批准人', type: 'text', required: true, span: 12 },
    { name: 'approveDate', label: '批准日期', type: 'date', span: 12 },
    { name: 'approveResult', label: '批准结果', type: 'select', span: 12,
      options: [
        { label: '已批准', value: 'approved' },
        { label: '已拒绝', value: 'rejected' },
      ]
    },
    { name: 'approveComment', label: '批准意见', type: 'textarea', span: 24, rows: 3 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12,
      options: [
        { label: '待审核', value: 'pending' },
        { label: '审核中', value: 'reviewing' },
        { label: '待批准', value: 'approving' },
        { label: '已批准', value: 'approved' },
        { label: '已拒绝', value: 'rejected' },
      ]
    },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        // TODO: 调用质量管理API：文件修改审批
        return true;
      }}
      onSave={async (values) => {
        // TODO: 调用质量管理API：文件修改审批暂存
        return true;
      }}
    />
  );
}
