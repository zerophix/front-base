/**
 * 人员一览表页面
 */

import React from 'react';
import { Form, Input, Upload, Button } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { EditableTable, FormActions } from '@/components/common';
import { useTableData, useFormSubmit } from '@/hooks';
import type { IPersonnel } from '@/types/personnel';
import type { IEditableTableConfig } from '@/types/form';

type PersonnelRow = IPersonnel & { key: string };

export default function PersonnelListPage() {
  const [form] = Form.useForm();
  
  // 使用表格数据管理Hook
  const {
    dataSource,
    setDataSource,
    createDefaultRow,
  } = useTableData<PersonnelRow>({
    createDefaultRow: () => ({
      key: `${Date.now()}`,
      certNo: '',
      name: '',
      department: '',
      mainProject: '',
      testingProject: '',
      remark: '',
      photo: '',
    }),
    initialData: [{
      key: '1',
      certNo: '',
      name: '',
      department: '',
      mainProject: '',
      testingProject: '',
      remark: '',
      photo: '',
    }],
  });

  // 使用表单提交Hook
  const { submitting, saving, handleSubmit, handleSave } = useFormSubmit({
    form,
    onSubmit: async (values) => {
      console.log('提交:', { ...values, dataSource });
      return true;
    },
    onSave: async (values) => {
      console.log('暂存:', { ...values, dataSource });
      return true;
    },
  });

  // 表格配置
  const tableConfig: IEditableTableConfig<PersonnelRow> = {
    columns: [
      {
        title: '上岗证编号',
        dataIndex: 'certNo',
        key: 'certNo',
        width: 150,
        editable: true,
      },
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        width: 120,
        editable: true,
      },
      {
        title: '部门',
        dataIndex: 'department',
        key: 'department',
        width: 200,
        editable: true,
      },
      {
        title: '主要从事项目',
        dataIndex: 'mainProject',
        key: 'mainProject',
        width: 150,
        editable: true,
      },
      {
        title: '检测项目',
        dataIndex: 'testingProject',
        key: 'testingProject',
        width: 150,
        editable: true,
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        width: 150,
        editable: true,
      },
      {
        title: '照片',
        dataIndex: 'photo',
        key: 'photo',
        width: 100,
        render: () => (
          <Upload>
            <Button size="small">上传</Button>
          </Upload>
        ),
      },
    ],
    showDragHandle: true,
    showActions: true,
    enableAdd: true,
    enableBatchImport: true,
  };

  return (
    <BaseFormPage form={form} onFinish={handleSubmit}>
      <Form.Item label="人员所属分级">
        <EditableTable
          dataSource={dataSource}
          onChange={setDataSource}
          config={tableConfig}
          createDefaultRow={createDefaultRow}
          onImport={() => console.log('批量导入')}
          tableProps={{ scroll: { y: 600 } }}
        />
      </Form.Item>

      <div style={{ margin: '16px 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
        说明：根据项目情况及部门配置时材料提供放置相似人员信息。
      </div>

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
