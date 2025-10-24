'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/auth';
import LoginPageComponent from './LoginPageComponent';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // 检查是否已登录，如果已登录则直接跳转到 home 页面
    if (isAuthenticated()) {
      router.replace('/home');
    }
  }, [router]);

  const handleLoginSuccess = () => {
    // 登录成功后直接跳转到 home 页面，避免循环跳转
    router.replace('/home');
  };

  return <LoginPageComponent onLoginSuccess={handleLoginSuccess} />;
}