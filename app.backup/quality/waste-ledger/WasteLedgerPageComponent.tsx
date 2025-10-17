/**
 * 废弃物台账页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function WasteLedgerPage() {
  const fields: FieldConfig[] = [
    { name: 'ledgerNo', label: '台账编号', type: 'text', required: true, span: 12 },
    { name: 'recordDate', label: '记录日期', type: 'date', required: true, span: 12 },
    { name: 'wasteType', label: '废弃物类型', type: 'text', required: true, span: 12 },
    { name: 'wasteSource', label: '来源', type: 'text', required: true, span: 12 },
    { name: 'quantity', label: '数量', type: 'number', required: true, span: 8 },
    { name: 'unit', label: '单位', type: 'text', required: true, span: 8 },
    { name: 'generateDate', label: '产生日期', type: 'date', required: true, span: 8 },
    { name: 'storageLocation', label: '储存位置', type: 'text', required: true, span: 12 },
    { name: 'responsiblePerson', label: '责任人', type: 'text', required: true, span: 12 },
    { name: 'disposalMethod', label: '处理方式', type: 'text', required: true, span: 12 },
    { name: 'disposalDate', label: '处理日期', type: 'date', span: 12 },
    { name: 'status', label: '状态', type: 'select', required: true, span: 12, options: [{ label: '待处理', value: 'pending' }, { label: '处理中', value: 'processing' }, { label: '已处理', value: 'completed' }] },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
