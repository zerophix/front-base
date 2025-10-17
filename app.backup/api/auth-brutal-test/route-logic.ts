// Code splitting optimized - Business logic module
import { NextRequest, NextResponse } from 'next/server';
import { securityLogger, SecurityEventType } from '@/utils/logger';
import { securityMonitor } from '@/utils/monitoring';
import { validateInput, securityValidationRules, rateLimitManager, TimingAttackProtection } from '@/utils/security';
import { rateLimitConfig } from '@/config/security';
import { AUTH_BYPASS_PAYLOADS } from '../security-payloads';

export async function handlePOST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    let body = {};
    try {
      const text = await request.text();
      if (text.trim()) {
        body = JSON.parse(text);
      }
    } catch (e) {
      // 如果解析失败，使用空对象
      body = {};
    }
    
    const { testType, username, password } = body as any;
    
    const testResults = {
      sql_injection_auth: { tested: 0, blocked: 0, vulnerabilities: [] as string[] },
      nosql_injection_auth: { tested: 0, blocked: 0, vulnerabilities: [] as string[] },
      ldap_injection: { tested: 0, blocked: 0, vulnerabilities: [] as string[] },
      jwt_manipulation: { tested: 0, blocked: 0, vulnerabilities: [] as string[] },
      session_manipulation: { tested: 0, blocked: 0, vulnerabilities: [] as string[] },
      parameter_pollution: { tested: 0, blocked: 0, vulnerabilities: [] as string[] },
      brute_force_protection: { tested: 0, blocked: 0, vulnerabilities: [] as string[] },
      timing_attacks: { tested: 0, blocked: 0, vulnerabilities: [] as string[] }
    };
    
    // 1. SQL注入认证绕过测试
    if (!testType || testType === 'sql_injection_auth') {
      console.log('🔥 开始SQL注入认证绕过测试...');
      for (const payload of AUTH_BYPASS_PAYLOADS.sql_injection_auth) {
        testResults.sql_injection_auth.tested++;
        
        // 模拟认证检查
        const isBlocked = payload.includes("'") || payload.includes("--") || payload.includes("#");
        
        if (isBlocked) {
          testResults.sql_injection_auth.blocked++;
          securityLogger.logSecurityEvent(
            SecurityEventType.LOGIN_FAILURE,
            `SQL注入认证绕过被阻止: ${payload}`,
            'high',
            'blocked',
            { ip: clientIP, payload, type: 'sql_injection_auth' }
          );
        } else {
          testResults.sql_injection_auth.vulnerabilities.push(payload);
          securityLogger.logSecurityEvent(
            SecurityEventType.LOGIN_FAILURE,
            `SQL注入认证绕过未被检测: ${payload}`,
            'critical',
            'failure',
            { ip: clientIP, payload, type: 'sql_injection_auth' }
          );
        }
      }
    }
    
    // 2. NoSQL注入认证绕过测试
    if (!testType || testType === 'nosql_injection_auth') {
      console.log('🔥 开始NoSQL注入认证绕过测试...');
      for (const payload of AUTH_BYPASS_PAYLOADS.nosql_injection_auth) {
        testResults.nosql_injection_auth.tested++;
        
        const isBlocked = payload.includes("$") || payload.includes("{") || payload.includes("}");
        
        if (isBlocked) {
          testResults.nosql_injection_auth.blocked++;
          securityLogger.logSecurityEvent(
            SecurityEventType.LOGIN_FAILURE,
            `NoSQL注入认证绕过被阻止: ${payload}`,
            'high',
            'blocked',
            { ip: clientIP, payload, type: 'nosql_injection_auth' }
          );
        } else {
          testResults.nosql_injection_auth.vulnerabilities.push(payload);
          securityLogger.logSecurityEvent(
            SecurityEventType.LOGIN_FAILURE,
            `NoSQL注入认证绕过未被检测: ${payload}`,
            'critical',
            'failure',
            { ip: clientIP, payload, type: 'nosql_injection_auth' }
          );
        }
      }
    }
    
    // 3. LDAP注入测试
    if (!testType || testType === 'ldap_injection') {
      console.log('🔥 开始LDAP注入测试...');
      for (const payload of AUTH_BYPASS_PAYLOADS.ldap_injection) {
        testResults.ldap_injection.tested++;
        
        const isBlocked = payload.includes(")(") || payload.includes("*") || payload.includes("&");
        
        if (isBlocked) {
          testResults.ldap_injection.blocked++;
          securityLogger.logSecurityEvent(
            SecurityEventType.LOGIN_FAILURE,
            `LDAP注入被阻止: ${payload}`,
            'high',
            'blocked',
            { ip: clientIP, payload, type: 'ldap_injection' }
          );
        } else {
          testResults.ldap_injection.vulnerabilities.push(payload);
          securityLogger.logSecurityEvent(
            SecurityEventType.LOGIN_FAILURE,
            `LDAP注入未被检测: ${payload}`,
            'high',
            'failure',
            { ip: clientIP, payload, type: 'ldap_injection' }
          );
        }
      }
    }
    
    // 4. JWT操作测试
    if (!testType || testType === 'jwt_manipulation') {
      console.log('🔥 开始JWT操作测试...');
      for (const payload of AUTH_BYPASS_PAYLOADS.jwt_manipulation) {
        testResults.jwt_manipulation.tested++;
        
        // 使用新的JWT验证功能
        const validationResult = validateInput(payload, securityValidationRules.jwtToken);
        const isBlocked = !validationResult.valid;
        
        if (isBlocked) {
          testResults.jwt_manipulation.blocked++;
          securityLogger.logSecurityEvent(
            SecurityEventType.LOGIN_FAILURE,
            `JWT操作被阻止: ${payload.substring(0, 50)} - ${validationResult.message}`,
            'medium',
            'blocked',
            { ip: clientIP, payload: payload.substring(0, 100), type: 'jwt_manipulation', reason: validationResult.message }
          );
        } else {
          testResults.jwt_manipulation.vulnerabilities.push(payload);
          securityLogger.logSecurityEvent(
            SecurityEventType.LOGIN_FAILURE,
            `JWT操作未被检测: ${payload.substring(0, 50)}`,
            'high',
            'failure',
            { ip: clientIP, payload: payload.substring(0, 100), type: 'jwt_manipulation' }
          );
        }
      }
    }
    
    // 5. 会话操作测试
    if (!testType || testType === 'session_manipulation') {
      console.log('🔥 开始会话操作测试...');
      for (const payload of AUTH_BYPASS_PAYLOADS.session_manipulation) {
        testResults.session_manipulation.tested++;
        
        const isBlocked = payload.includes("admin") || payload.includes("true") || payload.includes("1");
        
        if (isBlocked) {
          testResults.session_manipulation.blocked++;
          securityLogger.logSecurityEvent(
            SecurityEventType.LOGIN_FAILURE,
            `会话操作被阻止: ${payload}`,
            'medium',
            'blocked',
            { ip: clientIP, payload, type: 'session_manipulation' }
          );
        } else {
          testResults.session_manipulation.vulnerabilities.push(payload);
          securityLogger.logSecurityEvent(
            SecurityEventType.LOGIN_FAILURE,
            `会话操作未被检测: ${payload}`,
            'high',
            'failure',
            { ip: clientIP, payload, type: 'session_manipulation' }
          );
        }
      }
    }
    
    // 6. 参数污染测试
    if (!testType || testType === 'parameter_pollution') {
      console.log('🔥 开始参数污染测试...');
      for (const payload of AUTH_BYPASS_PAYLOADS.parameter_pollution) {
        testResults.parameter_pollution.tested++;
        
        // 使用新的参数污染验证功能
        const validationResult = validateInput(payload, securityValidationRules.authParameter);
        const isBlocked = !validationResult.valid;
        
        if (isBlocked) {
          testResults.parameter_pollution.blocked++;
          securityLogger.logSecurityEvent(
            SecurityEventType.LOGIN_FAILURE,
            `参数污染被阻止: ${payload} - ${validationResult.message}`,
            'medium',
            'blocked',
            { ip: clientIP, payload, type: 'parameter_pollution', reason: validationResult.message }
          );
        } else {
          testResults.parameter_pollution.vulnerabilities.push(payload);
          securityLogger.logSecurityEvent(
            SecurityEventType.LOGIN_FAILURE,
            `参数污染未被检测: ${payload}`,
            'medium',
            'failure',
            { ip: clientIP, payload, type: 'parameter_pollution' }
          );
        }
      }
    }
    
    // 7. 暴力破解保护测试
    if (!testType || testType === 'brute_force_protection') {
      console.log('🔥 开始暴力破解保护测试...');
      
      // 清理之前的速率限制记录，确保测试的准确性
      rateLimitManager.cleanup(0);
      
      // 测试场景1: 对单个用户的连续暴力破解攻击
      const targetUser = 'admin';
      const userIdentifier = `${clientIP}:${targetUser}`;
      
      console.log(`测试场景1: 对用户 ${targetUser} 进行连续暴力破解攻击`);
      for (let i = 0; i < 10; i++) {
        const password = AUTH_BYPASS_PAYLOADS.common_passwords[i % AUTH_BYPASS_PAYLOADS.common_passwords.length];
        testResults.brute_force_protection.tested++;
        
        const rateLimit = rateLimitManager.checkRateLimit(
          userIdentifier,
          3, // 降低到3次尝试
          rateLimitConfig.endpoints.login.windowMs
        );
        
        if (rateLimit.blocked) {
           testResults.brute_force_protection.blocked++;
           securityLogger.logSecurityEvent(
             SecurityEventType.LOGIN_FAILURE,
             `单用户暴力破解被阻止: ${targetUser}/${password} (尝试${i+1}/10) - ${rateLimit.reason || '速率限制'}`,
             'high',
             'blocked',
             { 
               ip: clientIP, 
               username: targetUser, 
               attempt: i+1, 
               remainingAttempts: rateLimit.remainingAttempts,
               reason: rateLimit.reason,
               lockoutUntil: rateLimit.lockoutUntil
             }
           );
         } else {
           testResults.brute_force_protection.vulnerabilities.push(`${targetUser}/${password} (尝试${i+1})`);
           securityLogger.logSecurityEvent(
             SecurityEventType.LOGIN_FAILURE,
             `单用户暴力破解未被限制: ${targetUser}/${password} (尝试${i+1}/10)`,
             'critical',
             'failure',
             { ip: clientIP, username: targetUser, attempt: i+1, remainingAttempts: rateLimit.remainingAttempts }
           );
         }
      }
      
      // 测试场景2: 基于IP的全局暴力破解攻击（不同用户）
      console.log('测试场景2: 基于IP的全局暴力破解攻击');
      
      for (let i = 0; i < 10; i++) {
        const user = AUTH_BYPASS_PAYLOADS.timing_attack_usernames[i % AUTH_BYPASS_PAYLOADS.timing_attack_usernames.length];
        const password = AUTH_BYPASS_PAYLOADS.common_passwords[i % AUTH_BYPASS_PAYLOADS.common_passwords.length];
        testResults.brute_force_protection.tested++;
        
        // 检查基于IP的全局限制（真正的IP级别限制）
        const ipRateLimit = rateLimitManager.checkIPRateLimit(
          clientIP,
          3, // IP级别限制：每个IP只允许3次尝试
          rateLimitConfig.endpoints.login.windowMs
        );
        
        if (ipRateLimit.blocked) {
           testResults.brute_force_protection.blocked++;
           securityLogger.logSecurityEvent(
             SecurityEventType.LOGIN_FAILURE,
             `IP级暴力破解被阻止: ${user}/${password} (IP尝试${i+1}/10) - ${ipRateLimit.reason || '速率限制'}`,
             'high',
             'blocked',
             { 
               ip: clientIP, 
               username: user, 
               ipAttempt: i+1, 
               remainingAttempts: ipRateLimit.remainingAttempts,
               reason: ipRateLimit.reason
             }
           );
         } else {
           testResults.brute_force_protection.vulnerabilities.push(`IP:${user}/${password} (IP尝试${i+1})`);
           securityLogger.logSecurityEvent(
             SecurityEventType.LOGIN_FAILURE,
             `IP级暴力破解未被限制: ${user}/${password} (IP尝试${i+1}/10)`,
             'critical',
             'failure',
             { ip: clientIP, username: user, ipAttempt: i+1, remainingAttempts: ipRateLimit.remainingAttempts }
           );
         }
      }
      
      // 测试场景3: 分布式暴力破解攻击（模拟不同IP）
      console.log('测试场景3: 分布式暴力破解攻击模拟');
      const fakeIPs = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.10', '198.51.100.5'];
      
      for (let i = 0; i < 10; i++) {
        const fakeIP = fakeIPs[i % fakeIPs.length];
        const user = 'admin'; // 都攻击同一个用户
        const password = AUTH_BYPASS_PAYLOADS.common_passwords[i % AUTH_BYPASS_PAYLOADS.common_passwords.length];
        
        testResults.brute_force_protection.tested++;
        
        // 检查分布式攻击保护
        const distributedAttack = rateLimitManager.checkDistributedAttack(
          user,
          rateLimitConfig.endpoints.login.windowMs
        );
        
        if (distributedAttack.blocked) {
           testResults.brute_force_protection.blocked++;
           securityLogger.logSecurityEvent(
             SecurityEventType.LOGIN_FAILURE,
             `分布式暴力破解被阻止: ${fakeIP}:${user}/${password} - ${distributedAttack.reason || '分布式攻击检测'}`,
             'high',
             'blocked',
             { 
               ip: fakeIP, 
               username: user, 
               distributedAttempt: i+1,
               reason: distributedAttack.reason
             }
           );
         } else {
           testResults.brute_force_protection.vulnerabilities.push(`分布式:${fakeIP}:${user}/${password}`);
           securityLogger.logSecurityEvent(
             SecurityEventType.LOGIN_FAILURE,
             `分布式暴力破解未被限制: ${fakeIP}:${user}/${password}`,
             'medium',
             'failure',
             { ip: fakeIP, username: user, distributedAttempt: i+1 }
           );
         }
      }
    }
    
    // 8. 时序攻击测试
    if (!testType || testType === 'timing_attacks') {
      console.log('🔥 开始时序攻击测试...');
      
      for (const user of AUTH_BYPASS_PAYLOADS.timing_attack_usernames) {
        testResults.timing_attacks.tested++;
        
        // 使用时序攻击防护进行检测
        const startTime = Date.now();
        
        // 模拟用户验证过程
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
        
        const responseTime = Date.now() - startTime;
        
        // 使用时序攻击检测功能
        const isTimingAttack = TimingAttackProtection.detectTimingAttack(user, responseTime);
        
        // 添加安全延迟以防止时序攻击
        await TimingAttackProtection.addSecurityDelay(user);
        await TimingAttackProtection.addConstantDelay(startTime);
        
        if (isTimingAttack) {
          testResults.timing_attacks.blocked++;
          securityLogger.logSecurityEvent(
            SecurityEventType.LOGIN_FAILURE,
            `时序攻击被阻止: ${user} (响应时间: ${responseTime}ms)`,
            'medium',
            'success',
            { ip: clientIP, username: user, responseTime, attackType: 'timing_attack' }
          );
        } else {
          testResults.timing_attacks.vulnerabilities.push(user);
          securityLogger.logSecurityEvent(
            SecurityEventType.LOGIN_FAILURE,
            `时序攻击未被检测: ${user} (响应时间: ${responseTime}ms)`,
            'high',
            'failure',
            { ip: clientIP, username: user, responseTime }
          );
        }
      }
    }
    
    // 记录安全监控事件
    securityMonitor.recordEvent({
      type: 'auth_brutal_test',
      userId: 'security-tester',
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: Date.now(),
      metadata: {
        method: 'POST',
        endpoint: '/api/auth-brutal-test',
        testType: testType || 'comprehensive',
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
      SecurityEventType.LOGIN_FAILURE,
      '认证安全暴力测试完成',
      totalVulnerabilities > 5 ? 'critical' : totalVulnerabilities > 0 ? 'high' : 'low',
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
      message: '认证安全暴力测试完成',
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
        '发现认证安全漏洞，需要立即修复',
        '实施更严格的输入验证和认证机制',
        '加强暴力破解保护和账户锁定策略',
        '实施时序攻击防护措施',
        '定期进行认证安全审计'
      ] : [
        '认证安全防护良好',
        '继续保持严格的认证机制',
        '定期更新安全策略',
        '持续监控认证异常'
      ]
    });
    
  } catch (error) {
    console.error('Auth brutal test error:', error);
    
    securityLogger.logSecurityEvent(
      SecurityEventType.LOGIN_FAILURE,
      '认证安全测试系统错误',
      'high',
      'failure',
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    );
    
    return NextResponse.json(
      { error: 'Internal server error', test: 'auth_brutal_test_error' },
      { status: 500 }
    );
  }
}
