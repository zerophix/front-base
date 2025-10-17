/**
 * 项目站点页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function ProjectStationPage() {
  const fields: FieldConfig[] = [
    { name: 'stationCode', label: '站点编号', type: 'text', required: true, span: 12 },
    { name: 'stationName', label: '站点名称', type: 'text', required: true, span: 12 },
    { name: 'projectId', label: '所属项目', type: 'select', required: true, span: 12 },
    { name: 'location', label: '位置', type: 'text', required: true, span: 12 },
    { name: 'address', label: '详细地址', type: 'textarea', required: true, span: 24, rows: 2 },
    { name: 'responsiblePerson', label: '负责人', type: 'text', required: true, span: 12 },
    { name: 'contactPhone', label: '联系电话', type: 'text', required: true, span: 12 },
    { name: 'stationType', label: '站点类型', type: 'text', required: true, span: 12 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12, options: [{ label: '活跃', value: 'active' }, { label: '暂停', value: 'paused' }, { label: '已关闭', value: 'closed' }] },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
