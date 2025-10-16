/**
 * 文件销毁(留存)记录表页面
 */

import React, { useRef } from 'react';
import { Form } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { EditableTable, FormActions } from '@/components/common';
import { useTableData, useFormSubmit } from '@/hooks';
import type { IEditableTableConfig } from '@/types/form';

type RetentionRow = {
  key: string;
  docCode: string;
  docName: string;
  version: string;
  retentionPeriod: string;
  retentionReason: string;
  disposalMethod: string;
  disposalDate: string;
  responsiblePerson: string;
  remark: string;
};

export default function DocRetentionRecordPage() {
  const keyCounter = useRef(0);

  // 数据记录表格
  const { dataSource, setDataSource, createDefaultRow } = useTableData<RetentionRow>({
    createDefaultRow: () => ({
      key: `item_${++keyCounter.current}`,
      docCode: '',
      docName: '',
      version: '',
      retentionPeriod: '',
      retentionReason: '',
      disposalMethod: '',
      disposalDate: '',
      responsiblePerson: '',
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
      // TODO: 调用质量管理API：文件销毁记录
      return true;
    },
    onSave: async (values) => {
      // TODO: 调用质量管理API：文件销毁记录暂存
      return true;
    },
  });

  // 表格配置
  const tableConfig: IEditableTableConfig<RetentionRow> = {
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
        title: '留存期限',
        dataIndex: 'retentionPeriod',
        key: 'retentionPeriod',
        width: 120,
      },
      {
        title: '留存原因',
        dataIndex: 'retentionReason',
        key: 'retentionReason',
        width: 150,
      },
      {
        title: '处置方式',
        dataIndex: 'disposalMethod',
        key: 'disposalMethod',
        width: 120,
      },
      {
        title: '处置日期',
        dataIndex: 'disposalDate',
        key: 'disposalDate',
        width: 120,
      },
      {
        title: '责任人',
        dataIndex: 'responsiblePerson',
        key: 'responsiblePerson',
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
      <Form.Item label="数据记录">
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
