'use client';

import React, { useState } from 'react';
import { Card, Typography, Divider, message, Alert, Button } from 'antd';
import LoginForm from '@/components/auth/LoginForm';
import type { LoginFormValues } from '@/components/auth/LoginForm';
import { authManager } from '@/utils/auth';
import WeChatLoginModal from '@/components/auth/WeChatLoginModal';

const { Title, Text } = Typography;

interface LoginPageComponentProps {
  onLoginSuccess: () => void;
}

const getFriendlyLoginError = (raw: string) => {
  const lower = raw.toLowerCase();
  if (lower.includes('bad credentials') || lower.includes('认证失败') || (lower.includes('账号') && lower.includes('密码'))) {
    return { title: '账号或密码错误', desc: '请确认输入无误，如忘记密码可点击"忘记密码"。' };
  }
  if (lower.includes('网络异常') || lower.includes('failed to fetch')) {
    return { title: '网络异常', desc: '网络不稳定或后端不可达，请稍后再试。' };
  }
  if (lower.includes('服务器繁忙') || /请求失败\(5\d{2}\)/.test(raw)) {
    return { title: '服务器繁忙', desc: '服务暂不可用，请稍后再试。' };
  }
  if (lower.includes('服务不可用') || lower.includes('404')) {
    return { title: '服务不可用', desc: '接口地址不可用或已下线，请联系管理员。' };
  }
  if (lower.includes('后端地址未配置') || lower.includes('next_public_api_base_url')) {
    return { title: '系统配置缺失', desc: '后端地址未配置，请联系维护人员。' };
  }
  return { title: '登录失败', desc: raw || '系统繁忙，请稍后再试。' };
};

const LoginPageComponent: React.FC<LoginPageComponentProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [wechatVisible, setWechatVisible] = useState(false);

  const handleSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    setLoading(true);
    try {
      const state = await authManager.login(values.username, values.password);
      message.success('登录成功');
      if (values.remember) {
        localStorage.setItem('remember_username', values.username);
      } else {
        localStorage.removeItem('remember_username');
      }
      onLoginSuccess();
    } catch (error: any) {
      const msg = error?.message || '登录失败';
      setFormError(msg);
      const f = getFriendlyLoginError(msg);
      message.error(f.title);
    } finally {
      setLoading(false);
    }
  };

  const enableWeChat = process.env.NEXT_PUBLIC_ENABLE_WECHAT_LOGIN === 'true';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff'
    }}>
      <Card style={{ width: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ marginBottom: 4 }}>登录</Title>
          <Text type="secondary">欢迎回来，请输入您的账户信息</Text>
        </div>

        {formError && (() => {
          const f = getFriendlyLoginError(formError);
          return (
            <Alert
              type="error"
              showIcon
              message={f.title}
              description={f.desc}
              style={{ marginBottom: 16 }}
            />
          );
        })()}

        <LoginForm onSubmit={handleSubmit} loading={loading} />

        {enableWeChat && (
          <>
            <Divider plain>其他登录方式</Divider>
            <Button block onClick={() => setWechatVisible(true)}>
              微信登录
            </Button>
          </>
        )}
      </Card>

      {enableWeChat && (
        <WeChatLoginModal
          visible={wechatVisible}
          onClose={() => setWechatVisible(false)}
          onSuccess={async (token?: string) => {
            if (token) {
              try {
                await authManager.loginWithToken(String(token), 'wechat');
              } catch (e) {
                message.error('保存登录状态失败');
                return;
              }
            }
            message.success('微信登录成功');
            setWechatVisible(false);
            onLoginSuccess();
          }}
        />
      )}
    </div>
  );
};

export default LoginPageComponent;