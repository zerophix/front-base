'use client';

import React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs';

/**
 * Ant Design 样式注册器
 * 使用 Next.js 的 useServerInsertedHTML 来处理 SSR 样式注入，彻底避免 FOUC 问题
 * 确保样式在服务端渲染时就被正确注入到 HTML 中
 */
interface AntdRegistryProps {
  children: React.ReactNode;
}

const AntdRegistry: React.FC<AntdRegistryProps> = ({ children }) => {
  const cache = createCache();

  // 使用 Next.js 的 useServerInsertedHTML 确保样式在 SSR 时正确注入
  useServerInsertedHTML(() => {
    const styles = extractStyle(cache, true);
    return (
      <style 
        id="antd-css-in-js" 
        dangerouslySetInnerHTML={{ __html: styles }} 
      />
    );
  });

  return (
    <StyleProvider cache={cache} hashPriority="high">
      {children}
    </StyleProvider>
  );
};

export default AntdRegistry;

