import React from 'react';
import { Form, Input, DatePicker, Select } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { FormActions } from '@/components/common/FormActions/FormActions';

export default function RiskControlFormPage() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    // TODO: 接入实际提交逻辑
    console.log('提交表单: ', values);
  };

  return (
    <BaseFormPage form={form} onFinish={onFinish} layout="vertical">
      <Form.Item name="recordDate" label="记录日期" rules={[{ required: true, message: '请选择记录日期' }]}> 
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="riskLevel" label="风险等级" rules={[{ required: true, message: '请选择风险等级' }]}> 
        <Select
          options={[
            { label: '低', value: 'low' },
            { label: '中', value: 'medium' },
            { label: '高', value: 'high' },
          ]}
        />
      </Form.Item>

      <Form.Item name="description" label="风险描述" rules={[{ required: true, message: '请输入风险描述' }]}> 
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item name="mitigation" label="控制措施" rules={[{ required: true, message: '请输入控制措施' }]}> 
        <Input.TextArea rows={4} />
      </Form.Item>

      <FormActions align="right" />
    </BaseFormPage>
  );
}