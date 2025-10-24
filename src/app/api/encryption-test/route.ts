import { NextRequest, NextResponse } from 'next/server';
import { EncryptionUtils, SecureEnvLoader, validateEnvironmentSecurity } from '@/utils/encryption';
import { securityLogger, SecurityEventType } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    const body = await request.json();
    const { testData, testType } = body;
    
    const encryptionResults = {
      environment_security: { status: 'unknown', issues: [] as string[] },
      data_encryption: { status: 'unknown', message: '' },
      password_hashing: { status: 'unknown', message: '' },
      secure_token_generation: { status: 'unknown', message: '' },
      env_variable_access: { status: 'unknown', message: '' }
    };
    
    // 1. 测试环境变量安全性
    try {
      const envValidation = validateEnvironmentSecurity();
      encryptionResults.environment_security = {
        status: envValidation.valid ? 'passed' : 'warning',
        issues: envValidation.issues
      };
    } catch (error) {
      encryptionResults.environment_security = {
        status: 'failed',
        issues: [error instanceof Error ? error.message : 'Unknown environment error']
      };
    }
    
    // 2. 测试数据加密和解密
    try {
      const testString = testData || 'Hello, this is a test encryption string!';
      const encrypted = await EncryptionUtils.encrypt(testString);
      const decrypted = await EncryptionUtils.decrypt(encrypted);
      
      if (decrypted === testString) {
        encryptionResults.data_encryption = {
          status: 'passed',
          message: '数据加密和解密功能正常'
        };
      } else {
        encryptionResults.data_encryption = {
          status: 'failed',
          message: '加密解密结果不匹配'
        };
      }
    } catch (error) {
      encryptionResults.data_encryption = {
        status: 'failed',
        message: `加密测试失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
    
    // 3. 测试密码哈希
    try {
      const testPassword = 'TestPassword123!';
      const hashedPassword = await EncryptionUtils.hashPassword(testPassword);
      const isValid = await EncryptionUtils.verifyPassword(testPassword, hashedPassword);
      const isInvalid = await EncryptionUtils.verifyPassword('WrongPassword', hashedPassword);
      
      if (isValid && !isInvalid) {
        encryptionResults.password_hashing = {
          status: 'passed',
          message: '密码哈希和验证功能正常'
        };
      } else {
        encryptionResults.password_hashing = {
          status: 'failed',
          message: '密码验证逻辑错误'
        };
      }
    } catch (error) {
      encryptionResults.password_hashing = {
        status: 'failed',
        message: `密码哈希测试失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
    
    // 4. 测试安全令牌生成
    try {
      const token1 = await EncryptionUtils.generateSecureToken(32);
      const token2 = await EncryptionUtils.generateSecureToken(32);
      
      // base64url编码的32字节应该产生约43个字符
      if (token1.length > 40 && token2.length > 40 && token1 !== token2) {
        encryptionResults.secure_token_generation = {
          status: 'passed',
          message: '安全令牌生成功能正常'
        };
      } else {
        encryptionResults.secure_token_generation = {
          status: 'failed',
          message: `令牌生成异常: token1长度=${token1.length}, token2长度=${token2.length}, 相同=${token1 === token2}`
        };
      }
    } catch (error) {
      encryptionResults.secure_token_generation = {
        status: 'failed',
        message: `令牌生成测试失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
    
    // 5. 测试安全环境变量访问
    try {
      const jwtSecret = await SecureEnvLoader.get('JWT_SECRET');
      const encryptionKey = await SecureEnvLoader.get('ENCRYPTION_KEY');
      
      if (jwtSecret && encryptionKey) {
        encryptionResults.env_variable_access = {
          status: 'passed',
          message: '环境变量访问正常'
        };
      } else {
        encryptionResults.env_variable_access = {
          status: 'warning',
          message: '部分环境变量未设置'
        };
      }
    } catch (error) {
      encryptionResults.env_variable_access = {
        status: 'failed',
        message: `环境变量访问失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
    
    // 记录安全测试事件
    securityLogger.logSecurityEvent(
      SecurityEventType.DATA_ACCESS,
      '加密系统功能测试完成',
      'low',
      'success',
      { 
        ip: clientIP,
        testType: testType || 'comprehensive',
        results: encryptionResults
      }
    );
    
    // 计算测试统计
    const allTests = Object.values(encryptionResults);
    const passed = allTests.filter(test => test.status === 'passed').length;
    const warnings = allTests.filter(test => test.status === 'warning').length;
    const failed = allTests.filter(test => test.status === 'failed').length;
    
    return NextResponse.json({
      message: '加密系统测试完成',
      timestamp: new Date().toISOString(),
      results: encryptionResults,
      summary: {
        total_tests: allTests.length,
        passed,
        warnings,
        failed,
        overall_status: failed > 0 ? 'failed' : warnings > 0 ? 'warning' : 'passed'
      }
    });
    
  } catch (error) {
    console.error('Encryption test error:', error);
    
    securityLogger.logSecurityEvent(
      SecurityEventType.SECURITY_VIOLATION,
      '加密系统测试错误',
      'high',
      'failure',
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    );
    
    return NextResponse.json(
      { error: 'Internal server error', test: 'encryption_system_error' },
      { status: 500 }
    );
  }
}