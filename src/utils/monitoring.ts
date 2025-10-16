/**
 * 安全监控系统
 * 实现实时威胁检测和异常行为分析
 */

import { securityLogger, SecurityEventType } from './logger';
import { monitoringConfig } from '../config/security';

/**
 * 威胁级别
 */
export enum ThreatLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * 监控事件
 */
export interface MonitoringEvent {
  timestamp: number;
  type: string;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  metadata?: Record<string, any>;
}

/**
 * 异常检测结果
 */
export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  threatLevel: ThreatLevel;
  riskScore: number;
  reasons: string[];
  recommendations: string[];
}

/**
 * 用户行为模式
 */
interface UserBehaviorPattern {
  userId: string;
  loginTimes: number[];
  ipAddresses: Set<string>;
  userAgents: Set<string>;
  accessPatterns: Map<string, number>;
  lastActivity: number;
  riskScore: number;
}

/**
 * 安全监控器
 */
export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private userPatterns = new Map<string, UserBehaviorPattern>();
  private recentEvents: MonitoringEvent[] = [];
  private maxEventsHistory = 10000;
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.startCleanupTask();
  }
  
  public static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }
  
  /**
   * 记录监控事件
   */
  public recordEvent(event: MonitoringEvent): void {
    this.recentEvents.push(event);
    
    // 限制历史事件数量
    if (this.recentEvents.length > this.maxEventsHistory) {
      this.recentEvents = this.recentEvents.slice(-this.maxEventsHistory);
    }
    
    // 更新用户行为模式
    if (event.userId) {
      this.updateUserPattern(event);
    }
    
    // 执行异常检测
    const anomalyResult = this.detectAnomaly(event);
    if (anomalyResult.isAnomaly) {
      this.handleAnomaly(event, anomalyResult);
    }
  }
  
  /**
   * 检测登录异常
   */
  public detectLoginAnomaly(
    userId: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): AnomalyDetectionResult {
    const pattern = this.userPatterns.get(userId);
    const reasons: string[] = [];
    let riskScore = 0;
    
    if (!pattern) {
      // 新用户，风险较低
      return {
        isAnomaly: false,
        threatLevel: ThreatLevel.LOW,
        riskScore: 10,
        reasons: ['New user account'],
        recommendations: ['Monitor initial activity'],
      };
    }
    
    // 检查IP地址异常
    if (!pattern.ipAddresses.has(ip)) {
      reasons.push('Login from new IP address');
      riskScore += 30;
    }
    
    // 检查User-Agent异常
    if (!pattern.userAgents.has(userAgent)) {
      reasons.push('Login from new device/browser');
      riskScore += 20;
    }
    
    // 检查登录时间异常
    const currentHour = new Date().getHours();
    const isUnusualTime = this.isUnusualLoginTime(pattern.loginTimes, currentHour);
    if (isUnusualTime) {
      reasons.push('Login at unusual time');
      riskScore += 25;
    }
    
    // 检查登录频率异常
    const recentLogins = this.getRecentLoginAttempts(userId, 3600000); // 1小时内
    if (recentLogins.length > 10) {
      reasons.push('Excessive login attempts');
      riskScore += 40;
    }
    
    // 检查失败登录模式
    if (!success) {
      const recentFailures = this.getRecentFailedLogins(userId, 900000); // 15分钟内
      if (recentFailures.length > 3) {
        reasons.push('Multiple failed login attempts');
        riskScore += 50;
      }
    }
    
    // 地理位置异常检测（简化版）
    if (this.detectGeographicalAnomaly(ip, pattern.ipAddresses)) {
      reasons.push('Login from unusual geographical location');
      riskScore += 35;
    }
    
    const threatLevel = this.calculateThreatLevel(riskScore);
    const isAnomaly = riskScore >= 50;
    
    return {
      isAnomaly,
      threatLevel,
      riskScore,
      reasons,
      recommendations: this.generateRecommendations(riskScore, reasons),
    };
  }
  
  /**
   * 检测API访问异常
   */
  public detectApiAnomaly(
    userId: string,
    endpoint: string,
    method: string,
    ip: string
  ): AnomalyDetectionResult {
    const reasons: string[] = [];
    let riskScore = 0;
    
    // 检查访问频率
    const recentApiCalls = this.getRecentApiCalls(userId, endpoint, 60000); // 1分钟内
    if (recentApiCalls.length > 100) {
      reasons.push('Excessive API calls');
      riskScore += 60;
    }
    
    // 检查敏感端点访问
    const sensitiveEndpoints = ['/api/admin', '/api/users', '/api/config', '/api/logs'];
    if (sensitiveEndpoints.some(sensitive => endpoint.includes(sensitive))) {
      reasons.push('Access to sensitive endpoint');
      riskScore += 30;
    }
    
    // 检查异常HTTP方法
    if (['DELETE', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      const recentModifications = this.getRecentModificationRequests(userId, 300000); // 5分钟内
      if (recentModifications.length > 20) {
        reasons.push('Excessive modification requests');
        riskScore += 40;
      }
    }
    
    // 检查IP地址变化
    const recentIps = this.getRecentIpAddresses(userId, 3600000); // 1小时内
    if (recentIps.size > 5) {
      reasons.push('Multiple IP addresses in short time');
      riskScore += 35;
    }
    
    const threatLevel = this.calculateThreatLevel(riskScore);
    const isAnomaly = riskScore >= 40;
    
    return {
      isAnomaly,
      threatLevel,
      riskScore,
      reasons,
      recommendations: this.generateRecommendations(riskScore, reasons),
    };
  }
  
  /**
   * 检测数据访问异常
   */
  public detectDataAccessAnomaly(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string
  ): AnomalyDetectionResult {
    const reasons: string[] = [];
    let riskScore = 0;
    
    // 检查批量数据访问
    const recentDataAccess = this.getRecentDataAccess(userId, resourceType, 300000); // 5分钟内
    if (recentDataAccess.length > 50) {
      reasons.push('Bulk data access detected');
      riskScore += 50;
    }
    
    // 检查敏感数据访问
    const sensitiveResources = ['user', 'payment', 'personal', 'financial'];
    if (sensitiveResources.includes(resourceType.toLowerCase())) {
      reasons.push('Access to sensitive data');
      riskScore += 25;
    }
    
    // 检查权限提升尝试
    if (action.includes('admin') || action.includes('delete') || action.includes('modify')) {
      reasons.push('Privileged operation attempt');
      riskScore += 30;
    }
    
    // 检查异常时间访问
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 22) {
      reasons.push('Data access during off-hours');
      riskScore += 20;
    }
    
    const threatLevel = this.calculateThreatLevel(riskScore);
    const isAnomaly = riskScore >= 35;
    
    return {
      isAnomaly,
      threatLevel,
      riskScore,
      reasons,
      recommendations: this.generateRecommendations(riskScore, reasons),
    };
  }
  
  /**
   * 更新用户行为模式
   */
  private updateUserPattern(event: MonitoringEvent): void {
    const userId = event.userId!;
    let pattern = this.userPatterns.get(userId);
    
    if (!pattern) {
      pattern = {
        userId,
        loginTimes: [],
        ipAddresses: new Set(),
        userAgents: new Set(),
        accessPatterns: new Map(),
        lastActivity: event.timestamp,
        riskScore: 0,
      };
      this.userPatterns.set(userId, pattern);
    }
    
    // 更新IP地址
    if (event.ip) {
      pattern.ipAddresses.add(event.ip);
    }
    
    // 更新User-Agent
    if (event.userAgent) {
      pattern.userAgents.add(event.userAgent);
    }
    
    // 更新访问模式
    if (event.url) {
      const count = pattern.accessPatterns.get(event.url) || 0;
      pattern.accessPatterns.set(event.url, count + 1);
    }
    
    // 更新登录时间（如果是登录事件）
    if (event.type === 'login') {
      const hour = new Date(event.timestamp).getHours();
      pattern.loginTimes.push(hour);
      
      // 只保留最近100次登录时间
      if (pattern.loginTimes.length > 100) {
        pattern.loginTimes = pattern.loginTimes.slice(-100);
      }
    }
    
    pattern.lastActivity = event.timestamp;
  }
  
  /**
   * 执行异常检测
   */
  private detectAnomaly(event: MonitoringEvent): AnomalyDetectionResult {
    const reasons: string[] = [];
    let riskScore = 0;
    
    // 检查事件频率
    const recentSimilarEvents = this.recentEvents.filter(e => 
      e.type === event.type && 
      e.userId === event.userId &&
      event.timestamp - e.timestamp < 60000 // 1分钟内
    );
    
    if (recentSimilarEvents.length > 10) {
      reasons.push('High frequency of similar events');
      riskScore += 40;
    }
    
    // 检查可疑User-Agent
    if (event.userAgent && this.isSuspiciousUserAgent(event.userAgent)) {
      reasons.push('Suspicious user agent detected');
      riskScore += 30;
    }
    
    // 检查可疑IP
    if (event.ip && this.isSuspiciousIp(event.ip)) {
      reasons.push('Suspicious IP address detected');
      riskScore += 50;
    }
    
    const threatLevel = this.calculateThreatLevel(riskScore);
    const isAnomaly = riskScore >= 30;
    
    return {
      isAnomaly,
      threatLevel,
      riskScore,
      reasons,
      recommendations: this.generateRecommendations(riskScore, reasons),
    };
  }
  
  /**
   * 处理异常事件
   */
  private handleAnomaly(event: MonitoringEvent, result: AnomalyDetectionResult): void {
    securityLogger.logSuspiciousActivity(
      `Anomaly detected: ${result.reasons.join(', ')}`,
      result.riskScore,
      {
        event,
        threatLevel: result.threatLevel,
        recommendations: result.recommendations,
      }
    );
    
    // 高风险事件自动响应
    if (result.threatLevel === ThreatLevel.CRITICAL || result.threatLevel === ThreatLevel.HIGH) {
      this.triggerSecurityResponse(event, result);
    }
  }
  
  /**
   * 触发安全响应
   */
  private triggerSecurityResponse(event: MonitoringEvent, result: AnomalyDetectionResult): void {
    // TODO: 实现自动安全响应
    // 例如：临时锁定账户、限制IP访问、发送告警等
    
    console.warn('🚨 Security Response Triggered:', {
      event,
      result,
      timestamp: new Date().toISOString(),
    });
  }
  
  /**
   * 计算威胁级别
   */
  private calculateThreatLevel(riskScore: number): ThreatLevel {
    if (riskScore >= 80) return ThreatLevel.CRITICAL;
    if (riskScore >= 60) return ThreatLevel.HIGH;
    if (riskScore >= 30) return ThreatLevel.MEDIUM;
    return ThreatLevel.LOW;
  }
  
  /**
   * 生成建议
   */
  private generateRecommendations(riskScore: number, reasons: string[]): string[] {
    const recommendations: string[] = [];
    
    if (riskScore >= 80) {
      recommendations.push('Immediately suspend account');
      recommendations.push('Require additional authentication');
      recommendations.push('Contact security team');
    } else if (riskScore >= 60) {
      recommendations.push('Require multi-factor authentication');
      recommendations.push('Monitor closely');
      recommendations.push('Consider temporary restrictions');
    } else if (riskScore >= 30) {
      recommendations.push('Increase monitoring frequency');
      recommendations.push('Log additional details');
      recommendations.push('Consider user notification');
    }
    
    if (reasons.includes('Login from new IP address')) {
      recommendations.push('Send email notification about new login location');
    }
    
    if (reasons.includes('Excessive API calls')) {
      recommendations.push('Apply rate limiting');
    }
    
    return recommendations;
  }
  
  /**
   * 检查是否为异常登录时间
   */
  private isUnusualLoginTime(loginTimes: number[], currentHour: number): boolean {
    if (loginTimes.length < 5) return false;
    
    const hourCounts = new Array(24).fill(0);
    loginTimes.forEach(hour => hourCounts[hour]++);
    
    const averageCount = loginTimes.length / 24;
    const currentHourCount = hourCounts[currentHour];
    
    return currentHourCount < averageCount * 0.1; // 如果当前小时的登录次数少于平均值的10%
  }
  
  /**
   * 检查地理位置异常
   */
  private detectGeographicalAnomaly(currentIp: string, knownIps: Set<string>): boolean {
    // 简化的地理位置检测
    // 实际实现应该使用IP地理位置数据库
    const currentIpPrefix = currentIp.split('.').slice(0, 2).join('.');
    
    for (const knownIp of knownIps) {
      const knownIpPrefix = knownIp.split('.').slice(0, 2).join('.');
      if (currentIpPrefix === knownIpPrefix) {
        return false; // 相同地区
      }
    }
    
    return knownIps.size > 0; // 如果有已知IP但都不在同一地区
  }
  
  /**
   * 检查可疑User-Agent
   */
  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /go-http/i,
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }
  
  /**
   * 检查可疑IP
   */
  private isSuspiciousIp(ip: string): boolean {
    // 简化的可疑IP检测
    // 实际实现应该使用威胁情报数据库
    const suspiciousRanges = [
      '10.0.0.0/8',    // 私有网络（可能是代理）
      '172.16.0.0/12', // 私有网络
      '192.168.0.0/16', // 私有网络
    ];
    
    // TODO: 实现IP范围检查
    return false;
  }
  
  /**
   * 获取最近的登录尝试
   */
  private getRecentLoginAttempts(userId: string, timeWindow: number): MonitoringEvent[] {
    const now = Date.now();
    return this.recentEvents.filter(event =>
      event.type === 'login' &&
      event.userId === userId &&
      now - event.timestamp < timeWindow
    );
  }
  
  /**
   * 获取最近的失败登录
   */
  private getRecentFailedLogins(userId: string, timeWindow: number): MonitoringEvent[] {
    const now = Date.now();
    return this.recentEvents.filter(event =>
      event.type === 'login_failure' &&
      event.userId === userId &&
      now - event.timestamp < timeWindow
    );
  }
  
  /**
   * 获取最近的API调用
   */
  private getRecentApiCalls(userId: string, endpoint: string, timeWindow: number): MonitoringEvent[] {
    const now = Date.now();
    return this.recentEvents.filter(event =>
      event.type === 'api_call' &&
      event.userId === userId &&
      event.url === endpoint &&
      now - event.timestamp < timeWindow
    );
  }
  
  /**
   * 获取最近的修改请求
   */
  private getRecentModificationRequests(userId: string, timeWindow: number): MonitoringEvent[] {
    const now = Date.now();
    return this.recentEvents.filter(event =>
      event.type === 'api_call' &&
      event.userId === userId &&
      event.metadata?.method &&
      ['DELETE', 'PUT', 'PATCH'].includes(event.metadata.method.toUpperCase()) &&
      now - event.timestamp < timeWindow
    );
  }
  
  /**
   * 获取最近的IP地址
   */
  private getRecentIpAddresses(userId: string, timeWindow: number): Set<string> {
    const now = Date.now();
    const recentEvents = this.recentEvents.filter(event =>
      event.userId === userId &&
      event.ip &&
      now - event.timestamp < timeWindow
    );
    
    return new Set(recentEvents.map(event => event.ip!));
  }
  
  /**
   * 获取最近的数据访问
   */
  private getRecentDataAccess(userId: string, resourceType: string, timeWindow: number): MonitoringEvent[] {
    const now = Date.now();
    return this.recentEvents.filter(event =>
      event.type === 'data_access' &&
      event.userId === userId &&
      event.metadata?.resourceType === resourceType &&
      now - event.timestamp < timeWindow
    );
  }
  
  /**
   * 启动清理任务
   */
  private startCleanupTask(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldData();
    }, 3600000); // 每小时清理一次
  }
  
  /**
   * 清理旧数据
   */
  private cleanupOldData(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24小时
    
    // 清理旧事件
    this.recentEvents = this.recentEvents.filter(event =>
      now - event.timestamp < maxAge
    );
    
    // 清理不活跃的用户模式
    for (const [userId, pattern] of this.userPatterns.entries()) {
      if (now - pattern.lastActivity > maxAge * 7) { // 7天不活跃
        this.userPatterns.delete(userId);
      }
    }
  }
  
  /**
   * 销毁监控器
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

/**
 * 导出单例实例
 */
export const securityMonitor = SecurityMonitor.getInstance();