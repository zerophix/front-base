'use client';

import React from 'react';
import { Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Image from 'next/image';
import styles from './UserSelect.module.css';

interface UserSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  options?: Array<{ label: string; value: string; avatar?: string }>;
}

export const UserSelect: React.FC<UserSelectProps> = ({
  value,
  onChange,
  placeholder = '请选择用户',
  options,
}) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={styles.userSelect}
      dropdownRender={(menu) => (
        <div className={styles.dropdownContainer}>
          {menu}
        </div>
      )}
    >
      {options?.map(option => (
        <Select.Option key={option.value} value={option.value}>
          <div className={styles.optionItem}>
            {option.avatar ? (
              <Image src={option.avatar} alt="avatar" className={styles.avatar} width={24} height={24} />
            ) : (
              <UserOutlined className={styles.icon} />
            )}
            <span>{option.label}</span>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};