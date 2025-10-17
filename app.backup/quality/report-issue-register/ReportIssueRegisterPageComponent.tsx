/**
 * 检验报告发布及发放登记表页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function ReportIssueRegisterPage() {
  const fields: FieldConfig[] = [
    { name: 'projectName', label: '项目名称', type: 'text', required: true, span: 12 },
    { name: 'reportNo', label: '报告编号', type: 'text', required: true, span: 12 },
    { name: 'issueDate', label: '发放日期', type: 'date', required: true, span: 12 },
    { name: 'issuer', label: '发放人', type: 'text', required: true, span: 12 },
    { name: 'issueMethod', label: '发放方式', type: 'select', required: true, span: 12,
      options: [
        { label: '现场发放', value: 'onsite' },
        { label: '邮寄发放', value: 'post' },
        { label: '电子签发', value: 'electronic' },
      ] },
    { name: 'originalCount', label: '正本数量', type: 'number', required: true, span: 12 },
    { name: 'copyCount', label: '副本数量', type: 'number', required: true, span: 12 },
    { name: 'leader', label: '领队人', type: 'text', required: true, span: 12 },
    { name: 'leaderPhone', label: '领队电话', type: 'text', required: true, span: 12 },
    { name: 'sealRecord', label: '印章使用记录', type: 'textarea', span: 24, rows: 3 },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
    { name: 'notify', label: '消息通知', type: 'select', span: 12,
      options: [{ label: '关闭', value: false }, { label: '开启', value: true }] },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => { console.log('提交:', values); return true; }}
      onSave={async (values) => { console.log('暂存:', values); return true; }}
    />
  );
}