'use client';

import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Button } from 'antd';
import styles from '../home/page.module.css';

const { Title, Paragraph } = Typography;

export default function DebugHomePage() {
  const [cssLoaded, setCssLoaded] = useState(false);
  const [stylesObject, setStylesObject] = useState<any>(null);

  useEffect(() => {
    // 检查CSS模块是否正确加载
    console.log('CSS Module styles:', styles);
    setStylesObject(styles);
    
    // 检查CSS变量是否可用
    const rootStyles = getComputedStyle(document.documentElement);
    const primaryColor = rootStyles.getPropertyValue('--color-primary');
    const homeCardPrimary = rootStyles.getPropertyValue('--home-card-primary');
    
    console.log('CSS Variables:', {
      primaryColor,
      homeCardPrimary,
      allStyles: styles
    });
    
    setCssLoaded(true);
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={1}>调试页面 - 欢迎信息测试</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="CSS 加载状态">
          <p>CSS 模块加载状态: {cssLoaded ? '✅ 已加载' : '❌ 未加载'}</p>
          <p>样式对象: {JSON.stringify(stylesObject, null, 2)}</p>
        </Card>

        <Card title="原始欢迎卡片测试">
          <Card className={styles.welcomeCard}>
            <div className={styles.welcomeContent}>
              <Title level={2} className={styles.welcomeTitle}>
                欢迎使用 LIMS 系统
              </Title>
              <Paragraph className={styles.welcomeDescription}>
                实验室信息管理系统为您提供全面的项目管理、人员管理、设备管理、数据管理和质量管理功能，
                助力实验室高效运营和规范管理。
              </Paragraph>
              <Space>
                <Button type="primary">
                  查看管理概览
                </Button>
                <Button>
                  新建项目
                </Button>
              </Space>
            </div>
          </Card>
        </Card>

        <Card title="简化版本测试">
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '32px',
            borderRadius: '8px',
            color: 'white'
          }}>
            <h2 style={{ color: 'white', margin: '0 0 16px 0' }}>
              欢迎使用 LIMS 系统
            </h2>
            <p style={{ color: 'white', margin: '0 0 24px 0' }}>
              实验室信息管理系统为您提供全面的项目管理、人员管理、设备管理、数据管理和质量管理功能，
              助力实验室高效运营和规范管理。
            </p>
            <Space>
              <Button type="primary">
                查看管理概览
              </Button>
              <Button>
                新建项目
              </Button>
            </Space>
          </div>
        </Card>

        <Card title="CSS 变量测试">
          <div style={{ 
            color: 'var(--color-primary)',
            fontSize: '18px',
            marginBottom: '16px'
          }}>
            这段文字使用了 --color-primary 变量
          </div>
          <div style={{ 
            color: 'var(--home-card-primary)',
            fontSize: '18px'
          }}>
            这段文字使用了 --home-card-primary 变量
          </div>
        </Card>
      </Space>
    </div>
  );
}