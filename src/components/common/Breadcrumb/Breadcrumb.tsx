'use client';

import React from 'react';
import Link from 'next/link';
import { Breadcrumb as AntdBreadcrumb } from 'antd';
import styles from './Breadcrumb.module.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Tab导航样式的面包屑组件
 * 统一管理所有页面的面包屑导航
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const antdItems = items.map((item, index) => {
    const isLast = index === items.length - 1;
    if (!item.href || isLast) {
      return { title: item.label };
    }
    return { title: <Link href={item.href} prefetch={false}>{item.label}</Link> };
  });

  return (
    <div className={styles.breadcrumb}>
      <AntdBreadcrumb items={antdItems} />
    </div>
  );
};

