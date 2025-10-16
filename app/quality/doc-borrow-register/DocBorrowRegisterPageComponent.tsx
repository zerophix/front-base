/**
 * 文件借阅登记表页面
 */

import React, { useRef } from 'react';
import { Form } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { EditableTable, FormActions } from '@/components/common';
import { useTableData, useFormSubmit, useRouteMeta } from '@/hooks';
import type { IEditableTableConfig } from '@/types/form';

type BorrowRow = {
  key: string;
  docCode: string;
  docName: string;
  version: string;
  borrower: string;
  department: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate: string;
  purpose: string;
  status: string;
  remark: string;
};

export default function DocBorrowRegisterPage() {
  const keyCounter = useRef(0);

  // 从路由派生页面元信息并写入全局（单一数据源）
  useRouteMeta();

  // 借阅记录表格
  const { dataSource, setDataSource, createDefaultRow } = useTableData<BorrowRow>({
    createDefaultRow: () => ({
      key: `item_${++keyCounter.current}`,
      docCode: '',
      docName: '',
      version: '',
      borrower: '',
      department: '',
      borrowDate: '',
      expectedReturnDate: '',
      actualReturnDate: '',
      purpose: '',
      status: '借阅中',
      remark: '',
    }),
    initialData: [],
  });

  // 表单提交
  const { submitting, saving, handleSubmit, handleSave } = useFormSubmit({
    form: null as any,
    onSubmit: async (values) => {
      const data = {
        ...values,
        records: dataSource,
      };
      // TODO: 调用质量管理API：文件借阅登记
      return true;
    },
    onSave: async (values) => {
      // TODO: 调用质量管理API：文件借阅登记暂存
      return true;
    },
  });

  // 表格配置
  const tableConfig: IEditableTableConfig<BorrowRow> = {
    columns: [
      {
        title: '文件编号',
        dataIndex: 'docCode',
        key: 'docCode',
        width: 120,
      },
      {
        title: '文件名称',
        dataIndex: 'docName',
        key: 'docName',
        width: 200,
      },
      {
        title: '版本号',
        dataIndex: 'version',
        key: 'version',
        width: 100,
      },
      {
        title: '借阅人',
        dataIndex: 'borrower',
        key: 'borrower',
        width: 100,
      },
      {
        title: '借阅部门',
        dataIndex: 'department',
        key: 'department',
        width: 120,
      },
      {
        title: '借阅日期',
        dataIndex: 'borrowDate',
        key: 'borrowDate',
        width: 120,
      },
      {
        title: '预计归还日期',
        dataIndex: 'expectedReturnDate',
        key: 'expectedReturnDate',
        width: 120,
      },
      {
        title: '实际归还日期',
        dataIndex: 'actualReturnDate',
        key: 'actualReturnDate',
        width: 120,
      },
      {
        title: '借阅目的',
        dataIndex: 'purpose',
        key: 'purpose',
        width: 150,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
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
      <Form.Item label="借阅记录">
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
