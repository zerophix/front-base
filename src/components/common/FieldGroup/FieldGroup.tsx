/**
 * 字段组组件
 * 快速渲染一组表单字段，减少重复代码
 * 集成XSS防护 - 所有文本输出自动转义
 */

'use client';

import React from 'react';
import { Form, Row, Col, Input, DatePicker, Select } from 'antd';
import type { Rule } from 'antd/es/form';
import { escapeHtml } from '@/utils/security';

export interface FieldConfig {
  /**
   * 字段名
   */
  name: string;
  
  /**
   * 字段标签
   */
  label: string;
  
  /**
   * 字段类型
   */
  type?: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'search-select' | 'user-select';
  
  /**
   * 占据列数 (24栅格)
   */
  span?: number;
  
  /**
   * 是否必填
   */
  required?: boolean;
  
  /**
   * 占位符
   */
  placeholder?: string;
  
  /**
   * 选项（select类型使用）
   */
  options?: Array<{ label: string; value: any }>;
  
  /**
   * 文本域行数
   */
  rows?: number;
  
  /**
   * 自定义校验规则
   */
  rules?: Rule[];
  
  /**
   * 默认值
   */
  defaultValue?: any;
}

export interface FieldGroupProps {
  /**
   * 字段配置数组
   */
  fields: FieldConfig[];
  
  /**
   * 栅格间距
   */
  gutter?: number;
}

/**
 * 渲染单个字段的输入组件
 * 所有placeholder自动进行XSS转义
 */
const renderFieldInput = (field: FieldConfig) => {
  // 安全转义placeholder和label
  const safePlaceholder = escapeHtml(field.placeholder || `请${field.type === 'select' ? '选择' : '输入'}${field.label}`);
  
  switch (field.type) {
    case 'textarea':
      return (
        <Input.TextArea
          placeholder={safePlaceholder}
          autoSize={{ minRows: field.rows || 3, maxRows: 6 }}
        />
      );
    
    case 'number':
      return (
        <Input
          type="number"
          placeholder={safePlaceholder}
        />
      );
    
    case 'date':
      return (
        <DatePicker
          style={{ width: '100%' }}
          placeholder={safePlaceholder}
        />
      );
    
    case 'select':
      return (
        <Select
          placeholder={safePlaceholder}
          options={field.options?.map(opt => ({
            ...opt,
            label: escapeHtml(String(opt.label)),
          }))}
        />
      );
    
    default:
      return <Input placeholder={safePlaceholder} />;
  }
};

/**
 * 字段组组件
 * 自动处理字段分组和布局
 */
export const FieldGroup: React.FC<FieldGroupProps> = ({
  fields,
  gutter = 24,
}) => {
  // 按行分组字段
  const groupedFields: FieldConfig[][] = [];
  let currentRow: FieldConfig[] = [];
  let currentSpan = 0;

  fields.forEach(field => {
    const span = field.span || 8;
    
    if (currentSpan + span > 24) {
      if (currentRow.length > 0) {
        groupedFields.push(currentRow);
      }
      currentRow = [field];
      currentSpan = span;
    } else {
      currentRow.push(field);
      currentSpan += span;
    }
  });

  if (currentRow.length > 0) {
    groupedFields.push(currentRow);
  }

  return (
    <>
      {groupedFields.map((row, rowIndex) => (
        <Row key={rowIndex} gutter={gutter}>
          {row.map(field => {
            const rules = field.rules || (field.required ? [{ required: true, message: `请输入${field.label}` }] : []);
            
            return (
              <Col key={field.name} span={field.span || 8}>
                <Form.Item
                  label={escapeHtml(field.label)}
                  name={field.name}
                  rules={rules}
                >
                  {renderFieldInput(field)}
                </Form.Item>
              </Col>
            );
          })}
        </Row>
      ))}
    </>
  );
};

