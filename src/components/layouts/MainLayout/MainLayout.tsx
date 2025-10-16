'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/core/Sidebar';
import styles from './MainLayout.module.css';
import { useUIStore } from '@/store';

export interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // 清理内存泄漏
  useEffect(() => {
    return () => {
      // 清理事件监听器
      // 示例：document.removeEventListener('event', handler);
    };
  }, []);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const _toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const sidebarWidth = sidebarCollapsed ? '64px' : '264px';
  
  // 移动端状态管理
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 移动端触摸手势支持
  useEffect(() => {
    if (!isMobile) return;

    let startX = 0;
    let startY = 0;
    let _isSwipeGesture = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      _isSwipeGesture = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !startY) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - startX;
      const diffY = currentY - startY;

      // 检测是否为水平滑动手势
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        _isSwipeGesture = true;
        
        // 从左边缘向右滑动打开侧边栏
        if (startX < 50 && diffX > 100 && !mobileMenuOpen) {
          setMobileMenuOpen(true);
          e.preventDefault();
        }
        // 向左滑动关闭侧边栏
        else if (diffX < -100 && mobileMenuOpen) {
          setMobileMenuOpen(false);
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      startX = 0;
      startY = 0;
      _isSwipeGesture = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, mobileMenuOpen]);

  // 处理遮罩层点击
  const handleOverlayClick = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className={styles.layout} style={{ ['--sidebar-width' as any]: sidebarWidth }}>
      <Header />
      <div 
        className={styles.sidebar} 
        data-mobile-open={isMobile ? mobileMenuOpen : undefined}
      >
        <Sidebar />
      </div>
      {isMobile && (
        <div 
          className={styles.mobileOverlay}
          data-visible={mobileMenuOpen}
          onClick={handleOverlayClick}
        />
      )}
      <main className={styles.main}>
        <div className={styles.mainRow}>
          <div className={styles.content}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};