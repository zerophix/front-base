/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useApiRequest } from '../useApiRequest';
import type { IApiResponse } from '@/types';

// Mock errorHandler
jest.mock('@/utils/errorHandler', () => ({
  globalErrorHandler: {
    handle: jest.fn()
  },
  createError: {
    network: jest.fn((message: string, code: string) => new Error(message))
  },
  safeExecute: jest.fn((fn: Function) => fn())
}));

describe('useApiRequest', () => {
  const mockSuccessResponse: IApiResponse<string> = {
    code: 200,
    message: 'Success',
    data: 'test data'
  };

  const mockErrorResponse = new Error('API Error');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const mockRequestFn = jest.fn().mockResolvedValue(mockSuccessResponse);
    
    const { result } = renderHook(() =>
      useApiRequest({
        requestFn: mockRequestFn
      })
    );

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.run).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
    expect(typeof result.current.cancel).toBe('function');
    expect(typeof result.current.setData).toBe('function');
  });

  it('should execute request successfully', async () => {
    const mockRequestFn = jest.fn().mockResolvedValue(mockSuccessResponse);
    const onSuccess = jest.fn();
    const onFinally = jest.fn();
    
    const { result } = renderHook(() =>
      useApiRequest({
        requestFn: mockRequestFn,
        onSuccess,
        onFinally
      })
    );

    await act(async () => {
      const response = await result.current.run('param1', 'param2');
      expect(response).toBe('test data');
    });

    expect(mockRequestFn).toHaveBeenCalledWith('param1', 'param2');
    expect(result.current.data).toBe('test data');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(onSuccess).toHaveBeenCalledWith('test data');
    expect(onFinally).toHaveBeenCalled();
  });

  it('should handle request error', async () => {
    const mockRequestFn = jest.fn().mockRejectedValue(mockErrorResponse);
    const onError = jest.fn();
    const onFinally = jest.fn();
    
    const { result } = renderHook(() =>
      useApiRequest({
        requestFn: mockRequestFn,
        onError,
        onFinally
      })
    );

    await act(async () => {
      const response = await result.current.run();
      expect(response).toBeNull();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(mockErrorResponse);
    expect(onError).toHaveBeenCalledWith(mockErrorResponse);
    expect(onFinally).toHaveBeenCalled();
  });

  it('should set loading state during request', async () => {
    let resolveRequest: (value: IApiResponse<string>) => void;
    const mockRequestFn = jest.fn().mockImplementation(() => 
      new Promise<IApiResponse<string>>((resolve) => {
        resolveRequest = resolve;
      })
    );
    
    const { result } = renderHook(() =>
      useApiRequest({
        requestFn: mockRequestFn
      })
    );

    // Start request
    act(() => {
      result.current.run();
    });

    // Should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // Resolve request
    await act(async () => {
      resolveRequest!(mockSuccessResponse);
    });

    // Should not be loading anymore
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe('test data');
  });

  it('should execute immediately when immediate is true', async () => {
    const mockRequestFn = jest.fn().mockResolvedValue(mockSuccessResponse);
    
    await act(async () => {
      renderHook(() =>
        useApiRequest({
          requestFn: mockRequestFn,
          immediate: true,
          immediateParams: ['immediate-param'] as any
        })
      );
    });

    expect(mockRequestFn).toHaveBeenCalledWith('immediate-param');
  });

  it('should refresh with last parameters', async () => {
    const mockRequestFn = jest.fn().mockResolvedValue(mockSuccessResponse);
    
    const { result } = renderHook(() =>
      useApiRequest({
        requestFn: mockRequestFn
      })
    );

    // First request
    await act(async () => {
      await result.current.run('param1', 'param2');
    });

    expect(mockRequestFn).toHaveBeenCalledTimes(1);
    expect(mockRequestFn).toHaveBeenCalledWith('param1', 'param2');

    // Refresh should use same parameters
    await act(async () => {
      await result.current.refresh();
    });

    expect(mockRequestFn).toHaveBeenCalledTimes(2);
    expect(mockRequestFn).toHaveBeenLastCalledWith('param1', 'param2');
  });

  it('should return null when refresh is called without previous request', async () => {
    const mockRequestFn = jest.fn().mockResolvedValue(mockSuccessResponse);
    
    const { result } = renderHook(() =>
      useApiRequest({
        requestFn: mockRequestFn
      })
    );

    await act(async () => {
      const response = await result.current.refresh();
      expect(response).toBeNull();
    });

    expect(mockRequestFn).not.toHaveBeenCalled();
  });

  it('should cancel request and clear state', () => {
    const mockRequestFn = jest.fn().mockResolvedValue(mockSuccessResponse);
    
    const { result } = renderHook(() =>
      useApiRequest({
        requestFn: mockRequestFn
      })
    );

    // Set some initial state
    act(() => {
      result.current.setData('initial data');
    });

    expect(result.current.data).toBe('initial data');

    // Cancel should clear state
    act(() => {
      result.current.cancel();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should manually set data', () => {
    const mockRequestFn = jest.fn().mockResolvedValue(mockSuccessResponse);
    
    const { result } = renderHook(() =>
      useApiRequest({
        requestFn: mockRequestFn
      })
    );

    act(() => {
      result.current.setData('manual data');
    });

    expect(result.current.data).toBe('manual data');

    act(() => {
      result.current.setData(null);
    });

    expect(result.current.data).toBeNull();
  });

  it('should handle non-Error exceptions', async () => {
    const mockRequestFn = jest.fn().mockRejectedValue('string error');
    
    const { result } = renderHook(() =>
      useApiRequest({
        requestFn: mockRequestFn
      })
    );

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('string error');
  });

  it('should use custom error message', async () => {
    const mockRequestFn = jest.fn().mockRejectedValue(mockErrorResponse);
    const customErrorMessage = 'Custom error message';
    
    const { result } = renderHook(() =>
      useApiRequest({
        requestFn: mockRequestFn,
        errorMessage: customErrorMessage
      })
    );

    await act(async () => {
      await result.current.run();
    });

    // Verify that createError.network was called with custom message
    const { createError } = require('@/utils/errorHandler');
    expect(createError.network).toHaveBeenCalledWith(customErrorMessage, 'API_REQUEST_FAILED');
  });
});