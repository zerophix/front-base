/**
 * useTableData Hook 测试
 */

import { renderHook, act } from '@testing-library/react';
import { useTableData } from '../useTableData';
import type { IEditableRow } from '@/types/form';

interface TestRow extends IEditableRow {
  name: string;
  age: number;
}

const createTestRow = (): TestRow => ({
  key: Math.random().toString(36).substr(2, 9),
  name: '',
  age: 0,
});

describe('useTableData', () => {
  it('should initialize with default row when no initial data', () => {
    const { result } = renderHook(() =>
      useTableData({
        createDefaultRow: createTestRow,
      })
    );

    expect(result.current.dataSource).toHaveLength(1);
    expect(result.current.dataSource[0]).toMatchObject({
      name: '',
      age: 0,
    });
  });

  it('should initialize with provided initial data', () => {
    const initialData: TestRow[] = [
      { key: '1', name: 'John', age: 25 },
      { key: '2', name: 'Jane', age: 30 },
    ];

    const { result } = renderHook(() =>
      useTableData({
        initialData,
        createDefaultRow: createTestRow,
      })
    );

    expect(result.current.dataSource).toHaveLength(2);
    expect(result.current.dataSource).toEqual(initialData);
  });

  it('should add new row', () => {
    const { result } = renderHook(() =>
      useTableData({
        createDefaultRow: createTestRow,
      })
    );

    act(() => {
      result.current.handleAdd();
    });

    expect(result.current.dataSource).toHaveLength(2);
  });

  it('should not add row when maxRows limit reached', () => {
    const { result } = renderHook(() =>
      useTableData({
        createDefaultRow: createTestRow,
        maxRows: 1,
      })
    );

    act(() => {
      result.current.handleAdd();
    });

    expect(result.current.dataSource).toHaveLength(1);
  });

  it('should delete row by key', () => {
    const initialData: TestRow[] = [
      { key: '1', name: 'John', age: 25 },
      { key: '2', name: 'Jane', age: 30 },
    ];

    const { result } = renderHook(() =>
      useTableData({
        initialData,
        createDefaultRow: createTestRow,
      })
    );

    act(() => {
      result.current.handleDelete('1');
    });

    expect(result.current.dataSource).toHaveLength(1);
    expect(result.current.dataSource[0].key).toBe('2');
  });

  it('should not delete row when minRows limit reached', () => {
    const initialData: TestRow[] = [
      { key: '1', name: 'John', age: 25 },
    ];

    const { result } = renderHook(() =>
      useTableData({
        initialData,
        createDefaultRow: createTestRow,
        minRows: 1,
      })
    );

    act(() => {
      result.current.handleDelete('1');
    });

    expect(result.current.dataSource).toHaveLength(1);
  });

  it('should update row by key', () => {
    const initialData: TestRow[] = [
      { key: '1', name: 'John', age: 25 },
    ];

    const { result } = renderHook(() =>
      useTableData({
        initialData,
        createDefaultRow: createTestRow,
      })
    );

    act(() => {
      result.current.handleUpdate('1', { name: 'Updated John', age: 26 });
    });

    expect(result.current.dataSource[0]).toMatchObject({
      key: '1',
      name: 'Updated John',
      age: 26,
    });
  });

  it('should update single field', () => {
    const initialData: TestRow[] = [
      { key: '1', name: 'John', age: 25 },
    ];

    const { result } = renderHook(() =>
      useTableData({
        initialData,
        createDefaultRow: createTestRow,
      })
    );

    act(() => {
      result.current.handleFieldChange('1', 'name', 'Updated John');
    });

    expect(result.current.dataSource[0].name).toBe('Updated John');
    expect(result.current.dataSource[0].age).toBe(25);
  });

  it('should batch add items', () => {
    const { result } = renderHook(() =>
      useTableData({
        createDefaultRow: createTestRow,
      })
    );

    const newItems: TestRow[] = [
      { key: '2', name: 'John', age: 25 },
      { key: '3', name: 'Jane', age: 30 },
    ];

    act(() => {
      result.current.handleBatchAdd(newItems);
    });

    expect(result.current.dataSource).toHaveLength(3);
  });

  it('should not batch add when maxRows limit would be exceeded', () => {
    const { result } = renderHook(() =>
      useTableData({
        createDefaultRow: createTestRow,
        maxRows: 2,
      })
    );

    const newItems: TestRow[] = [
      { key: '2', name: 'John', age: 25 },
      { key: '3', name: 'Jane', age: 30 },
    ];

    act(() => {
      result.current.handleBatchAdd(newItems);
    });

    expect(result.current.dataSource).toHaveLength(1);
  });

  it('should batch delete items', () => {
    const initialData: TestRow[] = [
      { key: '1', name: 'John', age: 25 },
      { key: '2', name: 'Jane', age: 30 },
      { key: '3', name: 'Bob', age: 35 },
    ];

    const { result } = renderHook(() =>
      useTableData({
        initialData,
        createDefaultRow: createTestRow,
      })
    );

    act(() => {
      result.current.handleBatchDelete(['1', '3']);
    });

    expect(result.current.dataSource).toHaveLength(1);
    expect(result.current.dataSource[0].key).toBe('2');
  });

  it('should not batch delete when minRows limit would be violated', () => {
    const initialData: TestRow[] = [
      { key: '1', name: 'John', age: 25 },
      { key: '2', name: 'Jane', age: 30 },
    ];

    const { result } = renderHook(() =>
      useTableData({
        initialData,
        createDefaultRow: createTestRow,
        minRows: 2,
      })
    );

    act(() => {
      result.current.handleBatchDelete(['1', '2']);
    });

    expect(result.current.dataSource).toHaveLength(2);
  });

  it('should clear data and add default row', () => {
    const initialData: TestRow[] = [
      { key: '1', name: 'John', age: 25 },
      { key: '2', name: 'Jane', age: 30 },
    ];

    const { result } = renderHook(() =>
      useTableData({
        initialData,
        createDefaultRow: createTestRow,
      })
    );

    act(() => {
      result.current.handleClear();
    });

    expect(result.current.dataSource).toHaveLength(1);
    expect(result.current.dataSource[0]).toMatchObject({
      name: '',
      age: 0,
    });
  });

  it('should reset to initial data', () => {
    const initialData: TestRow[] = [
      { key: '1', name: 'John', age: 25 },
    ];

    const { result } = renderHook(() =>
      useTableData({
        initialData,
        createDefaultRow: createTestRow,
      })
    );

    // Modify data
    act(() => {
      result.current.handleAdd();
    });
    
    act(() => {
      result.current.handleUpdate('1', { name: 'Modified' });
    });

    expect(result.current.dataSource).toHaveLength(2);
    expect(result.current.dataSource[0].name).toBe('Modified');

    // Reset
    act(() => {
      result.current.handleReset();
    });

    expect(result.current.dataSource).toHaveLength(1);
    expect(result.current.dataSource[0]).toEqual(initialData[0]);
  });

  it('should reset to default row when no initial data', () => {
    const { result } = renderHook(() =>
      useTableData({
        createDefaultRow: createTestRow,
      })
    );

    // Add more data
    act(() => {
      result.current.handleAdd();
    });

    expect(result.current.dataSource).toHaveLength(2);

    // Reset
    act(() => {
      result.current.handleReset();
    });

    expect(result.current.dataSource).toHaveLength(1);
    expect(result.current.dataSource[0]).toMatchObject({
      name: '',
      age: 0,
    });
  });

  it('should set data source directly', () => {
    const { result } = renderHook(() =>
      useTableData({
        createDefaultRow: createTestRow,
      })
    );

    const newData: TestRow[] = [
      { key: '1', name: 'Direct', age: 100 },
    ];

    act(() => {
      result.current.setDataSource(newData);
    });

    expect(result.current.dataSource).toEqual(newData);
  });
});