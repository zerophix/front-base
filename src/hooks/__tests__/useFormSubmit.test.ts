import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormSubmit } from '../useFormSubmit';

// Mock error handling module
jest.mock('@/utils/errorHandler', () => ({
  globalErrorHandler: {
    handle: jest.fn(),
  },
  createError: {
    validation: jest.fn(() => new Error('Validation error')),
    business: jest.fn(() => new Error('Business error')),
    network: jest.fn(() => new Error('Network error')),
  },
  safeExecute: jest.fn((fn) => fn()),
}));

// Mock antd message
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

describe('useFormSubmit', () => {
  let mockForm: any;

  beforeEach(() => {
    mockForm = {
      validateFields: jest.fn().mockResolvedValue({ name: 'test' }),
      getFieldsValue: jest.fn().mockReturnValue({ name: 'test' }),
      resetFields: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleSubmit', () => {
    it('应该验证表单并调用onSubmit', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(true);

      const { result } = renderHook(() =>
        useFormSubmit({
          form: mockForm,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockForm.validateFields).toHaveBeenCalled();
      expect(mockOnSubmit).toHaveBeenCalledWith({ name: 'test' });
    });

    it('验证失败时不应该调用onSubmit', async () => {
      const mockOnSubmit = jest.fn();
      mockForm.validateFields.mockRejectedValue(new Error('Validation failed'));

      const { result } = renderHook(() =>
        useFormSubmit({
          form: mockForm,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('提交中应该设置loading状态', async () => {
      const mockOnSubmit = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() =>
        useFormSubmit({
          form: mockForm,
          onSubmit: mockOnSubmit,
        })
      );

      act(() => {
        // 直接调用 submit，避免校验失败干扰
        result.current.submit({ name: 'test' } as any);
      });

      await waitFor(() => {
        expect(result.current.submitting).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.submitting).toBe(false);
      });
    });
  });

  describe('handleSave', () => {
    it('应该调用onSave不验证表单', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(true);

      const { result } = renderHook(() =>
        useFormSubmit({
          form: mockForm,
          onSave: mockOnSave,
        })
      );

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockForm.validateFields).not.toHaveBeenCalled();
      expect(mockForm.getFieldsValue).toHaveBeenCalled();
      expect(mockOnSave).toHaveBeenCalledWith({ name: 'test' });
    });

    it('保存中应该设置saving状态', async () => {
      const mockOnSave = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() =>
        useFormSubmit({
          form: mockForm,
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.handleSave();
      });

      await waitFor(() => {
        expect(result.current.saving).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.saving).toBe(false);
      });
    });
  });

  describe('handleReset', () => {
    it('应该重置表单', () => {
      const { result } = renderHook(() =>
        useFormSubmit({
          form: mockForm,
        })
      );

      act(() => {
        result.current.handleReset();
      });

      expect(mockForm.resetFields).toHaveBeenCalled();
    });
  });
});

