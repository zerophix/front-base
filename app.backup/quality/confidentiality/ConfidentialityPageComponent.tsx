/**
 * 保密管理页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function ConfidentialityPage() {
  const fields: FieldConfig[] = [
    { name: 'documentNo', label: '文件编号', type: 'text', required: true, span: 12 },
    { name: 'documentName', label: '文件名称', type: 'text', required: true, span: 12 },
    { name: 'confidentialityLevel', label: '保密等级', type: 'select', required: true, span: 12, options: [{ label: '一般', value: 'general' }, { label: '秘密', value: 'secret' }, { label: '机密', value: 'confidential' }, { label: '绝密', value: 'top-secret' }] },
    { name: 'responsiblePerson', label: '责任人', type: 'text', required: true, span: 12 },
    { name: 'department', label: '部门', type: 'text', required: true, span: 12 },
    { name: 'registerDate', label: '登记日期', type: 'date', required: true, span: 12 },
    { name: 'content', label: '内容描述', type: 'textarea', required: true, span: 24, rows: 4 },
    { name: 'storageLocation', label: '存放位置', type: 'text', required: true, span: 12 },
    { name: 'accessControl', label: '访问控制', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12, options: [{ label: '在用', value: 'active' }, { label: '封存', value: 'sealed' }, { label: '销毁', value: 'destroyed' }] },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
