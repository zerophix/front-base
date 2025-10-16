import React from 'react';
import { Breadcrumb } from '@/components/common';
import styles from './PageContainer.module.css';

export interface PageContainerProps {
  children?: React.ReactNode;
  breadcrumbItems?: Array<{
    label: string;
    href?: string;
  }>;
  title?: string;
  className?: string;
  /** 控制是否显示标题，默认 true */
  showTitle?: boolean;
}

/**
 * 通用页面容器组件
 * 提供标准的页面布局：面包屑 + 内容区域
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  breadcrumbItems,
  title,
  className = '',
  showTitle = true,
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <Breadcrumb items={breadcrumbItems} />
      )}
      
      <div className={styles.content}>
        {showTitle && title && <h2 className={styles.title}>{title}</h2>}
        {children}
      </div>
    </div>
  );
};

