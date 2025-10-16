/**
 * 检验原始记录更正申请表
 * 根据截图规范化字段与布局
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function DataCorrectionApplyPage() {
  const fields: FieldConfig[] = [
    { name: 'recordNo', label: '记录编号', type: 'text', required: true, span: 12 },
    { name: 'applicant', label: '申请人', type: 'text', required: true, span: 12 },
    { name: 'applyDate', label: '申请日期', type: 'date', required: true, span: 12 },
    { name: 'targetRecordNo', label: '更正记录编号', type: 'text', required: true, span: 12 },

    { name: 'correctionReason', label: '更正理由', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'correctionContent', label: '更正内容', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'departmentOpinion', label: '部门意见', type: 'textarea', span: 24, rows: 3 },

    { name: 'reviewer', label: '复审签名', type: 'text', span: 12 },
    { name: 'reviewDate', label: '日期', type: 'date', span: 12 },
    { name: 'techLeader', label: '技术负责人签名', type: 'text', span: 12 },
    { name: 'techLeaderDate', label: '日期', type: 'date', span: 12 },
    { name: 'supervisor', label: '主管签名', type: 'text', span: 12 },
    { name: 'qualityLeader', label: '质量负责人签名', type: 'text', span: 12 },
    { name: 'qualityLeaderDate', label: '日期', type: 'date', span: 12 },

    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        console.log('提交:', values);
        // TODO: 调用质量管理API：更正申请创建
        return true;
      }}
      onSave={async (values) => {
        console.log('暂存:', values);
        return true;
      }}
    />
  );
}