import React from 'react';
import { Breadcrumb } from '@/components/common';
import styles from './FormPageContainer.module.css';

export interface FormPageContainerProps {
  children: React.ReactNode;
  breadcrumbItems?: Array<{
    label: string;
    href?: string;
  }>;
  title?: string;
  recordNumber?: string;
  className?: string;
  containerClassName?: string;
  /** 控制是否显示标题，默认 true */
  showTitle?: boolean;
}

/**
 * 表单页面容器组件
 * 提供标准的表单页面布局：面包屑 + 表单标题 + 记录号 + 表单内容
 */
export const FormPageContainer: React.FC<FormPageContainerProps> = ({
  children,
  breadcrumbItems,
  title,
  recordNumber,
  className = '',
  containerClassName = '',
  showTitle = true,
}) => {
  return (
    <div className={`${styles.container} ${containerClassName}`}>
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <Breadcrumb items={breadcrumbItems} />
      )}
      
      <div className={`${styles.formContainer} ${className}`}>
        {showTitle && title && <h2 className={styles.formTitle}>{title}</h2>}
        {recordNumber && <div className={styles.recordNumber}>记录编号：{recordNumber}</div>}
        {children}
      </div>
    </div>
  );
};

