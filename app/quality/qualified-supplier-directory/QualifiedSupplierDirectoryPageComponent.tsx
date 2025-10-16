/**
 * 合格供应商和外部服务方名录页面
 */

import React, { useRef } from 'react';
import { Input, Row, Col, Form, DatePicker, message, Typography, Divider } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { EditableTable, FormActions } from '@/components/common';
import { useTableData, useFormSubmit, useRouteMeta, usePageConfig } from '@/hooks';
import type { IEditableTableConfig } from '@/types/form';
import { FieldType } from '@/types/form';

const { Title, Text } = Typography;

type SupplierRow = {
  key: string;
  recordNumber: string;
  supplierName: string;
  address: string;
  contact: string;
  phone: string;
  serviceProject: string;
};

const tableConfig: IEditableTableConfig<SupplierRow> = {
  columns: [
    {
      title: '记录编号',
      dataIndex: 'recordNumber',
      key: 'recordNumber',
      width: 150,
      editable: true,
      inputType: FieldType.Text,
      rules: [
        { required: true, message: '请输入记录编号' },
        { max: 50, message: '记录编号不能超过50个字符' },
        { pattern: /^[A-Z0-9-]+$/, message: '记录编号只能包含大写字母、数字和短横线' },
      ],
    },
    {
      title: '供应商名称',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 150,
      editable: true,
      inputType: FieldType.Text,
      rules: [
        { required: true, message: '请输入供应商名称' },
        { min: 2, message: '供应商名称至少2个字符' },
        { max: 100, message: '供应商名称不能超过100个字符' },
        { whitespace: true, message: '供应商名称不能为空格' },
      ],
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 150,
      editable: true,
      inputType: FieldType.Text,
      rules: [
        { max: 200, message: '地址不能超过200个字符' },
        { whitespace: true, message: '地址不能为空格' },
      ],
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
      width: 150,
      editable: true,
      inputType: FieldType.Text,
      rules: [
        { max: 50, message: '联系人姓名不能超过50个字符' },
        { pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/, message: '联系人姓名只能包含中文、英文和空格' },
      ],
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      editable: true,
      inputType: FieldType.Text,
      rules: [
        { 
          pattern: /^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8}|\d{3,4}-?\d{7,8})$/, 
          message: '请输入正确的手机号码或固定电话' 
        },
      ],
    },
    {
      title: '服务/供应项目',
      dataIndex: 'serviceProject',
      key: 'serviceProject',
      width: 200,
      editable: true,
      inputType: FieldType.Text,
      rules: [
        { max: 200, message: '服务/供应项目不能超过200个字符' },
        { whitespace: true, message: '服务/供应项目不能为空格' },
      ],
    },
  ],
  showActions: true,
  enableAdd: true,
  enableDelete: true,
  enableBatchImport: true,
  maxRows: 50,
  minRows: 1,
};

export default function QualifiedSupplierDirectoryPage() {
  const [form] = Form.useForm();
  
  // 从路由配置获取页面元信息
  const routeMeta = useRouteMeta();
  usePageConfig(routeMeta);
  
  // 使用useRef来保持key计数器的稳定性
  const keyCounterRef = React.useRef(0);

  // 创建默认行数据
  const createDefaultRow = (): SupplierRow => {
    keyCounterRef.current += 1;
    return {
      key: `supplier_${keyCounterRef.current}`,
      recordNumber: '',
      supplierName: '',
      address: '',
      contact: '',
      phone: '',
      serviceProject: '',
    };
  };

  // 表格数据管理
  const { dataSource, setDataSource } = useTableData<SupplierRow>({
    createDefaultRow,
    initialData: [createDefaultRow()], // 初始化一行数据
    minRows: 1,
    maxRows: 50,
  });

  // 表单提交处理
  const { submitting, saving, handleSubmit, handleSave } = useFormSubmit({
    form,
    onSubmit: async (values) => {
      // 验证表格数据
      if (!dataSource || dataSource.length === 0) {
        throw new Error('请至少添加一条供应商记录');
      }

      // 验证表格数据的必填字段
      const invalidRows = dataSource.filter(row => 
        !row.recordNumber || !row.supplierName
      );
      
      if (invalidRows.length > 0) {
        throw new Error('请完善表格中的必填字段（记录编号、供应商名称）');
      }

      // 格式化日期
      const formattedValues = {
        ...values,
        compileDate: values.compileDate?.format('YYYY-MM-DD'),
      };

      // 合并表格数据和表单数据
      const formData = {
        ...formattedValues,
        suppliers: dataSource,
        recordNumber: 'SZD-STL-15-02-2019', // 固定记录编号
        status: 'submitted',
        submitTime: new Date().toISOString(),
      };
      
      console.log('提交数据:', formData);
      
      // 这里可以调用API提交数据
      // await submitSupplierDirectory(formData);
      
      return true;
    },
    onSave: async (values) => {
      // 格式化日期
      const formattedValues = {
        ...values,
        compileDate: values.compileDate?.format('YYYY-MM-DD'),
      };

      // 合并表格数据和表单数据
      const formData = {
        ...formattedValues,
        suppliers: dataSource,
        recordNumber: 'SZD-STL-15-02-2019', // 固定记录编号
        status: 'draft',
        saveTime: new Date().toISOString(),
      };
      
      console.log('暂存数据:', formData);
      
      // 这里可以调用API暂存数据
      // await saveSupplierDirectory(formData);
      
      return true;
    },
  });

  // 批量导入处理
  const handleImport = () => {
    // TODO: 实现批量导入功能
    console.log('批量导入供应商数据');
  };

  return (
    <BaseFormPage form={form} onFinish={handleSubmit}>

      <Row gutter={24}>
        <Col span={24}>
          <Form.Item label="数据记录">
            <EditableTable
              dataSource={dataSource}
              onChange={setDataSource}
              config={tableConfig}
              createDefaultRow={createDefaultRow}
              showAddButton
              showImportButton
              onImport={handleImport}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* 备注区域 */}
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Form.Item 
            label="备注" 
            name="remark"
            rules={[
              { max: 500, message: '备注不能超过500个字符' },
              { whitespace: true, message: '备注不能为空格' },
            ]}
          >
            <Input.TextArea
              placeholder="以上合格供应商和外部服务方名录，评价合格后方可纳入合格名录"
              autoSize={{ minRows: 3, maxRows: 6 }}
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* 编制人和编制日期 */}
      <Row gutter={24} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Form.Item 
            label="编制人" 
            name="compiler" 
            rules={[
              { required: true, message: '请输入编制人' },
              { max: 50, message: '编制人姓名不能超过50个字符' },
              { pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/, message: '编制人姓名只能包含中文、英文和空格' },
            ]}
          >
            <Input placeholder="请输入编制人" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item 
            label="编制日期" 
            name="compileDate" 
            rules={[
              { required: true, message: '请选择编制日期' },
            ]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择编制日期" />
          </Form.Item>
        </Col>
      </Row>

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