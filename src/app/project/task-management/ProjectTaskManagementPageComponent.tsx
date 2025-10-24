/**
 * 项目任务管理页面
 */

import React, { useRef } from 'react';
import { Form } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { EditableTable, FormActions } from '@/components/common';
import { useTableData, useFormSubmit } from '@/hooks';
import type { IEditableTableConfig } from '@/types/form';

type TaskRow = {
  key: string;
  taskName: string;
  taskType: string;
  priority: string;
  assignee: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: string;
  remark: string;
};

export default function ProjectTaskManagementPage() {
  const [form] = Form.useForm();
  
  const { dataSource, setDataSource, createDefaultRow } = useTableData<TaskRow>({
    createDefaultRow: () => ({
      key: Date.now().toString(),
      taskName: '',
      taskType: '',
      priority: '',
      assignee: '',
      startDate: '',
      endDate: '',
      status: '',
      progress: '',
      remark: '',
    }),
    initialData: [],
  });

  // 表单提交
  const { submitting, saving, handleSubmit, handleSave } = useFormSubmit({
    form,
    onSubmit: async (values) => {
      const data = {
        ...values,
        tasks: dataSource,
      };
      // TODO: 调用项目管理API：任务管理
      return true;
    },
    onSave: async (values) => {
      // TODO: 调用项目管理API：任务管理暂存
      return true;
    },
  });

  // 表格配置
  const tableConfig: IEditableTableConfig<TaskRow> = {
    columns: [
      {
        title: '任务名称',
        dataIndex: 'taskName',
        key: 'taskName',
        width: 150,
      },
      {
        title: '任务类型',
        dataIndex: 'taskType',
        key: 'taskType',
        width: 120,
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
        width: 100,
      },
      {
        title: '负责人',
        dataIndex: 'assignee',
        key: 'assignee',
        width: 100,
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
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
      },
      {
        title: '进度',
        dataIndex: 'progress',
        key: 'progress',
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
      <Form.Item label="任务列表">
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
