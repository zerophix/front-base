/**
 * 基础表单页面模板
 * 提供统一的页面结构骨架
 * 
 * 设计原则：
 * - 不接受配置相关props（title/breadcrumbs/recordNumber等）
 * - 强制从全局 store 读取配置
 * - 单一数据源，职责清晰
 * - 智能 Form 渲染：传入 form 则自动包裹，否则让子组件自管理
 */

'use client';

import React from 'react';
import { Form } from 'antd';
import type { FormInstance, FormProps } from 'antd';
import { MainLayout, FormPageContainer } from '@/components/layouts/MainLayout';
import { usePageStore } from '@/store';

export interface BaseFormPageProps {
  /**
   * 子内容 - 页面的主体内容
   */
  children: React.ReactNode;
  
  /**
   * 表单实例（可选）
   * - 传入时自动渲染 Form 包裹子内容
   * - 不传时只渲染容器，让子组件自己管理 Form
   */
  form?: FormInstance;
  
  /**
   * 表单提交回调
   */
  onFinish?: FormProps['onFinish'];
  
  /**
   * 表单布局
   */
  layout?: FormProps['layout'];
  
  /**
   * 初始值
   */
  initialValues?: any;
  
  /**
   * 额外的表单属性
   */
  formProps?: Omit<FormProps, 'form' | 'onFinish' | 'layout' | 'initialValues'>;
}

/**
 * 基础表单页面组件
 * 
 * 使用方式：
 * ```tsx
 * // 页面组件中，元数据会自动通过 useRouteMeta 设置到 store 中
 * 
 * // 简单表单（自动 Form 包裹）
 * return <BaseFormPage form={form} onFinish={handleSubmit}>{content}</BaseFormPage>
 * 
 * // 复杂场景（自己管理 Form）
 * return <BaseFormPage><Form>{content}</Form></BaseFormPage>
 * ```
 */
export const BaseFormPage: React.FC<BaseFormPageProps> = ({
  children,
  form,
  onFinish,
  layout = 'vertical',
  initialValues,
  formProps,
}) => {
  // 从全局 store 读取配置（单一数据源）
  const { pageTitle, breadcrumbs, recordNumber } = usePageStore();

  // 渲染内容：如果传入 form，则自动包裹 Form；否则直接渲染子组件
  const content = form ? (
    <Form
      form={form}
      layout={layout}
      onFinish={onFinish}
      initialValues={initialValues}
      {...formProps}
    >
      {children}
    </Form>
  ) : (
    children
  );

  return (
    <MainLayout>
      <FormPageContainer
        title={pageTitle}
        breadcrumbItems={breadcrumbs as Array<{ label: string; href?: string }>}
        recordNumber={recordNumber || undefined}
      >
        {content}
      </FormPageContainer>
    </MainLayout>
  );
};
