import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';
import { useUserStore } from '@/store';
import { formatDate } from '@/utils/date';

export default function ContractChangeApplicationPage() {
  const user = useUserStore((s) => s.user);
  const today = formatDate(new Date());

  const fields: FieldConfig[] = [
    { name: 'contractName', label: '合同名称', type: 'select', required: true, span: 12 },
    { name: 'contractNumber', label: '合同编号', type: 'text', required: true, span: 12 },
    { name: 'customerName', label: '客户名称', type: 'text', required: true, span: 12 },
    { name: 'signingDate', label: '签订日期', type: 'select', required: true, span: 12 },
    { name: 'changeReason', label: '更改原因', type: 'textarea', required: true, span: 24, rows: 3 },
    { name: 'beforeContent', label: '更改前内容', type: 'textarea', required: true, span: 24, rows: 5 },
    { name: 'afterContent', label: '更改后内容', type: 'textarea', required: true, span: 24, rows: 5 },
    { name: 'department', label: '申请部门', type: 'search-select', required: true, span: 12 },
    { name: 'applicant', label: '申请人', type: 'user-select', required: true, span: 12, defaultValue: user?.name },
    { name: 'date', label: '日期', type: 'text', required: true, span: 12, defaultValue: today },
    { name: 'approvalResult', label: '更改批准结果', type: 'textarea', required: false, span: 24, rows: 5 },
  ];

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        console.log('提交:', values);
        return true;
      }}
      onSave={async (values) => {
        console.log('暂存:', values);
        return true;
      }}
    />
  );
}