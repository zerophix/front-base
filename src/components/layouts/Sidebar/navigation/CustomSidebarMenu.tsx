'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/common';
import styles from './CustomSidebarMenu.module.css';

interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  title?: string;
  children?: MenuItem[];
}

interface CustomSidebarMenuProps {
  items: MenuItem[];
  selectedKey: string;
  onItemClick: (key: string) => void;
}

interface PopupMenuProps {
  items: MenuItem[];
  selectedKey: string;
  onItemClick: (key: string) => void;
  onClose: () => void;
  triggerRect: DOMRect;
}

const PopupMenu: React.FC<PopupMenuProps> = ({
  items, 
  selectedKey, 
  onItemClick, 
  onClose, 
  triggerRect 
}) => {
  // 清理内存泄漏
  useEffect(() => {
    return () => {
      // 清理事件监听器
      // 示例：document.removeEventListener('event', handler);
    };
  }, []);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // 计算弹出菜单位置
  const getPopupStyle = (): React.CSSProperties => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const popupWidth = Math.min(Math.max(240, viewportWidth * 0.3), 420);
    const popupMaxHeight = viewportHeight * 0.8;
    
    let left = triggerRect.right + 8;
    let top = triggerRect.top;

    // 如果右侧空间不够，显示在左侧
    if (left + popupWidth > viewportWidth - 16) {
      left = triggerRect.left - popupWidth - 8;
    }

    // 如果下方空间不够，向上调整
    if (top + popupMaxHeight > viewportHeight - 16) {
      top = Math.max(16, viewportHeight - popupMaxHeight - 16);
    }

    return {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      width: `${popupWidth}px`,
      maxHeight: `${popupMaxHeight}px`,
      zIndex: 1050,
    };
  };

  return (
    <div 
      ref={popupRef}
      className={styles.popupMenu}
      style={getPopupStyle()}
    >
      <ScrollArea className={styles.popupContent}>
        {items.map((item) => (
          <div
            key={item.key}
            className={`${styles.popupMenuItem} ${
              selectedKey === item.key ? styles.popupMenuItemSelected : ''
            }`}
            onClick={() => {
              onItemClick(item.key);
              onClose();
            }}
          >
            {item.icon && <span className={styles.popupMenuIcon}>{item.icon}</span>}
            <span className={styles.popupMenuLabel}>{item.label}</span>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

const CustomSidebarMenu: React.FC<CustomSidebarMenuProps> = ({
  items,
  selectedKey,
  onItemClick,
}) => {
  const [openPopup, setOpenPopup] = useState<string | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const handleMenuItemClick = (item: MenuItem, event: React.MouseEvent) => {
    if (item.children && item.children.length > 0) {
      // 有子菜单，显示弹出菜单
      const rect = event.currentTarget.getBoundingClientRect();
      setTriggerRect(rect);
      setOpenPopup(item.key);
    } else {
      // 没有子菜单，直接导航
      onItemClick(item.key);
    }
  };

  const closePopup = () => {
    setOpenPopup(null);
    setTriggerRect(null);
  };

  const currentPopupItems = items.find(item => item.key === openPopup)?.children || [];

  return (
    <>
      <ScrollArea className={styles.customMenu}>
        {items.map((item) => (
          <div
            key={item.key}
            className={`${styles.menuItem} ${
              selectedKey === item.key ? styles.menuItemSelected : ''
            }`}
            onClick={(e) => handleMenuItemClick(item, e)}
            title={item.title || item.label}
          >
            {item.icon && <span className={styles.menuIcon}>{item.icon}</span>}
            {item.children && item.children.length > 0 && (
              <span className={styles.menuArrow}>›</span>
            )}
          </div>
        ))}
      </ScrollArea>

      {/* 弹出菜单 */}
      {openPopup && triggerRect && (
        <PopupMenu
          items={currentPopupItems}
          selectedKey={selectedKey}
          onItemClick={onItemClick}
          onClose={closePopup}
          triggerRect={triggerRect}
        />
      )}
    </>
  );
};

export default CustomSidebarMenu;