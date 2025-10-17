/**
 * 检测参数页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function DetectionParamsPage() {
  const fields: FieldConfig[] = [
    { name: 'paramCode', label: '参数编号', type: 'text', required: true, span: 12 },
    { name: 'paramName', label: '参数名称', type: 'text', required: true, span: 12 },
    { name: 'objectId', label: '检测对象', type: 'select', required: true, span: 12 },
    { name: 'unit', label: '单位', type: 'text', required: true, span: 12 },
    { name: 'paramType', label: '参数类型', type: 'text', required: true, span: 12 },
    { name: 'standardValue', label: '标准值', type: 'text', span: 12 },
    { name: 'allowableRange', label: '允许范围', type: 'text', span: 12 },
    { name: 'detectionMethod', label: '检测方法', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'standardReference', label: '标准依据', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12, options: [{ label: '有效', value: 'active' }, { label: '停用', value: 'inactive' }] },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
