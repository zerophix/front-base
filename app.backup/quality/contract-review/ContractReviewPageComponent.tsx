/**
 * 合同评审表页面
 */

import React, { useRef } from 'react';
import { Input, Select, Row, Col, Form } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { EditableTable, FormActions } from '@/components/common';
import { useTableData, useFormSubmit } from '@/hooks';
import type { IEditableTableConfig } from '@/types/form';

type ClientRequirementRow = {
  key: string;
  requirement: string;
  content: string;
};

export default function ContractReviewPage() {
  const keyCounter = useRef(0);
  const [form] = Form.useForm();

  // 委托方要求表格
  const { dataSource, setDataSource, createDefaultRow } = useTableData<ClientRequirementRow>({
    createDefaultRow: () => ({
      key: `item_${++keyCounter.current}`,
      requirement: '',
      content: '',
    }),
    initialData: [],
  });

  // 表单提交
  const { submitting, saving, handleSubmit, handleSave } = useFormSubmit({
    form,
    onSubmit: async (values) => {
      const data = {
        ...values,
        requirements: dataSource,
      };
      // TODO: 调用质量管理API：合同评审
      return true;
    },
    onSave: async (values) => {
      // TODO: 调用质量管理API：合同评审暂存
      return true;
    },
  });

  // 表格配置
  const tableConfig: IEditableTableConfig<ClientRequirementRow> = {
    columns: [
      {
        title: '相关要求',
        dataIndex: 'requirement',
        key: 'requirement',
        width: 200,
      },
      {
        title: '具体内容',
        dataIndex: 'content',
        key: 'content',
        width: 300,
      },
    ],
    showDragHandle: true,
    showActions: true,
  };

  return (
    <BaseFormPage form={form} onFinish={handleSubmit}>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="合同名称" name="contractName" rules={[{ required: true }]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="合同编号" name="contractNumber" rules={[{ required: true }]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="委托方名称" name="clientName" rules={[{ required: true }]}>
            <Select placeholder="请选择" options={[
              { label: '委托方A', value: 'clientA' },
              { label: '委托方B', value: 'clientB' },
              { label: '委托方C', value: 'clientC' },
            ]} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="合同类别" name="contractType" rules={[{ required: true }]}>
            <Select placeholder="请选择" options={[
              { label: '检测合同', value: 'testing' },
              { label: '咨询合同', value: 'consulting' },
              { label: '培训合同', value: 'training' },
            ]} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="委托方联系人" name="clientContact" rules={[{ required: true }]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="联系电话" name="contactPhone" rules={[{ required: true }]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="委托方要求">
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

      <Form.Item label="综合评审结论" name="reviewConclusion" rules={[{ required: true }]}>
        <Input.TextArea
          placeholder="请输入"
          autoSize={{ minRows: 4, maxRows: 8 }}
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
