/**
 * StandardFormPage 组件单元测试
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StandardFormPage } from '../StandardFormPage';
import type { FieldConfig } from '@/components/common/FieldGroup';
import '@testing-library/jest-dom';

// Mock hooks: route meta + page config + submit handlers
jest.mock('@/hooks', () => ({
  usePageConfig: jest.fn(),
  useRouteMeta: jest.fn(() => ({
    title: '测试表单',
    breadcrumbs: [{ label: '首页' }, { label: '测试表单' }],
    recordNumber: 'TEST-001',
  })),
  useFormSubmit: jest.fn(({ onSubmit, onSave, form }) => ({
    submitting: false,
    saving: false,
    handleSubmit: jest.fn(async (values) => {
      if (onSubmit) await onSubmit(values ?? {});
    }),
    handleSave: jest.fn(async () => {
      const values = typeof form?.getFieldsValue === 'function' ? form.getFieldsValue() : {};
      if (onSave) await onSave(values);
    }),
  })),
}));

jest.mock('@/components/templates/BaseFormPage', () => ({
  BaseFormPage: ({ children, onFinish }: any) => (
    <div data-testid="base-form-page">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (onFinish) {
            const formData = new FormData(e.currentTarget);
            const values = Object.fromEntries(formData);
            onFinish(values);
          }
        }}
      >
        {children}
      </form>
    </div>
  ),
}));

jest.mock('@/components/common', () => ({
  FieldGroup: ({ fields }: { fields: FieldConfig[] }) => (
    <div data-testid="field-group">
      {fields.map((field) => (
        <div key={field.name}>
          <label>
            {field.label}
            <input name={field.name} placeholder={field.placeholder} />
          </label>
        </div>
      ))}
    </div>
  ),
  FormActions: ({ showSubmit, showSave, onSave }: any) => (
    <div data-testid="form-actions">
      {showSubmit && <button type="submit">提交</button>}
      {showSave && (
        <button type="button" onClick={onSave}>
          暂存
        </button>
      )}
    </div>
  ),
}));

describe('StandardFormPage', () => {
  const mockFields: FieldConfig[] = [
    {
      name: 'name',
      label: '姓名',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'text',
    },
  ];

  const defaultProps = {
    fields: mockFields,
  } as const;

  describe('基础渲染', () => {
    it('应该正确渲染所有组件', () => {
      render(<StandardFormPage {...defaultProps} />);

      expect(screen.getByTestId('base-form-page')).toBeInTheDocument();
      expect(screen.getByTestId('field-group')).toBeInTheDocument();
      expect(screen.getByTestId('form-actions')).toBeInTheDocument();
    });

    it('应该渲染所有字段', () => {
      render(<StandardFormPage {...defaultProps} />);

      expect(screen.getByLabelText('姓名')).toBeInTheDocument();
      expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
    });
  });

  describe('表单提交', () => {
    it('应该调用 onSubmit 回调', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(true);

      render(<StandardFormPage {...defaultProps} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByText('提交');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('应该调用 onSave 回调', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(true);

      render(
        <StandardFormPage {...defaultProps} onSave={mockOnSave} />
      );

      const saveButton = screen.getByText('暂存');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });
  });

  describe('配置驱动', () => {
    it('应该支持自定义字段配置', () => {
      const customFields: FieldConfig[] = [
        { name: 'field1', label: '字段1', type: 'text' },
        { name: 'field2', label: '字段2', type: 'textarea' },
        { name: 'field3', label: '字段3', type: 'select' },
      ];

      render(
        <StandardFormPage
          fields={customFields}
        />
      );

      expect(screen.getByLabelText('字段1')).toBeInTheDocument();
      expect(screen.getByLabelText('字段2')).toBeInTheDocument();
      expect(screen.getByLabelText('字段3')).toBeInTheDocument();
    });

    it('应该通过 useRouteMeta 派生并写入页面元信息', async () => {
      const { useRouteMeta } = await import('@/hooks');

      render(
        <StandardFormPage
          {...defaultProps}
        />
      );

      expect(useRouteMeta).toHaveBeenCalled();
    });
  });
});

