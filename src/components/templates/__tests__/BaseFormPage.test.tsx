/**
 * BaseFormPage 组件单元测试
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { BaseFormPage } from '../BaseFormPage';
import '@testing-library/jest-dom';

// Mock store
jest.mock('@/store', () => ({
  usePageStore: jest.fn(),
}));

// Mock MainLayout
jest.mock('@/components/layouts/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
  FormPageContainer: ({
    children,
    title,
    breadcrumbItems,
    recordNumber,
  }: {
    children: React.ReactNode;
    title?: string;
    breadcrumbItems?: Array<{ label: string; href?: string }>;
    recordNumber?: string;
  }) => (
    <div data-testid="form-page-container">
      {title && <h1>{title}</h1>}
      {breadcrumbItems && <nav data-testid="breadcrumbs">{breadcrumbItems.length} items</nav>}
      {recordNumber && <div data-testid="record-number">{recordNumber}</div>}
      {children}
    </div>
  ),
}));

describe('BaseFormPage', () => {
  const mockStoreState = {
    pageTitle: '测试页面',
    breadcrumbs: [{ label: '首页', href: '/' }, { label: '测试' }],
    recordNumber: 'TEST-001',
  };

  beforeEach(() => {
    const { usePageStore } = jest.requireMock('@/store');
    usePageStore.mockReturnValue(mockStoreState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该正确渲染页面结构', () => {
      render(
        <BaseFormPage>
          <div>测试内容</div>
        </BaseFormPage>
      );

      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      expect(screen.getByTestId('form-page-container')).toBeInTheDocument();
      expect(screen.getByText('测试内容')).toBeInTheDocument();
    });

    it('应该从 store 读取页面标题', () => {
      render(
        <BaseFormPage>
          <div>内容</div>
        </BaseFormPage>
      );

      expect(screen.getByText('测试页面')).toBeInTheDocument();
    });

    it('应该从 store 读取面包屑', () => {
      render(
        <BaseFormPage>
          <div>内容</div>
        </BaseFormPage>
      );

      expect(screen.getByTestId('breadcrumbs')).toHaveTextContent('2 items');
    });

    it('应该从 store 读取记录编号', () => {
      render(
        <BaseFormPage>
          <div>内容</div>
        </BaseFormPage>
      );

      expect(screen.getByTestId('record-number')).toHaveTextContent('TEST-001');
    });
  });

  describe('Form 渲染模式', () => {
    it('当传入 form prop 时应该渲染 Form 包裹', () => {
      const FormWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const [form] = Form.useForm();
        return (
          <BaseFormPage form={form}>
            {children}
          </BaseFormPage>
        );
      };

      render(
        <FormWrapper>
          <div>表单内容</div>
        </FormWrapper>
      );

      expect(screen.getByText('表单内容')).toBeInTheDocument();
    });

    it('当不传入 form prop 时应该直接渲染子组件', () => {
      render(
        <BaseFormPage>
          <div>直接内容</div>
        </BaseFormPage>
      );

      expect(screen.getByText('直接内容')).toBeInTheDocument();
    });
  });

  describe('单一数据源原则', () => {
    it('应该强制从 store 读取配置，不接受 props', () => {
      const { container } = render(
        <BaseFormPage>
          <div>内容</div>
        </BaseFormPage>
      );

      // 验证没有额外的 props 接口
      const baseFormPageProps = Object.keys(container.querySelector('[data-testid="form-page-container"]')?.attributes || {});
      expect(baseFormPageProps).not.toContain('title');
      expect(baseFormPageProps).not.toContain('breadcrumbs');
    });
  });
});

