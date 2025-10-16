/**
 * 不符合项管理页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function NonconformityPage() {
  const fields: FieldConfig[] = [
    { name: 'nonconformityNo', label: '不符合项编号', type: 'text', required: true, span: 12 },
    { name: 'foundDate', label: '发现日期', type: 'date', required: true, span: 12 },
    { name: 'foundBy', label: '发现人', type: 'text', required: true, span: 12 },
    { name: 'department', label: '部门', type: 'text', required: true, span: 12 },
    { name: 'category', label: '类别', type: 'select', required: true, span: 12,
      options: [
        { label: '设备', value: 'equipment' },
        { label: '人员', value: 'personnel' },
        { label: '方法', value: 'method' },
        { label: '物料', value: 'material' },
        { label: '环境', value: 'environment' },
        { label: '文件', value: 'documentation' },
        { label: '其他', value: 'other' },
      ]
    },
    { name: 'severity', label: '严重程度', type: 'select', required: true, span: 12,
      options: [
        { label: '严重', value: 'critical' },
        { label: '重要', value: 'major' },
        { label: '一般', value: 'minor' },
      ]
    },
    { name: 'description', label: '描述', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'rootCause', label: '根本原因', type: 'textarea', span: 24, rows: 3 },
    { name: 'correctiveAction', label: '纠正措施', type: 'textarea', span: 24, rows: 3 },
    { name: 'responsiblePerson', label: '责任人', type: 'text', span: 12 },
    { name: 'targetDate', label: '目标完成日期', type: 'date', span: 12 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        console.log('提交:', values);
        // await qualityApi.nonconformity.create(values);
        return true;
      }}
      onSave={async (values) => {
        console.log('暂存:', values);
        return true;
      }}
    />
  );
}
