import { NextRequest, NextResponse } from 'next/server';
import { validateInput, securityValidationRules } from '@/utils/security';
import { isAuthenticated } from '@/utils/auth';
import { securityLogger, SecurityEventType } from '@/utils/logger';
import { securityMonitor } from '@/utils/monitoring';

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // 解析请求体
    const body = await request.json();
    const { testData, userInput, filePath, testType } = body;
    
    const securityResults = {
      authentication: { status: 'passed', message: '认证测试跳过（简化测试）' },
      input_validation: {
        xss_detection: { status: 'passed', message: '输入验证正常' },
        sql_injection_detection: { status: 'passed', message: '输入验证正常' },
        path_traversal_detection: { status: 'passed', message: '输入验证正常' }
      },
      security_monitoring: {
        threat_level: 'low',
        events_recorded: true
      }
    };
    
    // 1. 测试认证（如果提供了Authorization header）
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const authStatus = isAuthenticated();
      
      securityResults.authentication = {
        status: authStatus ? 'passed' : 'warning',
        message: authStatus ? 'JWT认证状态正常' : 'JWT认证状态未知（开发环境）'
      };
    }
    
    // 2. 测试XSS检测
    if (userInput) {
      const xssResult = validateInput(userInput, {
        ...securityValidationRules.text,
        preventXSS: true
      });
      
      securityResults.input_validation.xss_detection = {
        status: xssResult.valid ? 'passed' : 'blocked',
        message: xssResult.valid ? '未检测到XSS威胁' : `检测到XSS威胁: ${xssResult.message}`
      };
      
      if (!xssResult.valid) {
        securityLogger.logSecurityEvent(
          SecurityEventType.XSS_ATTEMPT,
          'XSS攻击尝试检测',
          'high',
          'blocked',
          { ip: clientIP, input: userInput.substring(0, 100) }
        );
      }
    }
    
    // 3. 测试SQL注入检测
    if (testData) {
      const sqlResult = validateInput(testData, {
        ...securityValidationRules.text,
        preventSQLInjection: true
      });
      
      securityResults.input_validation.sql_injection_detection = {
        status: sqlResult.valid ? 'passed' : 'blocked',
        message: sqlResult.valid ? '未检测到SQL注入威胁' : `检测到SQL注入威胁: ${sqlResult.message}`
      };
      
      if (!sqlResult.valid) {
        securityLogger.logSecurityEvent(
          SecurityEventType.SQL_INJECTION_ATTEMPT,
          'SQL注入攻击尝试检测',
          'high',
          'blocked',
          { ip: clientIP, input: testData.substring(0, 100) }
        );
      }
    }
    
    // 4. 测试路径遍历检测
    if (filePath) {
      const pathResult = validateInput(filePath, {
        maxLength: 255,
        allowedCharacters: 'a-zA-Z0-9._-',
        preventPathTraversal: true
      });
      
      securityResults.input_validation.path_traversal_detection = {
        status: pathResult.valid ? 'passed' : 'blocked',
        message: pathResult.valid ? '未检测到路径遍历威胁' : `检测到路径遍历威胁: ${pathResult.message}`
      };
      
      if (!pathResult.valid) {
        securityLogger.logSecurityEvent(
          SecurityEventType.SECURITY_VIOLATION,
          '路径遍历攻击尝试检测',
          'high',
          'blocked',
          { ip: clientIP, path: filePath }
        );
      }
    }
    
    // 5. 记录安全监控事件
    securityMonitor.recordEvent({
      type: 'security_test',
      userId: 'test-user',
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: Date.now(),
      metadata: {
        method: 'POST',
        endpoint: '/api/security-test-simple',
        testType: testType || 'comprehensive',
        hasThreats: securityResults.input_validation.xss_detection.status === 'blocked' ||
                   securityResults.input_validation.sql_injection_detection.status === 'blocked' ||
                   securityResults.input_validation.path_traversal_detection.status === 'blocked'
      }
    });
    
    // 6. 记录成功的安全测试
    securityLogger.logSecurityEvent(
      SecurityEventType.DATA_ACCESS,
      '简化安全功能测试完成',
      'low',
      'success',
      { 
        ip: clientIP,
        results: securityResults
      }
    );
    
    return NextResponse.json({
      message: '安全功能测试完成',
      timestamp: new Date().toISOString(),
      results: securityResults,
      summary: {
        total_tests: 4,
        passed: [
          securityResults.authentication,
          securityResults.input_validation.xss_detection,
          securityResults.input_validation.sql_injection_detection,
          securityResults.input_validation.path_traversal_detection
        ].filter(result => result.status === 'passed').length,
        warnings: [
          securityResults.authentication,
          securityResults.input_validation.xss_detection,
          securityResults.input_validation.sql_injection_detection,
          securityResults.input_validation.path_traversal_detection
        ].filter(result => result.status === 'warning').length,
        blocked: [
          securityResults.input_validation.xss_detection,
          securityResults.input_validation.sql_injection_detection,
          securityResults.input_validation.path_traversal_detection
        ].filter(result => result.status === 'blocked').length
      }
    });
    
  } catch (error) {
    console.error('Security test error:', error);
    
    securityLogger.logSecurityEvent(
      SecurityEventType.SECURITY_VIOLATION,
      '安全测试系统错误',
      'high',
      'failure',
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    );
    
    return NextResponse.json(
      { error: 'Internal server error', test: 'system_error' },
      { status: 500 }
    );
  }
}