/**
 * 技术标准有效性确认报告页面
 */

import React, { useRef } from 'react';
import { Form } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { EditableTable, FormActions } from '@/components/common';
import { useTableData, useFormSubmit } from '@/hooks';
import type { IEditableTableConfig } from '@/types/form';

type StandardRow = {
  key: string;
  standardCode: string;
  standardName: string;
  version: string;
  issueDate: string;
  expiryDate: string;
  validityStatus: string;
  checkDate: string;
  checker: string;
  remark: string;
};

export default function TechnicalStandardValidityReportPage() {
  const keyCounter = useRef(0);

  // 标准清单表格
  const { dataSource, setDataSource, createDefaultRow } = useTableData<StandardRow>({
    createDefaultRow: () => ({
      key: `item_${++keyCounter.current}`,
      standardCode: '',
      standardName: '',
      version: '',
      issueDate: '',
      expiryDate: '',
      validityStatus: '',
      checkDate: '',
      checker: '',
      remark: '',
    }),
    initialData: [],
  });

  // 表单提交
  const { submitting, saving, handleSubmit, handleSave } = useFormSubmit({
    form: null as any,
    onSubmit: async (values) => {
      // TODO: 调用质量管理API：技术标准有效性确认
      // const data = { ...values, standards: dataSource };
      console.log('Submitting:', values);
      return true;
    },
    onSave: async (values) => {
      // TODO: 调用质量管理API：技术标准有效性确认暂存
      console.log('Saving:', values);
      return true;
    },
  });

  // 表格配置
  const tableConfig: IEditableTableConfig<StandardRow> = {
    columns: [
      {
        title: '标准编号',
        dataIndex: 'standardCode',
        key: 'standardCode',
        width: 120,
      },
      {
        title: '标准名称',
        dataIndex: 'standardName',
        key: 'standardName',
        width: 200,
      },
      {
        title: '版本号',
        dataIndex: 'version',
        key: 'version',
        width: 100,
      },
      {
        title: '发布日期',
        dataIndex: 'issueDate',
        key: 'issueDate',
        width: 120,
      },
      {
        title: '有效期至',
        dataIndex: 'expiryDate',
        key: 'expiryDate',
        width: 120,
      },
      {
        title: '有效性状态',
        dataIndex: 'validityStatus',
        key: 'validityStatus',
        width: 120,
      },
      {
        title: '检查日期',
        dataIndex: 'checkDate',
        key: 'checkDate',
        width: 120,
      },
      {
        title: '检查人',
        dataIndex: 'checker',
        key: 'checker',
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
      <Form.Item label="标准清单">
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
