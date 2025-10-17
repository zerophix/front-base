'use client';

import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { initCsrfProtection } from '@/utils';

// 初始化增强的CSRF保护
if (typeof window !== 'undefined') {
  initCsrfProtection();
}

export function AntdProvider({ children }: { children: React.ReactNode }) {

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 4,
          fontSize: 14,
        },
        components: {
          Form: {
            labelFontSize: 14,
          },
          Input: {
            activeBorderColor: '#1890ff',
            hoverBorderColor: '#40a9ff',
          },
          Select: {
            optionSelectedBg: 'var(--color-bg-highlight)',
            optionActiveBg: 'var(--color-bg-muted)',
          },
          Button: {
            colorPrimary: '#1890ff',
            colorPrimaryHover: '#40a9ff',
            colorPrimaryActive: '#096dd9',
          },
          Table: {
            headerBg: 'var(--table-header-bg)',
            headerColor: '#595959',
            borderColor: 'var(--table-border-color)',
            rowHoverBg: 'var(--color-bg-muted)',
          },
          Menu: {
            itemSelectedBg: 'transparent', // 移除选中状态的背景色
            itemSelectedColor: '#1890ff', // 保持选中状态的文字颜色
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
      {children}
    </ConfigProvider>
  );
}

