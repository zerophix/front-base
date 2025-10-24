/**
 * usePageConfig Hook 测试
 */

import { renderHook } from '@testing-library/react';
import { usePageConfig } from '../../hooks/usePageConfig';
import type { PageConfig } from '../../hooks/usePageConfig';

// Mock the store
const mockSetPageConfig = jest.fn();
jest.mock('@/store/modules/pageStore', () => ({
  usePageStore: () => ({
    setPageConfig: mockSetPageConfig,
  }),
}));

describe('usePageConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set page config with title only', () => {
    const config: PageConfig = {
      title: 'Test Page',
    };

    renderHook(() => usePageConfig(config));

    expect(mockSetPageConfig).toHaveBeenCalledWith({
      title: 'Test Page',
      breadcrumbs: [],
      recordNumber: '',
    });
  });

  it('should set page config with all properties', () => {
    const config: PageConfig = {
      title: 'Test Page',
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Category', href: '/category' },
        { label: 'Current Page' },
      ],
      recordNumber: 'REC-001',
    };

    renderHook(() => usePageConfig(config));

    expect(mockSetPageConfig).toHaveBeenCalledWith({
      title: 'Test Page',
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Category', href: '/category' },
        { label: 'Current Page' },
      ],
      recordNumber: 'REC-001',
    });
  });

  it('should update page config when config changes', () => {
    const initialConfig: PageConfig = {
      title: 'Initial Title',
    };

    const { rerender } = renderHook(
      ({ config }) => usePageConfig(config),
      { initialProps: { config: initialConfig } }
    );

    expect(mockSetPageConfig).toHaveBeenCalledWith({
      title: 'Initial Title',
      breadcrumbs: [],
      recordNumber: '',
    });

    const updatedConfig: PageConfig = {
      title: 'Updated Title',
      breadcrumbs: [{ label: 'New Breadcrumb' }],
      recordNumber: 'NEW-001',
    };

    rerender({ config: updatedConfig });

    expect(mockSetPageConfig).toHaveBeenCalledWith({
      title: 'Updated Title',
      breadcrumbs: [{ label: 'New Breadcrumb' }],
      recordNumber: 'NEW-001',
    });

    expect(mockSetPageConfig).toHaveBeenCalledTimes(2);
  });

  it('should handle empty breadcrumbs array', () => {
    const config: PageConfig = {
      title: 'Test Page',
      breadcrumbs: [],
    };

    renderHook(() => usePageConfig(config));

    expect(mockSetPageConfig).toHaveBeenCalledWith({
      title: 'Test Page',
      breadcrumbs: [],
      recordNumber: '',
    });
  });

  it('should handle undefined breadcrumbs', () => {
    const config: PageConfig = {
      title: 'Test Page',
      breadcrumbs: undefined,
    };

    renderHook(() => usePageConfig(config));

    expect(mockSetPageConfig).toHaveBeenCalledWith({
      title: 'Test Page',
      breadcrumbs: [],
      recordNumber: '',
    });
  });

  it('should handle undefined recordNumber', () => {
    const config: PageConfig = {
      title: 'Test Page',
      recordNumber: undefined,
    };

    renderHook(() => usePageConfig(config));

    expect(mockSetPageConfig).toHaveBeenCalledWith({
      title: 'Test Page',
      breadcrumbs: [],
      recordNumber: '',
    });
  });
});