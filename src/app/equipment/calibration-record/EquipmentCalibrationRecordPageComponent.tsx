/**
 * 设备校准记录页面
 */

import React, { useRef } from 'react';
import { Form } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { EditableTable, FormActions } from '@/components/common';
import { useTableData, useFormSubmit, useRouteMeta } from '@/hooks';
import type { IEditableTableConfig } from '@/types/form';

type CalibrationRecordRow = {
  key: string;
  itemName: string;
  unit: string;
  measured: string;
  allowed: string;
  actual: string;
  verdict: string;
};

export default function EquipmentCalibrationRecordPage() {
  const keyCounter = useRef(0);
  const [form] = Form.useForm();

  // 从路由派生页面元信息并写入全局（单一数据源）
  useRouteMeta();

  // 校准记录表格
  const { dataSource, setDataSource, createDefaultRow } = useTableData<CalibrationRecordRow>({
    createDefaultRow: () => ({
      key: `item_${++keyCounter.current}`,
      itemName: '',
      unit: '',
      measured: '',
      allowed: '',
      actual: '',
      verdict: '',
    }),
    initialData: [],
  });

  // 表单提交
  const { submitting, saving, handleSubmit, handleSave } = useFormSubmit({
    form,
    onSubmit: async (values) => {
      const data = {
        ...values,
        records: dataSource,
      };
      // TODO: 调用设备管理API：校准记录
      return true;
    },
    onSave: async (values) => {
      // TODO: 调用设备管理API：校准记录暂存
      return true;
    },
  });

  // 表格配置
  const tableConfig: IEditableTableConfig<CalibrationRecordRow> = {
    columns: [
      {
        title: '名称',
        dataIndex: 'itemName',
        key: 'itemName',
        width: 150,
      },
      {
        title: '校准单位',
        dataIndex: 'unit',
        key: 'unit',
        width: 120,
      },
      {
        title: '测量值',
        dataIndex: 'measured',
        key: 'measured',
        width: 120,
      },
      {
        title: '允许值',
        dataIndex: 'allowed',
        key: 'allowed',
        width: 120,
      },
      {
        title: '实际值',
        dataIndex: 'actual',
        key: 'actual',
        width: 120,
      },
      {
        title: '判定',
        dataIndex: 'verdict',
        key: 'verdict',
        width: 100,
      },
    ],
    showDragHandle: true,
    showActions: true,
  };

  return (
    <BaseFormPage onFinish={handleSubmit}>
      <Form.Item label="校准记录">
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
