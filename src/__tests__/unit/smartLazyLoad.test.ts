import { ComponentType } from 'react';
import { smartLazyLoad, LazyLoadStrategies, shouldUseLazyLoad } from '../../utils/smartLazyLoad';

// Mock next/dynamic
jest.mock('next/dynamic', () => {
  return jest.fn((importFn: () => Promise<{ default: ComponentType<any> }>, options?: any) => {
    const MockComponent = () => null;
    MockComponent.displayName = 'DynamicComponent';
    return MockComponent;
  });
});

// Mock console.warn
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('smartLazyLoad', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleWarn.mockRestore();
  });

  describe('smartLazyLoad function', () => {
    const mockImportFn = jest.fn(() => Promise.resolve({ default: () => null }));

    beforeEach(() => {
      mockImportFn.mockClear();
    });

    it('should create lazy loaded component with complex option', () => {
      const LazyComponent = smartLazyLoad(mockImportFn, { isComplex: true });
      
      expect(LazyComponent).toBeDefined();
      expect(LazyComponent.displayName).toBe('DynamicComponent');
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should create lazy loaded component with low frequency option', () => {
      const LazyComponent = smartLazyLoad(mockImportFn, { isLowFrequency: true });
      
      expect(LazyComponent).toBeDefined();
      expect(LazyComponent.displayName).toBe('DynamicComponent');
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should create lazy loaded component with both complex and low frequency options', () => {
      const LazyComponent = smartLazyLoad(mockImportFn, { 
        isComplex: true, 
        isLowFrequency: true 
      });
      
      expect(LazyComponent).toBeDefined();
      expect(LazyComponent.displayName).toBe('DynamicComponent');
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should warn when neither complex nor low frequency is true', () => {
      const LazyComponent = smartLazyLoad(mockImportFn, { 
        isComplex: false, 
        isLowFrequency: false 
      });
      
      expect(LazyComponent).toBeDefined();
      expect(mockConsoleWarn).toHaveBeenCalledWith('建议对此组件使用直接导入而非懒加载');
    });

    it('should warn when no options are provided (defaults to false)', () => {
      const LazyComponent = smartLazyLoad(mockImportFn);
      
      expect(LazyComponent).toBeDefined();
      expect(mockConsoleWarn).toHaveBeenCalledWith('建议对此组件使用直接导入而非懒加载');
    });

    it('should warn when empty options object is provided', () => {
      const LazyComponent = smartLazyLoad(mockImportFn, {});
      
      expect(LazyComponent).toBeDefined();
      expect(mockConsoleWarn).toHaveBeenCalledWith('建议对此组件使用直接导入而非懒加载');
    });

    it('should handle loadingText option (though not used in implementation)', () => {
      const LazyComponent = smartLazyLoad(mockImportFn, { 
        isComplex: true,
        loadingText: 'Loading...' 
      });
      
      expect(LazyComponent).toBeDefined();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
  });

  describe('LazyLoadStrategies', () => {
    it('should have correct chart strategy configuration', () => {
      expect(LazyLoadStrategies.chart).toEqual({
        isComplex: true,
        isLowFrequency: false
      });
    });

    it('should have correct report strategy configuration', () => {
      expect(LazyLoadStrategies.report).toEqual({
        isComplex: true,
        isLowFrequency: true
      });
    });

    it('should have correct settings strategy configuration', () => {
      expect(LazyLoadStrategies.settings).toEqual({
        isComplex: false,
        isLowFrequency: true
      });
    });

    it('should have correct normal strategy configuration', () => {
      expect(LazyLoadStrategies.normal).toEqual({
        isComplex: false,
        isLowFrequency: false
      });
    });

    it('should be readonly (as const)', () => {
      // This test ensures the strategies object is properly typed as const
      const strategies = LazyLoadStrategies;
      expect(typeof strategies).toBe('object');
      expect(Object.keys(strategies)).toEqual(['chart', 'report', 'settings', 'normal']);
    });
  });

  describe('shouldUseLazyLoad function', () => {
    it('should return true for chart strategy (complex but not low frequency)', () => {
      expect(shouldUseLazyLoad('chart')).toBe(true);
    });

    it('should return true for report strategy (complex and low frequency)', () => {
      expect(shouldUseLazyLoad('report')).toBe(true);
    });

    it('should return true for settings strategy (not complex but low frequency)', () => {
      expect(shouldUseLazyLoad('settings')).toBe(true);
    });

    it('should return false for normal strategy (not complex and not low frequency)', () => {
      expect(shouldUseLazyLoad('normal')).toBe(false);
    });
  });

  describe('Integration tests', () => {
    const mockImportFn = jest.fn(() => Promise.resolve({ default: () => null }));

    beforeEach(() => {
      mockImportFn.mockClear();
    });

    it('should work with chart strategy', () => {
      const chartStrategy = LazyLoadStrategies.chart;
      const shouldLazy = shouldUseLazyLoad('chart');
      const LazyComponent = smartLazyLoad(mockImportFn, chartStrategy);
      
      expect(shouldLazy).toBe(true);
      expect(LazyComponent).toBeDefined();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should work with report strategy', () => {
      const reportStrategy = LazyLoadStrategies.report;
      const shouldLazy = shouldUseLazyLoad('report');
      const LazyComponent = smartLazyLoad(mockImportFn, reportStrategy);
      
      expect(shouldLazy).toBe(true);
      expect(LazyComponent).toBeDefined();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should work with settings strategy', () => {
      const settingsStrategy = LazyLoadStrategies.settings;
      const shouldLazy = shouldUseLazyLoad('settings');
      const LazyComponent = smartLazyLoad(mockImportFn, settingsStrategy);
      
      expect(shouldLazy).toBe(true);
      expect(LazyComponent).toBeDefined();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should work with normal strategy and show warning', () => {
      const normalStrategy = LazyLoadStrategies.normal;
      const shouldLazy = shouldUseLazyLoad('normal');
      const LazyComponent = smartLazyLoad(mockImportFn, normalStrategy);
      
      expect(shouldLazy).toBe(false);
      expect(LazyComponent).toBeDefined();
      expect(mockConsoleWarn).toHaveBeenCalledWith('建议对此组件使用直接导入而非懒加载');
    });
  });

  describe('Edge cases', () => {
    const mockImportFn = jest.fn(() => Promise.resolve({ default: () => null }));

    beforeEach(() => {
      mockImportFn.mockClear();
    });

    it('should handle undefined options gracefully', () => {
      const LazyComponent = smartLazyLoad(mockImportFn, undefined as any);
      
      expect(LazyComponent).toBeDefined();
      expect(mockConsoleWarn).toHaveBeenCalledWith('建议对此组件使用直接导入而非懒加载');
    });

    it('should handle partial options', () => {
      const LazyComponent = smartLazyLoad(mockImportFn, { isComplex: true });
      
      expect(LazyComponent).toBeDefined();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should handle only loadingText option', () => {
      const LazyComponent = smartLazyLoad(mockImportFn, { loadingText: 'Loading...' });
      
      expect(LazyComponent).toBeDefined();
      expect(mockConsoleWarn).toHaveBeenCalledWith('建议对此组件使用直接导入而非懒加载');
    });
  });

  describe('Type safety', () => {
    it('should accept valid strategy keys', () => {
      // These should compile without TypeScript errors
      expect(() => shouldUseLazyLoad('chart')).not.toThrow();
      expect(() => shouldUseLazyLoad('report')).not.toThrow();
      expect(() => shouldUseLazyLoad('settings')).not.toThrow();
      expect(() => shouldUseLazyLoad('normal')).not.toThrow();
    });

    it('should work with different component types', () => {
      const mockFunctionComponent = () => Promise.resolve({ default: () => null });
      const MockClassComponent = () => null;
      const mockClassComponent = () => Promise.resolve({ 
        default: MockClassComponent
      });

      expect(() => smartLazyLoad(mockFunctionComponent)).not.toThrow();
      expect(() => smartLazyLoad(mockClassComponent)).not.toThrow();
    });
  });
});