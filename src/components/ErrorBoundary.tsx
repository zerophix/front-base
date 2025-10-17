'use client';

/**
 * 全局错误边界组件
 * 捕获React组件中的错误并提供友好的错误界面
 */

import React, { Component, ReactNode } from 'react';
import { Result, Button } from 'antd';
import { globalErrorHandler, createError } from '@/utils/errorHandler';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: React.ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 使用全局错误处理器记录错误
    const appError = createError.business(
      '页面渲染出现错误',
      'COMPONENT_ERROR'
    );
    
    globalErrorHandler.handle(appError, {
      originalError: error,
      errorInfo,
      componentStack: errorInfo.componentStack,
    });

    // 调用自定义错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleRetry);
      }

      // 默认错误界面
      return (
        <div style={{ padding: '50px' }}>
          <Result
            status="error"
            title="页面出现错误"
            subTitle="抱歉，页面渲染时出现了错误。请尝试刷新页面或联系管理员。"
            extra={[
              <Button type="primary" key="retry" onClick={this.handleRetry}>
                重试
              </Button>,
              <Button key="refresh" onClick={() => window.location.reload()}>
                刷新页面
              </Button>,
            ]}
          >
            {process.env.NODE_ENV === 'development' && (
              <div style={{ textAlign: 'left', marginTop: '20px' }}>
                <details>
                  <summary>错误详情（开发环境）</summary>
                  <pre style={{ 
                    background: 'var(--color-bg-muted)', 
                    padding: '10px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto'
                  }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 高阶组件：为组件添加错误边界
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

/**
 * Hook：在函数组件中使用错误边界
 */
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: any) => {
    const appError = createError.business(
      '组件运行时错误',
      'RUNTIME_ERROR'
    );
    
    globalErrorHandler.handle(appError, {
      originalError: error,
      errorInfo,
    });
  }, []);
}