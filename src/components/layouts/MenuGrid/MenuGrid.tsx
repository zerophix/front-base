import React from 'react';
import Link from 'next/link';
import styles from './MenuGrid.module.css';

export interface MenuCardItem {
  title: string;
  description?: string; // 可选
  href: string;         // 改为 href
  icon?: string | React.ReactNode;
}

export interface MenuGridProps {
  items: MenuCardItem[];
  columns?: 'auto' | 2 | 3 | 4;
}

/**
 * 通用菜单网格组件
 * 用于展示卡片式菜单导航
 */
export const MenuGrid: React.FC<MenuGridProps> = ({ 
  items,
  columns = 'auto'
}) => {
  const getGridClass = () => {
    switch (columns) {
      case 2:
        return styles.grid2;
      case 3:
        return styles.grid3;
      case 4:
        return styles.grid4;
      default:
        return styles.gridAuto;
    }
  };

  return (
    <div className={`${styles.menuGrid} ${getGridClass()}`}>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={styles.menuCard} prefetch={false}>
          {item.icon && (
            <div className={styles.cardIcon}>
              {typeof item.icon === 'string' ? item.icon : item.icon}
            </div>
          )}
          <div className={styles.cardTitle}>{item.title}</div>
          {item.description && (
            <div className={styles.cardDesc}>{item.description}</div>
          )}
        </Link>
      ))}
    </div>
  );
};

