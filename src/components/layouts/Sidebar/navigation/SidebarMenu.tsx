'use client';

import React, { useMemo, useCallback, useEffect } from 'react';
import { Menu } from 'antd';
import { ScrollArea } from '@/components/common';
import styles from './SidebarMenu.module.css';

interface SidebarMenuProps {
  items: any[];
  selectedKey: string;
  openKeys: readonly string[];
  onOpenChange: (keys: readonly string[]) => void;
  collapsed: boolean;
  onItemClick: (key: string) => void;
}

const SidebarMenuComponent: React.FC<SidebarMenuProps> = ({
  items,
  selectedKey,
  openKeys,
  onOpenChange,
  collapsed,
  onItemClick,
}) => {
  // 清理内存泄漏
  useEffect(() => {
    return () => {
      // 清理事件监听器
      // 示例：document.removeEventListener('event', handler);
    };
  }, []);
  // 手风琴模式的openChange处理
  const handleOpenChange = useCallback((keys: string[]) => {
    if (!collapsed) {
      // 手风琴模式：只允许一个子菜单展开
      const latestOpenKey = keys.find(key => !openKeys.includes(key));
      if (latestOpenKey) {
        // 如果有新打开的key，只保留这一个
        onOpenChange([latestOpenKey]);
      } else {
        // 如果是关闭操作，直接使用新的keys
        onOpenChange(keys);
      }
    } else {
      // 折叠状态：正常处理
      onOpenChange(keys);
    }
  }, [collapsed, openKeys, onOpenChange]);

  // 优化折叠状态下的交互逻辑
  const handleMenuClick = useCallback((info: any) => {
    const key = String(info.key);
    
    // 在折叠状态下，如果点击的是有子菜单的项目，直接导航到该项目的路径
    if (collapsed) {
      // 查找对应的菜单项
      const findMenuItem = (items: any[], targetKey: string): any => {
        for (const item of items) {
          if (item.key === targetKey) return item;
          if (item.children) {
            const found = findMenuItem(item.children, targetKey);
            if (found) return found;
          }
        }
        return null;
      };
      
      const menuItem = findMenuItem(items, key);
      
      // 如果是有子菜单的项目，导航到该项目的主路径
      if (menuItem && menuItem.children && menuItem.children.length > 0) {
        onItemClick(key);
        return;
      }
    }
    
    // 其他情况使用默认行为
    onItemClick(key);
  }, [onItemClick, collapsed, items]);



  // 处理弹出框滚动事件隔离
  useEffect(() => {
    const handlePopupScroll = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      const popup = target.closest('.custom-submenu-popup');
      
      if (popup) {
        const menuContainer = popup.querySelector('.ant-menu');
        if (menuContainer) {
          const { scrollTop, scrollHeight, clientHeight } = menuContainer;
          
          // 如果滚动到顶部或底部，阻止事件传播
          if (
            (e.deltaY < 0 && scrollTop === 0) ||
            (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight)
          ) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };

    // 添加全局滚动事件监听
    document.addEventListener('wheel', handlePopupScroll, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', handlePopupScroll);
    };
  }, []);

  // 使用useMemo缓存Menu的props，减少重渲染
  const menuProps = useMemo(() => {
    const baseProps = {
      mode: "inline" as const,
      inlineCollapsed: collapsed,
      selectedKeys: [selectedKey],
      // 当折叠时，让 AntD 自行管理打开项，避免警告
      openKeys: collapsed ? undefined : [...openKeys] as string[],
      onOpenChange: collapsed ? undefined : (keys: string[]) => handleOpenChange(keys),
      items: items as any,
      motion: { motionAppear: false, motionEnter: false, motionLeave: false },
      onClick: handleMenuClick,
    };
    return baseProps;
  }, [collapsed, selectedKey, openKeys, handleOpenChange, items, handleMenuClick]);
  return (
    <ScrollArea 
      className={collapsed ? styles.menuCollapsed : styles.menu}
      data-accordion={true}
    >
      <Menu {...menuProps} />
    </ScrollArea>
  );
};

// 浅比较数组的辅助函数
const shallowEqual = (arr1: readonly string[], arr2: readonly string[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item === arr2[index]);
};

// 使用React.memo优化性能，只在props真正变化时重渲染
export const SidebarMenu = React.memo(SidebarMenuComponent, (prevProps, nextProps) => {
  return (
    prevProps.collapsed === nextProps.collapsed &&
    prevProps.selectedKey === nextProps.selectedKey &&
    shallowEqual(prevProps.openKeys, nextProps.openKeys) &&
    prevProps.items === nextProps.items &&
    prevProps.onOpenChange === nextProps.onOpenChange &&
    prevProps.onItemClick === nextProps.onItemClick
  );
});