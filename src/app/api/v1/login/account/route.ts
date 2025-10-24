import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({
        code: '0002',
        message: '用户名和密码不能为空'
      }, { status: 400 });
    }

    // 调用真实的后端API，添加超时控制
    const backendUrl = 'http://localhost:8080/api/v1/login/account';
    
    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    const result = await response.json();
    
    // 根据后端返回的响应码判断登录结果
    if (result.code === '0000') {
      // 登录成功
      return NextResponse.json({
        code: '0000',
        message: '登录成功',
        data: {
          username,
          // 这里可以添加其他用户信息
        }
      });
    } else {
      // 登录失败
      return NextResponse.json({
        code: result.code || '0001',
        message: result.info || '登录失败'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('账号密码登录失败:', error);
    
    // 检查是否是超时错误
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({
        code: '0001',
        message: '登录请求超时，请稍后重试'
      }, { status: 408 });
    }
    
    // 检查是否是网络连接错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({
        code: '0001',
        message: '无法连接到后端服务，请检查后端服务是否启动'
      }, { status: 503 });
    }

    return NextResponse.json({
      code: '0001',
      message: '登录失败，服务器内部错误'
    }, { status: 500 });
  }
}