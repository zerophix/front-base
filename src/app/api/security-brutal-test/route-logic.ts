// Code splitting optimized - Business logic module
import { NextRequest, NextResponse } from 'next/server';
import { validateInput, securityValidationRules } from '@/utils/security';
import { securityLogger, SecurityEventType } from '@/utils/logger';
import { securityMonitor } from '@/utils/monitoring';
import { ATTACK_PAYLOADS } from '../security-payloads';

export async function handlePOST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    const body = await request.json();
    const { attackType, customPayload } = body;
    
    const testResults = {
      sql_injection: { tested: 0, blocked: 0, passed: 0, vulnerabilities: [] as string[] },
      xss_attacks: { tested: 0, blocked: 0, passed: 0, vulnerabilities: [] as string[] },
      path_traversal: { tested: 0, blocked: 0, passed: 0, vulnerabilities: [] as string[] },
      command_injection: { tested: 0, blocked: 0, passed: 0, vulnerabilities: [] as string[] },
      nosql_injection: { tested: 0, blocked: 0, passed: 0, vulnerabilities: [] as string[] },
      xxe_attacks: { tested: 0, blocked: 0, passed: 0, vulnerabilities: [] as string[] },
      header_injection: { tested: 0, blocked: 0, passed: 0, vulnerabilities: [] as string[] }
    };
    
    // 1. SQL注入暴力测试
    if (!attackType || attackType === 'sql_injection') {
      console.log('🔥 开始SQL注入暴力测试...');
      for (const payload of ATTACK_PAYLOADS.sql_injection) {
        testResults.sql_injection.tested++;
        
        const result = validateInput(payload, {
          ...securityValidationRules.text,
          preventSQLInjection: true
        });
        
        if (!result.valid) {
          testResults.sql_injection.blocked++;
          securityLogger.logSecurityEvent(
            SecurityEventType.SQL_INJECTION_ATTEMPT,
            `SQL注入攻击被阻止: ${payload.substring(0, 50)}`,
            'high',
            'blocked',
            { ip: clientIP, payload: payload.substring(0, 100) }
          );
        } else {
          testResults.sql_injection.passed++;
          testResults.sql_injection.vulnerabilities.push(payload);
          securityLogger.logSecurityEvent(
            SecurityEventType.SECURITY_VIOLATION,
            `SQL注入攻击未被检测: ${payload.substring(0, 50)}`,
            'critical',
            'failure',
            { ip: clientIP, payload: payload.substring(0, 100) }
          );
        }
      }
    }
    
    // 2. XSS攻击暴力测试
    if (!attackType || attackType === 'xss_attacks') {
      console.log('🔥 开始XSS攻击暴力测试...');
      for (const payload of ATTACK_PAYLOADS.xss_payloads) {
        testResults.xss_attacks.tested++;
        
        const result = validateInput(payload, {
          ...securityValidationRules.text,
          preventXSS: true
        });
        
        if (!result.valid) {
          testResults.xss_attacks.blocked++;
          securityLogger.logSecurityEvent(
            SecurityEventType.XSS_ATTEMPT,
            `XSS攻击被阻止: ${payload.substring(0, 50)}`,
            'high',
            'blocked',
            { ip: clientIP, payload: payload.substring(0, 100) }
          );
        } else {
          testResults.xss_attacks.passed++;
          testResults.xss_attacks.vulnerabilities.push(payload);
          securityLogger.logSecurityEvent(
            SecurityEventType.SECURITY_VIOLATION,
            `XSS攻击未被检测: ${payload.substring(0, 50)}`,
            'critical',
            'failure',
            { ip: clientIP, payload: payload.substring(0, 100) }
          );
        }
      }
    }
    
    // 3. 路径遍历攻击暴力测试
    if (!attackType || attackType === 'path_traversal') {
      console.log('🔥 开始路径遍历攻击暴力测试...');
      for (const payload of ATTACK_PAYLOADS.path_traversal) {
        testResults.path_traversal.tested++;
        
        const result = validateInput(payload, {
          maxLength: 255,
          allowedCharacters: 'a-zA-Z0-9._-',
          preventPathTraversal: true
        });
        
        if (!result.valid) {
          testResults.path_traversal.blocked++;
          securityLogger.logSecurityEvent(
            SecurityEventType.SECURITY_VIOLATION,
            `路径遍历攻击被阻止: ${payload.substring(0, 50)}`,
            'high',
            'blocked',
            { ip: clientIP, payload: payload.substring(0, 100) }
          );
        } else {
          testResults.path_traversal.passed++;
          testResults.path_traversal.vulnerabilities.push(payload);
          securityLogger.logSecurityEvent(
            SecurityEventType.SECURITY_VIOLATION,
            `路径遍历攻击未被检测: ${payload.substring(0, 50)}`,
            'critical',
            'failure',
            { ip: clientIP, payload: payload.substring(0, 100) }
          );
        }
      }
    }
    
    // 4. 命令注入攻击暴力测试
    if (!attackType || attackType === 'command_injection') {
      console.log('🔥 开始命令注入攻击暴力测试...');
      for (const payload of ATTACK_PAYLOADS.command_injection) {
        testResults.command_injection.tested++;
        
        const result = validateInput(payload, {
          ...securityValidationRules.text,
          preventCommandInjection: true
        });
        
        if (!result.valid) {
          testResults.command_injection.blocked++;
          securityLogger.logSecurityEvent(
            SecurityEventType.SECURITY_VIOLATION,
            `命令注入攻击被阻止: ${payload.substring(0, 50)}`,
            'critical',
            'blocked',
            { ip: clientIP, payload: payload.substring(0, 100) }
          );
        } else {
          testResults.command_injection.passed++;
          testResults.command_injection.vulnerabilities.push(payload);
          securityLogger.logSecurityEvent(
            SecurityEventType.SECURITY_VIOLATION,
            `命令注入攻击未被检测: ${payload.substring(0, 50)}`,
            'critical',
            'failure',
            { ip: clientIP, payload: payload.substring(0, 100) }
          );
        }
      }
    }
    
    // 5. NoSQL注入攻击暴力测试
    if (!attackType || attackType === 'nosql_injection') {
      console.log('🔥 开始NoSQL注入攻击暴力测试...');
      for (const payload of ATTACK_PAYLOADS.nosql_injection) {
        testResults.nosql_injection.tested++;
        
        const result = validateInput(payload, {
          ...securityValidationRules.text,
          preventSQLInjection: true // 使用相同的规则检测NoSQL注入
        });
        
        if (!result.valid) {
          testResults.nosql_injection.blocked++;
          securityLogger.logSecurityEvent(
            SecurityEventType.SECURITY_VIOLATION,
            `NoSQL注入攻击被阻止: ${payload.substring(0, 50)}`,
            'high',
            'blocked',
            { ip: clientIP, payload: payload.substring(0, 100) }
          );
        } else {
          testResults.nosql_injection.passed++;
          testResults.nosql_injection.vulnerabilities.push(payload);
          securityLogger.logSecurityEvent(
            SecurityEventType.SECURITY_VIOLATION,
            `NoSQL注入攻击未被检测: ${payload.substring(0, 50)}`,
            'high',
            'failure',
            { ip: clientIP, payload: payload.substring(0, 100) }
          );
        }
      }
    }
    
    // 6. XXE攻击暴力测试
    if (!attackType || attackType === 'xxe_attacks') {
      console.log('🔥 开始XXE攻击暴力测试...');
      for (const payload of ATTACK_PAYLOADS.xxe_payloads) {
        testResults.xxe_attacks.tested++;
        
        const result = validateInput(payload, {
          ...securityValidationRules.text,
          preventXSS: true // 使用XSS规则检测XML实体
        });
        
        if (!result.valid) {
          testResults.xxe_attacks.blocked++;
          securityLogger.logSecurityEvent(
            SecurityEventType.SECURITY_VIOLATION,
            `XXE攻击被阻止: ${payload.substring(0, 50)}`,
            'high',
            'blocked',
            { ip: clientIP, payload: payload.substring(0, 100) }
          );
        } else {
          testResults.xxe_attacks.passed++;
          testResults.xxe_attacks.vulnerabilities.push(payload);
          securityLogger.logSecurityEvent(
            SecurityEventType.SECURITY_VIOLATION,
            `XXE攻击未被检测: ${payload.substring(0, 50)}`,
            'high',
            'failure',
            { ip: clientIP, payload: payload.substring(0, 100) }
          );
        }
      }
    }
    
    // 7. HTTP头注入攻击暴力测试
    if (!attackType || attackType === 'header_injection') {
      console.log('🔥 开始HTTP头注入攻击暴力测试...');
      for (const payload of ATTACK_PAYLOADS.header_injection) {
        testResults.header_injection.tested++;
        
        const result = validateInput(payload, securityValidationRules.httpHeader);
        
        if (!result.valid) {
          testResults.header_injection.blocked++;
          securityLogger.logSecurityEvent(
            SecurityEventType.SECURITY_VIOLATION,
            `HTTP头注入攻击被阻止: ${payload.substring(0, 50)}`,
            'medium',
            'blocked',
            { ip: clientIP, payload: payload.substring(0, 100) }
          );
        } else {
          testResults.header_injection.passed++;
          testResults.header_injection.vulnerabilities.push(payload);
          securityLogger.logSecurityEvent(
            SecurityEventType.SECURITY_VIOLATION,
            `HTTP头注入攻击未被检测: ${payload.substring(0, 50)}`,
            'medium',
            'failure',
            { ip: clientIP, payload: payload.substring(0, 100) }
          );
        }
      }
    }
    
    // 测试自定义载荷
    if (customPayload) {
      console.log('🔥 测试自定义攻击载荷...');
      const result = validateInput(customPayload, {
        ...securityValidationRules.text,
        preventXSS: true,
        preventSQLInjection: true,
        preventPathTraversal: true,
        preventCommandInjection: true
      });
      
      if (!result.valid) {
        securityLogger.logSecurityEvent(
          SecurityEventType.SECURITY_VIOLATION,
          `自定义攻击载荷被阻止: ${customPayload.substring(0, 50)}`,
          'high',
          'blocked',
          { ip: clientIP, payload: customPayload.substring(0, 100) }
        );
      } else {
        securityLogger.logSecurityEvent(
          SecurityEventType.SECURITY_VIOLATION,
          `自定义攻击载荷未被检测: ${customPayload.substring(0, 50)}`,
          'critical',
          'failure',
          { ip: clientIP, payload: customPayload.substring(0, 100) }
        );
      }
    }
    
    // 记录安全监控事件
    securityMonitor.recordEvent({
      type: 'brutal_security_test',
      userId: 'security-tester',
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: Date.now(),
      metadata: {
        method: 'POST',
        endpoint: '/api/security-brutal-test',
        attackType: attackType || 'comprehensive',
        totalTests: Object.values(testResults).reduce((sum, result) => sum + result.tested, 0),
        totalBlocked: Object.values(testResults).reduce((sum, result) => sum + result.blocked, 0),
        totalVulnerabilities: Object.values(testResults).reduce((sum, result) => sum + result.vulnerabilities.length, 0)
      }
    });
    
    // 计算总体安全评分
    const totalTests = Object.values(testResults).reduce((sum, result) => sum + result.tested, 0);
    const totalBlocked = Object.values(testResults).reduce((sum, result) => sum + result.blocked, 0);
    const totalVulnerabilities = Object.values(testResults).reduce((sum, result) => sum + result.vulnerabilities.length, 0);
    const securityScore = totalTests > 0 ? Math.round((totalBlocked / totalTests) * 100) : 0;
    
    // 记录最终测试结果
    securityLogger.logSecurityEvent(
      SecurityEventType.DATA_ACCESS,
      '暴力安全测试完成',
      totalVulnerabilities > 0 ? 'critical' : 'low',
      totalVulnerabilities > 0 ? 'failure' : 'success',
      { 
        ip: clientIP,
        securityScore,
        totalTests,
        totalBlocked,
        totalVulnerabilities,
        results: testResults
      }
    );
    
    return NextResponse.json({
      message: '暴力安全测试完成',
      timestamp: new Date().toISOString(),
      securityScore,
      summary: {
        totalTests,
        totalBlocked,
        totalVulnerabilities,
        securityLevel: securityScore >= 95 ? 'excellent' : 
                      securityScore >= 85 ? 'good' : 
                      securityScore >= 70 ? 'fair' : 'poor'
      },
      results: testResults,
      recommendations: totalVulnerabilities > 0 ? [
        '发现安全漏洞，需要立即修复输入验证规则',
        '加强对特殊字符和编码的检测',
        '实施更严格的输入过滤和输出编码',
        '考虑使用Web应用防火墙(WAF)',
        '定期进行安全测试和代码审计'
      ] : [
        '安全防护良好，继续保持',
        '定期更新安全规则和检测模式',
        '持续监控新的攻击向量',
        '保持安全意识培训'
      ]
    });
    
  } catch (error) {
    console.error('Brutal security test error:', error);
    
    securityLogger.logSecurityEvent(
      SecurityEventType.SECURITY_VIOLATION,
      '暴力安全测试系统错误',
      'high',
      'failure',
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    );
    
    return NextResponse.json(
      { error: 'Internal server error', test: 'brutal_security_test_error' },
      { status: 500 }
    );
  }
}
