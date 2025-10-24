'use client';

import React from 'react';

export default function SimpleTestPage() {
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: 'var(--color-primary, #722ed1)' }}>简单测试页面</h1>
      <p style={{ color: 'var(--color-text, #262626)' }}>
        这是一个最简单的测试页面，用于验证：
      </p>
      <ul>
        <li>React 组件是否正常渲染</li>
        <li>CSS 变量是否生效</li>
        <li>基础样式是否正常</li>
      </ul>
      
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: 'var(--color-bg-muted, #fafafa)',
        borderRadius: 'var(--radius-lg, 8px)',
        border: '1px solid var(--color-border, #e8e8e8)'
      }}>
        <h3 style={{ color: 'var(--color-primary, #722ed1)' }}>CSS 变量测试</h3>
        <p style={{ color: 'var(--color-text-secondary, #8c8c8c)' }}>
          如果你能看到这个区域有背景色和边框，说明 CSS 变量正常工作。
        </p>
      </div>
      
      <button 
        onClick={() => alert('按钮点击正常！')}
        style={{
          marginTop: '20px',
          padding: '8px 16px',
          backgroundColor: 'var(--color-primary, #722ed1)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md, 6px)',
          cursor: 'pointer'
        }}
      >
        测试按钮
      </button>
    </div>
  );
}