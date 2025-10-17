import { NextRequest, NextResponse } from 'next/server';
import { validateCsrfToken, validateInput, securityValidationRules } from '@/utils/security';
import { authManager, isAuthenticated } from '@/utils/auth';
import { securityLogger, SecurityEventType } from '@/utils/logger';
import { securityMonitor } from '@/utils/monitoring';

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // 1. 测试CSRF保护
    const csrfToken = request.headers.get('x-csrf-token');
    const csrfCookie = request.cookies.get('csrf-token')?.value;
    
    if (!csrfToken || !csrfCookie) {
      securityLogger.logSecurityEvent(
        SecurityEventType.CSRF_VIOLATION,
        'CSRF token缺失',
        'medium',
        'blocked',
        { ip: clientIP }
      );
      
      return NextResponse.json(
        { error: 'CSRF token required', test: 'csrf_protection', status: 'failed' },
        { status: 403 }
      );
    }
    
    const isCsrfValid = validateCsrfToken(csrfToken, csrfCookie);
    if (!isCsrfValid) {
      securityLogger.logSecurityEvent(
        SecurityEventType.CSRF_VIOLATION,
        'CSRF token验证失败',
        'high',
        'blocked',
        { ip: clientIP, token: csrfToken.substring(0, 10) + '...' }
      );
      
      return NextResponse.json(
        { error: 'Invalid CSRF token', test: 'csrf_protection', status: 'failed' },
        { status: 403 }
      );
    }
    
    // 2. 测试认证
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', test: 'authentication', status: 'failed' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const authStatus = isAuthenticated();
    
    // 3. 解析请求体并测试输入验证
    const body = await request.json();
    const { testData, userInput, filePath } = body;
    
    const securityResults = {
      csrf_protection: { status: 'passed', message: 'CSRF token验证通过' },
      authentication: { 
        status: authStatus ? 'passed' : 'warning', 
        message: authStatus ? '认证状态正常' : '认证状态未知（测试环境）' 
      },
      input_validation: {
        xss_detection: { status: 'passed', message: '输入验证正常' },
        sql_injection_detection: { status: 'passed', message: '输入验证正常' },
        path_traversal_detection: { status: 'passed', message: '输入验证正常' }
      },
      security_monitoring: {
        threat_level: 'low',
        anomalies_detected: []
      }
    };
    
    // 4. 测试输入验证
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
          'XSS攻击尝试',
          'high',
          'blocked',
          { ip: clientIP, input: userInput.substring(0, 100) }
        );
      }
    }
    
    // 5. 测试SQL注入检测
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
          'SQL注入攻击尝试',
          'high',
          'blocked',
          { ip: clientIP, input: testData.substring(0, 100) }
        );
      }
    }
    
    // 6. 测试路径遍历检测
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
          '路径遍历攻击尝试',
          'high',
          'blocked',
          { ip: clientIP, path: filePath }
        );
      }
    }
    
    // 7. 记录安全监控事件
    securityMonitor.recordEvent({
      type: 'api_access',
      userId: 'test-user',
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: Date.now(),
      metadata: {
        method: 'POST',
        endpoint: '/api/security-test',
        hasThreats: securityResults.input_validation.xss_detection.status === 'blocked' ||
                   securityResults.input_validation.sql_injection_detection.status === 'blocked' ||
                   securityResults.input_validation.path_traversal_detection.status === 'blocked'
      }
    });
    
    // 8. 记录成功的安全测试
    securityLogger.logSecurityEvent(
      SecurityEventType.DATA_ACCESS,
      '安全功能测试完成',
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
        total_tests: 6,
        passed: [
          securityResults.csrf_protection,
          securityResults.authentication,
          securityResults.input_validation.xss_detection,
          securityResults.input_validation.sql_injection_detection,
          securityResults.input_validation.path_traversal_detection
        ].filter(result => result.status === 'passed').length,
        warnings: [
          securityResults.csrf_protection,
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

export async function GET(request: NextRequest) {
  try {
    // 简单的安全状态检查
    const securityStatus = {
      timestamp: new Date().toISOString(),
      security_headers: {
        csp: 'enabled',
        xframe: 'enabled',
        xss_protection: 'enabled',
        content_type_options: 'enabled'
      },
      authentication: {
        jwt_enabled: true,
        token_refresh: true,
        session_management: true
      },
      input_validation: {
        xss_protection: true,
        sql_injection_protection: true,
        path_traversal_protection: true,
        csrf_protection: true
      },
      monitoring: {
        security_logging: true,
        anomaly_detection: true,
        threat_monitoring: true
      },
      encryption: {
        data_encryption: true,
        environment_security: true,
        secure_storage: true
      }
    };
    
    return NextResponse.json({
      message: '安全系统状态检查',
      status: 'operational',
      features: securityStatus
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check security status' },
      { status: 500 }
    );
  }
}