/**
 * 废弃物介质灭菌页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function WasteMediaSterilizationPage() {
  const fields: FieldConfig[] = [
    { name: 'recordNo', label: '记录编号', type: 'text', required: true, span: 12 },
    { name: 'sterilizationDate', label: '灭菌日期', type: 'date', required: true, span: 12 },
    { name: 'wasteType', label: '废弃物类型', type: 'text', required: true, span: 12 },
    { name: 'quantity', label: '数量', type: 'number', required: true, span: 6 },
    { name: 'unit', label: '单位', type: 'text', required: true, span: 6 },
    { name: 'sterilizationMethod', label: '灭菌方法', type: 'select', required: true, span: 12, options: [{ label: '高温灭菌', value: 'heat' }, { label: '化学灭菌', value: 'chemical' }, { label: '辐射灭菌', value: 'radiation' }, { label: '其他', value: 'other' }] },
    { name: 'sterilizationEquipment', label: '灭菌设备', type: 'text', required: true, span: 12 },
    { name: 'temperature', label: '温度(℃)', type: 'number', span: 8 },
    { name: 'pressure', label: '压力(kPa)', type: 'number', span: 8 },
    { name: 'duration', label: '时长(分钟)', type: 'number', required: true, span: 8 },
    { name: 'operator', label: '操作人', type: 'text', required: true, span: 12 },
    { name: 'verificationResult', label: '验证结果', type: 'select', required: true, span: 12, options: [{ label: '合格', value: 'pass' }, { label: '不合格', value: 'fail' }] },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
