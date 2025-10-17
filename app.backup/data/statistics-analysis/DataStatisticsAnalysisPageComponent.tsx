/**
 * 数据统计分析页面
 */

import React, { useRef } from 'react';
import { Form } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { EditableTable, FormActions } from '@/components/common';
import { useTableData, useFormSubmit } from '@/hooks';
import type { IEditableTableConfig } from '@/types/form';

type StatisticsRow = {
  key: string;
  indicator: string;
  category: string;
  value: string;
  unit: string;
  period: string;
  trend: string;
  remark: string;
};

export default function DataStatisticsAnalysisPage() {
  const keyCounter = useRef(0);

  // 统计数据表格
  const { dataSource, setDataSource, createDefaultRow } = useTableData<StatisticsRow>({
    createDefaultRow: () => ({
      key: `item_${++keyCounter.current}`,
      indicator: '',
      category: '',
      value: '',
      unit: '',
      period: '',
      trend: '',
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
        statistics: dataSource,
      };
      // TODO: 调用数据管理API：统计分析
      return true;
    },
    onSave: async (values) => {
      // TODO: 调用数据管理API：统计分析暂存
      return true;
    },
  });

  // 表格配置
  const tableConfig: IEditableTableConfig<StatisticsRow> = {
    columns: [
      {
        title: '指标名称',
        dataIndex: 'indicator',
        key: 'indicator',
        width: 150,
      },
      {
        title: '分类',
        dataIndex: 'category',
        key: 'category',
        width: 120,
      },
      {
        title: '数值',
        dataIndex: 'value',
        key: 'value',
        width: 100,
      },
      {
        title: '单位',
        dataIndex: 'unit',
        key: 'unit',
        width: 80,
      },
      {
        title: '统计周期',
        dataIndex: 'period',
        key: 'period',
        width: 120,
      },
      {
        title: '趋势',
        dataIndex: 'trend',
        key: 'trend',
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
      <Form.Item label="统计数据">
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
