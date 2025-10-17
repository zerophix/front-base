/**
 * 证书有效性确认页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function CertValidityConfirmPage() {
  const fields: FieldConfig[] = [
    { name: 'certNo', label: '证书编号', type: 'text', required: true, span: 12 },
    { name: 'certName', label: '证书名称', type: 'text', required: true, span: 12 },
    { name: 'certType', label: '证书类型', type: 'text', required: true, span: 12 },
    { name: 'holder', label: '持证人', type: 'text', required: true, span: 12 },
    { name: 'issueDate', label: '发证日期', type: 'date', required: true, span: 12 },
    { name: 'expiryDate', label: '有效期至', type: 'date', required: true, span: 12 },
    { name: 'confirmDate', label: '确认日期', type: 'date', required: true, span: 12 },
    { name: 'confirmer', label: '确认人', type: 'text', required: true, span: 12 },
    { name: 'confirmMethod', label: '确认方式', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'confirmResult', label: '确认结果', type: 'select', required: true, span: 12, options: [{ label: '有效', value: 'valid' }, { label: '无效', value: 'invalid' }, { label: '待确认', value: 'pending' }] },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return <StandardFormPage fields={fields} onSubmit={async (values) => { console.log('提交:', values); return true; }} onSave={async (values) => { console.log('暂存:', values); return true; }} />;
}
