/**
 * 标准表单页面模板
 * 配置式快速创建页面
 * 
 * 设计原则：
 * - 基于 BaseFormPage + FieldGroup + useRouteMeta
 * - 页面配置不再通过 props 传入，统一从路由表派生
 * - 简化简单表单页面的开发
 */

'use client';

import React from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd';
import { BaseFormPage } from './BaseFormPage';
import { FieldGroup, FormActions } from '@/components/common';
import type { FieldConfig } from '@/components/common/FieldGroup';
import { useFormSubmit, useRouteMeta } from '@/hooks';


export interface StandardFormPageProps {
  /**
   * 字段配置
   */
  fields: FieldConfig[];
  
  /**
   * 提交回调
   */
  onSubmit?: (values: any) => Promise<boolean | void>;
  
  /**
   * 暂存回调
   */
  onSave?: (values: any) => Promise<boolean | void>;
  
  /**
   * 初始值
   */
  initialValues?: any;
  
  /**
   * 自定义子内容（在字段组之后）
   */
  children?: (form: FormInstance) => React.ReactNode;
}

export type { FieldConfig };

/**
 * 标准表单页面组件
 * 
 * 使用方式：
 * ```tsx
 * <StandardFormPage
 *   fields={[...]}
 *   onSubmit={async (values) => {...}}
 * />
 * ```
 */
export const StandardFormPage: React.FC<StandardFormPageProps> = ({
  fields,
  onSubmit,
  onSave,
  initialValues,
  children,
}) => {
  const [form] = Form.useForm();

  // 从路由配置派生页面元信息并写入全局 store
  useRouteMeta();

  

  const { submitting, saving, handleSubmit, handleSave } = useFormSubmit({
    form,
    onSubmit,
    onSave,
  });

  return (
    <BaseFormPage
      form={form}
      onFinish={handleSubmit}
      initialValues={initialValues}
    >
      <FieldGroup fields={fields} />
      
      {children && children(form)}

      <FormActions
        showSubmit
        submitLoading={submitting}
        showSave={!!onSave}
        saveLoading={saving}
        onSave={handleSave}
      />
    </BaseFormPage>
  );
};
