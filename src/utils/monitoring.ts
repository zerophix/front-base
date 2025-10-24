/**
 * 安全监控系统
 * 实现实时威胁检测和异常行为分析
 */

import { securityLogger } from '@/utils/logger';

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
 * 安全响应类型
 */
export enum SecurityResponse {
  BLOCK_IP = 'block_ip',
  TEMP_BLOCK_IP = 'temp_block_ip',
  LOCK_ACCOUNT = 'lock_account',
  REQUIRE_MFA = 'require_mfa',
  RATE_LIMIT = 'rate_limit',
  SEND_ALERT = 'send_alert',
  ESCALATE_TO_ADMIN = 'escalate_to_admin',
  LOG_EVENT = 'log_event',
  MONITOR_CLOSELY = 'monitor_closely',
  INCREASE_MONITORING = 'increase_monitoring',
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
    _ip: string
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
    // 实现自动安全响应
    const responses = this.determineSecurityResponses(result);
    
    for (const response of responses) {
      this.executeSecurityResponse(response, event, result);
    }
    
    securityLogger.logSuspiciousActivity(
      `Security response triggered: ${result.reasons.join(', ')}`,
      result.riskScore,
      {
        event,
        threatLevel: result.threatLevel,
        riskScore: result.riskScore,
        recommendations: result.recommendations,
        responses: responses,
      }
    );
  }

  /**
   * 确定需要执行的安全响应措施
   */
  private determineSecurityResponses(result: AnomalyDetectionResult): SecurityResponse[] {
    const responses: SecurityResponse[] = [];
    
    // 根据威胁级别确定响应措施
    switch (result.threatLevel) {
      case ThreatLevel.CRITICAL:
        responses.push(
          SecurityResponse.BLOCK_IP,
          SecurityResponse.LOCK_ACCOUNT,
          SecurityResponse.SEND_ALERT,
          SecurityResponse.ESCALATE_TO_ADMIN
        );
        break;
      case ThreatLevel.HIGH:
        responses.push(
          SecurityResponse.TEMP_BLOCK_IP,
          SecurityResponse.REQUIRE_MFA,
          SecurityResponse.SEND_ALERT
        );
        break;
      case ThreatLevel.MEDIUM:
        responses.push(
          SecurityResponse.RATE_LIMIT,
          SecurityResponse.LOG_EVENT,
          SecurityResponse.MONITOR_CLOSELY
        );
        break;
      case ThreatLevel.LOW:
        responses.push(
          SecurityResponse.LOG_EVENT,
          SecurityResponse.INCREASE_MONITORING
        );
        break;
    }
    
    return responses;
  }

  /**
   * 执行具体的安全响应措施
   */
  private executeSecurityResponse(
    response: SecurityResponse,
    event: MonitoringEvent,
    result: AnomalyDetectionResult
  ): void {
    try {
      switch (response) {
        case SecurityResponse.BLOCK_IP:
          this.blockIpAddress(event.ip!, 24 * 60 * 60 * 1000); // 24小时
          break;
        case SecurityResponse.TEMP_BLOCK_IP:
          this.blockIpAddress(event.ip!, 60 * 60 * 1000); // 1小时
          break;
        case SecurityResponse.LOCK_ACCOUNT:
          this.lockUserAccount(event.userId!, 30 * 60 * 1000); // 30分钟
          break;
        case SecurityResponse.REQUIRE_MFA:
          this.requireMfaForUser(event.userId!);
          break;
        case SecurityResponse.RATE_LIMIT:
          this.applyRateLimit(event.ip!, event.userId!);
          break;
        case SecurityResponse.SEND_ALERT:
          this.sendSecurityAlert(event, result);
          break;
        case SecurityResponse.ESCALATE_TO_ADMIN:
          this.escalateToAdmin(event, result);
          break;
        case SecurityResponse.LOG_EVENT:
          // 已在上层处理
          break;
        case SecurityResponse.MONITOR_CLOSELY:
          this.enableCloseMonitoring(event.userId!, event.ip!);
          break;
        case SecurityResponse.INCREASE_MONITORING:
          this.increaseMonitoringLevel(event.userId!, event.ip!);
          break;
      }
    } catch (error) {
      securityLogger.logSuspiciousActivity(
        `Failed to execute security response: ${response}`,
        100,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * 封禁IP地址
   */
  private blockIpAddress(ip: string, duration: number): void {
    // 在实际应用中，这里应该调用防火墙API或更新IP黑名单
    securityLogger.logSuspiciousActivity(
      `IP address blocked: ${ip}`,
      80,
      { ip, duration, expiresAt: new Date(Date.now() + duration).toISOString() }
    );
  }

  /**
   * 锁定用户账户
   */
  private lockUserAccount(userId: string, duration: number): void {
    // 在实际应用中，这里应该调用用户管理API
    securityLogger.logSuspiciousActivity(
      `User account locked: ${userId}`,
      80,
      { userId, duration, expiresAt: new Date(Date.now() + duration).toISOString() }
    );
  }

  /**
   * 要求用户进行多因素认证
   */
  private requireMfaForUser(userId: string): void {
    securityLogger.logSuspiciousActivity(
      `MFA required for user: ${userId}`,
      60,
      { userId }
    );
  }

  /**
   * 应用速率限制
   */
  private applyRateLimit(ip: string, userId: string): void {
    securityLogger.logSuspiciousActivity(
      `Rate limit applied`,
      40,
      { ip, userId }
    );
  }

  /**
   * 发送安全告警
   */
  private sendSecurityAlert(event: MonitoringEvent, result: AnomalyDetectionResult): void {
    const alertData = {
      timestamp: new Date().toISOString(),
      threatLevel: result.threatLevel,
      riskScore: result.riskScore,
      event,
      reasons: result.reasons,
      recommendations: result.recommendations,
    };

    // 在实际应用中，这里应该调用告警服务API
    securityLogger.logSuspiciousActivity(
      `Security alert sent for threat level: ${result.threatLevel}`,
      result.riskScore,
      alertData
    );
  }

  /**
   * 升级到管理员
   */
  private escalateToAdmin(event: MonitoringEvent, result: AnomalyDetectionResult): void {
    securityLogger.logSuspiciousActivity(
      `Security incident escalated to admin`,
      100,
      { event, result }
    );
  }

  /**
   * 启用密切监控
   */
  private enableCloseMonitoring(userId: string, ip: string): void {
    securityLogger.logSuspiciousActivity(
      `Close monitoring enabled`,
      30,
      { userId, ip }
    );
  }

  /**
   * 提高监控级别
   */
  private increaseMonitoringLevel(userId: string, ip: string): void {
    securityLogger.logSuspiciousActivity(
      `Monitoring level increased`,
      20,
      { userId, ip }
    );
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
    // 检查已知的恶意IP范围
    const suspiciousRanges = [
      // Tor出口节点范围（示例）
      { start: '192.42.116.0', end: '192.42.116.255' },
      // 已知恶意IP范围（示例）
      { start: '185.220.100.0', end: '185.220.103.255' },
      // VPN/代理服务器范围（示例）
      { start: '104.244.72.0', end: '104.244.79.255' },
    ];
    
    // 检查是否在可疑范围内
    for (const range of suspiciousRanges) {
      if (this.isIpInRange(ip, range.start, range.end)) {
        return true;
      }
    }
    
    // 检查私有IP地址（可能是内网攻击）
    if (this.isPrivateIp(ip)) {
      return false; // 私有IP通常不可疑，除非在特定上下文中
    }
    
    // 检查本地回环地址
    if (ip.startsWith('127.') || ip === '::1') {
      return false;
    }
    
    // 检查格式异常的IP
    if (!this.isValidIpFormat(ip)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * 检查IP是否在指定范围内
   */
  private isIpInRange(ip: string, startIp: string, endIp: string): boolean {
    const ipToNumber = (ipStr: string): number => {
      return ipStr.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
    };
    
    const ipNum = ipToNumber(ip);
    const startNum = ipToNumber(startIp);
    const endNum = ipToNumber(endIp);
    
    return ipNum >= startNum && ipNum <= endNum;
  }
  
  /**
   * 检查是否为私有IP地址
   */
  private isPrivateIp(ip: string): boolean {
    const privateRanges = [
      { start: '10.0.0.0', end: '10.255.255.255' },
      { start: '172.16.0.0', end: '172.31.255.255' },
      { start: '192.168.0.0', end: '192.168.255.255' },
    ];
    
    return privateRanges.some(range => this.isIpInRange(ip, range.start, range.end));
  }
  
  /**
   * 验证IP地址格式
   */
  private isValidIpFormat(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
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