/**
 * 表单操作按钮组件
 * 统一处理表单的提交、暂存、重置等操作
 */

'use client';

import React from 'react';
import { Button, Space } from 'antd';
import styles from './FormActions.module.css';

export interface FormActionsProps {
  /**
   * 是否显示提交按钮
   */
  showSubmit?: boolean;
  
  /**
   * 提交按钮文本
   */
  submitText?: string;
  
  /**
   * 提交按钮loading状态
   */
  submitLoading?: boolean;
  
  /**
   * 提交按钮点击回调
   */
  onSubmit?: () => void;
  
  /**
   * 是否显示暂存按钮
   */
  showSave?: boolean;
  
  /**
   * 暂存按钮文本
   */
  saveText?: string;
  
  /**
   * 暂存按钮loading状态
   */
  saveLoading?: boolean;
  
  /**
   * 暂存按钮点击回调
   */
  onSave?: () => void;
  
  /**
   * 是否显示重置按钮
   */
  showReset?: boolean;
  
  /**
   * 重置按钮文本
   */
  resetText?: string;
  
  /**
   * 重置按钮点击回调
   */
  onReset?: () => void;
  
  /**
   * 是否显示取消按钮
   */
  showCancel?: boolean;
  
  /**
   * 取消按钮文本
   */
  cancelText?: string;
  
  /**
   * 取消按钮点击回调
   */
  onCancel?: () => void;
  
  /**
   * 额外的操作按钮
   */
  extra?: React.ReactNode;
  
  /**
   * 按钮对齐方式
   */
  align?: 'left' | 'center' | 'right';
  
  /**
   * 自定义样式
   */
  className?: string;
}

/**
 * 表单操作按钮组件
 */
export const FormActions: React.FC<FormActionsProps> = ({
  showSubmit = true,
  submitText = '提交',
  submitLoading = false,
  onSubmit,
  showSave = false,
  saveText = '暂存',
  saveLoading = false,
  onSave,
  showReset = false,
  resetText = '重置',
  onReset,
  showCancel = false,
  cancelText = '取消',
  onCancel,
  extra,
  align = 'left',
  className,
}) => {
  return (
    <div className={`${styles.container} ${styles[align]} ${className || ''}`}>
      <Space size="middle">
        {showSubmit && (
          <Button
            type="primary"
            htmlType="submit"
            loading={submitLoading}
            onClick={onSubmit}
          >
            {submitText}
          </Button>
        )}
        
        {showSave && (
          <Button
            loading={saveLoading}
            onClick={onSave}
          >
            {saveText}
          </Button>
        )}
        
        {showReset && (
          <Button onClick={onReset}>
            {resetText}
          </Button>
        )}
        
        {showCancel && (
          <Button onClick={onCancel}>
            {cancelText}
          </Button>
        )}
        
        {extra}
      </Space>
    </div>
  );
};

