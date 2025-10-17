/**
 * 人员培训记录页面
 */

import React, { useRef } from 'react';
import { Form } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { EditableTable, FormActions } from '@/components/common';
import { useTableData, useFormSubmit, useRouteMeta } from '@/hooks';
import type { IEditableTableConfig } from '@/types/form';

type TrainingRecordRow = {
  key: string;
  trainingName: string;
  trainingType: string;
  startDate: string;
  endDate: string;
  duration: string;
  trainer: string;
  score: string;
  result: string;
  remark: string;
};

export default function PersonnelTrainingRecordPage() {
  const keyCounter = useRef(0);

  // 从路由派生页面元信息并写入全局（单一数据源）
  useRouteMeta();

  // 培训记录表格
  const { dataSource, setDataSource, createDefaultRow } = useTableData<TrainingRecordRow>({
    createDefaultRow: () => ({
      key: `item_${++keyCounter.current}`,
      trainingName: '',
      trainingType: '',
      startDate: '',
      endDate: '',
      duration: '',
      trainer: '',
      score: '',
      result: '',
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
      // TODO: 调用人员管理API：培训记录
      return true;
    },
    onSave: async (values) => {
      // TODO: 调用人员管理API：培训记录暂存
      return true;
    },
  });

  // 表格配置
  const tableConfig: IEditableTableConfig<TrainingRecordRow> = {
    columns: [
      {
        title: '培训名称',
        dataIndex: 'trainingName',
        key: 'trainingName',
        width: 150,
      },
      {
        title: '培训类型',
        dataIndex: 'trainingType',
        key: 'trainingType',
        width: 120,
      },
      {
        title: '开始日期',
        dataIndex: 'startDate',
        key: 'startDate',
        width: 120,
      },
      {
        title: '结束日期',
        dataIndex: 'endDate',
        key: 'endDate',
        width: 120,
      },
      {
        title: '培训时长',
        dataIndex: 'duration',
        key: 'duration',
        width: 100,
      },
      {
        title: '培训师',
        dataIndex: 'trainer',
        key: 'trainer',
        width: 100,
      },
      {
        title: '成绩',
        dataIndex: 'score',
        key: 'score',
        width: 80,
      },
      {
        title: '结果',
        dataIndex: 'result',
        key: 'result',
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
      <Form.Item label="培训记录">
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