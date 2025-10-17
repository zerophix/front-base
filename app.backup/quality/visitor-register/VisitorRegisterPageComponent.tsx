/**
 * 访客登记页面
 */

import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';

export default function VisitorRegisterPage() {
  // 标准表单页面将自动通过 useRouteMeta 设置页面配置

  const fields: FieldConfig[] = [
    { name: 'visitorName', label: '访客姓名', type: 'text', required: true, span: 12 },
    { name: 'visitorCompany', label: '访客单位', type: 'text', required: true, span: 12 },
    { name: 'visitorIdNo', label: '证件号码', type: 'text', required: true, span: 12 },
    { name: 'contactPhone', label: '联系电话', type: 'text', required: true, span: 12 },
    { name: 'visitDate', label: '来访日期', type: 'date', required: true, span: 12 },
    { name: 'visitTime', label: '来访时间', type: 'text', required: true, span: 12 },
    { name: 'visitPurpose', label: '来访目的', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'visitDepartment', label: '被访部门', type: 'text', required: true, span: 12 },
    { name: 'visitPerson', label: '被访人', type: 'text', required: true, span: 12 },
    { name: 'escort', label: '陪同人', type: 'text', required: true, span: 12 },
    { name: 'entryTime', label: '进入时间', type: 'text', required: true, span: 12 },
    { name: 'exitTime', label: '离开时间', type: 'text', span: 12 },
    { name: 'remark', label: '备注', type: 'textarea', span: 24, rows: 2 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        console.log('提交:', values);
        // await qualityApi.visitor.register(values);
        return true;
      }}
      onSave={async (values) => {
        console.log('暂存:', values);
        return true;
      }}
    />
  );
}
