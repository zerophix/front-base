'use client';

import React from 'react';
import { MainLayout, PageContainer } from '@/components/layouts/MainLayout';
import { Card, Row, Col, Statistic, Button, Space, Typography } from 'antd';
import { 
  ProjectOutlined, 
  TeamOutlined, 
  ToolOutlined, 
  DatabaseOutlined, 
  SafetyOutlined,
  BarChartOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const { Title, Paragraph } = Typography;

function HomePageComponent() {
  const router = useRouter();

  const quickActions = [
    {
      title: '项目管理',
      description: '创建和管理检测项目',
      icon: <ProjectOutlined />,
      path: '/project'
    },
    {
      title: '人员管理',
      description: '管理实验室人员信息',
      icon: <TeamOutlined />,
      path: '/personnel'
    },
    {
      title: '设备管理',
      description: '设备台账和维护管理',
      icon: <ToolOutlined />,
      path: '/equipment'
    },
    {
      title: '数据管理',
      description: '检测参数和对象管理',
      icon: <DatabaseOutlined />,
      path: '/data'
    },
    {
      title: '质量管理',
      description: '质量体系和文件管理',
      icon: <SafetyOutlined />,
      path: '/quality'
    }
  ];

  const statistics = [
    {
      title: '进行中项目',
      value: 12,
      suffix: '个'
    },
    {
      title: '在岗人员',
      value: 28,
      suffix: '人'
    },
    {
      title: '设备总数',
      value: 156,
      suffix: '台'
    },
    {
      title: '本月检测',
      value: 89,
      suffix: '批次'
    }
  ];

  const statisticClasses = [
    styles.statisticPrimary,
    styles.statisticSuccess,
    styles.statisticWarning,
    styles.statisticPrimary,
  ];

  const actionIconClasses = [
    styles.actionIconPrimary,
    styles.actionIconSuccess,
    styles.actionIconWarning,
    styles.actionIconPurple,
    styles.actionIconPink,
  ];

  const handleQuickAction = (path: string) => {
    router.push(path);
  };

  const handleViewOverview = () => {
    router.push('/project/management-overview');
  };

  return (
    <MainLayout>
      <PageContainer title="LIMS">
        <div className={styles.container}>
          {/* 欢迎区域 */}
          <Card className={`${styles.welcomeCard} ${styles.welcomeCardEnhanced}`}>
            <div className={styles.welcomeContent}>
              <Title level={2} className={styles.welcomeTitle}>
                欢迎使用 LIMS 系统
              </Title>
              <Paragraph className={styles.welcomeDescription}>
                实验室信息管理系统为您提供全面的项目管理、人员管理、设备管理、数据管理和质量管理功能，
                助力实验室高效运营和规范管理。
              </Paragraph>
              <Space className={styles.welcomeActions}>
                <Button 
                  type="primary"
                  size="large"
                  icon={<BarChartOutlined />}
                  onClick={handleViewOverview}
                >
                  查看管理概览
                </Button>
                <Button 
                  size="large"
                  ghost
                  onClick={() => handleQuickAction('/project/new')}
                >
                  新建项目
                </Button>
              </Space>
            </div>
          </Card>

          {/* 统计数据 */}
          <Card title="系统概况" className={styles.statisticsCard}>
            <Row gutter={[24, 24]}>
              {statistics.map((stat, index) => (
                <Col xs={12} sm={6} key={index}>
                  <div className={statisticClasses[index]}>
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      suffix={stat.suffix}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* 快速导航 */}
          <Card title="快速导航" className={styles.quickActionsCard}>
            <Row gutter={[24, 24]}>
              {quickActions.map((action, index) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={index}>
                  <Card
                    hoverable
                    className={styles.actionCard}
                    onClick={() => handleQuickAction(action.path)}
                  >
                    <div className={styles.actionContent}>
                      <div className={`${styles.actionIcon} ${actionIconClasses[index]}`}>
                        {action.icon}
                      </div>
                      <div className={styles.actionText}>
                        <Title level={4} className={styles.actionTitle}>
                          {action.title}
                        </Title>
                        <Paragraph className={styles.actionDescription}>
                          {action.description}
                        </Paragraph>
                      </div>
                      <RightOutlined className={styles.actionArrow} />
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </div>
      </PageContainer>
    </MainLayout>
  );
}

// 使用React.memo优化性能
export default React.memo(HomePageComponent);