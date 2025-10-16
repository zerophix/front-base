'use client';

import React from 'react';
import styles from './ScrollArea.module.css';

export interface ScrollAreaProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal' | 'both';
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  className,
  style,
  children,
  direction = 'vertical',
}) => {
  const overflowStyle: React.CSSProperties =
    direction === 'vertical'
      ? { overflowY: 'auto', overflowX: 'hidden' }
      : direction === 'horizontal'
      ? { overflowX: 'auto', overflowY: 'hidden' }
      : { overflowX: 'auto', overflowY: 'auto' };

  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div className={classes} style={{ ...overflowStyle, ...style }}>
      {children}
    </div>
  );
};