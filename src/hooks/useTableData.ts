'use client';

/**
 * 表格数据管理 Hook
 * 统一处理表格数据的增删改查
 */

import { useState, useCallback } from 'react';
import type { IEditableRow } from '@/types/form';

export interface UseTableDataOptions<T extends IEditableRow> {
  /**
   * 初始数据
   */
  initialData?: T[];
  
  /**
   * 最小行数
   */
  minRows?: number;
  
  /**
   * 最大行数
   */
  maxRows?: number;
  
  /**
   * 创建默认行的工厂函数
   */
  createDefaultRow: () => T;
}

export interface UseTableDataReturn<T extends IEditableRow> {
  /**
   * 表格数据
   */
  dataSource: T[];
  
  /**
   * 设置表格数据
   */
  setDataSource: (data: T[]) => void;
  
  /**
   * 创建默认行的工厂函数
   */
  createDefaultRow: () => T;
  
  /**
   * 添加行
   */
  handleAdd: () => void;
  
  /**
   * 删除行
   */
  handleDelete: (key: string) => void;
  
  /**
   * 更新行
   */
  handleUpdate: (key: string, updates: Partial<T>) => void;
  
  /**
   * 更新单个字段
   */
  handleFieldChange: (key: string, field: keyof T, value: any) => void;
  
  /**
   * 批量添加
   */
  handleBatchAdd: (items: T[]) => void;
  
  /**
   * 批量删除
   */
  handleBatchDelete: (keys: string[]) => void;
  
  /**
   * 清空数据
   */
  handleClear: () => void;
  
  /**
   * 重置到初始数据
   */
  handleReset: () => void;
}

/**
 * 表格数据管理 Hook
 */
export function useTableData<T extends IEditableRow = IEditableRow>({
  initialData = [],
  minRows,
  maxRows,
  createDefaultRow,
}: UseTableDataOptions<T>): UseTableDataReturn<T> {
  const [dataSource, setDataSource] = useState<T[]>(
    initialData.length > 0 ? initialData : [createDefaultRow()]
  );

  /**
   * 添加行
   */
  const handleAdd = useCallback(() => {
    if (maxRows && dataSource.length >= maxRows) {
      return;
    }
    setDataSource([...dataSource, createDefaultRow()]);
  }, [dataSource, createDefaultRow, maxRows]);

  /**
   * 删除行
   */
  const handleDelete = useCallback((key: string) => {
    if (minRows && dataSource.length <= minRows) {
      return;
    }
    setDataSource(dataSource.filter(item => item.key !== key));
  }, [dataSource, minRows]);

  /**
   * 更新行
   */
  const handleUpdate = useCallback((key: string, updates: Partial<T>) => {
    setDataSource(dataSource.map(item => 
      item.key === key ? { ...item, ...updates } : item
    ));
  }, [dataSource]);

  /**
   * 更新单个字段
   */
  const handleFieldChange = useCallback((key: string, field: keyof T, value: any) => {
    setDataSource(dataSource.map(item =>
      item.key === key ? { ...item, [field]: value } : item
    ));
  }, [dataSource]);

  /**
   * 批量添加
   */
  const handleBatchAdd = useCallback((items: T[]) => {
    if (maxRows && dataSource.length + items.length > maxRows) {
      return;
    }
    setDataSource([...dataSource, ...items]);
  }, [dataSource, maxRows]);

  /**
   * 批量删除
   */
  const handleBatchDelete = useCallback((keys: string[]) => {
    const keysSet = new Set(keys);
    const newData = dataSource.filter(item => !keysSet.has(item.key));
    
    if (minRows && newData.length < minRows) {
      return;
    }
    
    setDataSource(newData);
  }, [dataSource, minRows]);

  /**
   * 清空数据
   */
  const handleClear = useCallback(() => {
    setDataSource([createDefaultRow()]);
  }, [createDefaultRow]);

  /**
   * 重置到初始数据
   */
  const handleReset = useCallback(() => {
    setDataSource(initialData.length > 0 ? initialData : [createDefaultRow()]);
  }, [initialData, createDefaultRow]);

  return {
    dataSource,
    setDataSource,
    createDefaultRow,
    handleAdd,
    handleDelete,
    handleUpdate,
    handleFieldChange,
    handleBatchAdd,
    handleBatchDelete,
    handleClear,
    handleReset,
  };
}

