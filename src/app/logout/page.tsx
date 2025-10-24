'use client';

import React, { useEffect } from 'react';
import { Typography, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { authManager } from '@/utils/auth';

const { Text } = Typography;

const LogoutPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await authManager.logout();
      } finally {
        router.replace('/login');
      }
    };
    doLogout();
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Spin />
        <div style={{ marginTop: 12 }}>
          <Text type="secondary">正在退出登录...</Text>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;