'use client';

import React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import type Entity from '@ant-design/cssinjs/es/Cache';

/**
 * Ant Design 样式注册器
 * 用于在服务端渲染时提取样式并注入到 HTML，防止 FOUC (Flash of Unstyled Content)
 */
export default function AntdRegistry({ children }: { children: React.ReactNode }) {
  const cache = React.useMemo<Entity>(() => createCache(), []);

  useServerInsertedHTML(() => {
    const styleText = extractStyle(cache, true);
    
    // 只在有样式内容时插入
    if (!styleText) {
      return null;
    }

    return (
      <style
        id="antd-css"
        dangerouslySetInnerHTML={{ __html: styleText }}
      />
    );
  });

  return (
    <StyleProvider cache={cache} hashPriority="high">
      {children}
    </StyleProvider>
  );
}

