'use client';

import React from 'react';
import { Form, Input, Checkbox, Button, Space, Typography } from 'antd';

export interface LoginFormValues {
  username: string;
  password: string;
  remember?: boolean;
}

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  loading?: boolean;
}

const { Text } = Typography;

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading = false }) => {
  const [form] = Form.useForm<LoginFormValues>();

  const onFinish = (values: LoginFormValues) => {
    onSubmit(values);
  };

  const onFinishFailed = () => {
    // 反馈由父组件处理
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      initialValues={{ remember: true }}
    >
      <Form.Item
        name="username"
        label="用户名"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input placeholder="用户名 / 邮箱 / 手机号" allowClear />
      </Form.Item>

      <Form.Item
        name="password"
        label="密码"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password placeholder="请输入密码" allowClear />
      </Form.Item>

      <Form.Item name="remember" valuePropName="checked">
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Checkbox>记住我</Checkbox>
          <Button type="link">忘记密码？</Button>
        </Space>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          登录
        </Button>
      </Form.Item>

      <Form.Item>
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">没有账号？</Text>
          <Button type="link">注册</Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;