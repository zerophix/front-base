/**
 * 参数编码页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function ParameterCodePage() {
  const fields: FieldConfig[] = [
    { name: 'codeId', label: '编码ID', type: 'text', required: true, span: 12 },
    { name: 'codeName', label: '编码名称', type: 'text', required: true, span: 12 },
    { name: 'codeType', label: '编码类型', type: 'text', required: true, span: 12 },
    { name: 'codeValue', label: '编码值', type: 'text', required: true, span: 12 },
    { name: 'description', label: '描述', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'parentCode', label: '父编码', type: 'text', span: 12 },
    { name: 'sortOrder', label: '排序', type: 'number', span: 12 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12, options: [{ label: '有效', value: 'active' }, { label: '停用', value: 'inactive' }] },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
