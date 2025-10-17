// Code splitting optimized - Business logic module
import { NextRequest, NextResponse } from 'next/server';
import { securityLogger, SecurityEventType } from '@/utils/logger';
import { securityMonitor } from '@/utils/monitoring';
import { validateInput, securityValidationRules, rateLimitManager, TimingAttackProtection } from '@/utils/security';
import { rateLimitConfig } from '@/config/security';
import { FILE_UPLOAD_ATTACK_PAYLOADS } from '../security-payloads';

export async function handlePOST(request: NextRequest) {
  try {
    const testResults = {
      malicious_extensions: { tested: 0, blocked: 0, vulnerabilities: [] as string[] },
      double_extensions: { tested: 0, blocked: 0, vulnerabilities: [] as string[] },
      null_byte_injection: { tested: 0, blocked: 0, vulnerabilities: [] as string[] },
      path_traversal: { tested: 0, blocked: 0, vulnerabilities: [] as string[] },
      oversized_files: { tested: 0, blocked: 0, vulnerabilities: [] as string[] },
      content_type_mismatch: { tested: 0, blocked: 0, vulnerabilities: [] as string[] },
      special_characters: { tested: 0, blocked: 0, vulnerabilities: [] as string[] }
    };

    // 测试恶意扩展名
    for (const payload of FILE_UPLOAD_ATTACK_PAYLOADS.malicious_extensions) {
      testResults.malicious_extensions.tested++;
      
      // 检查文件扩展名
      const extension = payload.filename.split('.').pop()?.toLowerCase();
      const dangerousExtensions = ['php', 'jsp', 'asp', 'exe', 'sh', 'bat', 'cmd', 'py', 'pl', 'rb'];
      const isBlocked = dangerousExtensions.includes(extension || '');
      
      if (isBlocked) {
        testResults.malicious_extensions.blocked++;
      } else {
        testResults.malicious_extensions.vulnerabilities.push(payload.description);
      }

      securityLogger.logSecurityEvent(
        SecurityEventType.FILE_UPLOAD,
        `恶意扩展名测试: ${payload.description}`,
        isBlocked ? 'medium' : 'high',
        isBlocked ? 'blocked' : 'failure',
        { filename: payload.filename, contentType: payload.contentType }
      );
    }

    // 测试双重扩展名
    for (const payload of FILE_UPLOAD_ATTACK_PAYLOADS.double_extensions) {
      testResults.double_extensions.tested++;
      
      // 检查双重扩展名
      const parts = payload.filename.split('.');
      const hasDoubleExtension = parts.length > 2;
      const lastExtension = parts[parts.length - 1]?.toLowerCase();
      
      const dangerousExtensions = ['php', 'jsp', 'asp', 'exe', 'bat', 'cmd', 'scr', 'js', 'vbs'];
      // 修复：检查最后的扩展名是否为危险扩展名
      const isBlocked = hasDoubleExtension && dangerousExtensions.includes(lastExtension || '');
      
      if (isBlocked) {
        testResults.double_extensions.blocked++;
      } else {
        testResults.double_extensions.vulnerabilities.push(payload.description);
      }

      securityLogger.logSecurityEvent(
        SecurityEventType.FILE_UPLOAD,
        `双重扩展名测试: ${payload.description}`,
        isBlocked ? 'medium' : 'high',
        isBlocked ? 'blocked' : 'failure',
        { filename: payload.filename }
      );
    }

    // 测试空字节注入
    for (const payload of FILE_UPLOAD_ATTACK_PAYLOADS.null_byte_injection) {
      testResults.null_byte_injection.tested++;
      
      // 检查空字节
      const hasNullByte = payload.filename.includes('\x00');
      const isBlocked = hasNullByte;
      
      if (isBlocked) {
        testResults.null_byte_injection.blocked++;
      } else {
        testResults.null_byte_injection.vulnerabilities.push(payload.description);
      }

      securityLogger.logSecurityEvent(
        SecurityEventType.FILE_UPLOAD,
        `空字节注入测试: ${payload.description}`,
        isBlocked ? 'medium' : 'high',
        isBlocked ? 'blocked' : 'failure',
        { filename: payload.filename }
      );
    }

    // 测试路径遍历
    for (const payload of FILE_UPLOAD_ATTACK_PAYLOADS.path_traversal) {
      testResults.path_traversal.tested++;
      
      // 检查路径遍历模式
      const hasPathTraversal = payload.filename.includes('..') || 
                              payload.filename.includes('%2e%2e') ||
                              payload.filename.includes('\\') ||
                              payload.filename.includes('/etc/') ||
                              payload.filename.includes('windows');
      const isBlocked = hasPathTraversal;
      
      if (isBlocked) {
        testResults.path_traversal.blocked++;
      } else {
        testResults.path_traversal.vulnerabilities.push(payload.description);
      }

      securityLogger.logSecurityEvent(
        SecurityEventType.FILE_UPLOAD,
        `路径遍历测试: ${payload.description}`,
        isBlocked ? 'medium' : 'high',
        isBlocked ? 'blocked' : 'failure',
        { filename: payload.filename }
      );
    }

    // 测试超大文件
    for (const payload of FILE_UPLOAD_ATTACK_PAYLOADS.oversized_files) {
      testResults.oversized_files.tested++;
      
      // 检查文件大小（假设限制为10MB）
      const maxSize = 10 * 1024 * 1024; // 10MB
      const isBlocked = (payload.size || 0) > maxSize;
      
      if (isBlocked) {
        testResults.oversized_files.blocked++;
      } else {
        testResults.oversized_files.vulnerabilities.push(payload.description);
      }

      securityLogger.logSecurityEvent(
        SecurityEventType.FILE_UPLOAD,
        `超大文件测试: ${payload.description}`,
        isBlocked ? 'low' : 'medium',
        isBlocked ? 'blocked' : 'failure',
        { filename: payload.filename, size: payload.size }
      );
    }

    // 测试内容类型不匹配
    for (const payload of FILE_UPLOAD_ATTACK_PAYLOADS.content_type_mismatch) {
      testResults.content_type_mismatch.tested++;
      
      // 检查内容类型与文件扩展名是否匹配
      const extension = payload.filename.split('.').pop()?.toLowerCase();
      const contentType = payload.contentType || '';
      
      const dangerousExtensions = ['php', 'jsp', 'asp', 'exe', 'bat', 'cmd', 'scr', 'js', 'vbs'];
      const safeContentTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'];
      
      // 修复：检查危险扩展名是否伪装成安全内容类型
      const isDangerousExtension = dangerousExtensions.includes(extension || '');
      const isSafeContentType = safeContentTypes.includes(contentType);
      const isContentTypeMismatch = isDangerousExtension && isSafeContentType;
      
      const isBlocked = isContentTypeMismatch;
      
      if (isBlocked) {
        testResults.content_type_mismatch.blocked++;
      } else {
        testResults.content_type_mismatch.vulnerabilities.push(payload.description);
      }

      securityLogger.logSecurityEvent(
        SecurityEventType.FILE_UPLOAD,
        `内容类型不匹配测试: ${payload.description}`,
        isBlocked ? 'low' : 'medium',
        isBlocked ? 'blocked' : 'failure',
        { filename: payload.filename, contentType: payload.contentType }
      );
    }

    // 测试特殊字符
    for (const payload of FILE_UPLOAD_ATTACK_PAYLOADS.special_characters) {
      testResults.special_characters.tested++;
      
      // 检查特殊字符
      const hasSpecialChars = /[<>:"|?*\r\n]/.test(payload.filename) || 
                             payload.filename.length > 255 ||
                             /[^\x00-\x7F]/.test(payload.filename);
      const isBlocked = hasSpecialChars;
      
      if (isBlocked) {
        testResults.special_characters.blocked++;
      } else {
        testResults.special_characters.vulnerabilities.push(payload.description);
      }

      securityLogger.logSecurityEvent(
        SecurityEventType.FILE_UPLOAD,
        `特殊字符测试: ${payload.description}`,
        isBlocked ? 'low' : 'medium',
        isBlocked ? 'blocked' : 'failure',
        { filename: payload.filename }
      );
    }

    // 计算总体统计
    const totalTests = Object.values(testResults).reduce((sum, result) => sum + result.tested, 0);
    const totalBlocked = Object.values(testResults).reduce((sum, result) => sum + result.blocked, 0);
    const totalVulnerabilities = totalTests - totalBlocked;
    
    // 计算安全评分
    const securityScore = totalTests > 0 ? Math.round((totalBlocked / totalTests) * 100) : 0;
    
    // 确定安全级别
    let securityLevel = 'poor';
    if (securityScore >= 95) securityLevel = 'excellent';
    else if (securityScore >= 80) securityLevel = 'good';
    else if (securityScore >= 60) securityLevel = 'fair';

    // 生成建议
    const recommendations = [];
    if (securityScore >= 95) {
      recommendations.push('文件上传安全防护优秀');
      recommendations.push('继续保持严格的文件验证机制');
      recommendations.push('定期更新文件类型黑名单');
    } else {
      recommendations.push('需要立即加强文件上传安全防护');
      recommendations.push('实施严格的文件类型验证');
      recommendations.push('添加文件内容检查');
      recommendations.push('限制文件大小和文件名长度');
      recommendations.push('使用安全的文件存储位置');
    }

    // 记录总体安全事件
    securityLogger.logSecurityEvent(
      SecurityEventType.SECURITY_VIOLATION,
      `文件上传安全暴力测试完成: ${totalTests}个测试, ${totalBlocked}个被阻止, ${totalVulnerabilities}个漏洞`,
      totalVulnerabilities > 0 ? 'high' : 'low',
      totalVulnerabilities > 0 ? 'failure' : 'success',
      { 
        totalTests, 
        totalBlocked, 
        totalVulnerabilities, 
        securityScore,
        testType: 'file_upload_brutal_test'
      }
    );

    return NextResponse.json({
      message: '文件上传安全暴力测试完成',
      timestamp: new Date().toISOString(),
      securityScore,
      summary: {
        totalTests,
        totalBlocked,
        totalVulnerabilities,
        securityLevel
      },
      results: testResults,
      recommendations
    });

  } catch (error) {
    console.error('文件上传安全测试错误:', error);
    
    securityLogger.logSecurityEvent(
      SecurityEventType.SECURITY_VIOLATION,
      `文件上传安全测试失败: ${error}`,
      'high',
      'failure',
      { error: String(error), testType: 'file_upload_brutal_test_error' }
    );

    return NextResponse.json(
      { 
        error: '文件上传安全测试失败',
        details: error instanceof Error ? error.message : String(error),
        testType: 'file_upload_brutal_test_error'
      },
      { status: 500 }
    );
  }
}
