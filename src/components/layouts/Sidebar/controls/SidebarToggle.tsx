'use client';

import React from 'react';
import styles from './SidebarToggle.module.css';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

interface SidebarToggleProps {
  collapsed: boolean;
  onToggle: () => void;
}

const SidebarToggleComponent: React.FC<SidebarToggleProps> = ({ collapsed, onToggle }) => {
  return (
    <div className={`${styles.bottomBar} ${collapsed ? styles.bottomBarCollapsed : ''}`}>
      <button
        className={styles.toggleBtn}
        onClick={onToggle}
        aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
        title={collapsed ? '展开侧边栏' : '收起侧边栏'}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </button>
    </div>
  );
};

// 使用React.memo优化性能
export const SidebarToggle = React.memo(SidebarToggleComponent);