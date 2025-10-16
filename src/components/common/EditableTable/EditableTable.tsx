/**
 * 可编辑表格组件
 * 统一处理表格的增删改查操作
 */

'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { Table, Button, Space, message, Input, Select, InputNumber, Checkbox, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { IEditableTableConfig, IEditableRow } from '@/types/form';
import { FieldType } from '@/types/form';
import styles from './EditableTable.module.css';

export interface EditableTableProps<T extends IEditableRow = IEditableRow> {
  /**
   * 数据源
   */
  dataSource: T[];
  
  /**
   * 数据更新回调
   */
  onChange: (dataSource: T[]) => void;
  
  /**
   * 表格配置
   */
  config: IEditableTableConfig<T>;
  
  /**
   * 新行默认值工厂函数
   */
  createDefaultRow: () => T;
  
  /**
   * 是否显示操作列
   */
  showActions?: boolean;
  
  /**
   * 是否显示添加按钮
   */
  showAddButton?: boolean;
  
  /**
   * 是否显示批量导入按钮
   */
  showImportButton?: boolean;
  
  /**
   * 导入回调
   */
  onImport?: () => void;
  
  /**
   * 表格其他属性
   */
  tableProps?: Omit<TableProps<T>, 'columns' | 'dataSource'>;
}

/**
 * 可编辑表格组件
 */
function EditableTableComponent<T extends IEditableRow = IEditableRow>({
  dataSource,
  onChange,
  config,
  createDefaultRow,
  showActions = true,
  showAddButton = true,
  showImportButton = false,
  onImport,
  tableProps,
}: EditableTableProps<T>) {
  // 清理内存泄漏
  useEffect(() => {
    return () => {
      // 清理定时器
      // 注意：需要将定时器ID保存到ref或state中
      // 示例：if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  // 批处理输入更新，减少频繁 setState 导致的重渲染
  const pendingRef = useRef<Map<string, Partial<T>>>(new Map());
  const timerRef = useRef<number | null>(null);
  /**
   * 添加行
   */
  const handleAdd = useCallback(() => {
    if (config.maxRows && dataSource.length >= config.maxRows) {
      message.warning(`最多只能添加 ${config.maxRows} 行`);
      return;
    }
    
    const newRow = createDefaultRow();
    onChange([...dataSource, newRow]);
  }, [dataSource, onChange, createDefaultRow, config.maxRows]);

  /**
   * 删除行
   */
  const handleDelete = useCallback((key: string) => {
    if (config.minRows && dataSource.length <= config.minRows) {
      message.warning(`至少需要保留 ${config.minRows} 行`);
      return;
    }
    
    onChange(dataSource.filter(item => item.key !== key));
  }, [dataSource, onChange, config.minRows]);

  /**
   * 更新单元格
   */
  const handleCellChange = useCallback((key: string, dataIndex: keyof T, value: any) => {
    // 将单元格更新进行轻量节流/批处理，降低频繁输入导致的整表重渲染
    const pending = pendingRef.current;
    const exist = pending.get(key) || {};
    (exist as any)[dataIndex] = value;
    pending.set(key, exist);

    const FLUSH_INTERVAL_MS = 120;

    const flush = () => {
      const updates = pendingRef.current;
      const newData = dataSource.map(item => {
        const u = updates.get(item.key);
        return u ? { ...item, ...u } : item;
      });
      updates.clear();
      onChange(newData);
      timerRef.current = null;
    };

    if (timerRef.current == null) {
      timerRef.current = window.setTimeout(flush, FLUSH_INTERVAL_MS);
    }
  }, [dataSource, onChange]);

  /**
   * 构建表格列
   */
  const columns = React.useMemo(() => {
    const baseColumns = config.columns.map(col => {
      // 非可编辑列，直接返回
      if (!col.editable) {
        return col as any;
      }

      // 可编辑列：通过 render 渲染编辑控件，避免向 DOM 传递无效属性
      const renderEditable = (value: any, record: T) => {
        const onCommit = (val: any) => handleCellChange(record.key, col.dataIndex, val);

        switch (col.inputType) {
          case FieldType.Number:
            return (
              <InputNumber
                value={value as number}
                onChange={(v) => onCommit(v)}
                style={{ width: '100%' }}
              />
            );
          case FieldType.Select:
          case FieldType.MultiSelect:
            return (
              <Select
                mode={col.inputType === FieldType.MultiSelect ? 'multiple' : undefined}
                value={value}
                onChange={(v) => onCommit(v)}
                options={col.options}
                style={{ width: '100%' }}
              />
            );
          case FieldType.Checkbox:
            return (
              <Checkbox
                checked={!!value}
                onChange={(e) => onCommit(e.target.checked)}
              />
            );
          case FieldType.Switch:
            return (
              <Switch
                checked={!!value}
                onChange={(checked) => onCommit(checked)}
              />
            );
          default:
            return (
              <Input
                value={value as any}
                onChange={(e) => onCommit(e.target.value)}
              />
            );
        }
      };

      return {
        ...col,
        render: col.render ?? renderEditable,
      } as any;
    });

    // 添加拖拽手柄列
    if (config.showDragHandle) {
      baseColumns.unshift({
        title: '⋮⋮',
        key: 'drag',
        width: 50,
        render: () => (
          <span style={{ cursor: 'move', color: 'var(--color-text-tertiary)' }}>
            ⋮⋮
          </span>
        ),
      });
    }

    // 添加操作列
    if (showActions && config.showActions !== false) {
      baseColumns.push({
        title: '操作',
        key: 'action',
        width: 100,
        fixed: 'right' as const,
        render: (_: any, record: T) => (
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
          >
            删除
          </Button>
        ),
      });
    }

    return baseColumns;
  }, [config, showActions, handleCellChange, handleDelete]);

  return (
    <div className={styles.container}>
      <Table<T>
        {...tableProps}
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        scroll={{ x: 'max-content', ...tableProps?.scroll }}
      />
      
      {(showAddButton || showImportButton) && (
        <Space className={styles.actions}>
          {showAddButton && config.enableAdd !== false && (
            <Button
              type="dashed"
              onClick={handleAdd}
              icon={<PlusOutlined />}
            >
              新增一项
            </Button>
          )}
          
          {showImportButton && config.enableBatchImport && (
            <Button
              onClick={onImport}
              icon={<UploadOutlined />}
            >
              批量导入
            </Button>
          )}
        </Space>
      )}
    </div>
  );
}

// 使用React.memo优化性能
export const EditableTable = React.memo(EditableTableComponent) as typeof EditableTableComponent;

