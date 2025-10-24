/**
 * 增强的性能分析 API 端点
 * 处理详细的性能指标数据
 */

import { NextResponse } from 'next/server';
import type { PerformanceMetric } from '@/lib/performance-enhanced';

// 内存存储（生产环境应使用数据库）
const performanceMetrics: PerformanceMetric[] = [];
const MAX_METRICS = 10000; // 最大存储指标数量

export async function POST(request: Request) {
  try {
    const metric: PerformanceMetric = await request.json();
    
    // 验证指标数据
    if (!isValidMetric(metric)) {
      return NextResponse.json(
        { success: false, error: 'Invalid metric data' }, 
        { status: 400 }
      );
    }

    // 添加服务器时间戳
    metric.ts = Date.now();

    // 存储指标
    performanceMetrics.push(metric);

    // 清理旧数据，保持在限制范围内
    if (performanceMetrics.length > MAX_METRICS) {
      performanceMetrics.splice(0, performanceMetrics.length - MAX_METRICS);
    }

    // 开发环境：打印到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Performance metric received:', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        path: metric.path,
        sessionId: metric.sessionId,
      });
    }

    // 检查是否需要告警
    checkPerformanceAlerts(metric);

    // 生产环境：发送到外部监控服务
    if (process.env.NODE_ENV === 'production') {
      await sendToExternalMonitoring(metric);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics] Error processing performance metric:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process metric' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const metricName = searchParams.get('metric');
    const sessionId = searchParams.get('sessionId');
    const path = searchParams.get('path');

    let filteredMetrics = [...performanceMetrics];

    // 按时间范围过滤
    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      filteredMetrics = filteredMetrics.filter(m => 
        m.ts && m.ts >= start && m.ts <= end
      );
    }

    // 按指标名称过滤
    if (metricName) {
      filteredMetrics = filteredMetrics.filter(m => m.name === metricName);
    }

    // 按会话ID过滤
    if (sessionId) {
      filteredMetrics = filteredMetrics.filter(m => m.sessionId === sessionId);
    }

    // 按路径过滤
    if (path) {
      filteredMetrics = filteredMetrics.filter(m => m.path === path);
    }

    // 生成统计信息
    const stats = generateMetricStats(filteredMetrics);

    return NextResponse.json({
      success: true,
      data: {
        metrics: filteredMetrics,
        stats,
        total: filteredMetrics.length,
      }
    });
  } catch (error) {
    console.error('[Analytics] Error retrieving performance metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve metrics' }, 
      { status: 500 }
    );
  }
}

/**
 * 验证指标数据
 */
function isValidMetric(metric: any): metric is PerformanceMetric {
  return (
    typeof metric === 'object' &&
    typeof metric.name === 'string' &&
    typeof metric.value === 'number' &&
    typeof metric.rating === 'string' &&
    ['good', 'needs-improvement', 'poor'].includes(metric.rating) &&
    typeof metric.delta === 'number' &&
    typeof metric.id === 'string'
  );
}

/**
 * 检查性能告警
 */
function checkPerformanceAlerts(metric: PerformanceMetric) {
  const alertThresholds = {
    LCP: 4000,
    INP: 500,
    CLS: 0.25,
    FCP: 3000,
    TTFB: 1800,
    MEMORY_USAGE: 80,
  };

  const threshold = alertThresholds[metric.name as keyof typeof alertThresholds];
  if (threshold && metric.value > threshold) {
    console.warn(`[Performance Alert] ${metric.name} exceeded threshold:`, {
      value: metric.value,
      threshold,
      path: metric.path,
      sessionId: metric.sessionId,
    });

    // 这里可以发送告警通知
    // await sendAlert(metric, threshold);
  }
}

/**
 * 发送到外部监控服务
 */
async function sendToExternalMonitoring(metric: PerformanceMetric) {
  try {
    // 示例：发送到 Google Analytics 4
    if (process.env.GA_MEASUREMENT_ID) {
      await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: metric.sessionId,
          events: [{
            name: 'performance_metric',
            params: {
              metric_name: metric.name,
              metric_value: metric.value,
              metric_rating: metric.rating,
              page_path: metric.path,
            }
          }]
        })
      });
    }

    // 示例：发送到 Datadog
    if (process.env.DATADOG_API_KEY) {
      await fetch('https://api.datadoghq.com/api/v1/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': process.env.DATADOG_API_KEY,
        },
        body: JSON.stringify({
          series: [{
            metric: `performance.${metric.name.toLowerCase()}`,
            points: [[Math.floor(Date.now() / 1000), metric.value]],
            tags: [
              `rating:${metric.rating}`,
              `path:${metric.path || 'unknown'}`,
              `session:${metric.sessionId}`,
            ]
          }]
        })
      });
    }
  } catch (error) {
    console.error('[Analytics] Failed to send to external monitoring:', error);
  }
}

/**
 * 生成指标统计信息
 */
function generateMetricStats(metrics: PerformanceMetric[]) {
  if (metrics.length === 0) {
    return {};
  }

  const metricsByName = metrics.reduce((groups, metric) => {
    if (!groups[metric.name]) groups[metric.name] = [];
    groups[metric.name].push(metric.value);
    return groups;
  }, {} as { [name: string]: number[] });

  const stats: any = {};

  Object.keys(metricsByName).forEach(name => {
    const values = metricsByName[name].sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);
    
    stats[name] = {
      count: values.length,
      min: values[0],
      max: values[values.length - 1],
      average: sum / values.length,
      median: values[Math.floor(values.length / 2)],
      p75: values[Math.floor(values.length * 0.75)],
      p90: values[Math.floor(values.length * 0.90)],
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)],
    };
  });

  return stats;
}