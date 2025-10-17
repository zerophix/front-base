/**
 * 仪器设备检校记录表页面
 */

import React from 'react';
import { Form, Input, DatePicker, Row, Col } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { EditableTable, FormActions } from '@/components/common';
import { useTableData, useFormSubmit } from '@/hooks';
import type { IEquipmentCalibration, ICalibrationRecord } from '@/types/equipment';
import type { IEditableTableConfig } from '@/types/form';

type CalibrationRow = ICalibrationRecord & { key: string };

export default function EquipmentCalibrationPage() {
  const [form] = Form.useForm();

  // 检校记录表格
  const { dataSource, setDataSource, createDefaultRow } = useTableData<CalibrationRow>({
    createDefaultRow: () => ({
      key: `${Date.now()}`,
      itemName: '',
      unit: '',
      measured: '',
      allowed: '',
      actual: '',
      verdict: '',
    }),
    initialData: [{
      key: '1',
      itemName: '',
      unit: '',
      measured: '',
      allowed: '',
      actual: '',
      verdict: '',
    }],
  });

  // 表单提交
  const { submitting, saving, handleSubmit, handleSave } = useFormSubmit({
    form,
    onSubmit: async (values) => {
      const data: Partial<IEquipmentCalibration> = {
        ...values,
        records: dataSource,
      };
      console.log('提交:', data);
      return true;
    },
    onSave: async (values) => {
      console.log('暂存:', values);
      return true;
    },
  });

  // 表格配置
  const tableConfig: IEditableTableConfig<CalibrationRow> = {
    columns: [
      {
        title: '名称',
        dataIndex: 'itemName',
        key: 'itemName',
        render: (_: string, record: CalibrationRow, index: number) => (
          <Input
            value={record.itemName}
            onChange={(e) => {
              const newData = [...dataSource];
              newData[index].itemName = e.target.value;
              setDataSource(newData);
            }}
          />
        ),
      },
      {
        title: '校准单位',
        dataIndex: 'unit',
        key: 'unit',
        render: (_: string, record: CalibrationRow, index: number) => (
          <Input
            value={record.unit}
            onChange={(e) => {
              const newData = [...dataSource];
              newData[index].unit = e.target.value;
              setDataSource(newData);
            }}
          />
        ),
      },
      {
        title: '测量值',
        dataIndex: 'measured',
        key: 'measured',
        render: (_: string, record: CalibrationRow, index: number) => (
          <Input
            value={record.measured}
            onChange={(e) => {
              const newData = [...dataSource];
              newData[index].measured = e.target.value;
              setDataSource(newData);
            }}
          />
        ),
      },
      {
        title: '允许值',
        dataIndex: 'allowed',
        key: 'allowed',
        render: (_: string, record: CalibrationRow, index: number) => (
          <Input
            value={record.allowed}
            onChange={(e) => {
              const newData = [...dataSource];
              newData[index].allowed = e.target.value;
              setDataSource(newData);
            }}
          />
        ),
      },
      {
        title: '实际值',
        dataIndex: 'actual',
        key: 'actual',
        render: (_: string, record: CalibrationRow, index: number) => (
          <Input
            value={record.actual}
            onChange={(e) => {
              const newData = [...dataSource];
              newData[index].actual = e.target.value;
              setDataSource(newData);
            }}
          />
        ),
      },
      {
        title: '判定',
        dataIndex: 'verdict',
        key: 'verdict',
        render: (_: string, record: CalibrationRow, index: number) => (
          <Input
            value={record.verdict}
            onChange={(e) => {
              const newData = [...dataSource];
              newData[index].verdict = e.target.value;
              setDataSource(newData);
            }}
          />
        ),
      },
    ],
    showDragHandle: true,
    showActions: true,
  };

  return (
    <BaseFormPage form={form} onFinish={handleSubmit}>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="设备名称" name="equipmentName" rules={[{ required: true }]}> 
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="设备编号" name="equipmentCode" rules={[{ required: true }]}> 
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="型号规格" name="model" rules={[{ required: true }]}> 
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="生产厂家" name="manufacturer" rules={[{ required: true }]}> 
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={8}>
          <Form.Item label="校准日期" name="calibrationDate" rules={[{ required: true }]}> 
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="下次校准日期" name="nextDate" rules={[{ required: true }]}> 
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="校准方法" name="method" rules={[{ required: true }]}> 
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="检校记录">
        <EditableTable
          dataSource={dataSource}
          onChange={setDataSource}
          config={tableConfig}
          createDefaultRow={createDefaultRow}
        />
      </Form.Item>

      <Form.Item label="备注" name="remark">
        <Input.TextArea placeholder="请输入" autoSize={{ minRows: 3, maxRows: 6 }} />
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