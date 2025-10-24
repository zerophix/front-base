/**
 * 性能报告生成器
 * 生成详细的性能分析报告
 */

import type { PerformanceMetric } from './performance-enhanced';

export interface PerformanceReport {
  summary: PerformanceSummary;
  metrics: MetricAnalysis[];
  trends: TrendAnalysis[];
  recommendations: Recommendation[];
  alerts: Alert[];
  generatedAt: number;
  period: {
    start: number;
    end: number;
  };
}

export interface PerformanceSummary {
  totalMetrics: number;
  uniqueSessions: number;
  uniquePages: number;
  overallScore: number;
  scoreBreakdown: {
    [metricName: string]: {
      score: number;
      rating: 'good' | 'needs-improvement' | 'poor';
      trend: 'improving' | 'stable' | 'degrading';
    };
  };
}

export interface MetricAnalysis {
  name: string;
  statistics: {
    count: number;
    min: number;
    max: number;
    average: number;
    median: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
    standardDeviation: number;
  };
  distribution: {
    good: number;
    needsImprovement: number;
    poor: number;
  };
  topPages: {
    path: string;
    averageValue: number;
    sampleCount: number;
  }[];
}

export interface TrendAnalysis {
  metricName: string;
  trend: 'improving' | 'stable' | 'degrading';
  changePercentage: number;
  dataPoints: {
    timestamp: number;
    value: number;
  }[];
}

export interface Recommendation {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  metricName?: string;
  affectedPages?: string[];
}

export interface Alert {
  type: 'threshold' | 'anomaly' | 'trend';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  metricName: string;
  value: number;
  threshold?: number;
  timestamp: number;
  affectedPages: string[];
}

export class PerformanceReporter {
  private metrics: PerformanceMetric[] = [];

  constructor(metrics: PerformanceMetric[]) {
    this.metrics = metrics;
  }

  /**
   * 生成完整的性能报告
   */
  generateReport(startDate?: Date, endDate?: Date): PerformanceReport {
    const filteredMetrics = this.filterMetricsByDate(startDate, endDate);
    
    return {
      summary: this.generateSummary(filteredMetrics),
      metrics: this.analyzeMetrics(filteredMetrics),
      trends: this.analyzeTrends(filteredMetrics),
      recommendations: this.generateRecommendations(filteredMetrics),
      alerts: this.generateAlerts(filteredMetrics),
      generatedAt: Date.now(),
      period: {
        start: startDate?.getTime() || 0,
        end: endDate?.getTime() || Date.now(),
      },
    };
  }

  /**
   * 按日期过滤指标
   */
  private filterMetricsByDate(startDate?: Date, endDate?: Date): PerformanceMetric[] {
    if (!startDate && !endDate) return this.metrics;

    return this.metrics.filter(metric => {
      if (!metric.ts) return false;
      
      const metricDate = new Date(metric.ts);
      
      if (startDate && metricDate < startDate) return false;
      if (endDate && metricDate > endDate) return false;
      
      return true;
    });
  }

  /**
   * 生成性能摘要
   */
  private generateSummary(metrics: PerformanceMetric[]): PerformanceSummary {
    const uniqueSessions = new Set(metrics.map(m => m.sessionId)).size;
    const uniquePages = new Set(metrics.map(m => m.path).filter(Boolean)).size;
    
    const metricsByName = this.groupMetricsByName(metrics);
    const scoreBreakdown: PerformanceSummary['scoreBreakdown'] = {};
    let totalScore = 0;
    let scoreCount = 0;

    Object.keys(metricsByName).forEach(name => {
      const metricValues = metricsByName[name];
      const score = this.calculateMetricScore(name, metricValues);
      const rating = this.getMetricRating(name, score);
      const trend = this.calculateTrend(name, metricValues);

      scoreBreakdown[name] = { score, rating, trend };
      totalScore += score;
      scoreCount++;
    });

    return {
      totalMetrics: metrics.length,
      uniqueSessions,
      uniquePages,
      overallScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
      scoreBreakdown,
    };
  }

  /**
   * 分析指标
   */
  private analyzeMetrics(metrics: PerformanceMetric[]): MetricAnalysis[] {
    const metricsByName = this.groupMetricsByName(metrics);
    
    return Object.keys(metricsByName).map(name => {
      const values = metricsByName[name].map(m => m.value);
      const statistics = this.calculateStatistics(values);
      const distribution = this.calculateDistribution(metricsByName[name]);
      const topPages = this.getTopPages(metricsByName[name]);

      return {
        name,
        statistics,
        distribution,
        topPages,
      };
    });
  }

  /**
   * 分析趋势
   */
  private analyzeTrends(metrics: PerformanceMetric[]): TrendAnalysis[] {
    const metricsByName = this.groupMetricsByName(metrics);
    
    return Object.keys(metricsByName).map(name => {
      const metricValues = metricsByName[name];
      const dataPoints = metricValues
        .filter(m => m.ts)
        .sort((a, b) => (a.ts || 0) - (b.ts || 0))
        .map(m => ({
          timestamp: m.ts!,
          value: m.value,
        }));

      const trend = this.calculateTrend(name, metricValues);
      const changePercentage = this.calculateChangePercentage(dataPoints);

      return {
        metricName: name,
        trend,
        changePercentage,
        dataPoints,
      };
    });
  }

  /**
   * 生成建议
   */
  private generateRecommendations(metrics: PerformanceMetric[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const metricsByName = this.groupMetricsByName(metrics);

    // LCP 建议
    if (metricsByName.LCP) {
      const avgLCP = metricsByName.LCP.reduce((sum, m) => sum + m.value, 0) / metricsByName.LCP.length;
      if (avgLCP > 4000) {
        recommendations.push({
          type: 'critical',
          title: 'Largest Contentful Paint 需要优化',
          description: '页面主要内容加载时间过长，建议优化图片、字体和关键资源的加载',
          impact: 'high',
          effort: 'medium',
          metricName: 'LCP',
          affectedPages: this.getWorstPages(metricsByName.LCP, 'LCP').map(p => p.path),
        });
      }
    }

    // CLS 建议
    if (metricsByName.CLS) {
      const avgCLS = metricsByName.CLS.reduce((sum, m) => sum + m.value, 0) / metricsByName.CLS.length;
      if (avgCLS > 0.25) {
        recommendations.push({
          type: 'warning',
          title: 'Cumulative Layout Shift 需要改善',
          description: '页面布局稳定性较差，建议为图片和广告设置尺寸属性',
          impact: 'medium',
          effort: 'low',
          metricName: 'CLS',
          affectedPages: this.getWorstPages(metricsByName.CLS, 'CLS').map(p => p.path),
        });
      }
    }

    // 内存使用建议
    if (metricsByName.MEMORY_USAGE) {
      const avgMemory = metricsByName.MEMORY_USAGE.reduce((sum, m) => sum + m.value, 0) / metricsByName.MEMORY_USAGE.length;
      if (avgMemory > 80) {
        recommendations.push({
          type: 'warning',
          title: '内存使用率过高',
          description: '应用内存使用率较高，建议检查内存泄漏和优化数据结构',
          impact: 'medium',
          effort: 'high',
          metricName: 'MEMORY_USAGE',
        });
      }
    }

    return recommendations;
  }

  /**
   * 生成告警
   */
  private generateAlerts(metrics: PerformanceMetric[]): Alert[] {
    const alerts: Alert[] = [];
    const metricsByName = this.groupMetricsByName(metrics);

    // 阈值告警
    const thresholds = {
      LCP: 4000,
      INP: 500,
      CLS: 0.25,
      FCP: 3000,
      TTFB: 1800,
      MEMORY_USAGE: 90,
    };

    Object.keys(thresholds).forEach(metricName => {
      const threshold = thresholds[metricName as keyof typeof thresholds];
      const recentMetrics = metricsByName[metricName]?.filter(m => 
        m.ts && m.ts > Date.now() - 24 * 60 * 60 * 1000 // 最近24小时
      ) || [];

      const exceedingMetrics = recentMetrics.filter(m => m.value > threshold);
      
      if (exceedingMetrics.length > 0) {
        const avgValue = exceedingMetrics.reduce((sum, m) => sum + m.value, 0) / exceedingMetrics.length;
        const affectedPages = [...new Set(exceedingMetrics.map(m => m.path).filter((path): path is string => Boolean(path)))];

        alerts.push({
          type: 'threshold',
          severity: avgValue > threshold * 1.5 ? 'critical' : 'warning',
          title: `${metricName} 超过阈值`,
          description: `${metricName} 平均值 ${avgValue.toFixed(2)} 超过阈值 ${threshold}`,
          metricName,
          value: avgValue,
          threshold,
          timestamp: Date.now(),
          affectedPages,
        });
      }
    });

    return alerts;
  }

  /**
   * 按名称分组指标
   */
  private groupMetricsByName(metrics: PerformanceMetric[]): { [name: string]: PerformanceMetric[] } {
    return metrics.reduce((groups, metric) => {
      if (!groups[metric.name]) groups[metric.name] = [];
      groups[metric.name].push(metric);
      return groups;
    }, {} as { [name: string]: PerformanceMetric[] });
  }

  /**
   * 计算统计信息
   */
  private calculateStatistics(values: number[]) {
    if (values.length === 0) {
      return {
        count: 0, min: 0, max: 0, average: 0, median: 0,
        p75: 0, p90: 0, p95: 0, p99: 0, standardDeviation: 0
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average,
      median: sorted[Math.floor(sorted.length / 2)],
      p75: sorted[Math.floor(sorted.length * 0.75)],
      p90: sorted[Math.floor(sorted.length * 0.90)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      standardDeviation,
    };
  }

  /**
   * 计算分布
   */
  private calculateDistribution(metrics: PerformanceMetric[]) {
    const total = metrics.length;
    const good = metrics.filter(m => m.rating === 'good').length;
    const needsImprovement = metrics.filter(m => m.rating === 'needs-improvement').length;
    const poor = metrics.filter(m => m.rating === 'poor').length;

    return {
      good: total > 0 ? (good / total) * 100 : 0,
      needsImprovement: total > 0 ? (needsImprovement / total) * 100 : 0,
      poor: total > 0 ? (poor / total) * 100 : 0,
    };
  }

  /**
   * 获取表现最差的页面
   */
  private getWorstPages(metrics: PerformanceMetric[], metricName: string) {
    const pageMetrics = metrics.reduce((groups, metric) => {
      if (!metric.path) return groups;
      if (!groups[metric.path]) groups[metric.path] = [];
      groups[metric.path].push(metric.value);
      return groups;
    }, {} as { [path: string]: number[] });

    return Object.keys(pageMetrics)
      .map(path => ({
        path,
        averageValue: pageMetrics[path].reduce((sum, val) => sum + val, 0) / pageMetrics[path].length,
        sampleCount: pageMetrics[path].length,
      }))
      .sort((a, b) => b.averageValue - a.averageValue)
      .slice(0, 5);
  }

  /**
   * 获取表现最好的页面
   */
  private getTopPages(metrics: PerformanceMetric[]) {
    const pageMetrics = metrics.reduce((groups, metric) => {
      if (!metric.path) return groups;
      if (!groups[metric.path]) groups[metric.path] = [];
      groups[metric.path].push(metric.value);
      return groups;
    }, {} as { [path: string]: number[] });

    return Object.keys(pageMetrics)
      .map(path => ({
        path,
        averageValue: pageMetrics[path].reduce((sum, val) => sum + val, 0) / pageMetrics[path].length,
        sampleCount: pageMetrics[path].length,
      }))
      .sort((a, b) => a.averageValue - b.averageValue)
      .slice(0, 10);
  }

  /**
   * 计算指标评分
   */
  private calculateMetricScore(metricName: string, metrics: PerformanceMetric[]): number {
    const goodCount = metrics.filter(m => m.rating === 'good').length;
    const total = metrics.length;
    return total > 0 ? Math.round((goodCount / total) * 100) : 0;
  }

  /**
   * 获取指标评级
   */
  private getMetricRating(metricName: string, score: number): 'good' | 'needs-improvement' | 'poor' {
    if (score >= 75) return 'good';
    if (score >= 50) return 'needs-improvement';
    return 'poor';
  }

  /**
   * 计算趋势
   */
  private calculateTrend(metricName: string, metrics: PerformanceMetric[]): 'improving' | 'stable' | 'degrading' {
    if (metrics.length < 2) return 'stable';

    const sortedMetrics = metrics
      .filter(m => m.ts)
      .sort((a, b) => (a.ts || 0) - (b.ts || 0));

    if (sortedMetrics.length < 2) return 'stable';

    const firstHalf = sortedMetrics.slice(0, Math.floor(sortedMetrics.length / 2));
    const secondHalf = sortedMetrics.slice(Math.floor(sortedMetrics.length / 2));

    const firstAvg = firstHalf.reduce((sum, m) => sum + m.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.value, 0) / secondHalf.length;

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (Math.abs(changePercent) < 5) return 'stable';
    
    // 对于性能指标，值越小越好
    return changePercent < 0 ? 'improving' : 'degrading';
  }

  /**
   * 计算变化百分比
   */
  private calculateChangePercentage(dataPoints: { timestamp: number; value: number }[]): number {
    if (dataPoints.length < 2) return 0;

    const firstValue = dataPoints[0].value;
    const lastValue = dataPoints[dataPoints.length - 1].value;

    return ((lastValue - firstValue) / firstValue) * 100;
  }
}