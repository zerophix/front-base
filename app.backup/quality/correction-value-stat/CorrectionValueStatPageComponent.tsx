/**
 * 修正值统计页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function CorrectionValueStatPage() {
  const fields: FieldConfig[] = [
    { name: 'statPeriod', label: '统计周期', type: 'text', required: true, span: 12 },
    { name: 'statDate', label: '统计日期', type: 'date', required: true, span: 12 },
    { name: 'equipmentId', label: '设备名称', type: 'select', required: true, span: 12 },
    { name: 'parameter', label: '参数', type: 'text', required: true, span: 12 },
    { name: 'correctionValue', label: '修正值', type: 'number', required: true, span: 12 },
    { name: 'unit', label: '单位', type: 'text', required: true, span: 12 },
    { name: 'statistician', label: '统计人', type: 'text', required: true, span: 12 },
    { name: 'analysisResult', label: '分析结果', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'conclusion', label: '结论', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
