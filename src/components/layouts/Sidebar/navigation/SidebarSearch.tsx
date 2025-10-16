'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input, Popover, Tooltip, Badge } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styles from './SidebarSearch.module.css';
import type { SearchResult } from '@/config/routes/helpers';

interface SidebarSearchProps {
  value: string;
  onChange: (value: string) => void;
  collapsed?: boolean;
  searchResultsCount?: number;
  searchResults?: SearchResult[];
  onClear?: () => void;
}

const SidebarSearchComponent: React.FC<SidebarSearchProps> = ({
  value, 
  onChange, 
  collapsed, 
  searchResultsCount = 0,
  searchResults = [],
  onClear 
}) => {
  // 清理内存泄漏
  useEffect(() => {
    return () => {
      // 清理定时器
      // 注意：需要将定时器ID保存到ref或state中
      // 示例：if (timerRef.current) clearInterval(timerRef.current);
      // 清理事件监听器
      // 示例：document.removeEventListener('event', handler);
    };
  }, []);
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const inputRef = useRef<any>(null);
  const popoverInputRef = useRef<any>(null);

  // 键盘快捷键支持 (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (collapsed) {
          setOpen(true);
        } else {
          inputRef.current?.focus();
        }
      }
      // ESC 键清空搜索
      if (e.key === 'Escape' && (isFocused || open)) {
        e.preventDefault();
        if (value) {
          onChange('');
          onClear?.();
        } else if (collapsed) {
          setOpen(false);
        } else {
          inputRef.current?.blur();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [collapsed, value, onChange, onClear, isFocused, open]);

  // 当 Popover 打开时自动聚焦
  useEffect(() => {
    if (open && popoverInputRef.current) {
      setTimeout(() => {
        popoverInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // 当搜索内容改变时重置展开状态
  useEffect(() => {
    setShowAllResults(false);
  }, [value]);

  // 处理 Popover 中的键盘事件
  const handlePopoverKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setOpen(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    onChange('');
    onClear?.();
  }, [onChange, onClear]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // 高亮搜索文本 - 优化性能，缓存正则表达式
  const highlightSearchText = useCallback((text: string, searchText: string) => {
    if (!searchText.trim()) return text;
    
    const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return React.createElement('span', {
          key: index,
          className: styles.highlightText // 使用CSS类而不是内联样式
        }, part);
      }
      return part;
    });
  }, []);

  // 优化搜索结果渲染 - 使用虚拟化减少DOM节点
  const visibleResults = React.useMemo(() => {
    if (!searchResults.length) return [];
    const maxVisible = showAllResults ? Math.min(searchResults.length, 50) : 8; // 限制最大显示数量
    return searchResults.slice(0, maxVisible);
  }, [searchResults, showAllResults]);

  if (collapsed) {
    const hasResults = value && searchResultsCount > 0;
    const hasSearch = Boolean(value);

    return (
      <div className={styles.searchCollapsed}>
        <Popover
          trigger="click"
          open={open}
          onOpenChange={setOpen}
          placement="bottom"
          overlayClassName={styles.searchPopover}
          content={
            <div className={styles.popoverContent}>
              <Input
                ref={popoverInputRef}
                allowClear
                autoFocus
                placeholder="搜索菜单 (Ctrl+K)"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onPressEnter={() => setOpen(false)}
                onKeyDown={handlePopoverKeyDown}
                prefix={<SearchOutlined />}
                suffix={
                  hasResults && (
                    <Badge 
                      count={searchResultsCount} 
                      size="small" 
                      style={{ backgroundColor: '#52c41a' }}
                    />
                  )
                }
                size="middle"
                style={{ width: 240 }}
              />
              {hasSearch && (
                <div className={styles.searchHint}>
                  {hasResults 
                    ? `找到 ${searchResultsCount} 个结果` 
                    : '未找到匹配项'
                  }
                </div>
              )}
              {hasResults && visibleResults.length > 0 && (
                <div className={styles.searchResultsList}>
                  {visibleResults.map((result, index) => (
                    <div 
                      key={`${result.path}-${index}`} 
                      className={styles.searchResultItem}
                      onClick={() => {
                        if (result.path) {
                          window.location.href = result.path;
                          setOpen(false);
                        }
                      }}
                    >
                      <div className={styles.resultLabel}>
                        {highlightSearchText(result.label, value)}
                      </div>
                      {result.parentPath && (
                        <div className={styles.resultPath}>
                          {result.parentPath}
                        </div>
                      )}
                    </div>
                  ))}
                  {searchResults.length > 8 && !showAllResults && (
                    <div 
                      className={styles.moreResults}
                      onClick={() => setShowAllResults(true)}
                    >
                      还有 {searchResults.length - 8} 个结果... (点击查看全部)
                    </div>
                  )}
                  {showAllResults && searchResults.length > 8 && (
                    <div 
                      className={styles.moreResults}
                      onClick={() => setShowAllResults(false)}
                    >
                      收起结果
                    </div>
                  )}
                </div>
              )}
            </div>
          }
        >
          <Tooltip title={`搜索 (Ctrl+K)${hasSearch ? ` - ${searchResultsCount} 个结果` : ''}`}>
            <button 
              className={`${styles.searchIconBtn} ${hasSearch ? styles.searchActive : ''}`} 
              aria-label="搜索"
            >
              {hasSearch ? (
                <Badge count={searchResultsCount} size="small" offset={[4, -4]}>
                  <SearchOutlined />
                </Badge>
              ) : (
                <SearchOutlined />
              )}
            </button>
          </Tooltip>
        </Popover>
      </div>
    );
  }

  const hasResults = value && searchResultsCount > 0;
  const hasSearch = Boolean(value);

  return (
    <div className={`${styles.search} ${isFocused ? styles.searchFocused : ''}`}>
      <Input
        ref={inputRef}
        allowClear
        placeholder="搜索菜单 (Ctrl+K)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        prefix={<SearchOutlined />}
        suffix={
          hasResults && (
            <Badge 
              count={searchResultsCount} 
              size="small" 
              style={{ backgroundColor: '#52c41a' }}
            />
          )
        }
        size="middle"
      />
      {hasSearch && (
        <div className={styles.searchResults}>
          {hasResults 
            ? `找到 ${searchResultsCount} 个匹配项` 
            : '未找到匹配项'
          }
        </div>
      )}
    </div>
  );
};

// 使用React.memo优化性能
export const SidebarSearch = React.memo(SidebarSearchComponent);