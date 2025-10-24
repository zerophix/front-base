'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Avatar, App } from 'antd';
import {
  DownloadOutlined,
  ShareAltOutlined,
  EllipsisOutlined,
  HomeOutlined,
  FontSizeOutlined,
  GlobalOutlined,
  LogoutOutlined,
  RightOutlined,
} from '@ant-design/icons';
import styles from './Header.module.css';
import { useRouter } from 'next/navigation';
import { logout } from '@/utils/auth';
import { message } from 'antd';

export interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  // 清理内存泄漏
  useEffect(() => {
    return () => {
      // 清理事件监听器
      // 示例：document.removeEventListener('event', handler);
    };
  }, []);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { message } = App.useApp();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!mounted) {
    return (
      <header className={`${styles.header} ${className || ''}`}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}></div>
            <span className={styles.logoText}>LIMS</span>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.iconBtn}>安装到桌面</div>
          <div className={styles.iconBtn}>分享</div>
          <div className={styles.iconBtn}>更多操作</div>
          <div className={styles.userSection}>
            <div className={styles.userBtn}>
              <div className={styles.avatar}>用</div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`${styles.header} ${className || ''}`}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}></div>
          <span className={styles.logoText}>LIMS</span>
        </div>
      </div>

      <div className={styles.right}>
        <Button className={styles.iconBtn} title="安装到桌面" icon={<DownloadOutlined />}>安装到桌面</Button>
        <Button className={styles.iconBtn} title="分享" icon={<ShareAltOutlined />}>分享</Button>
        <Button className={styles.iconBtn} title="更多操作" icon={<EllipsisOutlined />}>更多操作</Button>

        <div className={styles.userSection} ref={menuRef}>
          <Button 
            className={styles.userBtn}
            onClick={() => setShowUserMenu(!showUserMenu)}
            type="text"
          >
            <div className={styles.avatar}>
              <Avatar size={32}>用</Avatar>
            </div>
          </Button>

          {showUserMenu && (
            <div className={styles.userMenu}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  <Avatar size={48}>用</Avatar>
                </div>
                <div className={styles.userDetails}>
                  <div className={styles.userName}>用户A</div>
                  <div className={styles.userSubtitle}>智能OA体验中心</div>
                </div>
              </div>

              <div className={styles.menuDivider}></div>

              <ul className={styles.menuList}>
                <li className={styles.menuItem}>
                  <Button className={styles.menuLink} type="text" href="#" icon={<HomeOutlined />}>宜搭中文站官网</Button>
                </li>
                <li className={styles.menuItem}>
                  <Button className={styles.menuLink} type="text" icon={<FontSizeOutlined />}>显示大小<span className={styles.menuArrow}><RightOutlined /></span></Button>
                </li>
                <li className={styles.menuItem}>
                  <Button className={styles.menuLink} type="text" icon={<GlobalOutlined />}>简体中文<span className={styles.menuArrow}><RightOutlined /></span></Button>
                </li>
              </ul>

              <div className={styles.menuDivider}></div>

              <Button 
                className={styles.logoutBtn} 
                type="text" 
                icon={<LogoutOutlined />} 
                onClick={async () => {
                  try {
                    await logout();
                    message.success('退出登录成功');
                    router.push('/login');
                  } catch (error) {
                    message.error('退出登录失败');
                  }
                }}
              >
                退出登录
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

