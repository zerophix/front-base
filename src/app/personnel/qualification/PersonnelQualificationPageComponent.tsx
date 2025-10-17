/**
 * 人员资质管理页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function PersonnelQualificationPage() {

  const fields: FieldConfig[] = [
    { name: 'personnelId', label: '人员姓名', type: 'select', required: true, span: 12 },
    { name: 'qualificationType', label: '资质类型', type: 'text', required: true, span: 12 },
    { name: 'qualificationName', label: '资质名称', type: 'text', required: true, span: 12 },
    { name: 'certificateNo', label: '证书编号', type: 'text', required: true, span: 12 },
    { name: 'issueDate', label: '发证日期', type: 'date', required: true, span: 8 },
    { name: 'expiryDate', label: '有效期至', type: 'date', span: 8 },
    { name: 'issuingAuthority', label: '发证机关', type: 'text', required: true, span: 8 },
    { name: 'status', label: '状态', type: 'select', span: 12,
      options: [
        { label: '有效', value: 'valid' },
        { label: '即将过期', value: 'expiring' },
        { label: '已过期', value: 'expired' },
      ]
    },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 3 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        console.log('提交:', values);
        // await personnelApi.qualification.create(values);
        return true;
      }}
      onSave={async (values) => {
        console.log('暂存:', values);
        return true;
      }}
    />
  );
}
