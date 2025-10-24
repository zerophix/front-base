'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/auth';

/**
 * 应用根页面 - 根据认证状态进行路由分发
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // 检查用户是否已登录
    if (isAuthenticated()) {
      // 已登录，跳转到主页
      router.replace('/home');
    } else {
      // 未登录，跳转到登录页
      router.replace('/login');
    }
  }, [router]);

  // 显示加载状态，避免闪烁
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '16px',
      color: '#666'
    }}>
      正在加载...
    </div>
  );
}
