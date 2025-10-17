/**
 * PreloadStrategy 组件测试
 */

import React from 'react';
import { render } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { PreloadStrategy } from '../PreloadStrategy';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockRouter = {
  prefetch: jest.fn(),
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock window.location
const mockLocation = {
  pathname: '/',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('PreloadStrategy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseRouter.mockReturnValue(mockRouter as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render without crashing', () => {
    const { container } = render(<PreloadStrategy />);
    expect(container.firstChild).toBeNull(); // Component renders nothing
  });

  it('should preload common routes after delay', () => {
    mockLocation.pathname = '/home';
    
    render(<PreloadStrategy />);
    
    // Fast-forward past the initial delay
    jest.advanceTimersByTime(1000);
    
    // Fast-forward past the staggered preloading
    jest.advanceTimersByTime(1000);
    
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/data');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/equipment');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/personnel');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/quality');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/project');
    
    // Should not preload current page
    expect(mockRouter.prefetch).not.toHaveBeenCalledWith('/home');
  });

  it('should preload data module routes when on data page', () => {
    mockLocation.pathname = '/data/detection-objects';
    
    render(<PreloadStrategy />);
    
    jest.advanceTimersByTime(2000);
    
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/data/detection-params');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/data/parameter-code');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/data/statistics-analysis');
    
    // Should not preload current page
    expect(mockRouter.prefetch).not.toHaveBeenCalledWith('/data/detection-objects');
  });

  it('should preload equipment module routes when on equipment page', () => {
    mockLocation.pathname = '/equipment/device';
    
    render(<PreloadStrategy />);
    
    jest.advanceTimersByTime(2000);
    
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/equipment/new');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/equipment/calibration');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/equipment/maintenance-plan');
    
    // Should not preload current page
    expect(mockRouter.prefetch).not.toHaveBeenCalledWith('/equipment/device');
  });

  it('should preload personnel module routes when on personnel page', () => {
    mockLocation.pathname = '/personnel/list';
    
    render(<PreloadStrategy />);
    
    jest.advanceTimersByTime(2000);
    
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/personnel/registration');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/personnel/training');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/personnel/qualification');
    
    // Should not preload current page
    expect(mockRouter.prefetch).not.toHaveBeenCalledWith('/personnel/list');
  });

  it('should preload quality module routes when on quality page', () => {
    mockLocation.pathname = '/quality/contract-review';
    
    render(<PreloadStrategy />);
    
    jest.advanceTimersByTime(2000);
    
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/quality/supervision-plan');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/quality/nonconformity');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/quality/environment');
    
    // Should not preload current page
    expect(mockRouter.prefetch).not.toHaveBeenCalledWith('/quality/contract-review');
  });

  it('should preload project module routes when on project page', () => {
    mockLocation.pathname = '/project/new';
    
    render(<PreloadStrategy />);
    
    jest.advanceTimersByTime(2000);
    
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/project/task');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/project/station');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/project/task-management');
    
    // Should not preload current page
    expect(mockRouter.prefetch).not.toHaveBeenCalledWith('/project/new');
  });

  it('should stagger preload calls with delays', () => {
    mockLocation.pathname = '/data';
    
    render(<PreloadStrategy />);
    
    // Initial delay of 1000ms
    jest.advanceTimersByTime(1000);
    
    // Advance all timers to trigger all preload calls
    jest.runAllTimers();
    
    // Check that prefetch was called for common routes (excluding current path)
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/home');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/equipment');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/personnel');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/quality');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/project');
    
    // Check that prefetch was called for data module routes
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/data/detection-objects');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/data/detection-params');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/data/parameter-code');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/data/statistics-analysis');
    
    // Should not prefetch current path
    expect(mockRouter.prefetch).not.toHaveBeenCalledWith('/data');
  });

  it('should cleanup timer on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    const { unmount } = render(<PreloadStrategy />);
    
    unmount();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });
});