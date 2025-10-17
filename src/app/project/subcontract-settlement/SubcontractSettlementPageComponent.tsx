import { Form, message } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { FieldGroup } from '@/components/common/FieldGroup';
import { EditableTable } from '@/components/common/EditableTable';
import { FieldConfig } from '@/components/common/FieldGroup';
import { FormActions } from '@/components/common';
import { IEditableRow, IEditableTableConfig, FieldType } from '@/types/form';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useRouteMeta } from '@/hooks';

interface TestItemDetail {
  key: string;
  serialNumber: number;
  testItemName: string;
  specification: string;
  quantity: number;
  unit: string;
  testMethod: string;
  testStandard: string;
  unitPrice: number;
  remark: string;
}

export default function SubcontractSettlementPage() {
  const [form] = Form.useForm();
  const [tableData, setTableData] = useState<TestItemDetail[]>([
    {
      key: '1',
      serialNumber: 1,
      testItemName: '',
      specification: '',
      quantity: 0,
      unit: '',
      testMethod: '',
      testStandard: '',
      unitPrice: 0,
      remark: '',
    }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);

  // 设置页面元信息
  useRouteMeta();

  // 基本信息字段配置
  const fields: FieldConfig[] = [
    { name: 'projectName', label: '项目名称', type: 'text', required: true, span: 12 },
    { name: 'contractNumber', label: '合同编号', type: 'text', required: true, span: 12 },
    { name: 'subcontractorUnit', label: '分包单位', type: 'text', required: true, span: 12 },
    { name: 'settlementPeriod', label: '结算期间', type: 'text', required: true, span: 12 },
    { name: 'totalAmount', label: '结算总金额', type: 'number', required: true, span: 8 },
    { name: 'taxRate', label: '税率', type: 'number', required: true, span: 8 },
    { name: 'taxAmount', label: '税额', type: 'number', required: true, span: 8 },
    { name: 'netAmount', label: '不含税金额', type: 'number', required: true, span: 8 },
    { name: 'prepaidAmount', label: '已付金额', type: 'number', span: 8 },
    { name: 'payableAmount', label: '应付金额', type: 'number', required: true, span: 8 },
    { name: 'signDate', label: '签字日期', type: 'date', required: true, span: 12 },
  ];

  // 表格配置
  const tableConfig: IEditableTableConfig<TestItemDetail> = {
    columns: [
      {
        title: '序号',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        width: 80,
        editable: false,
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: '检测项目名称',
        dataIndex: 'testItemName',
        key: 'testItemName',
        editable: true,
      },
      {
        title: '规格型号',
        dataIndex: 'specification',
        key: 'specification',
        editable: true,
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 120,
        editable: true,
        inputType: FieldType.Number,
      },
      {
        title: '单位',
        dataIndex: 'unit',
        key: 'unit',
        width: 80,
        editable: true,
      },
      {
        title: '检测方法',
        dataIndex: 'testMethod',
        key: 'testMethod',
        width: 150,
        editable: true,
      },
      {
        title: '检测标准',
        dataIndex: 'testStandard',
        key: 'testStandard',
        width: 150,
        editable: true,
      },
      {
        title: '单价',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        width: 120,
        editable: true,
        inputType: FieldType.Number,
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        editable: true,
      },
    ],
    showActions: true,
    enableAdd: true,
    enableDelete: true,
  };

  const createDefaultRow = () => ({
    key: Date.now().toString(),
    serialNumber: tableData.length + 1,
    testItemName: '',
    specification: '',
    quantity: 0,
    unit: '',
    testMethod: '',
    testStandard: '',
    unitPrice: 0,
    remark: '',
  });

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      const formData = {
        ...values,
        testItemDetails: tableData,
        signDate: values.signDate?.format('YYYY-MM-DD'),
      };
      
      console.log('提交分包结算清单:', formData);
      message.success('分包结算清单提交成功！');
      return true;
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败，请重试');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      const formData = {
        ...values,
        testItemDetails: tableData,
        signDate: values.signDate?.format('YYYY-MM-DD'),
      };
      
      console.log('暂存分包结算清单:', formData);
      message.success('分包结算清单暂存成功！');
      return true;
    } catch (error) {
      console.error('暂存失败:', error);
      message.error('暂存失败，请重试');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseFormPage 
      form={form}
      onFinish={handleSubmit}
      initialValues={{
        signDate: dayjs()
      }}
    >
      <FieldGroup fields={fields} />
      
      <Form.Item label="检测项目明细">
        <EditableTable
          dataSource={tableData}
          config={tableConfig}
          onChange={(data) => setTableData(data as TestItemDetail[])}
          createDefaultRow={createDefaultRow}
        />
      </Form.Item>

      <FormActions
        showSubmit
        submitLoading={submitting}
        showSave
        saveLoading={saving}
        onSave={handleSave}
      />
    </BaseFormPage>
  );
}