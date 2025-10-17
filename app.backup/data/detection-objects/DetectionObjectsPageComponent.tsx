/**
 * 检测对象页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import { useRouteMeta, usePageConfig } from '@/hooks';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function DetectionObjectsPage() {
  const routeMeta = useRouteMeta();
  usePageConfig(routeMeta);
  const fields: FieldConfig[] = [
    { name: 'objectCode', label: '对象编号', type: 'text', required: true, span: 12 },
    { name: 'objectName', label: '对象名称', type: 'text', required: true, span: 12 },
    { name: 'category', label: '类别', type: 'text', required: true, span: 12 },
    { name: 'specification', label: '规格', type: 'text', span: 12 },
    { name: 'description', label: '描述', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'standardReference', label: '标准依据', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'detectionMethod', label: '检测方法', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12, options: [{ label: '有效', value: 'active' }, { label: '停用', value: 'inactive' }] },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
