/**
 * 受控文件有效性检查登记表页面
 */

import React, { useRef } from 'react';
import { Form } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { EditableTable, FormActions } from '@/components/common';
import { useTableData, useFormSubmit, useRouteMeta } from '@/hooks';
import type { IEditableTableConfig } from '@/types/form';

type EffectivenessRow = {
  key: string;
  docCode: string;
  docName: string;
  version: string;
  checkDate: string;
  checker: string;
  effectivenessStatus: string;
  issueDescription: string;
  solution: string;
  remark: string;
};

export default function DocEffectivenessCheckPage() {
  const keyCounter = useRef(0);

  // 从路由派生页面元信息并写入全局（单一数据源）
  useRouteMeta();

  // 检查记录表格
  const { dataSource, setDataSource, createDefaultRow } = useTableData<EffectivenessRow>({
    createDefaultRow: () => ({
      key: `item_${++keyCounter.current}`,
      docCode: '',
      docName: '',
      version: '',
      checkDate: '',
      checker: '',
      effectivenessStatus: '',
      issueDescription: '',
      solution: '',
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
      // TODO: 调用质量管理API：文件有效性检查
      return true;
    },
    onSave: async (values) => {
      // TODO: 调用质量管理API：文件有效性检查暂存
      return true;
    },
  });

  // 表格配置
  const tableConfig: IEditableTableConfig<EffectivenessRow> = {
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
        title: '有效性状态',
        dataIndex: 'effectivenessStatus',
        key: 'effectivenessStatus',
        width: 120,
      },
      {
        title: '问题描述',
        dataIndex: 'issueDescription',
        key: 'issueDescription',
        width: 150,
      },
      {
        title: '解决方案',
        dataIndex: 'solution',
        key: 'solution',
        width: 150,
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
      <Form.Item label="检查记录">
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
