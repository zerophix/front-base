/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary, useErrorHandler } from '../ErrorBoundary';
import { globalErrorHandler } from '@/utils/errorHandler';

// Mock the error handler
jest.mock('@/utils/errorHandler', () => ({
  globalErrorHandler: {
    handle: jest.fn(),
  },
  createError: {
    business: jest.fn((message, code) => ({ message, code, type: 'business' })),
  },
}));

// Suppress console.error for all tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should have error boundary functionality', () => {
    // Test that ErrorBoundary class exists and has required methods
    expect(ErrorBoundary).toBeDefined();
    expect(ErrorBoundary.getDerivedStateFromError).toBeDefined();
    
    const instance = new ErrorBoundary({ children: null });
    expect(instance.componentDidCatch).toBeDefined();
    expect(instance.handleRetry).toBeDefined();
  });

  it('should handle retry functionality', () => {
    const instance = new ErrorBoundary({ children: null });
    instance.setState({ hasError: true, error: new Error('test'), errorInfo: { componentStack: 'test' } });
    
    instance.handleRetry();
    
    expect(instance.state.hasError).toBe(false);
    expect(instance.state.error).toBeUndefined();
    expect(instance.state.errorInfo).toBeUndefined();
  });

  it('should call onError prop when provided', () => {
    const onError = jest.fn();
    const instance = new ErrorBoundary({ children: null, onError });
    const error = new Error('test error');
    const errorInfo = { componentStack: 'test stack' };
    
    instance.componentDidCatch(error, errorInfo);
    
    expect(onError).toHaveBeenCalledWith(error, errorInfo);
  });
});

describe('withErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should wrap component with ErrorBoundary', () => {
    const TestComponent = () => <div>Test Component</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should pass props to wrapped component', () => {
    const TestComponent = ({ message }: { message: string }) => <div>{message}</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent message="Hello World" />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a function that handles errors', () => {
    const TestComponent = () => {
      const handleError = useErrorHandler();
      
      const triggerError = () => {
        const error = new Error('Test error');
        handleError(error);
      };

      return (
        <div>
          <button onClick={triggerError}>Trigger Error</button>
        </div>
      );
    };

    render(<TestComponent />);

    fireEvent.click(screen.getByText('Trigger Error'));

    expect(globalErrorHandler.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '组件运行时错误',
        code: 'RUNTIME_ERROR',
        type: 'business'
      }),
      expect.objectContaining({
        originalError: expect.any(Error),
        errorInfo: undefined,
      })
    );
  });
});