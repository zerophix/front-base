"use client";

import React, { useEffect } from 'react';
import { ConfigProvider, App } from 'antd';
import zhCN from 'antd/locale/zh_CN';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  // 暂时禁用 CSRF 初始化，避免 SSR 兼容性问题
  useEffect(() => {
    // TODO: 重新启用 CSRF 保护
    /*
    if (typeof window !== 'undefined') {
      (async () => {
        const { initCsrfProtection } = await import('@/utils/security');
        initCsrfProtection();
      })();
    }
    */
  }, []);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: 'var(--color-primary)',
          borderRadius: 4,
          fontSize: 14,
        },
        components: {
          Form: {
            labelFontSize: 14,
          },
          Input: {
            activeBorderColor: 'var(--color-primary)',
            hoverBorderColor: 'var(--color-primary-hover)',
          },
          Select: {
            optionSelectedBg: 'var(--color-bg-highlight)',
            optionActiveBg: 'var(--color-bg-muted)',
          },
          Button: {
            colorPrimary: 'var(--color-primary)',
            colorPrimaryHover: 'var(--color-primary-hover)',
            colorPrimaryActive: 'var(--color-primary-active)',
          },
          Table: {
            headerBg: 'var(--table-header-bg)',
            headerColor: 'var(--color-text-secondary)',
            borderColor: 'var(--table-border-color)',
            rowHoverBg: 'var(--color-bg-muted)',
          },
          Menu: {
            itemSelectedBg: 'transparent', // 移除选中状态的背景色
            itemSelectedColor: 'var(--color-primary)', // 保持选中状态的文字颜色
            itemHoverBg: 'var(--color-bg-muted)', // 悬停时的背景色
            // 修复collapsed状态下图标居中问题
            collapsedIconSize: 16, // 设置collapsed状态下的图标大小
            collapsedWidth: 64, // 设置collapsed状态下的宽度
            iconSize: 16, // 设置正常状态下的图标大小
            // 确保padding计算正确
            itemPaddingInline: 16, // 正常状态下的内边距
          },
        },
      }}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}

