/**
 * 性能监控仪表板
 * 展示实时性能数据和分析报告
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Badge, 
  Button, 
  Tabs, 
  Alert, 
  Progress, 
  Row, 
  Col, 
  Statistic, 
  Space,
  Typography,
  Spin,
  Table
} from 'antd';
import { 
  RiseOutlined, 
  FallOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import type { PerformanceReport } from '@/lib/performance-reporter';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface PerformanceDashboardProps {
  className?: string;
}

export function PerformanceDashboard({ className }: PerformanceDashboardProps) {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // 获取性能数据
  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/performance');
      if (!response.ok) throw new Error('Failed to fetch performance data');
      
      const data = await response.json();
      if (data.success) {
        // 生成模拟报告
        const mockReport = generateMockReport();
        setReport(mockReport);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchPerformanceData, 30000); // 30秒刷新
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '64px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载性能数据...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="错误"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  if (!report) {
    return (
      <div style={{ textAlign: 'center', padding: '64px' }}>
        <Text type="secondary">暂无性能数据</Text>
      </div>
    );
  }

  return (
    <div className={className} style={{ padding: '24px' }}>
      {/* 头部控制 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2}>性能监控仪表板</Title>
          <Text type="secondary">
            最后更新: {new Date(report.generatedAt).toLocaleString()}
          </Text>
        </div>
        <Space>
          <Button
            type={autoRefresh ? "primary" : "default"}
            icon={<ReloadOutlined spin={autoRefresh} />}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            自动刷新
          </Button>
          <Button 
            icon={<ReloadOutlined />}
            onClick={fetchPerformanceData}
          >
            手动刷新
          </Button>
        </Space>
      </div>

      {/* 总体评分 */}
      <Card 
        title={
          <span>
            <ThunderboltOutlined style={{ marginRight: 8 }} />
            总体性能评分
          </span>
        }
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={24} align="middle">
          <Col span={6}>
            <Statistic
              title="总体评分"
              value={report.summary.overallScore}
              suffix="分"
              valueStyle={{ 
                color: getScoreColor(report.summary.overallScore),
                fontSize: '48px'
              }}
            />
          </Col>
          <Col span={12}>
             <Progress 
               percent={report.summary.overallScore} 
               strokeColor={getScoreColor(report.summary.overallScore)}
               size={[300, 20]}
             />
           </Col>
          <Col span={6}>
            <Badge 
              status={getScoreStatus(report.summary.overallScore)} 
              text={getScoreLabel(report.summary.overallScore)}
            />
          </Col>
        </Row>
        
        <Row gutter={24} style={{ marginTop: '24px' }}>
          <Col span={8}>
            <Statistic
              title="总指标数"
              value={report.summary.totalMetrics}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="用户会话"
              value={report.summary.uniqueSessions}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="页面数量"
              value={report.summary.uniquePages}
              prefix={<ExclamationCircleOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* 告警 */}
      {report.alerts.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <Title level={4}>
            <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
            性能告警
          </Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            {report.alerts.slice(0, 3).map((alert, index) => (
              <Alert
                key={index}
                message={alert.title}
                description={alert.description}
                type={alert.severity === 'critical' ? 'error' : 'warning'}
                showIcon
              />
            ))}
          </Space>
        </div>
      )}

      {/* 详细数据 */}
      <Tabs defaultActiveKey="metrics">
        <TabPane tab="核心指标" key="metrics">
          <Row gutter={[16, 16]}>
            {Object.entries(report.summary.scoreBreakdown).map(([name, data]) => (
              <Col xs={24} sm={12} lg={8} key={name}>
                <Card size="small">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong>{getMetricDisplayName(name)}</Text>
                    {data.trend === 'improving' && <RiseOutlined style={{ color: '#52c41a' }} />}
                    {data.trend === 'degrading' && <FallOutlined style={{ color: '#ff4d4f' }} />}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 8 }}>
                    {data.score}
                  </div>
                  <Progress 
                    percent={data.score} 
                    size="small" 
                    strokeColor={getScoreColor(data.score)}
                    style={{ marginBottom: 8 }}
                  />
                  <Badge 
                    status={getRatingStatus(data.rating)} 
                    text={getRatingLabel(data.rating)}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        <TabPane tab="优化建议" key="recommendations">
          <Space direction="vertical" style={{ width: '100%' }}>
            {report.recommendations.map((rec, index) => (
              <Card key={index} size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      {rec.type === 'critical' && <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />}
                      {rec.type === 'warning' && <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />}
                      {rec.type === 'info' && <CheckCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
                      <Text strong>{rec.title}</Text>
                    </div>
                    <Text type="secondary">{rec.description}</Text>
                    {rec.affectedPages && rec.affectedPages.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text style={{ fontSize: '12px' }}>受影响页面: </Text>
                        <Space wrap>
                          {rec.affectedPages.slice(0, 5).map((page, i) => (
                            <Badge key={i} count={page} style={{ backgroundColor: '#f0f0f0', color: '#666' }} />
                          ))}
                          {rec.affectedPages.length > 5 && (
                            <Badge count={`+${rec.affectedPages.length - 5} 更多`} style={{ backgroundColor: '#f0f0f0', color: '#666' }} />
                          )}
                        </Space>
                      </div>
                    )}
                  </div>
                  <Space>
                    <Badge status="processing" text={`影响: ${rec.impact}`} />
                    <Badge status="default" text={`工作量: ${rec.effort}`} />
                  </Space>
                </div>
              </Card>
            ))}
          </Space>
        </TabPane>

        <TabPane tab="详细数据" key="details">
          {report.metrics.map((metric, index) => (
            <Card key={index} title={`${getMetricDisplayName(metric.name)} 详细统计`} style={{ marginBottom: 16 }}>
              <Row gutter={24}>
                <Col span={12}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic title="平均值" value={metric.statistics.average.toFixed(2)} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="中位数" value={metric.statistics.median.toFixed(2)} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="P95" value={metric.statistics.p95.toFixed(2)} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="样本数" value={metric.statistics.count} />
                    </Col>
                  </Row>
                </Col>
                <Col span={12}>
                  <div>
                    <Text strong style={{ marginBottom: 16, display: 'block' }}>性能分布</Text>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>良好</span>
                        <span>{metric.distribution.good.toFixed(1)}%</span>
                      </div>
                      <Progress percent={metric.distribution.good} strokeColor="#52c41a" size="small" />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>需要改进</span>
                        <span>{metric.distribution.needsImprovement.toFixed(1)}%</span>
                      </div>
                      <Progress percent={metric.distribution.needsImprovement} strokeColor="#faad14" size="small" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>较差</span>
                        <span>{metric.distribution.poor.toFixed(1)}%</span>
                      </div>
                      <Progress percent={metric.distribution.poor} strokeColor="#ff4d4f" size="small" />
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          ))}
        </TabPane>
      </Tabs>
    </div>
  );
}

// 辅助函数
function getScoreColor(score: number) {
  if (score >= 75) return '#52c41a';
  if (score >= 50) return '#faad14';
  return '#ff4d4f';
}

function getScoreStatus(score: number): 'success' | 'warning' | 'error' {
  if (score >= 75) return 'success';
  if (score >= 50) return 'warning';
  return 'error';
}

function getScoreLabel(score: number) {
  if (score >= 75) return '良好';
  if (score >= 50) return '需要改进';
  return '较差';
}

function getRatingStatus(rating: string): 'success' | 'warning' | 'error' | 'default' {
  switch (rating) {
    case 'good': return 'success';
    case 'needs-improvement': return 'warning';
    case 'poor': return 'error';
    default: return 'default';
  }
}

function getRatingLabel(rating: string) {
  switch (rating) {
    case 'good': return '良好';
    case 'needs-improvement': return '需要改进';
    case 'poor': return '较差';
    default: return '未知';
  }
}

function getMetricDisplayName(name: string) {
  const displayNames: { [key: string]: string } = {
    LCP: 'Largest Contentful Paint',
    INP: 'Interaction to Next Paint',
    CLS: 'Cumulative Layout Shift',
    FCP: 'First Contentful Paint',
    TTFB: 'Time to First Byte',
    MEMORY_USAGE: '内存使用率',
    RESOURCE_LOAD_TIME: '资源加载时间',
    ERROR_RATE: '错误率',
  };
  return displayNames[name] || name;
}

// 生成模拟报告
function generateMockReport(): PerformanceReport {
  return {
    summary: {
      totalMetrics: 1250,
      uniqueSessions: 25,
      uniquePages: 8,
      overallScore: 78,
      scoreBreakdown: {
        LCP: { score: 85, rating: 'good', trend: 'improving' },
        INP: { score: 72, rating: 'needs-improvement', trend: 'stable' },
        CLS: { score: 90, rating: 'good', trend: 'improving' },
        FCP: { score: 68, rating: 'needs-improvement', trend: 'degrading' },
        TTFB: { score: 75, rating: 'good', trend: 'stable' },
      },
    },
    metrics: [
      {
        name: 'LCP',
        statistics: {
          count: 500,
          min: 1200,
          max: 8000,
          average: 2800,
          median: 2500,
          p75: 3200,
          p90: 4500,
          p95: 5800,
          p99: 7200,
          standardDeviation: 1200,
        },
        distribution: {
          good: 65,
          needsImprovement: 25,
          poor: 10,
        },
        topPages: [
          { path: '/home', averageValue: 1800, sampleCount: 120 },
          { path: '/dashboard', averageValue: 2200, sampleCount: 95 },
          { path: '/profile', averageValue: 2500, sampleCount: 80 },
        ],
      },
    ],
    trends: [],
    recommendations: [
      {
        type: 'warning',
        title: 'First Contentful Paint 需要优化',
        description: '首次内容绘制时间较长，建议优化关键资源加载',
        impact: 'medium',
        effort: 'medium',
        metricName: 'FCP',
        affectedPages: ['/dashboard', '/profile'],
      },
    ],
    alerts: [
      {
        type: 'threshold',
        severity: 'warning',
        title: 'LCP 超过阈值',
        description: 'Largest Contentful Paint 平均值 4200ms 超过阈值 4000ms',
        metricName: 'LCP',
        value: 4200,
        threshold: 4000,
        timestamp: Date.now(),
        affectedPages: ['/dashboard'],
      },
    ],
    generatedAt: Date.now(),
    period: {
      start: Date.now() - 24 * 60 * 60 * 1000,
      end: Date.now(),
    },
  };
}