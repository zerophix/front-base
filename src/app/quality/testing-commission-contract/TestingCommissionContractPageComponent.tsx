/**
 * 检测委托合同页面
 */

import React, { useRef } from 'react';
import { Form } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { EditableTable, FormActions } from '@/components/common';
import { useTableData, useFormSubmit } from '@/hooks';
import type { IEditableTableConfig } from '@/types/form';

type ContractRow = {
  key: string;
  itemName: string;
  specification: string;
  quantity: string;
  unit: string;
  testMethod: string;
  testStandard: string;
  testFee: string;
  remark: string;
};

export default function TestingCommissionContractPage() {
  const keyCounter = useRef(0);

  // 检测项目表格
  const { dataSource, setDataSource, createDefaultRow } = useTableData<ContractRow>({
    createDefaultRow: () => ({
      key: `item_${++keyCounter.current}`,
      itemName: '',
      specification: '',
      quantity: '',
      unit: '',
      testMethod: '',
      testStandard: '',
      testFee: '',
      remark: '',
    }),
    initialData: [],
  });

  // 表单提交
  const { submitting, saving, handleSubmit, handleSave } = useFormSubmit({
    form: null as any,
    onSubmit: async (values) => {
      // TODO: 调用质量管理API：检测委托合同
      // const data = { ...values, items: dataSource };
      console.log('Submitting:', values);
      return true;
    },
    onSave: async (values) => {
      // TODO: 调用质量管理API：检测委托合同暂存
      console.log('Saving:', values);
      return true;
    },
  });

  // 表格配置
  const tableConfig: IEditableTableConfig<ContractRow> = {
    columns: [
      {
        title: '项目名称',
        dataIndex: 'itemName',
        key: 'itemName',
        width: 150,
      },
      {
        title: '规格型号',
        dataIndex: 'specification',
        key: 'specification',
        width: 120,
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 80,
      },
      {
        title: '单位',
        dataIndex: 'unit',
        key: 'unit',
        width: 80,
      },
      {
        title: '检测方法',
        dataIndex: 'testMethod',
        key: 'testMethod',
        width: 150,
      },
      {
        title: '检测标准',
        dataIndex: 'testStandard',
        key: 'testStandard',
        width: 150,
      },
      {
        title: '检测费用',
        dataIndex: 'testFee',
        key: 'testFee',
        width: 100,
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        width: 150,
      },
    ],
    showDragHandle: true,
    showActions: true,
  };

  return (
    <BaseFormPage onFinish={handleSubmit}>
      <Form.Item label="检测项目">
        <EditableTable
          dataSource={dataSource}
          onChange={setDataSource}
          config={tableConfig}
          createDefaultRow={createDefaultRow}
          showAddButton
          showImportButton
          onImport={() => {
            // TODO: 实现批量导入功能
          }}
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
