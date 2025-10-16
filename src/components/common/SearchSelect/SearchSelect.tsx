'use client';

import React from 'react';
import { Select } from 'antd';
import styles from './SearchSelect.module.css';

interface SearchSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  onSearch?: (value: string) => void;
}

const SearchSelectComponent: React.FC<SearchSelectProps> = ({
  value,
  onChange,
  placeholder = '请输入关键字进行搜索',
  options,
  onSearch,
}) => {
  return (
    <Select
      showSearch
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      optionFilterProp="children"
      onSearch={onSearch}
      filterOption={(input, option) =>
        (option?.label as string).toLowerCase().includes(input.toLowerCase())
      }
      className={styles.searchSelect}
    >
      {options?.map(option => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      ))}
    </Select>
  );
};

// 使用React.memo优化性能
export const SearchSelect = React.memo(SearchSelectComponent);